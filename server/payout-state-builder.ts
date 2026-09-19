import { z } from "zod";
import { db } from "./db";
import { PayoutStateData } from "../src/types";

export const PayoutStateSchema = z.object({
  merchant_id: z.string(),
  payout_amount_usd: z.number().positive(),
  avg_daily_sales_usd: z.number().nonnegative(),
  account_age_days: z.number().int().nonnegative(),
  open_disputes_count: z.number().int().nonnegative(),
  chargeback_count_90d: z.number().int().nonnegative(),
  total_payouts_ytd: z.number().nonnegative(),
  last_payout_date: z.string().optional(),
  risk_flags: z.array(z.string()).default([]),
  velocity_24h_count: z.number().int().nonnegative(),
  velocity_24h_amount: z.number().nonnegative(),
});

export async function buildPayoutState(merchantId: string, payoutAmount: number, currency = "USD"): Promise<PayoutStateData> {
  const merchant = db.merchants.get(merchantId);
  if (!merchant) {
    throw new Error(`Merchant with id ${merchantId} not found`);
  }

  // Convert payout amount to USD equivalent for standard risk normalization
  // Rates approx: 1 USD = 3.10 TND, 1 USD = 3.64 QAR, 1 EUR = 1.08 USD
  let payoutAmountUsd = payoutAmount;
  if (currency === "TND" || merchant.currency === "TND") {
    payoutAmountUsd = payoutAmount / 3.10;
  } else if (currency === "QAR" || merchant.currency === "QAR") {
    payoutAmountUsd = payoutAmount / 3.64;
  }

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  // Transactions in last 90 days
  const merchantTransactions = Array.from(db.transactions.values()).filter(
    (t) => t.merchantId === merchantId && new Date(t.createdAt) >= ninetyDaysAgo
  );

  // Completed sales
  const completedCharges = merchantTransactions.filter(
    (t) => t.type === "charge" && t.status === "completed"
  );

  let totalSales = completedCharges.reduce((sum, t) => sum + Number(t.amount), 0);
  if (currency === "TND" || merchant.currency === "TND") {
    totalSales = totalSales / 3.10;
  } else if (currency === "QAR" || merchant.currency === "QAR") {
    totalSales = totalSales / 3.64;
  }

  const avgDailySales = totalSales > 0 ? totalSales / 90 : 50;

  // Merchant payouts
  const merchantPayouts = Array.from(db.payouts.values()).filter(
    (p) => p.merchantId === merchantId
  );

  // Payouts YTD
  const payoutsYtd = merchantPayouts
    .filter((p) => new Date(p.createdAt) >= startOfYear && p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  // Recent payouts in last 24h
  const recentPayouts24h = merchantPayouts.filter(
    (p) => new Date(p.createdAt) >= oneDayAgo && (p.status === "paid" || p.status === "processing" || p.status === "manual_review")
  );

  // Risk events
  const merchantRiskEvents = Array.from(db.riskEvents.values()).filter(
    (e) => e.merchantId === merchantId && new Date(e.createdAt) >= ninetyDaysAgo
  );

  // Risk flags extraction
  const riskFlags: string[] = [];
  if (merchantRiskEvents.some((e) => e.severity === "critical")) {
    riskFlags.push("critical_event_90d");
  }
  if (recentPayouts24h.length >= 3) {
    riskFlags.push("high_velocity_24h");
  }
  if (merchant.accountAgeDays < 30) {
    riskFlags.push("new_account_under_30d");
  }
  if (payoutAmountUsd > avgDailySales * 3.5 && avgDailySales > 0) {
    riskFlags.push("spike_withdrawal_over_3.5x_daily");
  }
  if (merchant.kycStatus !== "approved") {
    riskFlags.push("unverified_kyc");
  }

  const openDisputes = merchantRiskEvents.filter(
    (e) => e.eventType === "dispute" && !e.details?.resolved
  ).length;

  const chargebacks90d = merchantRiskEvents.filter(
    (e) => e.eventType === "chargeback"
  ).length;

  // Most recent payout
  const sortedPayouts = [...merchantPayouts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const lastPayoutDate = sortedPayouts[0]?.createdAt;

  const rawState = {
    merchant_id: merchant.id,
    payout_amount_usd: Math.round(payoutAmountUsd * 100) / 100,
    avg_daily_sales_usd: Math.round(avgDailySales * 100) / 100,
    account_age_days: merchant.accountAgeDays,
    open_disputes_count: openDisputes,
    chargeback_count_90d: chargebacks90d,
    total_payouts_ytd: Math.round(payoutsYtd * 100) / 100,
    last_payout_date: lastPayoutDate,
    risk_flags: riskFlags,
    velocity_24h_count: recentPayouts24h.length,
    velocity_24h_amount: recentPayouts24h.reduce((sum, p) => sum + Number(p.amount), 0),
  };

  return PayoutStateSchema.parse(rawState);
}
