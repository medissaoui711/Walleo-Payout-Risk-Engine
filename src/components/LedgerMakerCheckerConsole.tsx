import React, { useState, useEffect } from "react";
import { MakerCheckerCase, LedgerEntry } from "../types";
import { formatMoney } from "../lib/currency";
import { 
  Shield, 
  UserCheck, 
  UserPlus, 
  FileText, 
  Lock, 
  ArrowDownRight, 
  ArrowUpRight, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Search,
  Building,
  Key
} from "lucide-react";

interface LedgerMakerCheckerConsoleProps {
  lang: 'ar' | 'en';
  onActionComplete?: () => void;
}

export function LedgerMakerCheckerConsole({ lang, onActionComplete }: LedgerMakerCheckerConsoleProps) {
  const isAr = lang === 'ar';
  const [cases, setCases] = useState<MakerCheckerCase[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [selectedCase, setSelectedCase] = useState<MakerCheckerCase | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'cases' | 'ledger'>('cases');

  // Maker form state
  const [makerId, setMakerId] = useState("ops_maker_44");
  const [makerRec, setMakerRec] = useState<"RECOMMEND_APPROVE" | "RECOMMEND_REJECT">("RECOMMEND_APPROVE");
  const [makerNotes, setMakerNotes] = useState("");

  // Checker form state
  const [checkerId, setCheckerId] = useState("ops_checker_92");
  const [checkerDecision, setCheckerDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [checkerNotes, setCheckerNotes] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function loadData() {
    try {
      const [casesRes, ledgerRes] = await Promise.all([
        fetch("/api/maker-checker/cases"),
        fetch("/api/ledger/entries"),
      ]);

      if (casesRes.ok) {
        const cData = await casesRes.json();
        setCases(cData);
        if (cData.length > 0 && !selectedCase) {
          setSelectedCase(cData[0]);
        }
      }

      if (ledgerRes.ok) {
        const lData = await ledgerRes.json();
        setLedgerEntries(lData);
      }
    } catch (err) {
      console.error("Failed to load Maker/Checker data:", err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleMakerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCase) return;
    setActionLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/maker-checker/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: selectedCase.caseId,
          makerUserId: makerId,
          recommendation: makerRec,
          notes: makerNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit Maker recommendation");

      setStatusMessage({
        type: 'success',
        text: isAr ? "تم تسجيل توصية المُعد (Maker) بنجاح وإحالة الملف للمُراجع (Checker)" : "Maker recommendation recorded. Transferred to Checker sign-off.",
      });

      await loadData();
      if (data.case) setSelectedCase(data.case);
      if (onActionComplete) onActionComplete();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCase) return;
    setActionLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/maker-checker/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: selectedCase.caseId,
          checkerUserId: checkerId,
          decision: checkerDecision,
          notes: checkerNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to execute Checker decision");

      setStatusMessage({
        type: 'success',
        text: isAr ? "تم اعتماد القرار المصرفي النهائي وتحديث قيود دفتر الأستاذ بنجاح!" : "Checker decision finalized. Ledger entries reconciled atomically.",
      });

      await loadData();
      if (data.reviewCase) setSelectedCase(data.reviewCase);
      if (onActionComplete) onActionComplete();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Sub Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">
              {isAr ? "نظام عزل الصلاحيات Maker / Checker ودفتر الأستاذ" : "Maker / Checker Segregation & Double-Entry Ledger"}
            </h2>
            <p className="text-xs text-slate-400">
              {isAr ? "الفصل الإلزامي بين إعداد التحقيق والاعتماد المالي النهائي" : "Dual-control sign-off preventing single-operator financial movement"}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            id="tab-maker-cases-btn"
            onClick={() => setActiveSubTab('cases')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'cases' ? "bg-slate-800 text-emerald-400 shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            {isAr ? `قضايا المراجعة (${cases.length})` : `Review Cases (${cases.length})`}
          </button>
          <button
            id="tab-ledger-entries-btn"
            onClick={() => setActiveSubTab('ledger')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'ledger' ? "bg-slate-800 text-emerald-400 shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            {isAr ? `دفتر الأستاذ (${ledgerEntries.length})` : `Ledger Statements (${ledgerEntries.length})`}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
          statusMessage.type === 'success' 
            ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-200" 
            : "bg-red-950/50 border-red-500/40 text-red-200"
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {activeSubTab === 'cases' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cases List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              {isAr ? "قائمة طلبات السحب قيد الحجز والتحقيق" : "Pending Maker/Checker Queue"}
            </div>

            <div className="space-y-2.5">
              {cases.map((c) => {
                const isSelected = selectedCase?.caseId === c.caseId;
                return (
                  <div
                    key={c.caseId}
                    id={`case-card-${c.caseId}`}
                    onClick={() => setSelectedCase(c)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-800/90 border-teal-500/50 shadow-md shadow-teal-950/40"
                        : "bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-mono text-[11px] text-slate-400">{c.caseId}</div>
                        <div className="font-bold text-sm text-white mt-0.5">
                          {isAr && c.businessNameAr ? c.businessNameAr : c.merchantName}
                        </div>
                        <div className="font-mono font-bold text-emerald-400 text-xs mt-1">
                          {formatMoney(c.amount, c.currency, lang)}
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        c.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        c.status === 'REJECTED' ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        c.status === 'PENDING_CHECKER' ? "bg-purple-500/10 text-purple-300 border border-purple-500/20" :
                        "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Trust: <strong className="text-white">{c.trustScore}/100</strong></span>
                      <span>Risk: <strong className="text-white">{c.riskLevel}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Maker & Checker Investigation Inspector */}
          <div className="lg:col-span-7">
            {selectedCase ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="font-mono text-xs text-slate-400">{selectedCase.caseId} • Payout: {selectedCase.payoutId}</span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      {isAr && selectedCase.businessNameAr ? selectedCase.businessNameAr : selectedCase.merchantName}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">{isAr ? "مبلغ الحجز في Escrow" : "Held in Escrow"}</span>
                    <span className="text-lg font-black font-mono text-emerald-400">
                      {formatMoney(selectedCase.amount, selectedCase.currency, lang)}
                    </span>
                  </div>
                </div>

                {/* Reason Codes Breakdown */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                    {isAr ? "أسباب الإحالة للمراجعة البشرية (Risk Flags)" : "Triggered Risk Flags & Policy Codes"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.reasonCodes.map((rc, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-red-950/30 border border-red-500/30 text-red-300 text-xs font-mono">
                        {rc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* SHA-256 Chained Event Hash */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-teal-400" />
                    <span>{isAr ? "البصمة التشفيرية للحدث (Audit Hash Chain)" : "Cryptographic Audit Hash Chain"}</span>
                  </h4>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-teal-400 break-all select-all">
                    {selectedCase.eventHash}
                  </div>
                </div>

                {/* STEP 1: MAKER INVESTIGATION PANEL */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-xs text-white uppercase tracking-wider">
                        {isAr ? "المرحلة الأولى: إعداد التحقيق والتوصية (Maker Role)" : "Stage 1: Investigation & Recommendation (Maker)"}
                      </span>
                    </div>
                    {selectedCase.makerUserId && (
                      <span className="text-[11px] text-emerald-400 font-mono">
                        ✓ {selectedCase.makerUserId} ({new Date(selectedCase.makerTimestamp || '').toLocaleTimeString()})
                      </span>
                    )}
                  </div>

                  {selectedCase.status === 'PENDING_MAKER' ? (
                    <form onSubmit={handleMakerSubmit} className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-slate-400 block mb-1">{isAr ? "معرّف المُعد (Maker ID)" : "Maker Officer ID"}</label>
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
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs"
                          >
                            <option value="RECOMMEND_APPROVE">{isAr ? "توصية بالموافقة (Verified)" : "Recommend Approve"}</option>
                            <option value="RECOMMEND_REJECT">{isAr ? "توصية بالرفض (Suspicious)" : "Recommend Reject"}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1 text-xs">{isAr ? "ملاحظات التحقيق والأدلة" : "Investigation Notes & Evidence"}</label>
                        <textarea
                          rows={2}
                          value={makerNotes}
                          onChange={(e) => setMakerNotes(e.target.value)}
                          placeholder={isAr ? "أدخل تفاصيل التحقق من الفواتير وسجل التاجر..." : "Enter verification findings, commercial registry notes..."}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer"
                      >
                        {actionLoading ? "..." : (isAr ? "إحالة التوصية إلى المُراجع المعتمد (Checker)" : "Submit Recommendation to Checker")}
                      </button>
                    </form>
                  ) : (
                    <div className="text-xs space-y-1.5 text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      <div><strong>{isAr ? "التوصية:" : "Recommendation:"}</strong> {selectedCase.makerRecommendation}</div>
                      <div><strong>{isAr ? "ملاحظات المُعد:" : "Maker Notes:"}</strong> {selectedCase.makerNotes || "N/A"}</div>
                    </div>
                  )}
                </div>

                {/* STEP 2: CHECKER FINAL AUTHORIZATION PANEL */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-purple-400" />
                      <span className="font-bold text-xs text-white uppercase tracking-wider">
                        {isAr ? "المرحلة الثانية: الاعتماد المصرفي النهائي (Checker Role)" : "Stage 2: Final Authorization (Checker)"}
                      </span>
                    </div>
                    {selectedCase.checkerUserId && (
                      <span className="text-[11px] text-purple-300 font-mono">
                        ✓ {selectedCase.checkerUserId}
                      </span>
                    )}
                  </div>

                  {selectedCase.status === 'PENDING_CHECKER' ? (
                    <form onSubmit={handleCheckerSubmit} className="space-y-3 pt-2">
                      <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/30 text-[11px] text-purple-200">
                        {isAr 
                          ? "⚠️ شرط عزل الصلاحيات: لا يمكن للمُعد (Maker) نفسه اعتماد هذا الطلب (يجب أن يكون Checker شخصاً مختلفاً تماماً)." 
                          : "⚠️ Segregation of Duties Invariant: The Maker cannot approve this payout. Checker must be an independent authorized officer."}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-slate-400 block mb-1">{isAr ? "معرّف المعتمد (Checker ID)" : "Checker Officer ID"}</label>
                          <input
                            type="text"
                            value={checkerId}
                            onChange={(e) => setCheckerId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">{isAr ? "القرار النهائي" : "Binding Decision"}</label>
                          <select
                            value={checkerDecision}
                            onChange={(e) => setCheckerDecision(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs"
                          >
                            <option value="APPROVED">{isAr ? "اعتماد وصرف السحب (Settle)" : "Approve & Release Funds"}</option>
                            <option value="REJECTED">{isAr ? "رفض السحب وإلغاء الحجز (Reverse)" : "Reject & Release Hold"}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1 text-xs">{isAr ? "ملاحظات الاعتماد والامتثال" : "Compliance Sign-off Notes"}</label>
                        <input
                          type="text"
                          value={checkerNotes}
                          onChange={(e) => setCheckerNotes(e.target.value)}
                          placeholder={isAr ? "تأكيد فحص العقوبات وصحة التحويل المصرفي..." : "Sanctions check confirmed, authorization signed..."}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-500 hover:to-teal-500 text-white font-bold text-xs transition-all cursor-pointer"
                      >
                        {actionLoading ? "..." : (isAr ? "تنفيذ الاعتماد المالي وتحديث دفتر الأستاذ" : "Execute Checker Decision & Settle Ledger")}
                      </button>
                    </form>
                  ) : selectedCase.status === 'APPROVED' || selectedCase.status === 'REJECTED' ? (
                    <div className="text-xs space-y-1.5 text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      <div><strong>{isAr ? "القرار النهائي:" : "Final Decision:"}</strong> <span className={selectedCase.status === 'APPROVED' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{selectedCase.status}</span></div>
                      <div><strong>{isAr ? "المعتمد (Checker):" : "Checker ID:"}</strong> {selectedCase.checkerUserId}</div>
                      <div><strong>{isAr ? "الملاحظات:" : "Notes:"}</strong> {selectedCase.checkerNotes}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic py-2">
                      {isAr ? "بانتظار استكمال مرحلة إعداد التحقيق (Maker) أولاً." : "Awaiting Maker investigation first."}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                {isAr ? "اختر قضية من القائمة للمراجعة والاعتماد" : "Select a case to inspect"}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Live Ledger Statements Table */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">
                {isAr ? "سجل قيود دفتر الأستاذ المزدوج (Double-Entry Ledger)" : "Immutable Double-Entry Ledger Statements"}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? "تتبع ذري لجميع عمليات الحجز (HOLD)، التسوية (SETTLE)، وفك الحجز (RELEASE)" : "Atomic trail of all fund reservations, settlements, and reversals"}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Entry ID</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Merchant ID</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Available After</th>
                  <th className="p-3">Held Escrow</th>
                  <th className="p-3">Reason / Description</th>
                  <th className="p-3">SHA-256 Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ledgerEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-slate-400">{e.id}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        e.type === 'HOLD' ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                        e.type === 'SETTLE' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                        e.type === 'RELEASE_HOLD' ? "bg-purple-500/10 text-purple-300 border border-purple-500/30" :
                        "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}>
                        {e.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px]">{e.merchantId}</td>
                    <td className="p-3 font-mono font-bold text-white">
                      {formatMoney(e.amount, e.currency, lang)}
                    </td>
                    <td className="p-3 font-mono text-slate-300">
                      {formatMoney(e.availableBalanceAfter, e.currency, lang)}
                    </td>
                    <td className="p-3 font-mono text-amber-400">
                      {formatMoney(e.heldBalanceAfter, e.currency, lang)}
                    </td>
                    <td className="p-3 text-[11px] text-slate-400 max-w-xs truncate">{e.reason}</td>
                    <td className="p-3 font-mono text-[10px] text-teal-400 max-w-[120px] truncate select-all">{e.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
