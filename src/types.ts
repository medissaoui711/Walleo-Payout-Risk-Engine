export type KycStatus = 'pending' | 'approved' | 'rejected';
export type RiskTier = 'standard' | 'high' | 'vip';
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'manual_review';
export type RiskLevel = 'Low_Risk' | 'Medium_Risk' | 'High_Risk';
export type TransactionType = 'charge' | 'refund' | 'chargeback';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type RiskEventSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RiskEventType = 'chargeback' | 'dispute' | 'velocity_breach' | 'kyc_change';

export interface Merchant {
  id: string;
  email: string;
  businessName: string;
  businessNameAr?: string;
  taxId?: string;
  country: 'Tunisia' | 'Qatar' | 'Regional';
  kycStatus: KycStatus;
  riskTier: RiskTier;
  accountAgeDays: number;
  availableBalance: number;
  heldBalance: number;
  currency: string;
  isFrozen?: boolean;
  hasSanctionsHold?: boolean;
  hasOpenHighSeverityDispute?: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export type LedgerEntryType = 'HOLD' | 'RELEASE_HOLD' | 'SETTLE' | 'REVERSE';

export interface LedgerEntry {
  id: string;
  payoutId: string;
  merchantId: string;
  type: LedgerEntryType;
  amount: number;
  currency: string;
  availableBalanceAfter: number;
  heldBalanceAfter: number;
  reason: string;
  timestamp: string;
  hash: string;
  previousHash?: string;
}

export interface MakerCheckerCase {
  caseId: string;
  payoutId: string;
  merchantId: string;
  merchantName: string;
  businessNameAr?: string;
  amount: number;
  currency: string;
  status: 'PENDING_MAKER' | 'PENDING_CHECKER' | 'APPROVED' | 'REJECTED';
  makerUserId?: string;
  makerRecommendation?: 'RECOMMEND_APPROVE' | 'RECOMMEND_REJECT';
  makerNotes?: string;
  makerTimestamp?: string;
  checkerUserId?: string;
  checkerDecision?: 'APPROVED' | 'REJECTED';
  checkerNotes?: string;
  checkerTimestamp?: string;
  reasonCodes: string[];
  policyVersion: string;
  jevEvaluationId: string;
  riskLevel: RiskLevel;
  trustScore: number;
  occurredAt: string;
  eventHash: string;
  previousEventHash?: string;
}

export interface OutboxJob {
  id: string;
  payoutId: string;
  merchantId: string;
  amount: number;
  currency: string;
  status: 'QUEUED' | 'SUBMITTED' | 'SETTLED' | 'FAILED' | 'REVERSED';
  idempotencyKey: string;
  bankProvider: string;
  attempts: number;
  lastError?: string;
  createdAt: string;
  processedAt?: string;
}

export interface CompositePolicyResult {
  canAutoApprove: boolean;
  tier: 'AUTO_APPROVE' | 'MANUAL_REVIEW' | 'HARD_BLOCK';
  failureReasons: string[];
  policyVersion: string;
  invariantsPassed: boolean;
  idempotencyValid: boolean;
  jevSignalsPassed: boolean;
  volumeLimitPassed: boolean;
  autoPayoutLimit: number;
}

export interface FinancialTestResult {
  id: string;
  title: string;
  titleAr: string;
  category: string;
  passed: boolean;
  status: 'SUCCESS' | 'FAILED';
  details: string;
  expectedOutcome: string;
  actualOutcome: string;
  auditHash?: string;
}

export interface BankAccount {
  id: string;
  merchantId: string;
  bankName: string;
  bankNameAr?: string;
  accountNumber: string;
  iban: string;
  routingNumber?: string;
  isVerified: boolean;
  isDefault: boolean;
  country: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  customerName?: string;
  paymentMethod?: string;
  createdAt: string;
}

export interface RiskEvent {
  id: string;
  merchantId: string;
  eventType: RiskEventType;
  severity: RiskEventSeverity;
  details: {
    description?: string;
    amount?: number;
    disputeReason?: string;
    resolved?: boolean;
    ipCountry?: string;
    velocityHits?: number;
    [key: string]: any;
  };
  createdAt: string;
}

export interface Payout {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  riskLevel?: RiskLevel;
  riskScore?: number;
  autoApproved?: boolean;
  jevDecisionId?: string;
  bankAccountId: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
  };
  reviewReason?: string;
  reviewerNotes?: string;
  createdAt: string;
  processedAt?: string;
}

export interface PayoutStateData {
  merchant_id: string;
  payout_amount_usd: number;
  avg_daily_sales_usd: number;
  account_age_days: number;
  open_disputes_count: number;
  chargeback_count_90d: number;
  total_payouts_ytd: number;
  last_payout_date?: string;
  risk_flags: string[];
  velocity_24h_count: number;
  velocity_24h_amount: number;
}

export interface JevEvaluationResult {
  riskLevel: RiskLevel;
  riskConfidence: number;
  trustScore: number;
  trustConfidence: number;
  autoApprove: boolean;
  autoApproveConfidence: number;
  velocityConcern: boolean;
  velocityConfidence: number;
  rawProbabilities: Record<string, any>;
  geminiAnalysis?: string;
  timestamp: string;
}

export interface JevRoutingDecision {
  action: 'AUTO_APPROVE' | 'MANUAL_REVIEW';
  reason: string;
  evalResult: JevEvaluationResult;
  auditLogId: string;
  payoutId?: string;
}

export interface JevAuditLog {
  id: string;
  merchantId: string;
  merchantName?: string;
  payoutAmount: number;
  currency: string;
  riskLevel: RiskLevel;
  trustScore: number;
  autoApproved: boolean;
  confidence: number;
  velocityConcern: boolean;
  action: 'AUTO_APPROVE' | 'MANUAL_REVIEW';
  reason: string;
  rawResponse: any;
  geminiExplanation?: string;
  createdAt: string;
}

export interface ReviewQueueItem {
  id: string;
  merchantId: string;
  merchantName: string;
  businessNameAr?: string;
  country: string;
  amount: number;
  currency: string;
  riskLevel: RiskLevel;
  trustScore: number;
  reason: string;
  autoApproveConfidence: number;
  velocityConcern: boolean;
  riskFlags: string[];
  bankName: string;
  accountNumber: string;
  jevDecisionId?: string;
  geminiAudit?: string;
  createdAt: string;
}

export interface PrometheusMetrics {
  totalRequests: number;
  autoApprovedCount: number;
  manualReviewCount: number;
  rejectedCount: number;
  approvedCount: number;
  fallbackCount: number;
  autoApprovalRate: number;
  fallbackRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  latencyBuckets: { bucket: string; count: number }[];
  riskDistribution: { level: string; count: number; color: string }[];
  hourlyActivity: { time: string; requests: number; autoApproved: number; manual: number }[];
}

export interface ShadowModeComparison {
  payoutId: string;
  merchantName: string;
  amount: number;
  humanDecision: 'APPROVED' | 'MANUAL_REVIEW';
  jevDecision: 'AUTO_APPROVE' | 'MANUAL_REVIEW';
  agreed: boolean;
  jevConfidence: number;
  riskLevel: RiskLevel;
  trustScore: number;
  discrepancyReason?: string;
}

export interface ShadowModeReport {
  totalTested: number;
  agreements: number;
  agreementRate: number;
  passedThreshold: boolean;
  benchmarkTarget: number;
  comparisons: ShadowModeComparison[];
  summary: string;
}
