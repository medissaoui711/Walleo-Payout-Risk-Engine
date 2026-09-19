import React, { useState } from "react";
import { 
  Cpu, 
  Sliders, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Activity, 
  FileCode2, 
  RefreshCw,
  GitBranch,
  ShieldCheck,
  Check,
  X
} from "lucide-react";
import { JevEvaluationResult, ShadowModeReport } from "../types";
import { formatMoney } from "../lib/currency";

interface JevSimulatorProps {
  lang: 'ar' | 'en';
}

export const JevSimulator: React.FC<JevSimulatorProps> = ({ lang }) => {
  const isAr = lang === 'ar';

  // Simulator State Parameters
  const [payoutAmountUsd, setPayoutAmountUsd] = useState<number>(1200);
  const [avgDailySalesUsd, setAvgDailySalesUsd] = useState<number>(450);
  const [accountAgeDays, setAccountAgeDays] = useState<number>(140);
  const [openDisputesCount, setOpenDisputesCount] = useState<number>(0);
  const [chargebackCount90d, setChargebackCount90d] = useState<number>(0);
  const [velocity24hCount, setVelocity24hCount] = useState<number>(1);
  const [velocity24hAmount, setVelocity24hAmount] = useState<number>(500);

  // Results State
  const [isRunning, setIsRunning] = useState(false);
  const [simResult, setSimResult] = useState<{
    state: any;
    evalResult: JevEvaluationResult;
    decision: 'AUTO_APPROVE' | 'MANUAL_REVIEW';
  } | null>(null);

  // Shadow Mode State
  const [isTestingShadow, setIsTestingShadow] = useState(false);
  const [shadowReport, setShadowReport] = useState<ShadowModeReport | null>(null);

  // Canary Deployment State
  const [canaryPercentage, setCanaryPercentage] = useState<number>(10);
  const [isJevEnabled, setIsJevEnabled] = useState<boolean>(true);

  async function runSimulation() {
    setIsRunning(true);
    try {
      const customState = {
        merchant_id: "m-simulated",
        payout_amount_usd: payoutAmountUsd,
        avg_daily_sales_usd: avgDailySalesUsd,
        account_age_days: accountAgeDays,
        open_disputes_count: openDisputesCount,
        chargeback_count_90d: chargebackCount90d,
        total_payouts_ytd: 14500,
        risk_flags: [
          ...(chargebackCount90d > 1 ? ["chargeback_spike"] : []),
          ...(velocity24hCount > 3 ? ["high_velocity_24h"] : []),
          ...(accountAgeDays < 30 ? ["new_account_under_30d"] : [])
        ],
        velocity_24h_count: velocity24hCount,
        velocity_24h_amount: velocity24hAmount,
      };

      const res = await fetch("/api/risk/evaluate-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customState }),
      });

      const data = await res.json();
      const evalRes: JevEvaluationResult = data.evalResult;
      const isAuto = evalRes.autoApprove && evalRes.autoApproveConfidence >= 0.85 && evalRes.riskConfidence >= 0.85;

      setSimResult({
        state: data.state,
        evalResult: evalRes,
        decision: isAuto ? 'AUTO_APPROVE' : 'MANUAL_REVIEW',
      });
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsRunning(false);
    }
  }

  async function runShadowModeBenchmark() {
    setIsTestingShadow(true);
    try {
      const res = await fetch("/api/shadow-mode/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setShadowReport(data);
    } catch (err) {
      console.error("Shadow mode error:", err);
    } finally {
      setIsTestingShadow(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">
              {isAr ? "محرك القرار الذكي Walleo Sentinel ومحاكاة المخاطر" : "Walleo Sentinel Decision Engine & Shadow Testing"}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr 
              ? "اختبار خوارزمية التقييم الاحتمالي لمصفوفة الأمان وتوجيه السحوبات بنسبة ثقة عتبية 0.85"
              : "Interactive parameter tuning, live state builder execution, and Shadow Mode historical verification"}
          </p>
        </div>

        {/* Quick Canary Badge */}
        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <GitBranch className="w-4 h-4 text-emerald-400" />
          <div className="text-xs">
            <span className="text-slate-400 block">{isAr ? "نسبة النشر التدريجي" : "Canary Routing"}</span>
            <span className="font-mono font-bold text-emerald-400">{canaryPercentage}% Live Traffic</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters vs Real-time Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Sliders (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              {isAr ? "معايير حالة التاجر (Payout State)" : "Merchant State Curating Inputs"}
            </h3>
            <span className="text-[11px] font-mono text-slate-400">@typesafe-ai/sdk</span>
          </div>

          <div className="space-y-4">
            {/* Payout Amount */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{isAr ? "مبلغ السحب المطلوب" : "Payout Amount (USD)"}</span>
                <span className="font-mono font-bold text-emerald-400">${payoutAmountUsd}</span>
              </div>
              <input
                type="range"
                min="50"
                max="25000"
                step="50"
                value={payoutAmountUsd}
                onChange={(e) => setPayoutAmountUsd(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950 cursor-pointer"
              />
            </div>

            {/* Avg Daily Sales */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{isAr ? "متوسط المبيعات اليومية (90d)" : "Avg Daily Sales (USD)"}</span>
                <span className="font-mono font-bold text-indigo-400">${avgDailySalesUsd}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="50"
                value={avgDailySalesUsd}
                onChange={(e) => setAvgDailySalesUsd(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-950 cursor-pointer"
              />
            </div>

            {/* Account Age */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{isAr ? "عمر حساب التاجر (أيام)" : "Account Age (Days)"}</span>
                <span className="font-mono font-bold text-slate-200">{accountAgeDays} {isAr ? "يوم" : "days"}</span>
              </div>
              <input
                type="range"
                min="1"
                max="500"
                value={accountAgeDays}
                onChange={(e) => setAccountAgeDays(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950 cursor-pointer"
              />
            </div>

            {/* Chargebacks 90d */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{isAr ? "عدد الشحن المرتد (90d)" : "90d Chargebacks Count"}</span>
                <span className={`font-mono font-bold ${chargebackCount90d > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                  {chargebackCount90d}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={chargebackCount90d}
                onChange={(e) => setChargebackCount90d(Number(e.target.value))}
                className="w-full accent-red-500 bg-slate-950 cursor-pointer"
              />
            </div>

            {/* Open Disputes */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{isAr ? "النزاعات المفتوحة غير المحسومة" : "Open Disputes Count"}</span>
                <span className={`font-mono font-bold ${openDisputesCount > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {openDisputesCount}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={openDisputesCount}
                onChange={(e) => setOpenDisputesCount(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-950 cursor-pointer"
              />
            </div>

            {/* Velocity 24h Count */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{isAr ? "عدد محاولات السحب في 24 ساعة" : "24h Payout Attempts"}</span>
                <span className={`font-mono font-bold ${velocity24hCount > 3 ? 'text-red-400' : 'text-slate-200'}`}>
                  {velocity24hCount}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={velocity24hCount}
                onChange={(e) => setVelocity24hCount(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950 cursor-pointer"
              />
            </div>
          </div>

          <button
            id="btn-run-jev-sim"
            onClick={runSimulation}
            disabled={isRunning}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isAr ? "جاري تشغيل محرك Sentinel..." : "Executing Sentinel Engine..."}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{isAr ? "تشغيل تقييم المخاطر (Run Evaluation)" : "Evaluate Payout Risk"}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Output & Pipeline Steps (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {simResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-400" />
                  {isAr ? "نتيجة قرار Sentinel وبوابة التوجيه" : "Sentinel Decision & Routing Pipeline Result"}
                </h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  simResult.decision === 'AUTO_APPROVE'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  Action: {simResult.decision}
                </span>
              </div>

              {/* 4 Core Jev Outputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Risk Level (Choice)</span>
                  <span className={`font-bold text-sm ${
                    simResult.evalResult.riskLevel === 'High_Risk' ? 'text-red-400' :
                    simResult.evalResult.riskLevel === 'Medium_Risk' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {simResult.evalResult.riskLevel}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    Conf: {(simResult.evalResult.riskConfidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Trust Score (Score)</span>
                  <span className="font-bold text-sm font-mono text-white">
                    {simResult.evalResult.trustScore}/100
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    Conf: {(simResult.evalResult.trustConfidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Auto-Approve (Noul)</span>
                  <span className={`font-bold text-sm ${simResult.evalResult.autoApprove ? 'text-emerald-400' : 'text-red-400'}`}>
                    {simResult.evalResult.autoApprove ? 'YES (>=0.5)' : 'NO (<0.5)'}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    Conf: {(simResult.evalResult.autoApproveConfidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Velocity Flag (Noul)</span>
                  <span className={`font-bold text-sm ${simResult.evalResult.velocityConcern ? 'text-red-400' : 'text-emerald-400'}`}>
                    {simResult.evalResult.velocityConcern ? 'TRIGGERED' : 'CLEAR'}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    Conf: {(simResult.evalResult.velocityConfidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Threshold Gate Condition Evaluation */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <span className="font-bold text-slate-300 block">
                  {isAr ? "تحليل شرط عتبة التوجيه (CONFIDENCE_THRESHOLD >= 0.85):" : "Routing Gateway Rule Execution (Threshold >= 0.85):"}
                </span>
                <div className="space-y-1 font-mono text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className={simResult.evalResult.autoApprove ? 'text-emerald-400' : 'text-red-400'}>
                      {simResult.evalResult.autoApprove ? '✔' : '✖'} autoApprove === true
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={simResult.evalResult.autoApproveConfidence >= 0.85 ? 'text-emerald-400' : 'text-red-400'}>
                      {simResult.evalResult.autoApproveConfidence >= 0.85 ? '✔' : '✖'} autoApproveConfidence ({(simResult.evalResult.autoApproveConfidence).toFixed(2)}) &gt;= 0.85
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={simResult.evalResult.riskConfidence >= 0.85 ? 'text-emerald-400' : 'text-red-400'}>
                      {simResult.evalResult.riskConfidence >= 0.85 ? '✔' : '✖'} riskConfidence ({(simResult.evalResult.riskConfidence).toFixed(2)}) &gt;= 0.85
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Narrative */}
              {simResult.evalResult.geminiAnalysis && (
                <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>{isAr ? "تفسير الذكاء الاصطناعي للمخاطر" : "Gemini AI Risk Narrative"}</span>
                  </div>
                  <p className="text-indigo-200/90 leading-relaxed">
                    {simResult.evalResult.geminiAnalysis}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <Cpu className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
              <h4 className="text-base font-bold text-white">
                {isAr ? "اضغط على تشغيل تقييم المخاطر لبدء المحاكاة" : "Ready to evaluate Jev Risk Model"}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isAr ? "قم بتعديل مؤشرات التاجر وسرعة السحب وراقب كيف يتخذ محرك Jev قراره الاحتمالي تلقائياً." : "Adjust the sliders and observe how Jev calculates confidence and determines auto-approval."}
              </p>
            </div>
          )}

          {/* Canary Deployment Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase text-white tracking-wider">
                  {isAr ? "إعدادات النشر التدريجي (Canary Deployment)" : "Phase 4.2 Canary Deployment Configuration"}
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">vercel.json</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-300">JEV_CANARY_PERCENTAGE:</label>
              <div className="flex items-center gap-2">
                {[10, 25, 50, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setCanaryPercentage(pct)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                      canaryPercentage === pct
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 4.1: Shadow Mode Testing Suite Runner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">
                {isAr ? "اختبار Shadow Mode التقييمي (Sentinel Benchmark)" : "Sentinel Shadow Mode Verification Suite"}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr 
                ? "تشغيل مقارنة آلية على 50 معاملة تاريخية للتحقق من تطابق قرارات محرك Sentinel مع القرارات البشرية بنسبة > 90%"
                : "Executes test runner against historical payouts to ensure agreement rate >90.0% before production rollout"}
            </p>
          </div>

          <button
            id="btn-run-shadow-mode"
            onClick={runShadowModeBenchmark}
            disabled={isTestingShadow}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.99] transition-all shrink-0"
          >
            {isTestingShadow ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isAr ? "جاري تشغيل الاختبار..." : "Running Suite..."}</span>
              </>
            ) : (
              <>
                <FileCode2 className="w-4 h-4" />
                <span>{isAr ? "تشغيل اختبار Shadow Mode" : "Run Shadow Mode Test"}</span>
              </>
            )}
          </button>
        </div>

        {shadowReport && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Agreement Rate Card */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              shadowReport.passedThreshold
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            }`}>
              <div>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {shadowReport.passedThreshold ? <Check className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-amber-400" />}
                  <span>{shadowReport.summary}</span>
                </div>
                <p className="text-xs mt-1 text-slate-300">
                  {isAr 
                    ? `عدد المعاملات المختبرة: ${shadowReport.totalTested} | عدد التطابقات: ${shadowReport.agreements}`
                    : `Total Tested: ${shadowReport.totalTested} | Matches: ${shadowReport.agreements}`}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Agreement Rate</span>
                <span className="text-3xl font-mono font-extrabold text-white">
                  {shadowReport.agreementRate}%
                </span>
                <span className="text-[10px] text-slate-400 block">Target: &gt;= 90.0%</span>
              </div>
            </div>

            {/* Comparison Samples Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-2">{isAr ? "المعرف" : "Test ID"}</th>
                    <th className="pb-2">{isAr ? "التاجر" : "Merchant"}</th>
                    <th className="pb-2">{isAr ? "المبلغ" : "Amount"}</th>
                    <th className="pb-2">{isAr ? "القرار البشري التاريخي" : "Human Baseline"}</th>
                    <th className="pb-2">{isAr ? "قرار Sentinel الآلي" : "Sentinel Decision"}</th>
                    <th className="pb-2">{isAr ? "النتيجة" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {shadowReport.comparisons.slice(0, 8).map((c) => (
                    <tr key={c.payoutId} className="hover:bg-slate-800/20">
                      <td className="py-2 font-mono text-slate-400">{c.payoutId}</td>
                      <td className="py-2 text-white font-medium">{c.merchantName}</td>
                      <td className="py-2 font-mono">${c.amount}</td>
                      <td className="py-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                          {c.humanDecision}
                        </span>
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                          c.jevDecision === 'AUTO_APPROVE'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {c.jevDecision}
                        </span>
                      </td>
                      <td className="py-2">
                        {c.agreed ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            {isAr ? "متطابق" : "Match"}
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <X className="w-3.5 h-3.5" />
                            {isAr ? "تباين متحفظ" : "Discrepancy"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
