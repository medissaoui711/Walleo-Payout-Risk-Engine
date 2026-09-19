import { evaluatePayoutRisk } from "./payout-risk-evaluator";
import { db } from "./db";
import { JevRoutingDecision, Payout, JevAuditLog } from "../src/types";
import { evaluateCompositePolicy } from "./policy-engine";
import { ledgerService } from "./ledger";
import { makerCheckerService } from "./maker-checker";
import { outboxService } from "./outbox-worker";

// Metrics tracking
export const metricsState = {
  totalRequests: 8,
  autoApprovedCount: 5,
  manualReviewCount: 3,
  rejectedCount: 0,
  approvedCount: 5,
  fallbackCount: 0,
  latencies: [120, 145, 98, 210, 160, 185, 110, 130] as number[],
  hourlyLogs: [
    { time: "09:00", requests: 12, autoApproved: 10, manual: 2 },
    { time: "10:00", requests: 18, autoApproved: 15, manual: 3 },
    { time: "11:00", requests: 24, autoApproved: 20, manual: 4 },
    { time: "12:00", requests: 16, autoApproved: 13, manual: 3 },
    { time: "13:00", requests: 22, autoApproved: 19, manual: 3 },
    { time: "14:00", requests: 29, autoApproved: 25, manual: 4 },
  ]
};

export async function routePayoutDecision(
  merchantId: string,
  payoutAmount: number,
  bankAccountId?: string,
  currency = "USD",
  idempotencyKey?: string
): Promise<JevRoutingDecision> {
  const startTime = Date.now();
  const effectiveIdemKey = idempotencyKey || `idem-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // 1. Idempotency Cache Check
  if (db.idempotencyRecords.has(effectiveIdemKey)) {
    const cached = db.idempotencyRecords.get(effectiveIdemKey)!;
    return cached.responseBody;
  }

  return await ledgerService.acquireLock(merchantId, async () => {
    const merchant = db.merchants.get(merchantId);
    if (!merchant) {
      throw new Error(`Merchant ${merchantId} not found`);
    }

    // Pick target bank
    let targetBank = bankAccountId ? db.bankAccounts.get(bankAccountId) : null;
    if (!targetBank) {
      targetBank = Array.from(db.bankAccounts.values()).find(b => b.merchantId === merchantId && b.isDefault) ||
                   Array.from(db.bankAccounts.values()).find(b => b.merchantId === merchantId) || null;
    }
    const bankId = targetBank?.id || "ba-default";

    // 2. Evaluate Jev AI Probabilistic Risk
    let evalResult;
    let isJevAvailable = true;
    try {
      evalResult = await evaluatePayoutRisk(merchantId, payoutAmount, currency);
    } catch (jevErr) {
      console.warn("Jev AI engine exception, switching to conservative fallback:", jevErr);
      isJevAvailable = false;
      evalResult = null;
      metricsState.fallbackCount += 1;
    }

    const latency = Date.now() - startTime;
    metricsState.latencies.push(latency);
    metricsState.totalRequests += 1;

    // 3. Multi-layer Composite Policy Evaluation
    const policy = evaluateCompositePolicy(
      merchant,
      targetBank,
      payoutAmount,
      currency,
      evalResult,
      isJevAvailable
    );

    const isAutoApproved = policy.canAutoApprove && policy.tier === "AUTO_APPROVE";
    const payoutId = `po-${Date.now()}`;
    const auditLogId = `jev-audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const action = isAutoApproved
      ? ("AUTO_APPROVE" as const)
      : policy.tier === "HARD_BLOCK"
      ? ("MANUAL_REVIEW" as const)
      : ("MANUAL_REVIEW" as const);

    const reason = isAutoApproved
      ? "Auto-approved by 3-tier composite policy (Invariants + Volume + Jev Confidence)"
      : policy.failureReasons.join(" | ");

    // 4. Record Jev Audit Log
    const auditLog: JevAuditLog = {
      id: auditLogId,
      merchantId,
      merchantName: merchant.businessName,
      payoutAmount,
      currency: merchant.currency,
      riskLevel: evalResult?.riskLevel || "High_Risk",
      trustScore: evalResult?.trustScore || 0,
      autoApproved: isAutoApproved,
      confidence: evalResult?.autoApproveConfidence || 0,
      velocityConcern: evalResult?.velocityConcern || false,
      action,
      reason,
      rawResponse: evalResult?.rawProbabilities || { fallback: "Jev unavailable" },
      geminiExplanation: evalResult?.geminiAnalysis || "Policy decision evaluated under composite governance rules.",
      createdAt: new Date().toISOString(),
    };
    db.auditLogs.set(auditLogId, auditLog);

    // 5. ATOMIC LEDGER TRANSACTION: Place requested funds on HOLD
    ledgerService.recordEntry(
      merchant.id,
      payoutId,
      "HOLD",
      payoutAmount,
      currency,
      isAutoApproved ? "Atomic reserve hold pending bank dispatch" : "Escrow reserve hold pending Maker/Checker review"
    );

    // 6. Create Payout Record
    const newPayout: Payout = {
      id: payoutId,
      merchantId,
      amount: payoutAmount,
      currency: merchant.currency,
      status: isAutoApproved ? "paid" : "manual_review",
      riskLevel: evalResult?.riskLevel || "High_Risk",
      riskScore: evalResult?.trustScore || 0,
      autoApproved: isAutoApproved,
      jevDecisionId: auditLogId,
      bankAccountId: bankId,
      bankDetails: targetBank ? { bankName: targetBank.bankName, accountNumber: targetBank.accountNumber } : undefined,
      reviewReason: isAutoApproved ? undefined : reason,
      createdAt: new Date().toISOString(),
      processedAt: isAutoApproved ? new Date().toISOString() : undefined,
    };
    db.payouts.set(payoutId, newPayout);

    // 7. Execution Path
    if (isAutoApproved) {
      metricsState.autoApprovedCount += 1;
      metricsState.approvedCount += 1;

      // Dispatch Outbox Job for Settlement Rails
      const job = outboxService.enqueueJob(
        payoutId,
        merchant.id,
        payoutAmount,
        currency,
        effectiveIdemKey,
        targetBank?.bankName || "Clearing Switch"
      );
      // Process settlement immediately (simulated)
      await outboxService.processJob(job.id, false);
    } else {
      metricsState.manualReviewCount += 1;

      // Create Maker/Checker Review Case
      makerCheckerService.createCase(
        payoutId,
        merchant.id,
        payoutAmount,
        currency,
        evalResult?.riskLevel || "High_Risk",
        evalResult?.trustScore || 30,
        policy.failureReasons,
        auditLogId
      );
    }

    const decisionResponse: JevRoutingDecision = {
      action,
      reason,
      evalResult: evalResult || {
        riskLevel: "High_Risk",
        riskConfidence: 1.0,
        trustScore: 0,
        trustConfidence: 1.0,
        autoApprove: false,
        autoApproveConfidence: 0,
        velocityConcern: true,
        velocityConfidence: 1.0,
        rawProbabilities: {},
        geminiAnalysis: "Service fallback to manual inspection",
        timestamp: new Date().toISOString(),
      },
      auditLogId,
      payoutId,
    };

    // Save in Idempotency cache
    db.idempotencyRecords.set(effectiveIdemKey, {
      payoutId,
      responseBody: decisionResponse,
      createdAt: new Date().toISOString(),
    });

    return decisionResponse;
  });
}
