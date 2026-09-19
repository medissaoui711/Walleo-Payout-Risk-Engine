import React, { useState } from "react";
import { 
  FileCode, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  ShieldAlert, 
  Info, 
  RotateCw,
  Cpu,
  Sparkles
} from "lucide-react";
import { ShadowModeReport } from "../types";

interface ShadowTestingPageProps {
  lang: 'ar' | 'en';
}

export const ShadowTestingPage: React.FC<ShadowTestingPageProps> = ({
  lang,
}) => {
  const isAr = lang === 'ar';

  const report: ShadowModeReport = {
    totalTested: 500,
    agreements: 489,
    agreementRate: 0.978, // 97.8%
    passedThreshold: true,
    benchmarkTarget: 0.95,
    summary: "Sentinel shadow policy v3.2.1 achieved 97.8% concordance with senior human risk committee decisions across historical Q2/Q3 payout cohorts.",
    comparisons: [
      {
        payoutId: "SHD-801",
        merchantName: "Tunis Digital Media",
        amount: 3200,
        humanDecision: "APPROVED",
        jevDecision: "AUTO_APPROVE",
        agreed: true,
        jevConfidence: 0.94,
        riskLevel: "Low_Risk",
        trustScore: 88
      },
      {
        payoutId: "SHD-802",
        merchantName: "Carthage Handcrafts",
        amount: 8500,
        humanDecision: "MANUAL_REVIEW",
        jevDecision: "MANUAL_REVIEW",
        agreed: true,
        jevConfidence: 0.89,
        riskLevel: "Medium_Risk",
        trustScore: 62
      },
      {
        payoutId: "SHD-803",
        merchantName: "Doha Freight Logistics",
        amount: 14000,
        humanDecision: "MANUAL_REVIEW",
        jevDecision: "MANUAL_REVIEW",
        agreed: true,
        jevConfidence: 0.92,
        riskLevel: "High_Risk",
        trustScore: 45
      },
      {
        payoutId: "SHD-804",
        merchantName: "Sousse Apparel Direct",
        amount: 1200,
        humanDecision: "APPROVED",
        jevDecision: "AUTO_APPROVE",
        agreed: true,
        jevConfidence: 0.96,
        riskLevel: "Low_Risk",
        trustScore: 92
      }
    ]
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Safe Mode Warning Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold text-white">
              {isAr ? "اختبارات الظل والتحقق من النماذج (Sentinel Shadow Testing)" : "Sentinel Shadow Testing & Model Validation"}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr 
              ? "مقارنة القرارات السابقة لخبراء العمليات مع توصيات سياسات Sentinel الجديدة دون أي تحريك للأموال."
              : "Concordance benchmarking comparing historical human risk officer decisions against new Sentinel policy candidates in shadow mode."}
          </p>
        </div>

        {/* Invariant Warning */}
        <div className="bg-amber-950/40 border border-amber-500/40 px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-xs">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-amber-300 font-mono font-bold">
            {isAr ? "⚠️ قرارات وضع الظل (Shadow Mode) لا تحرّك أي أموال نقدية" : "⚠️ Shadow mode decisions do not move funds"}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 font-mono uppercase text-[11px] block">{isAr ? "نسبة التطابق مع البشر" : "Agreement Rate"}</span>
          <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">{(report.agreementRate * 100).toFixed(1)}%</span>
          <span className="text-[10px] text-slate-400 font-mono">Target: &gt;= 95.0%</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 font-mono uppercase text-[11px] block">{isAr ? "معدل الإيجابيات الكاذبة" : "False Positive Rate"}</span>
          <span className="text-2xl font-black font-mono text-teal-300 mt-1 block">1.4%</span>
          <span className="text-[10px] text-slate-400 font-mono">Unnecessary review rate</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 font-mono uppercase text-[11px] block">{isAr ? "معدل السلبيات الكاذبة" : "False Negative Rate"}</span>
          <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">0.0%</span>
          <span className="text-[10px] text-slate-400 font-mono">Zero unflagged risk cases</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 font-mono uppercase text-[11px] block">{isAr ? "العينات المختبرة" : "Cohort Sample Size"}</span>
          <span className="text-2xl font-black font-mono text-white mt-1 block">{report.totalTested}</span>
          <span className="text-[10px] text-slate-400 font-mono">{report.agreements} perfect concordances</span>
        </div>
      </div>

      {/* Shadow Evaluation Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {isAr ? "مقارنة قرارات الظل مع القرارات البشرية المعتمدة" : "Shadow Evaluation vs Historical Human Officer Decisions"}
          </h3>
          <span className="text-xs font-mono text-slate-400">Model Candidate: Sentinel-v3.2.1-Shadow</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3 text-start">Shadow Case ID</th>
                <th className="p-3 text-start">Merchant</th>
                <th className="p-3 text-start">Amount</th>
                <th className="p-3 text-start">Historical Human Decision</th>
                <th className="p-3 text-start">Sentinel Shadow Candidate</th>
                <th className="p-3 text-start">Confidence</th>
                <th className="p-3 text-start">Concordance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {report.comparisons.map((c) => (
                <tr key={c.payoutId} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-teal-400">{c.payoutId}</td>
                  <td className="p-3 font-sans text-white font-medium">{c.merchantName}</td>
                  <td className="p-3 text-slate-200 font-bold">${c.amount.toLocaleString()} USD</td>
                  <td className="p-3 text-slate-300">{c.humanDecision}</td>
                  <td className="p-3 text-teal-300 font-bold">{c.jevDecision}</td>
                  <td className="p-3 text-slate-400">{(c.jevConfidence * 100).toFixed(0)}%</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      ✓ CONCORDANT
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
