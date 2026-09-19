import { 
  Merchant, 
  BankAccount, 
  Transaction, 
  Payout, 
  RiskEvent, 
  JevAuditLog, 
  LedgerEntry, 
  MakerCheckerCase, 
  OutboxJob 
} from '../src/types';

export class WalleoDatabase {
  merchants: Map<string, Merchant> = new Map();
  bankAccounts: Map<string, BankAccount> = new Map();
  transactions: Map<string, Transaction> = new Map();
  payouts: Map<string, Payout> = new Map();
  riskEvents: Map<string, RiskEvent> = new Map();
  auditLogs: Map<string, JevAuditLog> = new Map();
  ledgerEntries: Map<string, LedgerEntry> = new Map();
  makerCheckerCases: Map<string, MakerCheckerCase> = new Map();
  outboxJobs: Map<string, OutboxJob> = new Map();
  idempotencyRecords: Map<string, { payoutId: string; responseBody: any; createdAt: string }> = new Map();

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    // 1. Merchant A: Low-risk veteran merchant in Tunis
    const m1: Merchant = {
      id: "m-tunis-01",
      email: "finance@carthage-exports.tn",
      businessName: "Carthage Organic Olive Oils",
      businessNameAr: "زيوت قرطاج البيولوجية المصدرة",
      taxId: "TN-1892834-M",
      country: "Tunisia",
      kycStatus: "approved",
      riskTier: "standard",
      accountAgeDays: 340,
      availableBalance: 18450.00,
      heldBalance: 0.00,
      currency: "USD",
      isFrozen: false,
      hasSanctionsHold: false,
      hasOpenHighSeverityDispute: false,
      createdAt: new Date(Date.now() - 340 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // 2. Merchant B: High velocity / Rapid growth tech store in Doha, Qatar
    const m2: Merchant = {
      id: "m-doha-02",
      email: "payouts@dohapaytech.qa",
      businessName: "Doha Pay Tech Solutions WLL",
      businessNameAr: "حلول الدوحة للتكنولوجيا المالية ذ.م.م",
      taxId: "QA-CR-994821",
      country: "Qatar",
      kycStatus: "approved",
      riskTier: "vip",
      accountAgeDays: 195,
      availableBalance: 42300.00,
      heldBalance: 35000.00, // p4 is held
      currency: "QAR",
      isFrozen: false,
      hasSanctionsHold: false,
      hasOpenHighSeverityDispute: false,
      createdAt: new Date(Date.now() - 195 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // 3. Merchant C: New merchant with high dispute rate (High Risk)
    const m3: Merchant = {
      id: "m-sousse-03",
      email: "store@medina-electronics.tn",
      businessName: "Medina Digital & Electronics",
      businessNameAr: "إلكترونيات المدينة الرقمية بسوسة",
      taxId: "TN-4491022-P",
      country: "Tunisia",
      kycStatus: "approved",
      riskTier: "high",
      accountAgeDays: 24, // New merchant < 30 days
      availableBalance: 6150.00,
      heldBalance: 4800.00, // p3 is held
      currency: "TND",
      isFrozen: false,
      hasSanctionsHold: false,
      hasOpenHighSeverityDispute: true,
      createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // 4. Merchant D: Lusail Luxury Goods in Qatar
    const m4: Merchant = {
      id: "m-lusail-04",
      email: "accounts@lusail-luxury.qa",
      businessName: "Lusail Artisan Perfumes & Oud",
      businessNameAr: "عطور وعود لوسيل الفاخرة",
      taxId: "QA-CR-330198",
      country: "Qatar",
      kycStatus: "approved",
      riskTier: "vip",
      accountAgeDays: 420,
      availableBalance: 89000.00,
      heldBalance: 0.00,
      currency: "USD",
      isFrozen: false,
      hasSanctionsHold: false,
      hasOpenHighSeverityDispute: false,
      createdAt: new Date(Date.now() - 420 * 24 * 60 * 60 * 1000).toISOString(),
    };

    [m1, m2, m3, m4].forEach(m => this.merchants.set(m.id, m));

    // Bank Accounts
    const b1: BankAccount = {
      id: "ba-biat-01",
      merchantId: m1.id,
      bankName: "BIAT (Banque Internationale Arabe de Tunisie)",
      bankNameAr: "بنك تونس العربي الدولي (BIAT)",
      accountNumber: "08001234567890123456",
      iban: "TN5908001234567890123456",
      routingNumber: "BIATTNTT",
      isVerified: true,
      isDefault: true,
      country: "Tunisia",
      createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const b2: BankAccount = {
      id: "ba-qnb-02",
      merchantId: m2.id,
      bankName: "QNB (Qatar National Bank)",
      bankNameAr: "بنك قطر الوطني (QNB)",
      accountNumber: "00130982340192",
      iban: "QA54QNBA00000000130982340192",
      routingNumber: "QNBAQAQA",
      isVerified: true,
      isDefault: true,
      country: "Qatar",
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const b3: BankAccount = {
      id: "ba-attijari-03",
      merchantId: m3.id,
      bankName: "Attijari Bank Tunisie",
      bankNameAr: "التجاري بنك تونس",
      accountNumber: "04019928371625341200",
      iban: "TN5904019928371625341200",
      routingNumber: "BSTUTNTT",
      isVerified: true,
      isDefault: true,
      country: "Tunisia",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const b4: BankAccount = {
      id: "ba-cbq-04",
      merchantId: m4.id,
      bankName: "Commercial Bank of Qatar (CBQ)",
      bankNameAr: "البنك التجاري القطري (CBQ)",
      accountNumber: "02094857291039",
      iban: "QA88CBQA000000002094857291039",
      routingNumber: "CBQAQAQA",
      isVerified: true,
      isDefault: true,
      country: "Qatar",
      createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
    };

    [b1, b2, b3, b4].forEach(b => this.bankAccounts.set(b.id, b));

    // Transactions for Merchant 1 (Healthy stream)
    for (let i = 1; i <= 45; i++) {
      const daysAgo = Math.floor(Math.random() * 85);
      const amount = Math.floor(150 + Math.random() * 600);
      const txId = `tx-m1-${i}`;
      this.transactions.set(txId, {
        id: txId,
        merchantId: m1.id,
        amount,
        currency: "USD",
        status: "completed",
        type: "charge",
        customerName: `Client ${i} (EU/MENA)`,
        paymentMethod: "Visa / Mastercard 3D-Secure",
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Transactions for Merchant 2 (High volume)
    for (let i = 1; i <= 70; i++) {
      const daysAgo = Math.floor(Math.random() * 85);
      const amount = Math.floor(400 + Math.random() * 2200);
      const txId = `tx-m2-${i}`;
      this.transactions.set(txId, {
        id: txId,
        merchantId: m2.id,
        amount,
        currency: "QAR",
        status: "completed",
        type: "charge",
        customerName: `Enterprise Qatar ${i}`,
        paymentMethod: "QPay / Apple Pay / NAPS",
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Transactions for Merchant 3 (High disputes & chargebacks)
    for (let i = 1; i <= 20; i++) {
      const daysAgo = Math.floor(Math.random() * 20);
      const amount = Math.floor(80 + Math.random() * 400);
      const txId = `tx-m3-${i}`;
      const isChargeback = i % 5 === 0;
      this.transactions.set(txId, {
        id: txId,
        merchantId: m3.id,
        amount,
        currency: "TND",
        status: isChargeback ? "refunded" : "completed",
        type: isChargeback ? "chargeback" : "charge",
        customerName: `Customer ${i}`,
        paymentMethod: "Flouci / ClicToPay / Visa",
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Risk Events for Merchant 3
    this.riskEvents.set("re-01", {
      id: "re-01",
      merchantId: m3.id,
      eventType: "chargeback",
      severity: "high",
      details: { amount: 320, disputeReason: "Fraudulent card usage reported by issuer", resolved: false },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    });
    this.riskEvents.set("re-02", {
      id: "re-02",
      merchantId: m3.id,
      eventType: "dispute",
      severity: "medium",
      details: { amount: 190, disputeReason: "Item not received / tracking invalid", resolved: false },
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    });
    this.riskEvents.set("re-03", {
      id: "re-03",
      merchantId: m3.id,
      eventType: "velocity_breach",
      severity: "critical",
      details: { velocityHits: 6, description: "6 rapid withdrawal attempts in under 3 hours" },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Seed Initial Payouts
    const p1: Payout = {
      id: "po-101",
      merchantId: m1.id,
      amount: 2500,
      currency: "USD",
      status: "paid",
      riskLevel: "Low_Risk",
      riskScore: 92,
      autoApproved: true,
      jevDecisionId: "jev-dec-101",
      bankAccountId: b1.id,
      bankDetails: { bankName: b1.bankName, accountNumber: b1.accountNumber },
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      processedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const p2: Payout = {
      id: "po-102",
      merchantId: m2.id,
      amount: 8500,
      currency: "QAR",
      status: "paid",
      riskLevel: "Low_Risk",
      riskScore: 88,
      autoApproved: true,
      jevDecisionId: "jev-dec-102",
      bankAccountId: b2.id,
      bankDetails: { bankName: b2.bankName, accountNumber: b2.accountNumber },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      processedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Payout in Manual Review Queue (High Risk from Merchant 3)
    const p3: Payout = {
      id: "po-103",
      merchantId: m3.id,
      amount: 4800,
      currency: "TND",
      status: "manual_review",
      riskLevel: "High_Risk",
      riskScore: 28,
      autoApproved: false,
      jevDecisionId: "jev-dec-103",
      bankAccountId: b3.id,
      bankDetails: { bankName: b3.bankName, accountNumber: b3.accountNumber },
      reviewReason: "Multiple red flags: account age < 30 days, 2 open chargebacks, velocity breach 48h",
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    };

    // Another Payout in Manual Review Queue (Velocity concern from Merchant 2 for large amount)
    const p4: Payout = {
      id: "po-104",
      merchantId: m2.id,
      amount: 35000,
      currency: "QAR",
      status: "manual_review",
      riskLevel: "Medium_Risk",
      riskScore: 62,
      autoApproved: false,
      jevDecisionId: "jev-dec-104",
      bankAccountId: b2.id,
      bankDetails: { bankName: b2.bankName, accountNumber: b2.accountNumber },
      reviewReason: "Payout amount is >4x daily average sales ($9,600 equivalent) triggering velocity review gate",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    };

    [p1, p2, p3, p4].forEach(p => this.payouts.set(p.id, p));

    // Audit logs
    this.auditLogs.set("jev-dec-101", {
      id: "jev-dec-101",
      merchantId: m1.id,
      merchantName: m1.businessName,
      payoutAmount: 2500,
      currency: "USD",
      riskLevel: "Low_Risk",
      trustScore: 92,
      autoApproved: true,
      confidence: 0.94,
      velocityConcern: false,
      action: "AUTO_APPROVE",
      reason: "High confidence auto-approval (Account >90d, clean record)",
      rawResponse: { risk_level: { choice: "Low_Risk", confidence: 0.94 }, trust_score: { score: 92, confidence: 0.95 } },
      createdAt: p1.createdAt,
    });

    this.auditLogs.set("jev-dec-103", {
      id: "jev-dec-103",
      merchantId: m3.id,
      merchantName: m3.businessName,
      payoutAmount: 4800,
      currency: "TND",
      riskLevel: "High_Risk",
      trustScore: 28,
      autoApproved: false,
      confidence: 0.91,
      velocityConcern: true,
      action: "MANUAL_REVIEW",
      reason: "High risk flags detected: chargeback velocity & new account age",
      rawResponse: { risk_level: { choice: "High_Risk", confidence: 0.91 }, auto_approve: { noul: 0.12, confidence: 0.93 } },
      geminiExplanation: "🚨 High risk transaction profile: Merchant account is only 24 days old, exceeding normal dispute benchmarks with unresolved chargeback and high withdrawal ratio relative to balance.",
      createdAt: p3.createdAt,
    });

    // Seed Ledger Entries (Double-Entry Invariants)
    this.ledgerEntries.set("le-01", {
      id: "le-01",
      payoutId: "po-101",
      merchantId: m1.id,
      type: "HOLD",
      amount: 2500,
      currency: "USD",
      availableBalanceAfter: 18450,
      heldBalanceAfter: 2500,
      reason: "Payout initiated - funds placed on atomic reserve hold",
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      hash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    });

    this.ledgerEntries.set("le-02", {
      id: "le-02",
      payoutId: "po-101",
      merchantId: m1.id,
      type: "SETTLE",
      amount: 2500,
      currency: "USD",
      availableBalanceAfter: 18450,
      heldBalanceAfter: 0,
      reason: "Bank settlement cleared via BIAT clearing rails",
      timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
      hash: "sha256:cb2d603a74378f8cf6de4b9c1d09e5dd0b3e51f5c6a1e35d2146f3900a30b809",
      previousHash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    });

    this.ledgerEntries.set("le-03", {
      id: "le-03",
      payoutId: "po-103",
      merchantId: m3.id,
      type: "HOLD",
      amount: 4800,
      currency: "TND",
      availableBalanceAfter: 6150,
      heldBalanceAfter: 4800,
      reason: "Manual review trigger: funds held in escrow pending Maker/Checker inspection",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      hash: "sha256:4a8b792d47c430e3860bb4a6bc6477e68fa7c793ff028682a0b4eec1debb27b8",
    });

    this.ledgerEntries.set("le-04", {
      id: "le-04",
      payoutId: "po-104",
      merchantId: m2.id,
      type: "HOLD",
      amount: 35000,
      currency: "QAR",
      availableBalanceAfter: 42300,
      heldBalanceAfter: 35000,
      reason: "High velocity payout threshold exceeded - balance reserved for Ops validation",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      hash: "sha256:6e01a91e5c8e29a3e2a9b71d9d9f53e34b12c5b058a9e6912389d0e2d3c909e4",
    });

    // Seed Maker / Checker Review Cases
    this.makerCheckerCases.set("mc-103", {
      caseId: "mc-103",
      payoutId: "po-103",
      merchantId: m3.id,
      merchantName: m3.businessName,
      businessNameAr: m3.businessNameAr,
      amount: 4800,
      currency: "TND",
      status: "PENDING_MAKER",
      reasonCodes: ["ACCOUNT_AGE_UNDER_30D", "CHARGEBACK_DETECTED_90D", "OPEN_DISPUTE_EXISTS"],
      policyVersion: "walleo-policy-v2.1",
      jevEvaluationId: "jev-dec-103",
      riskLevel: "High_Risk",
      trustScore: 28,
      occurredAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      eventHash: "sha256:88e0b651034f40f0925c4ef674a9dd1367098ef6476e3e57f123895e7b23aa91",
    });

    this.makerCheckerCases.set("mc-104", {
      caseId: "mc-104",
      payoutId: "po-104",
      merchantId: m2.id,
      merchantName: m2.businessName,
      businessNameAr: m2.businessNameAr,
      amount: 35000,
      currency: "QAR",
      status: "PENDING_CHECKER",
      makerUserId: "ops_maker_44",
      makerRecommendation: "RECOMMEND_APPROVE",
      makerNotes: "Merchant provided valid high-value invoice #QA-8910 verifying corporate customer bulk order. Verified with commercial registry.",
      makerTimestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      reasonCodes: ["HIGH_VALUE_THRESHOLD_EXCEEDED", "VELOCITY_BURST_24H"],
      policyVersion: "walleo-policy-v2.1",
      jevEvaluationId: "jev-dec-104",
      riskLevel: "Medium_Risk",
      trustScore: 62,
      occurredAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      eventHash: "sha256:33a0b891044f50f0925c4ef674a9dd1367098ef6476e3e57f123895e7b23bb99",
      previousEventHash: "sha256:88e0b651034f40f0925c4ef674a9dd1367098ef6476e3e57f123895e7b23aa91",
    });
  }
}

export const db = new WalleoDatabase();
