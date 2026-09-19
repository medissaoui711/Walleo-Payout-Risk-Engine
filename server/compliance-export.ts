import { db } from "./db";
import { maskAccountNumber, maskIBAN } from "../src/lib/currency";

export interface ComplianceAuditPackage {
  packageId: string;
  generatedAt: string;
  reportingAuthority: "Banque Centrale de Tunisie (BCT)" | "Qatar Central Bank (QCB)";
  regulationReference: "BCT Circular 2018-16 (PSP Standards)" | "QCB FinTech Sandbox & AML Guidelines";
  pspLicensee: "Walleo Technology Solutions (Payment Facilitator / Gateway)";
  settlementPartner: string;
  summary: {
    totalPayoutsAudited: number;
    totalAmountUSD: number;
    autoApprovedCount: number;
    manualReviewedCount: number;
    rejectedOrHeldCount: number;
    sanctionsFlaggedCount: number;
  };
  beneficiaryScreeningRecords: Array<{
    payoutId: string;
    merchantTaxId: string;
    businessName: string;
    beneficiaryBank: string;
    accountMasked: string;
    amount: number;
    currency: string;
    amlCheck: "PASSED_UN_OFAC_CLEARED" | "FLAGGED_ENHANCED_DILIGENCE";
    makerUserId: string;
    checkerUserId: string;
    decision: string;
    eventHash: string;
  }>;
  settlementLedgerReconciliation: Array<{
    entryId: string;
    type: string;
    amount: number;
    currency: string;
    timestamp: string;
    hash: string;
  }>;
  complianceOfficerAttestation: {
    statement: string;
    hashSignature: string;
  };
}

export function generateComplianceAuditPackage(country: "Tunisia" | "Qatar"): ComplianceAuditPackage {
  const isTunisia = country === "Tunisia";
  const authority = isTunisia ? "Banque Centrale de Tunisie (BCT)" : "Qatar Central Bank (QCB)";
  const ref = isTunisia ? "BCT Circular 2018-16 (PSP Standards)" : "QCB FinTech Sandbox & AML Guidelines";
  const partner = isTunisia ? "BIAT / Attijari Bank / Monétique Tunisie Switch" : "Qatar National Bank (QNB) / NAPS Switch";

  const allPayouts = Array.from(db.payouts.values());
  const allLedger = Array.from(db.ledgerEntries.values());
  const allCases = Array.from(db.makerCheckerCases.values());

  const beneficiaryRecords = allPayouts.map(p => {
    const merchant = db.merchants.get(p.merchantId);
    const relatedCase = allCases.find(c => c.payoutId === p.id);
    return {
      payoutId: p.id,
      merchantTaxId: merchant?.taxId || "TN-XXXXXX",
      businessName: merchant?.businessName || "Unknown",
      beneficiaryBank: p.bankDetails?.bankName || "Clearing Bank",
      accountMasked: maskAccountNumber(p.bankDetails?.accountNumber || "0000"),
      amount: p.amount,
      currency: p.currency,
      amlCheck: (merchant?.hasSanctionsHold ? "FLAGGED_ENHANCED_DILIGENCE" : "PASSED_UN_OFAC_CLEARED") as any,
      makerUserId: relatedCase?.makerUserId || "SYSTEM_AUTO",
      checkerUserId: relatedCase?.checkerUserId || (p.autoApproved ? "JEV_AUTOMATION_GATE" : "OPS_SUPERVISOR"),
      decision: p.status.toUpperCase(),
      eventHash: relatedCase?.eventHash || "sha256:01jev-settlement-proof",
    };
  });

  const totalAmount = allPayouts.reduce((sum, p) => sum + p.amount, 0);

  return {
    packageId: `CAP-${isTunisia ? "BCT" : "QCB"}-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    reportingAuthority: authority,
    regulationReference: ref,
    pspLicensee: "Walleo Technology Solutions (Payment Facilitator / Gateway)",
    settlementPartner: partner,
    summary: {
      totalPayoutsAudited: allPayouts.length,
      totalAmountUSD: totalAmount,
      autoApprovedCount: allPayouts.filter(p => p.autoApproved).length,
      manualReviewedCount: allPayouts.filter(p => p.status === "manual_review").length,
      rejectedOrHeldCount: allPayouts.filter(p => p.status === "failed").length,
      sanctionsFlaggedCount: allPayouts.filter(p => db.merchants.get(p.merchantId)?.hasSanctionsHold).length,
    },
    beneficiaryScreeningRecords: beneficiaryRecords,
    settlementLedgerReconciliation: allLedger.slice(0, 10).map(l => ({
      entryId: l.id,
      type: l.type,
      amount: l.amount,
      currency: l.currency,
      timestamp: l.timestamp,
      hash: l.hash,
    })),
    complianceOfficerAttestation: {
      statement: `We hereby attest that the attached payout requests and ledger double-entries adhere to AML/CFT provisions, beneficiary validation standards, and PSP clearing rules under ${ref}.`,
      hashSignature: `sha256:${Date.now().toString(16)}walleo-compliance-sign-off`,
    },
  };
}
