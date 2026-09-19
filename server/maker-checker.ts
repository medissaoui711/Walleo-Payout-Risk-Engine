import { db } from "./db";
import { MakerCheckerCase } from "../src/types";
import { ledgerService } from "./ledger";
import { POLICY_VERSION } from "./policy-engine";
import crypto from "crypto";

function computeAuditHash(payload: string, prevHash = ""): string {
  return "sha256:" + crypto.createHash("sha256").update(payload + prevHash).digest("hex");
}

let lastAuditHash = "sha256:genesis-audit-chain-walleo-v2";

export class MakerCheckerService {
  createCase(
    payoutId: string,
    merchantId: string,
    amount: number,
    currency: string,
    riskLevel: any,
    trustScore: number,
    reasonCodes: string[],
    jevEvaluationId: string
  ): MakerCheckerCase {
    const merchant = db.merchants.get(merchantId);
    const caseId = `mc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = new Date().toISOString();

    const payload = `${caseId}:${payoutId}:${merchantId}:${amount}:${currency}:${riskLevel}:${trustScore}:${timestamp}`;
    const hash = computeAuditHash(payload, lastAuditHash);
    const prev = lastAuditHash;
    lastAuditHash = hash;

    const newCase: MakerCheckerCase = {
      caseId,
      payoutId,
      merchantId,
      merchantName: merchant?.businessName || "Unknown Merchant",
      businessNameAr: merchant?.businessNameAr,
      amount,
      currency,
      status: "PENDING_MAKER",
      reasonCodes,
      policyVersion: POLICY_VERSION,
      jevEvaluationId,
      riskLevel,
      trustScore,
      occurredAt: timestamp,
      eventHash: hash,
      previousEventHash: prev,
    };

    db.makerCheckerCases.set(caseId, newCase);
    return newCase;
  }

  submitMakerRecommendation(
    caseId: string,
    makerUserId: string,
    recommendation: "RECOMMEND_APPROVE" | "RECOMMEND_REJECT",
    notes: string
  ): MakerCheckerCase {
    const rCase = db.makerCheckerCases.get(caseId);
    if (!rCase) throw new Error(`Review case ${caseId} not found`);

    if (rCase.status !== "PENDING_MAKER") {
      throw new Error(`Review case ${caseId} is not in PENDING_MAKER status (Current: ${rCase.status})`);
    }

    if (!makerUserId || !makerUserId.trim()) {
      throw new Error("Maker User ID is required");
    }

    const timestamp = new Date().toISOString();
    rCase.makerUserId = makerUserId.trim();
    rCase.makerRecommendation = recommendation;
    rCase.makerNotes = notes || "Investigated transaction telemetry & merchant business standing";
    rCase.makerTimestamp = timestamp;
    rCase.status = "PENDING_CHECKER";

    const payload = `MAKER_SUBMIT:${caseId}:${makerUserId}:${recommendation}:${timestamp}`;
    const hash = computeAuditHash(payload, rCase.eventHash);
    rCase.previousEventHash = rCase.eventHash;
    rCase.eventHash = hash;
    lastAuditHash = hash;

    db.makerCheckerCases.set(caseId, rCase);
    return rCase;
  }

  submitCheckerDecision(
    caseId: string,
    checkerUserId: string,
    decision: "APPROVED" | "REJECTED",
    notes: string
  ): { reviewCase: MakerCheckerCase; ledgerResult?: any } {
    const rCase = db.makerCheckerCases.get(caseId);
    if (!rCase) throw new Error(`Review case ${caseId} not found`);

    if (rCase.status !== "PENDING_CHECKER") {
      throw new Error(`Review case ${caseId} is not in PENDING_CHECKER status (Current: ${rCase.status})`);
    }

    if (!checkerUserId || !checkerUserId.trim()) {
      throw new Error("Checker User ID is required");
    }

    // STRICT SEGREGATION OF DUTIES INVARIANT
    if (rCase.makerUserId && rCase.makerUserId.toLowerCase() === checkerUserId.toLowerCase().trim()) {
      throw new Error(`Segregation of Duties Violation: Maker (${rCase.makerUserId}) cannot serve as Checker for the same payout case!`);
    }

    const timestamp = new Date().toISOString();
    rCase.checkerUserId = checkerUserId.trim();
    rCase.checkerDecision = decision;
    rCase.checkerNotes = notes || "Verified compliance standards and authorization";
    rCase.checkerTimestamp = timestamp;
    rCase.status = decision === "APPROVED" ? "APPROVED" : "REJECTED";

    const payload = `CHECKER_DECISION:${caseId}:${checkerUserId}:${decision}:${timestamp}`;
    const hash = computeAuditHash(payload, rCase.eventHash);
    rCase.previousEventHash = rCase.eventHash;
    rCase.eventHash = hash;
    lastAuditHash = hash;

    db.makerCheckerCases.set(caseId, rCase);

    // Update Payout and Ledger State
    const payout = db.payouts.get(rCase.payoutId);
    let ledgerResult;

    if (payout) {
      if (decision === "APPROVED") {
        payout.status = "paid";
        payout.processedAt = timestamp;
        payout.reviewerNotes = `Approved by Checker ${checkerUserId} following recommendation by Maker ${rCase.makerUserId}`;
        db.payouts.set(payout.id, payout);

        // Deduct from held balance via Ledger SETTLE
        ledgerResult = ledgerService.recordEntry(
          rCase.merchantId,
          rCase.payoutId,
          "SETTLE",
          rCase.amount,
          rCase.currency,
          `Maker/Checker sign-off: settled to merchant bank (${checkerUserId})`
        );
      } else {
        payout.status = "failed";
        payout.reviewerNotes = `Rejected by Checker ${checkerUserId}: ${notes}`;
        db.payouts.set(payout.id, payout);

        // Release hold back to available balance via Ledger RELEASE_HOLD
        ledgerResult = ledgerService.recordEntry(
          rCase.merchantId,
          rCase.payoutId,
          "RELEASE_HOLD",
          rCase.amount,
          rCase.currency,
          `Maker/Checker rejection: released held funds back to available balance (${checkerUserId})`
        );
      }
    }

    return { reviewCase: rCase, ledgerResult };
  }

  getAllCases(): MakerCheckerCase[] {
    return Array.from(db.makerCheckerCases.values()).reverse();
  }

  getCaseById(caseId: string): MakerCheckerCase | undefined {
    return db.makerCheckerCases.get(caseId);
  }
}

export const makerCheckerService = new MakerCheckerService();
