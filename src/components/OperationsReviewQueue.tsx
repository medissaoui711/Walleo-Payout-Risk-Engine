import React, { useState } from "react";
import { 
  ShieldAlert, 
  Check, 
  X, 
  Eye, 
  AlertTriangle, 
  Building, 
  Cpu, 
  Sparkles,
  Info,
  Clock,
  CheckCircle2,
  FileSearch,
  ExternalLink
} from "lucide-react";
import { ReviewQueueItem } from "../types";
import { formatMoney, maskAccountNumber } from "../lib/currency";

interface OperationsReviewQueueProps {
  queue: ReviewQueueItem[];
  lang: 'ar' | 'en';
  onActionComplete: () => void;
}

export const OperationsReviewQueue: React.FC<OperationsReviewQueueProps> = ({
  queue,
  lang,
  onActionComplete,
}) => {
  const isAr = lang === 'ar';
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleDecision(id: string, decision: "approve" | "reject") {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/review/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, notes: reviewNotes }),
      });

      if (res.ok) {
        setSelectedItem(null);
        setReviewNotes("");
        onActionComplete();
      }
    } catch (err) {
      console.error("Decision failed:", err);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-white">
              {isAr ? "طابور المراجعة الأمنية (Operations Queue)" : "Security & Payout Review Queue"}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr 
              ? "المعاملات التي لم تتجاوز عتبة الثقة (0.85) أو تم رصد أعلام مخاطر بها بواسطة محرك Walleo Sentinel"
              : "Payout requests falling below the confidence threshold (0.85) or flagged by Sentinel risk heuristics"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">{isAr ? "الطلبات المعلقة" : "Pending Reviews"}</span>
            <span className="text-xl font-bold text-amber-400 font-mono">{queue.length}</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {queue.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isAr ? "طابور المراجعة فارغ تماماً!" : "Review Queue is Empty"}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {isAr 
                ? "جميع طلبات السحب تم تدقيقها والموافقة عليها تلقائياً عبر محرك Sentinel أو قام مسؤولو العمليات بمعالجتها."
                : "All payout requests have been auto-approved by Sentinel or resolved by the risk operations team."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider">
                  <th className="p-4">{isAr ? "التاجر" : "Merchant"}</th>
                  <th className="p-4">{isAr ? "المبلغ" : "Amount"}</th>
                  <th className="p-4">{isAr ? "مستوى الخطورة" : "Risk Level"}</th>
                  <th className="p-4">{isAr ? "درجة الثقة" : "Trust Score"}</th>
                  <th className="p-4">{isAr ? "السبب المعياري" : "Reason"}</th>
                  <th className="p-4 text-center">{isAr ? "القرار الإجرائي" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {queue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          <span>{isAr && item.businessNameAr ? item.businessNameAr : item.merchantName}</span>
                          <span className="text-xs">{item.country === 'Tunisia' ? '🇹🇳' : '🇶🇦'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {item.bankName} • {maskAccountNumber(item.accountNumber)}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-base font-bold font-mono text-white">
                        {formatMoney(item.amount, item.currency, lang)}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        item.riskLevel === "High_Risk"
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : item.riskLevel === "Medium_Risk"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      }`}>
                        {item.riskLevel.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.trustScore >= 70 ? "bg-emerald-500" : item.trustScore >= 40 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${item.trustScore}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-200">{item.trustScore}/100</span>
                      </div>
                    </td>

                    <td className="p-4 max-w-xs">
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {item.reason}
                      </p>
                      {item.velocityConcern && (
                        <span className="inline-block mt-1 text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                          ⚠️ Velocity Surge
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                          title={isAr ? "فحص تقرير المخاطر المفصل" : "Inspect Sentinel Risk Audit"}
                        >
                          <FileSearch className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{isAr ? "فحص" : "Inspect"}</span>
                        </button>

                        <button
                          disabled={processingId === item.id}
                          onClick={() => handleDecision(item.id, "approve")}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isAr ? "موافقة" : "Approve"}</span>
                        </button>

                        <button
                          disabled={processingId === item.id}
                          onClick={() => handleDecision(item.id, "reject")}
                          className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold border border-red-500/30 flex items-center gap-1 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>{isAr ? "رفض" : "Reject"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deep Inspection Modal / Drawer */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">
                  {isAr ? "تقرير فحص المخاطر العميق (Walleo Sentinel Audit)" : "Walleo Sentinel Deep Audit Breakdown"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Merchant Context */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">{isAr ? "التاجر" : "Merchant"}</span>
                <span className="font-bold text-white">{selectedItem.merchantName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{isAr ? "المبلغ" : "Amount"}</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatMoney(selectedItem.amount, selectedItem.currency, lang)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">{isAr ? "درجة الثقة" : "Trust Score"}</span>
                <span className="font-mono font-bold text-amber-400">{selectedItem.trustScore}/100</span>
              </div>
              <div>
                <span className="text-slate-400 block">{isAr ? "مستوى الخطورة" : "Risk Level"}</span>
                <span className="font-bold text-red-400">{selectedItem.riskLevel}</span>
              </div>
            </div>

            {/* Bank & Settlement Details */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-teal-400" />
                <div>
                  <span className="text-slate-400 block text-[11px]">{isAr ? "الحساب البنكي للتسوية" : "Settlement Bank Route"}</span>
                  <span className="text-white font-mono font-medium">{selectedItem.bankName} • {maskAccountNumber(selectedItem.accountNumber)}</span>
                </div>
              </div>
              <div className="text-[11px] px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                {selectedItem.country === 'Tunisia' ? '🇹🇳 BCT Circ. 2018-16' : '🇶🇦 QCB FinTech Rails'}
              </div>
            </div>

            {/* Probabilities Meter breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                {isAr ? "احتماليات القرار الذكي (Sentinel Confidence Scores)" : "Sentinel Decision Probabilities & Confidence"}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">{isAr ? "ثقة الموافقة التلقائية" : "Auto-Approve Confidence"}</span>
                    <span className="font-mono font-bold text-slate-200">
                      {(selectedItem.autoApproveConfidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${selectedItem.autoApproveConfidence * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Threshold target: &gt;= 85.0%
                  </span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">{isAr ? "مؤشر اضطراب السرعة (Velocity)" : "Velocity Concern"}</span>
                    <span className={`font-mono font-bold ${selectedItem.velocityConcern ? 'text-red-400' : 'text-emerald-400'}`}>
                      {selectedItem.velocityConcern ? "High Risk" : "Normal"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${selectedItem.velocityConcern ? "bg-red-500" : "bg-emerald-500"}`}
                      style={{ width: selectedItem.velocityConcern ? "85%" : "15%" }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Calculated over 24-hour transaction burst
                  </span>
                </div>
              </div>
            </div>

            {/* AI Forensic Analysis (Gemini / Jev Reasoning) */}
            {selectedItem.geminiAudit && (
              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? "التحليل الجنائي للذكاء الاصطناعي (AI Forensic Analysis)" : "AI Forensic Narrative"}</span>
                </div>
                <p className="text-indigo-200/90 leading-relaxed font-sans">
                  {selectedItem.geminiAudit}
                </p>
              </div>
            )}

            {/* Reviewer Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {isAr ? "ملاحظات وتوجيهات مسؤول العمليات" : "Risk Officer Notes"}
              </label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={isAr ? "أدخل سبب الموافقة أو الرفض المصرفي..." : "Add reviewer justification..."}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Actions in Modal */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                {isAr ? "إلغاء" : "Close"}
              </button>

              <button
                disabled={processingId === selectedItem.id}
                onClick={() => handleDecision(selectedItem.id, "reject")}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold hover:bg-red-500/30 flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>{isAr ? "رفض المعاملة" : "Reject Payout"}</span>
              </button>

              <button
                disabled={processingId === selectedItem.id}
                onClick={() => handleDecision(selectedItem.id, "approve")}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-4 h-4" />
                <span>{isAr ? "اعتماد وصرف السحب" : "Approve & Clear"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
