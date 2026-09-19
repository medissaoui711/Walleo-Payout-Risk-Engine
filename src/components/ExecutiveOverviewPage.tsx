import React, { useState } from "react";
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowUpRight, 
  Clock, 
  Zap, 
  Building2, 
  Lock, 
  Scale, 
  FileSearch, 
  ArrowRight,
  Activity,
  History,
  Shield,
  Layers,
  Sparkles
} from "lucide-react";
import { Merchant, Transaction, Payout, ReviewQueueItem } from "../types";
import { formatMoney } from "../lib/currency";
import { ActivePage } from "../navigation";

interface ExecutiveOverviewPageProps {
  merchants: Merchant[];
  payouts: Payout[];
  reviewQueue: ReviewQueueItem[];
  lang: 'ar' | 'en';
  onNavigate: (page: ActivePage) => void;
  onOpenCase: (caseId: string) => void;
}

export const ExecutiveOverviewPage: React.FC<ExecutiveOverviewPageProps> = ({
  merchants,
  payouts,
  reviewQueue,
  lang,
  onNavigate,
  onOpenCase,
}) => {
  const isAr = lang === 'ar';

  const pendingReviewCount = reviewQueue.length;
  const autoApprovedCount = 1205;
  const totalHeldMinorUnits = 1450000; // in minor units ($14,500.00)
  const failedSettlementsToday = 0;
  const criticalSecurityIncidents = 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. COMPACT SYSTEM HEALTH STRIP */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">{isAr ? "حالة النظام:" : "System:"}</span>
          <span className="font-bold text-white font-mono">OPERATIONAL</span>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">{isAr ? "محرك Sentinel:" : "Sentinel:"}</span>
          <span className="font-bold text-emerald-400 font-mono">HEALTHY (99.98%)</span>
        </div>

        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">{isAr ? "الموصل المصرفي:" : "Bank Connector:"}</span>
          <span className="font-bold text-slate-200 font-mono">OPERATIONAL</span>
        </div>

        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-400" />
          <span className="text-slate-400">{isAr ? "نزاهة الأستاذ العام:" : "Ledger Integrity:"}</span>
          <span className="font-bold text-teal-300 font-mono">VERIFIED (ZERO DELTA)</span>
        </div>

        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">{isAr ? "الـ Webhooks والمطابقة:" : "Webhooks & Recon:"}</span>
          <span className="font-bold text-slate-200 font-mono">LAST RUN SUCCESSFUL</span>
        </div>
      </div>

      {/* 2. SIX INSTITUTIONAL KPI CARDS (Integer minor units logic in mock data) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1 */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isAr ? "طلبات السحب اليوم" : "Payout Requests Today"}
          </span>
          <div className="mt-2 text-2xl font-black font-mono text-white">
            1,284
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">Volume: $3.84M USD</span>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isAr ? "المبالغ المحجوزة حالياً" : "Held in Escrow"}
          </span>
          <div className="mt-2 text-2xl font-black font-mono text-amber-400">
            ${(totalHeldMinorUnits / 100).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">3 cases pending review</span>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isAr ? "نسبة الموافقة الآلية" : "Auto-Approved Rate"}
          </span>
          <div className="mt-2 text-2xl font-black font-mono text-emerald-400">
            93.8%
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">Straight-Through STP</span>
        </div>

        {/* KPI 4 */}
        <div 
          onClick={() => onNavigate('payouts-review')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 flex flex-col justify-between cursor-pointer transition-all"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isAr ? "طابور المراجعة المعلق" : "Review Queue"}
          </span>
          <div className="mt-2 text-2xl font-black font-mono text-amber-400 flex items-center justify-between">
            <span>{pendingReviewCount}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-sans font-semibold">
              {isAr ? "مطلوب إجراء" : "Action Req"}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">SLA max: 45 min</span>
        </div>

        {/* KPI 5 */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isAr ? "التسويات الفاشلة اليوم" : "Failed Settlements"}
          </span>
          <div className="mt-2 text-2xl font-black font-mono text-slate-200">
            {failedSettlementsToday}
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 font-mono">0.00% failure rate</span>
        </div>

        {/* KPI 6 */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isAr ? "الحوادث الأمنية الحرجة" : "Critical Incidents"}
          </span>
          <div className="mt-2 text-2xl font-black font-mono text-emerald-400">
            {criticalSecurityIncidents}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">22 Invariants Active</span>
        </div>
      </div>

      {/* 3. PRIORITY ACTION LIST: "إجراءات تتطلب تدخلاً" */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              {isAr ? "إجراءات تتطلب تدخلاً عاجلاً (Priority Action List)" : "Priority Action Required Queue"}
            </h3>
          </div>
          <span className="text-xs text-amber-400 font-mono font-semibold">
            {pendingReviewCount} {isAr ? "معاملات معلقة" : "Pending Human Authorizations"}
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          {/* Action Row 1 */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors">
            <div className="flex items-start sm:items-center gap-3">
              <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 font-mono font-bold text-[10px] border border-rose-500/30">
                CRITICAL
              </span>
              <div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-white">PO-101</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 font-bold">$2,500 USD</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">MER-204 (Carthage Retail)</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {isAr 
                    ? "السبب: تسارع غير معتاد في السحب (Velocity Anomaly) وتعديل حساب التسوية المصرفي قبل 3 ساعات."
                    : "Trigger: Velocity anomaly detected + settlement bank updated within cooldown window."}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-[11px] font-mono text-amber-400 me-2">SLA: 18m left</span>
              <button
                onClick={() => onOpenCase('PO-101')}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <span>{isAr ? "فتح ملف التحقيق" : "Investigate Case"}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Action Row 2 */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors">
            <div className="flex items-start sm:items-center gap-3">
              <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] border border-amber-500/30">
                HIGH AMOUNT
              </span>
              <div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-white">PO-098</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 font-bold">$12,000 USD</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">MER-102 (Doha Tech Hub)</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {isAr 
                    ? "السبب: تجاوز الحد الأقصى للموافقة الآلية ($5,000). بانتظار توقيع المدقق (Checker)."
                    : "Trigger: Single-payout limit threshold exceeded. Maker approved, awaiting Checker sign-off."}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-[11px] font-mono text-amber-400 me-2">SLA: 32m left</span>
              <button
                onClick={() => onNavigate('payouts-review')}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <span>{isAr ? "مراجعة الصلاحيات" : "Review Sign-off"}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TWO-COLUMN OPERATIONAL PANELS: LATEST DECISION & SETTLEMENT HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Latest Payout Decision Card */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {isAr ? "آخر قرار مالي لمحرّك Sentinel" : "Latest Financial Decision"}
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400 font-bold">PO-100</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">STATUS</span>
                <span className="text-xl font-mono font-bold text-white">$4,200.00 USD</span>
              </div>
              <div className="text-end">
                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  AUTO APPROVED
                </span>
                <span className="text-[10px] text-slate-400 font-mono block mt-1">SETTLED TO BANK (BIAT)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Beneficiary KYC</span>
                <span className="font-bold text-emerald-400">VERIFIED</span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Ledger Hold</span>
                <span className="font-bold text-teal-300 font-mono">PASSED</span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Velocity Burst</span>
                <span className="font-bold text-emerald-400">NORMAL</span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Sanctions AML</span>
                <span className="font-bold text-emerald-400">CLEAR</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400 text-[11px] font-mono">
              Decision Hash: 8f4a...92b1 • Policy: STRAIGHT_THROUGH_P01
            </span>
            <button
              onClick={() => onOpenCase('PO-100')}
              className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>{isAr ? "عرض ملف التحقيق" : "View Case Details"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sentinel Performance & Latency Panel */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {isAr ? "أداء المحرك ومعدل الـ Fallback" : "Sentinel Engine Performance"}
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              HEALTHY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">p95 Engine Latency</span>
              <span className="text-lg font-black font-mono text-white mt-0.5 block">142 ms</span>
              <span className="text-[10px] text-slate-400 font-mono">SLA Target: &lt; 300 ms</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Fallback Rate</span>
              <span className="text-lg font-black font-mono text-emerald-400 mt-0.5 block">0.00%</span>
              <span className="text-[10px] text-slate-400 font-mono">0 circuits tripped</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <span className="text-slate-400 font-semibold block text-[11px]">
              {isAr ? "توزيع درجات الثقة (Confidence Distribution)" : "Confidence Score Distribution"}
            </span>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300">High Confidence (&gt; 90%)</span>
                <span className="font-mono text-emerald-400 font-bold">94.2%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[94.2%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. RECENT IMMUTABLE AUDIT EVENTS TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {isAr ? "سجل أحداث التدقيق المالي غير القابلة للتعديل" : "Recent Immutable Financial Audit Log"}
            </h3>
          </div>
          <button
            onClick={() => onNavigate('audit-log')}
            className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>{isAr ? "عرض السجل الكامل" : "View Full Audit Trail"}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-2.5 text-start">{isAr ? "رقم الحدث" : "Event ID"}</th>
                <th className="p-2.5 text-start">{isAr ? "نوع الحدث" : "Event Type"}</th>
                <th className="p-2.5 text-start">{isAr ? "المرجع" : "Reference"}</th>
                <th className="p-2.5 text-start">{isAr ? "الفاعل / الخدمة" : "Actor / Service"}</th>
                <th className="p-2.5 text-start">{isAr ? "البصمة التشفيرية" : "SHA-256 Digest"}</th>
                <th className="p-2.5 text-start">{isAr ? "التوقيت" : "Timestamp"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              <tr className="hover:bg-slate-800/30">
                <td className="p-2.5 text-teal-400">EV-89421</td>
                <td className="p-2.5 text-white font-sans font-medium">SETTLEMENT_CONFIRMED</td>
                <td className="p-2.5 text-slate-300">PO-100</td>
                <td className="p-2.5 text-slate-400 font-sans">Bank_Webhook_Worker</td>
                <td className="p-2.5 text-slate-500 truncate max-w-[140px]">9f3a18...298b</td>
                <td className="p-2.5 text-slate-400 font-sans">10:42:15 UTC</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-2.5 text-teal-400">EV-89420</td>
                <td className="p-2.5 text-white font-sans font-medium">LEDGER_HOLD_CREATED</td>
                <td className="p-2.5 text-slate-300">PO-101</td>
                <td className="p-2.5 text-slate-400 font-sans">Ledger_Engine</td>
                <td className="p-2.5 text-slate-500 truncate max-w-[140px]">7e1b42...884f</td>
                <td className="p-2.5 text-slate-400 font-sans">10:41:02 UTC</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-2.5 text-teal-400">EV-89419</td>
                <td className="p-2.5 text-white font-sans font-medium">SENTINEL_EVALUATED</td>
                <td className="p-2.5 text-slate-300">PO-101</td>
                <td className="p-2.5 text-slate-400 font-sans">Sentinel_Policy_V2</td>
                <td className="p-2.5 text-slate-500 truncate max-w-[140px]">4c2a99...112d</td>
                <td className="p-2.5 text-slate-400 font-sans">10:40:59 UTC</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
