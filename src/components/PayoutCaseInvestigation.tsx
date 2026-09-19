import React, { useState } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  ArrowLeft, 
  Building2, 
  Clock, 
  FileText, 
  UserCheck, 
  UserPlus, 
  Scale, 
  Cpu, 
  Sparkles, 
  ExternalLink,
  History,
  Check,
  X,
  AlertOctagon,
  Download
} from "lucide-react";
import { formatMoney } from "../lib/currency";

interface PayoutCaseInvestigationProps {
  payoutId: string;
  lang: 'ar' | 'en';
  onBack: () => void;
  onDecisionSubmitted?: () => void;
}

export const PayoutCaseInvestigation: React.FC<PayoutCaseInvestigationProps> = ({
  payoutId,
  lang,
  onBack,
  onDecisionSubmitted,
}) => {
  const isAr = lang === 'ar';

  // Role simulation
  const [currentUserRole, setCurrentUserRole] = useState<'MAKER' | 'CHECKER' | 'COMPLIANCE_ADMIN'>('MAKER');

  // Maker form state
  const [makerId, setMakerId] = useState("ops_maker_44");
  const [makerRec, setMakerRec] = useState<"RECOMMEND_APPROVE" | "RECOMMEND_REJECT">("RECOMMEND_APPROVE");
  const [makerNotes, setMakerNotes] = useState("Beneficiary merchant tax ID verified with Tunisian Trade Registry (RNE). Historical chargeback rate is 0.0%. Velocity surge verified against Ramadan promotional campaign invoices.");
  const [makerSubmitted, setMakerSubmitted] = useState(false);

  // Checker form state
  const [checkerId, setCheckerId] = useState("ops_checker_92");
  const [checkerDecision, setCheckerDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [checkerNotes, setCheckerNotes] = useState("Commercial registry and sanctions screening validated. Dual-signoff authorized for Bank BIAT routing.");
  const [checkerSubmitted, setCheckerSubmitted] = useState(false);

  // Compliance hold state
  const [complianceHoldActive, setComplianceHoldActive] = useState(false);
  const [showRawEvaluation, setShowRawEvaluation] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Mock case details for PO-101
  const caseData = {
    payoutId: payoutId || "PO-101",
    status: checkerSubmitted 
      ? (checkerDecision === 'APPROVED' ? 'SETTLED' : 'REVERSED')
      : (makerSubmitted ? 'PENDING_CHECKER' : 'MANUAL_REVIEW'),
    amount: 2500, // $2,500.00
    currency: "USD",
    merchantId: "MER-204",
    merchantName: "Carthage Retail S.A.R.L",
    merchantNameAr: "قرطاج للتجارة والتجزئة ش.م.م",
    bankName: "BIAT (Banque Internationale Arabe de Tunisie)",
    accountMasked: "BIAT •••• 1259",
    ibanMasked: "TN59 •••• •••• •••• 1259",
    createdAt: "2026-09-19T07:15:22Z",
    owner: makerSubmitted ? "ops_checker_92" : "ops_maker_44",
    slaCountdown: "18m 42s",
    policyVersion: "POL-MENA-2026.04",
    modelVersion: "Sentinel-Core-v3.2.1",
    stateSchemaVersion: "2.1.0",
  };

  const handleMakerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMakerSubmitted(true);
    setCurrentUserRole('CHECKER');
  };

  const handleCheckerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckerSubmitted(true);
    if (onDecisionSubmitted) onDecisionSubmitted();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* CASE HEADER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer mt-0.5"
            title={isAr ? "العودة إلى طابور المراجعة" : "Back to Review Queue"}
          >
            <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap font-mono">
              <span className="text-lg font-bold text-white">{caseData.payoutId}</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono border ${
                caseData.status === 'SETTLED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : caseData.status === 'REVERSED'
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}>
                {caseData.status}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-sans text-xs">
                {isAr ? caseData.merchantNameAr : caseData.merchantName} ({caseData.merchantId})
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-4 flex-wrap">
              <span>{isAr ? "المبلغ المطلوب:" : "Amount:"} <strong className="font-mono text-emerald-400 text-sm">${caseData.amount.toLocaleString()} USD</strong></span>
              <span>{isAr ? "المسؤول الحالي:" : "Current Owner:"} <strong className="font-mono text-slate-200">{caseData.owner}</strong></span>
              <span className="flex items-center gap-1 text-amber-400 font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>SLA: {caseData.slaCountdown}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Role Switching & Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role selector simulator for testing Maker/Checker */}
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1 text-xs">
            <span className="text-[10px] text-slate-500 uppercase px-2 font-mono">Simulate Role:</span>
            <button
              onClick={() => setCurrentUserRole('MAKER')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold ${currentUserRole === 'MAKER' ? 'bg-slate-800 text-amber-400 border border-slate-700' : 'text-slate-400 hover:text-white'}`}
            >
              Maker
            </button>
            <button
              onClick={() => setCurrentUserRole('CHECKER')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold ${currentUserRole === 'CHECKER' ? 'bg-slate-800 text-purple-400 border border-slate-700' : 'text-slate-400 hover:text-white'}`}
            >
              Checker
            </button>
            <button
              onClick={() => setCurrentUserRole('COMPLIANCE_ADMIN')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold ${currentUserRole === 'COMPLIANCE_ADMIN' ? 'bg-slate-800 text-teal-300 border border-slate-700' : 'text-slate-400 hover:text-white'}`}
            >
              Compliance
            </button>
          </div>

          <button
            onClick={() => setComplianceHoldActive(!complianceHoldActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              complianceHoldActive
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{complianceHoldActive ? (isAr ? "الحجز الرقابي مفعل" : "Compliance Hold ON") : (isAr ? "فرض حجز رقابي" : "Place Compliance Hold")}</span>
          </button>
        </div>
      </div>

      {/* SECTION A & B: DECISION SUMMARY & MANDATORY CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Section A: Sentinel Decision Summary */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {isAr ? "أ. ملخص تقييم Sentinel (Decision Summary)" : "A. Sentinel Decision Summary"}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{caseData.modelVersion}</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{isAr ? "فئة الخطورة:" : "Risk Tier:"}</span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                MEDIUM / REVIEW_REQUIRED
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{isAr ? "احتمالية الموافقة الآلية:" : "Auto-Approve Probability:"}</span>
              <span className="font-mono text-slate-200 font-bold text-xs">71.4% (Threshold: 85.0%)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{isAr ? "مستوى الثقة الإجمالي:" : "Confidence Score:"}</span>
              <span className="font-mono text-emerald-400 font-bold text-xs">88.2%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{isAr ? "القرار السياساتي النهائي:" : "Final Policy Routing:"}</span>
              <span className="font-mono text-amber-400 font-bold text-xs">ROUTED_TO_MANUAL_REVIEW</span>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2">
              {isAr ? "رموز الأسباب المنطقية (Reason Codes):" : "Explainable Reason Codes:"}
            </h4>
            <div className="space-y-1.5">
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono">
                FLAG_VELOCITY_24H_BURST (+185% vs 30d baseline)
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono">
                FLAG_BENEFICIARY_COOLDOWN (Account added &lt; 24h ago)
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Mandatory Operational Controls */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {isAr ? "ب. الضوابط التشغيلية الإلزامية (Mandatory Controls)" : "B. Mandatory Controls Matrix"}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-teal-400">7/7 Evaluated</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* Control 1 */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">1. KYC Merchant Verification</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PASS
              </span>
            </div>

            {/* Control 2 */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">2. Beneficiary Bank Route</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PASS (BIAT)
              </span>
            </div>

            {/* Control 3 */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">3. Sanctions & AML Screening</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                CLEAR
              </span>
            </div>

            {/* Control 4 */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">4. Ledger Available Balance</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PASSED ($8,420)
              </span>
            </div>

            {/* Control 5 */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">5. Idempotency Key Guard</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                VERIFIED
              </span>
            </div>

            {/* Control 6 */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">6. Bank Account Cooldown</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                WARNING (3h ago)
              </span>
            </div>

            {/* Control 7 */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between sm:col-span-2">
              <span className="text-slate-300">7. Velocity & Surge Anomaly Limit</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                REVIEW REQUIRED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION C & D & E: EVIDENCE, FINANCIAL TIMELINE, BANK TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Section C: Sentinel Evidence & AI Narrative */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {isAr ? "ج. أدلة وتفسيرات Sentinel (Explainable Evidence)" : "C. Explainable Sentinel Evidence"}
              </h3>
            </div>
            <button
              onClick={() => setShowRawEvaluation(!showRawEvaluation)}
              className="text-[11px] font-mono text-teal-400 hover:text-teal-300 cursor-pointer"
            >
              {showRawEvaluation ? (isAr ? "إخفاء التفاصيل الأولية" : "Hide Raw JSON") : (isAr ? "عرض التقييم الأولي" : "Open Raw Evaluation")}
            </button>
          </div>

          <div className="p-3.5 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-xs space-y-2">
            <span className="font-bold text-indigo-300 block">AI Forensic Risk Narrative:</span>
            <p className="text-indigo-200/90 leading-relaxed text-[11px]">
              "Merchant registered 412 days ago in Tunisia with stable transaction history. Payout request of $2,500 occurs alongside a 3-hour-old bank account modification. While KYC identity matches commercial registry, dual Maker/Checker verification is mandated to confirm account ownership prior to settlement."
            </p>
          </div>

          {showRawEvaluation && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400 overflow-x-auto max-h-40">
              <pre>{JSON.stringify({
                payout_id: "PO-101",
                merchant_state: { id: "MER-204", country: "TN", risk_tier: "standard" },
                policy: caseData.policyVersion,
                features: { velocity_24h: 2500, avg_daily_sales: 1200, chargebacks_90d: 0 },
                invariants_passed: true,
                hash: "4c2a99e81b...298df"
              }, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Section D & E: Financial & Bank / PSP Timeline */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {isAr ? "د. الخط الزمني المالي والمصرفي (Ledger & Bank Timeline)" : "D & E. Financial & Bank Timeline"}
              </h3>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-emerald-500/30">
                1
              </div>
              <div className="flex-1 pb-2 border-b border-slate-800">
                <div className="flex justify-between font-mono">
                  <span className="font-bold text-white">LEDGER_HOLD_CREATED</span>
                  <span className="text-slate-500 text-[10px]">10:41:02 UTC</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Journal #JRN-9021 • Debit: Available ($2,500) • Credit: Held Escrow ($2,500)
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-amber-500/30">
                2
              </div>
              <div className="flex-1 pb-2 border-b border-slate-800">
                <div className="flex justify-between font-mono">
                  <span className="font-bold text-white">SENTINEL_ROUTED_MANUAL_REVIEW</span>
                  <span className="text-slate-500 text-[10px]">10:41:05 UTC</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Actor: Sentinel_Policy_V2 • Case queued for Maker investigation
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border ${
                checkerSubmitted ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                3
              </div>
              <div className="flex-1">
                <div className="flex justify-between font-mono">
                  <span className="font-bold text-white">{checkerSubmitted ? 'SUBMITTED_TO_BANK_PARTNER' : 'AWAITING_CHECKER_AUTHORIZATION'}</span>
                  <span className="text-slate-500 text-[10px]">{checkerSubmitted ? 'JUST NOW' : 'PENDING'}</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Bank Route: {caseData.bankName} • Account: {caseData.accountMasked}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION F: MAKER / CHECKER DUAL-CONTROL INVESTIGATION PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {isAr ? "و. لوحة التحقيق والاعتماد المزدوج (Maker / Checker Review Panel)" : "F. Maker / Checker Review & Authorization"}
              </h3>
              <span className="text-[11px] text-slate-400">
                {isAr ? "شرط العزل الإلزامي: لا يمكن للمُعد (Maker) اعتماد الحالة التي أعدها بنفسه." : "Segregation Invariant: You cannot approve a case you prepared."}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* STAGE 1: MAKER INVESTIGATION */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs text-white uppercase tracking-wider">
                  {isAr ? "المرحلة الأولى: إعداد التحقيق (Maker)" : "Stage 1: Maker Investigation"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-400">
                {makerSubmitted ? "✓ COMPLETED" : "IN PROGRESS"}
              </span>
            </div>

            {!makerSubmitted ? (
              <form onSubmit={handleMakerSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">{isAr ? "معرف المُعد (Maker ID)" : "Maker Officer ID"}</label>
                  <input
                    type="text"
                    value={makerId}
                    onChange={(e) => setMakerId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">{isAr ? "التوصية المرفوعة" : "Recommendation"}</label>
                  <select
                    value={makerRec}
                    onChange={(e) => setMakerRec(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs font-mono"
                  >
                    <option value="RECOMMEND_APPROVE">RECOMMEND_APPROVE (Verified Invoices & Identity)</option>
                    <option value="RECOMMEND_REJECT">RECOMMEND_REJECT (Suspicious Velocity / Bank Mismatch)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">{isAr ? "ملاحظات التحقيق والأدلة" : "Investigation Notes & Evidence"}</label>
                  <textarea
                    rows={3}
                    value={makerNotes}
                    onChange={(e) => setMakerNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  {isAr ? "إحالة التوصية إلى المُراجع (Checker)" : "Submit Recommendation to Checker"}
                </button>
              </form>
            ) : (
              <div className="text-xs space-y-2 text-slate-300">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-400">Maker: {makerId}</span>
                  <span className="text-emerald-400 font-bold">{makerRec}</span>
                </div>
                <p className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  {makerNotes}
                </p>
              </div>
            )}
          </div>

          {/* STAGE 2: CHECKER FINAL DECISION */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-xs text-white uppercase tracking-wider">
                  {isAr ? "المرحلة الثانية: الاعتماد النهائي (Checker)" : "Stage 2: Checker Authorization"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-purple-400">
                {checkerSubmitted ? "✓ FINALIZED" : "AWAITING SIGN-OFF"}
              </span>
            </div>

            {makerSubmitted && !checkerSubmitted ? (
              <form onSubmit={handleCheckerSubmit} className="space-y-3 text-xs">
                <div className="p-2 rounded-lg bg-purple-950/20 border border-purple-500/30 text-[10px] text-purple-200">
                  {isAr 
                    ? "✓ تم التحقق من عزل الصلاحيات: Checker مختلف عن Maker (ops_checker_92 ≠ ops_maker_44)."
                    : "✓ Segregation Check Passed: Checker is distinct from Maker (ops_checker_92 ≠ ops_maker_44)."}
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">{isAr ? "معرف المعتمد (Checker ID)" : "Checker Officer ID"}</label>
                  <input
                    type="text"
                    value={checkerId}
                    onChange={(e) => setCheckerId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">{isAr ? "القرار المصرفي النهائي" : "Binding Decision"}</label>
                  <select
                    value={checkerDecision}
                    onChange={(e) => setCheckerDecision(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs font-mono"
                  >
                    <option value="APPROVED">APPROVE_AND_ROUTE_TO_BANK ($2,500 to BIAT)</option>
                    <option value="REJECTED">REJECT_AND_RELEASE_LEDGER_HOLD</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">{isAr ? "ملاحظات الامتثال والتوقيع" : "Compliance Sign-off Notes"}</label>
                  <input
                    type="text"
                    value={checkerNotes}
                    onChange={(e) => setCheckerNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    {isAr ? "تنفيذ الاعتماد والتوجيه المصرفي" : "Execute Authorization & Route"}
                  </button>
                </div>
              </form>
            ) : checkerSubmitted ? (
              <div className="text-xs space-y-2 text-slate-300">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-400">Checker: {checkerId}</span>
                  <span className="text-emerald-400 font-bold">{checkerDecision}</span>
                </div>
                <p className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  {checkerNotes}
                </p>
                <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
                  ✓ Ledger updated: SETTLE • Bank reference: TX-BIAT-88219
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                {isAr ? "بانتظار استكمال مرحلة إعداد التحقيق (Maker) أولاً." : "Stage 1 (Maker) must be submitted before Checker authorization."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION G: IMMUTABLE AUDIT TIMELINE & EXPORT */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {isAr ? "ز. سجل التدقيق غير القابل للتعديل والتصدير الرقابي" : "G. Immutable Audit Timeline & Compliance Package"}
            </h3>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? "تصدير حزمة الامتثال (PDF/ZIP)" : "Export Compliance Package"}</span>
          </button>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
          <span>Case Hash Chain: <strong>4c2a99e81b89...884fe01a</strong></span>
          <span className="text-emerald-400 font-bold">✓ CRYPTOGRAPHICALLY VERIFIED</span>
        </div>
      </div>

      {/* EXPORT CONFIRMATION MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {isAr ? "تصدير حزمة التدقيق والامتثال التنظيمي" : "Export Regulatory Compliance Package"}
              </h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr 
                ? "سيتم إنشاء ملف موقع رقمياً يحتوي على: قرارات Sentinel، قيود دفتر الأستاذ المزدوج، توقيعات Maker/Checker، وبصمات SHA-256 للبنك المركزي."
                : "This creates a cryptographically signed compliance docket with full Maker/Checker logs, double-entry ledger journals, and SHA-256 audit proof for bank auditors."}
            </p>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-teal-400">
              Target: Walleo_Sentinel_Dossier_PO-101.tar.gz
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={() => {
                  alert(isAr ? "تم تصدير حزمة الامتثال بنجاح وتوثيق بصمة التصدير في سجل التدقيق." : "Compliance package generated and sealed with SHA-256 hash.");
                  setShowExportModal(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
              >
                {isAr ? "تأكيد وتصدير الحزمة" : "Authorize & Download"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
