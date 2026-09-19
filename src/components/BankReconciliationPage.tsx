import React, { useState } from "react";
import { 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  FileWarning, 
  Clock, 
  ArrowRight, 
  RefreshCw,
  FilePlus2,
  Lock
} from "lucide-react";

interface BankReconciliationPageProps {
  lang: 'ar' | 'en';
}

export const BankReconciliationPage: React.FC<BankReconciliationPageProps> = ({
  lang,
}) => {
  const isAr = lang === 'ar';
  const [createdDocket, setCreatedDocket] = useState<string | null>(null);

  // Settlement File Stats (Integer minor units logic)
  const stats = {
    matchedCount: 1420,
    matchedAmount: "$4,280,000.00 USD",
    unmatchedCount: 1,
    unmatchedAmount: "$350.00 USD",
    pendingBankCount: 12,
    pendingBankAmount: "$28,400.00 USD",
    lastWebhook: "2 minutes ago (HTTP 200)",
    connectorStatus: "Operational (BIAT & QCB Direct Rails)",
  };

  const exceptions = [
    {
      id: "EXC-409",
      payoutId: "PO-089",
      merchantId: "MER-108",
      bankRef: "BIAT-REF-99210",
      expectedMinorUnits: 35000, // $350.00
      actualBankMinorUnits: 34500, // $345.00
      discrepancyType: "FEE_DEDUCTION_MISMATCH",
      status: "OPEN_INVESTIGATION",
      createdAt: "2026-09-19T06:22:00Z"
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold text-white">
              {isAr ? "المطابقة البنكية والتسويات (Bank Reconciliation Control)" : "Bank & PSP Reconciliation Control"}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr 
              ? "مقارنة ملفات التسوية المصرفية (MT940 / ISO 20022 Camt.053) مع قيود دفتر الأستاذ الداخلي لرصد أي فروقات."
              : "Reconciliation engine cross-referencing bank settlement statements (ISO 20022) with Walleo Sentinel ledger."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold">
            99.99% Matched
          </span>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono uppercase">{isAr ? "المطابقة التامة" : "Matched Settlements"}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-black font-mono text-emerald-400">{stats.matchedAmount}</div>
          <span className="text-[10px] text-slate-400 font-mono">{stats.matchedCount} transactions cleared</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono uppercase">{isAr ? "قيد المعالجة البنكية" : "Pending Partner Settlement"}</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="mt-2 text-xl font-black font-mono text-amber-400">{stats.pendingBankAmount}</div>
          <span className="text-[10px] text-slate-400 font-mono">{stats.pendingBankCount} batches in transit</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono uppercase">{isAr ? "الاستثناءات والفروقات" : "Reconciliation Exceptions"}</span>
            <span className="w-2 h-2 rounded-full bg-rose-400" />
          </div>
          <div className="mt-2 text-xl font-black font-mono text-rose-400">{stats.unmatchedAmount}</div>
          <span className="text-[10px] text-slate-400 font-mono">{stats.unmatchedCount} case requiring audit</span>
        </div>
      </div>

      {/* Connector Health & Last Webhook */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">{isAr ? "موصلات البنوك:" : "Bank Connectors:"}</span>
          <span className="font-mono text-white font-bold">{stats.connectorStatus}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-400" />
          <span className="text-slate-400">{isAr ? "آخر Webhook استلام:" : "Last Webhook:"}</span>
          <span className="font-mono text-slate-300">{stats.lastWebhook}</span>
        </div>
      </div>

      {/* Reconciliation Exceptions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileWarning className="w-5 h-5 text-rose-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {isAr ? "جدول الاستثناءات المالية والمطابقة" : "Reconciliation Exceptions Table"}
            </h3>
          </div>
          <span className="text-xs text-rose-400 font-mono font-bold">1 Active Exception</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3 text-start">Exception ID</th>
                <th className="p-3 text-start">Payout Reference</th>
                <th className="p-3 text-start">Partner Bank Ref</th>
                <th className="p-3 text-start">Expected (Ledger)</th>
                <th className="p-3 text-start">Actual (Bank CAMT)</th>
                <th className="p-3 text-start">Discrepancy Reason</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {exceptions.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-800/40">
                  <td className="p-3 text-rose-400 font-bold">{ex.id}</td>
                  <td className="p-3 text-white">{ex.payoutId}</td>
                  <td className="p-3 text-slate-300">{ex.bankRef}</td>
                  <td className="p-3 font-bold text-slate-200">${(ex.expectedMinorUnits / 100).toFixed(2)}</td>
                  <td className="p-3 font-bold text-amber-400">${(ex.actualBankMinorUnits / 100).toFixed(2)}</td>
                  <td className="p-3 text-slate-400 font-sans text-xs">
                    {isAr ? "خصم غير متطابق لرسوم المقاصة البنكية ($5.00)" : "Interbank clearing fee deduction ($5.00 delta)"}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setCreatedDocket(ex.id)}
                      className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 font-sans text-xs font-bold border border-slate-700 flex items-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <FilePlus2 className="w-3.5 h-3.5" />
                      <span>{isAr ? "إنشاء ملف استثناء" : "Create Exception Docket"}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exception Docket Modal */}
      {createdDocket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {isAr ? "ملف التحقيق في الاستثناء المالي" : "Financial Exception Docket (EXC-409)"}
              </h3>
              <button onClick={() => setCreatedDocket(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr 
                ? "تم فتح ملف تحقيق مالي رسمي. تطبيقاً لسياسة الأمان المصرفي، لن يتم إعادة التحويل آلياً بدون موافقة المراجع (Checker) ومطابقة كشف البنك الشريك."
                : "Formal investigation docket created. In accordance with safety rules, automatic re-payout is locked pending Checker reconciliation."}
            </p>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-teal-400">
              Docket Ref: DKT-EXC-409-RECON-2026
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCreatedDocket(null)}
                className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
              >
                {isAr ? "تأكيد وإحالة للمراجعة" : "Confirm Docket Creation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
