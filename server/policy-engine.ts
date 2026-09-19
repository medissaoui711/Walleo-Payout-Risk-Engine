import { Merchant, BankAccount, JevEvaluationResult, CompositePolicyResult } from "../src/types";

export const POLICY_VERSION = "walleo-payout-risk-v2.2";

export function getAutoPayoutLimit(merchant: Merchant): number {
  if (merchant.riskTier === "vip" && merchant.accountAgeDays > 180) {
    return 20000; // $20k for veteran VIP
  }
  if (merchant.riskTier === "standard" && merchant.accountAgeDays > 90) {
    return 5000; // $5k for standard established
  }
  if (merchant.accountAgeDays < 60) {
    return 500; // $500 for newer accounts
  }
  return 2500;
}

export function evaluateCompositePolicy(
  merchant: Merchant,
  bankAccount: BankAccount | null,
  amount: number,
  currency: string,
  jevResult: JevEvaluationResult | null,
  isJevAvailable: boolean = true
): CompositePolicyResult {
  const failureReasons: string[] = [];

  // 1. Deterministic Financial & Compliance Invariants (Non-negotiable)
  let invariantsPassed = true;

  if (merchant.kycStatus !== "approved") {
    invariantsPassed = false;
    failureReasons.push("KYC_NOT_VERIFIED");
  }

  if (!bankAccount || !bankAccount.isVerified) {
    invariantsPassed = false;
    failureReasons.push("BANK_ACCOUNT_NOT_VERIFIED");
  }

  if (currency !== merchant.currency) {
    invariantsPassed = false;
    failureReasons.push("CURRENCY_MISMATCH");
  }

  if (amount <= 0) {
    invariantsPassed = false;
    failureReasons.push("INVALID_AMOUNT");
  }

  if (amount > merchant.availableBalance) {
    invariantsPassed = false;
    failureReasons.push("INSUFFICIENT_AVAILABLE_BALANCE");
  }

  if (merchant.isFrozen) {
    invariantsPassed = false;
    failureReasons.push("MERCHANT_ACCOUNT_FROZEN");
  }

  if (merchant.hasSanctionsHold) {
    invariantsPassed = false;
    failureReasons.push("SANCTIONS_COMPLIANCE_HOLD");
  }

  if (merchant.hasOpenHighSeverityDispute) {
    invariantsPassed = false;
    failureReasons.push("OPEN_HIGH_SEVERITY_DISPUTE");
  }

  // If hard invariants fail, it's a Hard Block / Hold immediately
  if (!invariantsPassed) {
    return {
      canAutoApprove: false,
      tier: "HARD_BLOCK",
      failureReasons,
      policyVersion: POLICY_VERSION,
      invariantsPassed: false,
      idempotencyValid: true,
      jevSignalsPassed: false,
      volumeLimitPassed: false,
      autoPayoutLimit: getAutoPayoutLimit(merchant),
    };
  }

  // 2. Safe Fallback if Jev Engine is unavailable or timed out
  if (!isJevAvailable || !jevResult) {
    return {
      canAutoApprove: false,
      tier: "MANUAL_REVIEW",
      failureReasons: ["JEV_SERVICE_UNAVAILABLE_FALLBACK"],
      policyVersion: POLICY_VERSION,
      invariantsPassed: true,
      idempotencyValid: true,
      jevSignalsPassed: false,
      volumeLimitPassed: false,
      autoPayoutLimit: getAutoPayoutLimit(merchant),
    };
  }

  // 3. Payout Volume Policy Limit
  const autoLimit = getAutoPayoutLimit(merchant);
  const volumeLimitPassed = amount <= autoLimit;
  if (!volumeLimitPassed) {
    failureReasons.push(`AMOUNT_EXCEEDS_AUTO_TIER_LIMIT (${amount} > ${autoLimit})`);
  }

  // 4. Jev AI Probabilistic & Confidence Signals
  const autoApproveProb = jevResult.rawProbabilities?.auto_approve?.noul ?? 0;
  const jevSignalsPassed =
    jevResult.riskLevel === "Low_Risk" &&
    autoApproveProb >= 0.90 &&
    jevResult.autoApproveConfidence >= 0.90 &&
    jevResult.riskConfidence >= 0.90 &&
    jevResult.trustScore >= 80 &&
    !jevResult.velocityConcern;

  if (!jevSignalsPassed) {
    if (jevResult.riskLevel !== "Low_Risk") failureReasons.push(`JEV_RISK_LEVEL_${jevResult.riskLevel}`);
    if (jevResult.trustScore < 80) failureReasons.push(`JEV_TRUST_SCORE_BELOW_80 (${jevResult.trustScore})`);
    if (jevResult.autoApproveConfidence < 0.90) failureReasons.push(`JEV_CONFIDENCE_BELOW_90 (${Math.round(jevResult.autoApproveConfidence * 100)}%)`);
    if (jevResult.velocityConcern) failureReasons.push("JEV_VELOCITY_SPIKE_DETECTED");
  }

  // Composite Decision Rule
  const canAutoApprove = invariantsPassed && volumeLimitPassed && jevSignalsPassed;

  return {
    canAutoApprove,
    tier: canAutoApprove ? "AUTO_APPROVE" : "MANUAL_REVIEW",
    failureReasons,
    policyVersion: POLICY_VERSION,
    invariantsPassed: true,
    idempotencyValid: true,
    jevSignalsPassed,
    volumeLimitPassed,
    autoPayoutLimit: autoLimit,
  };
}
