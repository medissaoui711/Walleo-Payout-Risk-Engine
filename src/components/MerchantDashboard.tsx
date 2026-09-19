import React, { useState } from "react";
import { 
  ArrowUpRight, 
  Building, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck, 
  CreditCard, 
  ArrowDownRight,
  Info,
  Sparkles,
  RefreshCw,
  Lock
} from "lucide-react";
import confetti from "canvas-confetti";
import { Merchant, BankAccount, Transaction, Payout, JevRoutingDecision } from "../types";
import { formatMoney, convertCurrency, maskAccountNumber, maskIBAN } from "../lib/currency";

interface MerchantDashboardProps {
  merchant: Merchant;
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  payouts: Payout[];
  currency: string;
  lang: 'ar' | 'en';
  onRequestPayoutSuccess: () => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  merchant,
  bankAccounts,
  transactions,
  payouts,
  currency,
  lang,
  onRequestPayoutSuccess,
}) => {
  const isAr = lang === 'ar';
  const [payoutAmount, setPayoutAmount] = useState("");
  const [selectedBankId, setSelectedBankId] = useState<string>(bankAccounts[0]?.id || "");
  const [status, setStatus] = useState<"idle" | "processing" | "approved" | "review" | "error">("idle");
  const [lastResult, setLastResult] = useState<JevRoutingDecision | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const availableBalanceInCur = convertCurrency(merchant.availableBalance, merchant.currency, currency);

  async function handlePayoutRequest(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = parseFloat(payoutAmount);
    if (!amountNum || amountNum <= 0) {
      setErrorMessage(isAr ? "يرجى إدخال مبلغ سحب صحيح" : "Please enter a valid payout amount");
      setStatus("error");
      return;
    }

    const maxAllowedInCur = availableBalanceInCur;
    if (amountNum > maxAllowedInCur) {
      setErrorMessage(isAr ? "المبلغ المطلوب يتجاوز الرصيد المتاح" : "Requested amount exceeds available balance");
      setStatus("error");
      return;
    }

    // Convert requested amount back to merchant native currency for backend processing
    const amountInMerchantCur = convertCurrency(amountNum, currency, merchant.currency);
    const idempotencyKey = `idem-${merchant.id}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    setStatus("processing");
    setErrorMessage("");

    try {
      const response = await fetch("/api/payouts/request", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify({
          merchantId: merchant.id,
          amount: amountInMerchantCur,
          bankAccountId: selectedBankId || bankAccounts[0]?.id,
          currency: merchant.currency,
          idempotencyKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process payout");
      }

      setLastResult(data);

      if (data.action === "AUTO_APPROVE") {
        setStatus("approved");
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setStatus("review");
      }

      setPayoutAmount("");
      onRequestPayoutSuccess();
    } catch (err: any) {
      console.error("Payout error:", err);
      setStatus("error");
      setErrorMessage(err.message || "An error occurred");
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Merchant Identity */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl">
              {merchant.country === 'Tunisia' ? '🇹🇳' : '🇶🇦'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">
                  {isAr && merchant.businessNameAr ? merchant.businessNameAr : merchant.businessName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isAr ? "KYC موثق" : "Verified KYC"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  {merchant.riskTier.toUpperCase()} TIER
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span>{merchant.email}</span>
                <span>•</span>
                <span>{isAr ? `معرف الضريبة: ${merchant.taxId || 'N/A'}` : `Tax ID: ${merchant.taxId || 'N/A'}`}</span>
                <span>•</span>
                <span>{isAr ? `عمر الحساب: ${merchant.accountAgeDays} يوماً` : `Account Age: ${merchant.accountAgeDays} days`}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-right">
              <span className="text-[11px] text-slate-400 block">{isAr ? "العملة الأساسية" : "Base Currency"}</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{merchant.currency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Available Balance Card */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isAr ? "الرصيد المتاح للسحب" : "Available Balance"}
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
            {formatMoney(availableBalanceInCur, currency, lang)}
          </div>
          {currency !== merchant.currency && (
            <p className="text-xs text-slate-400 mt-1 font-mono">
              ≈ {formatMoney(merchant.availableBalance, merchant.currency, lang)} ({isAr ? "بالعملة الأصلية" : "Native"})
            </p>
          )}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div>
              {merchant.heldBalance > 0 ? (
                <span className="text-amber-400 font-mono flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {isAr ? "محجوز قيد المعالجة:" : "Held in Escrow:"} {formatMoney(merchant.heldBalance, merchant.currency, lang)}
                </span>
              ) : (
                <span>{isAr ? "سحب فوري متاح" : "Instant Payout Eligible"}</span>
              )}
            </div>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Sentinel Instant Ready
            </span>
          </div>
        </div>

        {/* Total YTD Payouts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isAr ? "إجمالي السحوبات (YTD)" : "Total Payouts (YTD)"}
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
            {formatMoney(
              convertCurrency(
                payouts.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0),
                merchant.currency,
                currency
              ),
              currency,
              lang
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {isAr ? `عدد عمليات السحب المكتملة: ${payouts.filter(p => p.status === 'paid').length}` : `${payouts.filter(p => p.status === 'paid').length} successful transfers`}
          </p>
        </div>

        {/* Bank Account Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {isAr ? "الحساب البنكي المعتمد" : "Settlement Bank"}
              </span>
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                <Building className="w-5 h-5" />
              </div>
            </div>
            <div className="font-bold text-white text-base truncate">
              {bankAccounts[0]?.bankName || "BIAT / QNB Settlement"}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              IBAN: {bankAccounts[0]?.iban ? maskIBAN(bankAccounts[0].iban) : "TN59 •••• •••• 4892"}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              {isAr ? "حساب موثق ومطابق" : "Verified Settlement Route"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Request Payout Form + Bank Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Payout Card (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                {isAr ? "طلب سحب الأرباح (Payout Request)" : "Request Merchant Payout"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? "يتم تقييم كل طلب لحظياً عبر محرك Walleo Sentinel للموافقة الفورية أو التوجيه للمراجعة الأمنية" : "Every payout is evaluated in real-time by Walleo Sentinel Engine for instant auto-approval or risk routing"}
              </p>
            </div>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-mono">
              {merchant.country === 'Tunisia' ? 'BCT 2018-16 Compliant' : 'QCB FinTech Sandbox'}
            </span>
          </div>

          <form onSubmit={handlePayoutRequest} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? "المبلغ المطلوب سحبه" : "Withdrawal Amount"} ({currency})
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutAmount((availableBalanceInCur * 0.25).toFixed(2))}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutAmount((availableBalanceInCur * 0.50).toFixed(2))}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutAmount(availableBalanceInCur.toFixed(2))}
                    className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/30"
                  >
                    {isAr ? "الكل (Max)" : "Max"}
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  id="input-payout-amount"
                  type="number"
                  step="0.01"
                  min="1"
                  max={availableBalanceInCur}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder={isAr ? `مثال: ${(availableBalanceInCur * 0.4).toFixed(2)}` : `e.g. ${(availableBalanceInCur * 0.4).toFixed(2)}`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <span className="absolute left-4 rtl:left-auto rtl:right-auto rtl:left-4 top-3.5 text-slate-400 font-bold font-mono">
                  {currency}
                </span>
              </div>
            </div>

            {/* Bank selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {isAr ? "الحساب البنكي للتحويل" : "Destination Settlement Bank"}
              </label>
              <select
                id="select-payout-bank"
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
              >
                {bankAccounts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} - {maskAccountNumber(b.accountNumber)} ({b.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              id="btn-submit-payout"
              type="submit"
              disabled={status === "processing" || !payoutAmount || parseFloat(payoutAmount) <= 0}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                status === "processing"
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-[0.99]"
              }`}
            >
              {status === "processing" ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isAr ? "جاري تقييم المخاطر عبر Walleo Sentinel..." : "Evaluating Risk via Walleo Sentinel..."}</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{isAr ? "تأكيد طلب السحب الفوري" : "Confirm Payout Request"}</span>
                </>
              )}
            </button>

            {/* Results Banners */}
            {status === "approved" && lastResult && (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 rounded-xl space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                  <CheckCircle className="w-5 h-5" />
                  <span>{isAr ? "✅ تمت الموافقة الفورية على السحب تلقائياً!" : "Instant Auto-Approval Granted!"}</span>
                </div>
                <p className="text-xs text-emerald-300/90 leading-relaxed">
                  {isAr 
                    ? "قام محرك Walleo Sentinel بفحص درجة الثقة (Trust Score) ومعدل الشحن المرتد ومؤشرات AML بنجاح بنسبة ثقة عالية. سيتم تحويل الأموال إلى حسابك البنكي خلال 1-3 أيام عمل."
                    : "Walleo Sentinel Engine evaluated your account age, zero dispute history, and velocity with high confidence. Payout is dispatched to your settlement bank."}
                </p>
                <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                  <span>Audit Log ID: {lastResult.auditLogId}</span>
                  <span>Decision: AUTO_APPROVE (Conf: {(lastResult.evalResult.autoApproveConfidence * 100).toFixed(0)}%)</span>
                </div>
              </div>
            )}

            {status === "review" && lastResult && (
              <div className="p-4 bg-amber-950/60 border border-amber-500/40 text-amber-200 rounded-xl space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                  <Clock className="w-5 h-5" />
                  <span>{isAr ? "⏳ طلبك قيد المراجعة الأمنية ومسؤول المخاطر" : "Queued for Manual Security Review"}</span>
                </div>
                <p className="text-xs text-amber-300/90 leading-relaxed">
                  {isAr 
                    ? `تم تحويل المعاملة إلى طابور المراجعة الأمنية بسبب: ${lastResult.reason}. سنقوم بمراجعة الطلب وإشعارك خلال 24 ساعة كحد أقصى.`
                    : `Your payout was routed to the Risk Review Queue due to: ${lastResult.reason}. Our operations team will process it within 24 hours.`}
                </p>
                <div className="pt-2 border-t border-amber-900/60 flex items-center justify-between text-[11px] font-mono text-amber-400">
                  <span>Audit Reference: {lastResult.auditLogId}</span>
                  <span>Status: MANUAL_REVIEW</span>
                </div>
              </div>
            )}

            {status === "error" && errorMessage && (
              <div className="p-4 bg-red-950/60 border border-red-500/40 text-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span className="text-xs font-medium">{errorMessage}</span>
              </div>
            )}
          </form>
        </div>

        {/* Side Risk & Guidelines Summary */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {isAr ? "معايير الموافقة الفورية (Sentinel)" : "Auto-Approval Benchmarks"}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{isAr ? "عمر حساب التاجر > 90 يوماً وسجل نظيف" : "Merchant account age > 90 days"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{isAr ? "نسبة النزاعات والشحن المرتد < 2 خلال 90 يوماً" : "Chargeback count < 2 in last 90 days"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{isAr ? "المبلغ المطلوب ضمن المعدل اليومي المعتاد للمبيعات" : "Withdrawal within average daily sales limits"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{isAr ? "عدم وجود محاولات سحب متكررة في آخر 24 ساعة" : "No rapid velocity spikes in 24 hours"}</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400">
            <h5 className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-400" />
              {isAr ? "الامتثال المصرفي المحلي" : "Regional Banking Rails"}
            </h5>
            <p className="leading-relaxed">
              {merchant.country === 'Tunisia'
                ? isAr ? "يتم تسوية السحوبات في تونس عبر نظام المقاصة الإلكترونية والتحويلات المصرفية المحلية (BIAT, Attijari, STB)." : "Settlements in Tunisia are cleared via national banking rails."
                : isAr ? "تتم التسوية في قطر عبر شبكة NAPS الوطنية وبنك قطر الوطني (QNB) والمصرف التجاري." : "Settlements in Qatar run via QCB NAPS & QNB."}
            </p>
          </div>
        </div>
      </div>

      {/* Tables: Recent Payouts & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payouts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              {isAr ? "سجل السحوبات الأخيرة" : "Recent Payouts"}
            </h3>
            <span className="text-xs text-slate-400">{payouts.length} {isAr ? "عمليات" : "records"}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2">{isAr ? "المبلغ" : "Amount"}</th>
                  <th className="pb-2">{isAr ? "الحالة" : "Status"}</th>
                  <th className="pb-2">{isAr ? "تقييم Jev" : "Jev Risk"}</th>
                  <th className="pb-2">{isAr ? "التاريخ" : "Date"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-white">
                      {formatMoney(p.amount, p.currency, lang)}
                    </td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        p.status === "paid"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : p.status === "manual_review"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-slate-800 text-slate-300"
                      }`}>
                        {p.status === "paid" ? (isAr ? "مدفوع فوراً" : "Paid") :
                         p.status === "manual_review" ? (isAr ? "مراجعة أمنية" : "In Review") :
                         p.status}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className="font-mono text-slate-300">
                        {p.riskLevel ? p.riskLevel.replace('_', ' ') : 'Standard'}
                        {p.riskScore ? ` (${p.riskScore}/100)` : ''}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400 font-mono text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString(isAr ? 'ar-TN' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-teal-400" />
              {isAr ? "معاملات المتجر الواردة" : "Incoming Store Sales"}
            </h3>
            <span className="text-xs text-slate-400">{transactions.length} {isAr ? "معاملات" : "records"}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2">{isAr ? "المبلغ" : "Amount"}</th>
                  <th className="pb-2">{isAr ? "النوع" : "Type"}</th>
                  <th className="pb-2">{isAr ? "طريقة الدفع" : "Method"}</th>
                  <th className="pb-2">{isAr ? "التاريخ" : "Date"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.slice(0, 7).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className={`py-2.5 font-mono font-bold ${
                      t.type === "chargeback" ? "text-red-400" : "text-emerald-400"
                    }`}>
                      {t.type === "chargeback" ? "-" : "+"} {formatMoney(t.amount, t.currency, lang)}
                    </td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        t.type === "chargeback"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-slate-800 text-slate-300"
                      }`}>
                        {t.type === "chargeback" ? (isAr ? "شحن مرتد (نزاع)" : "Chargeback") : (isAr ? "مبيعات مكتملة" : "Charge")}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-300 truncate max-w-[140px]">
                      {t.paymentMethod || "Visa / Mastercard"}
                    </td>
                    <td className="py-2.5 text-slate-400 font-mono text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString(isAr ? 'ar-TN' : 'en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
