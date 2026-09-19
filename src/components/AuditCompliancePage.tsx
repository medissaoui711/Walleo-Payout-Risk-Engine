import React, { useState } from "react";
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Lock, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  Key, 
  ShieldCheck,
  X
} from "lucide-react";

interface AuditCompliancePageProps {
  lang: 'ar' | 'en';
}

export const AuditCompliancePage: React.FC<AuditCompliancePageProps> = ({
  lang,
}) => {
  const isAr = lang === 'ar';
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("ALL");
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  const auditEvents = [
    {
      id: "EV-89421",
      payoutId: "PO-100",
      merchantId: "MER-101",
      eventType: "SETTLEMENT_COMPLETED",
      actor: "Bank_Webhook_Worker",
      prevHash: "8e2a11b091f0",
      currHash: "9f3a18e2298b",
      timestamp: "2026-09-19T07:42:15Z",
      policyVer: "POL-MENA-2026.04",
      status: "VERIFIED"
    },
    {
      id: "EV-89420",
      payoutId: "PO-101",
      merchantId: "MER-204",
      eventType: "LEDGER_HOLD_CREATED",
      actor: "Ledger_Engine",
      prevHash: "7d1b32a9010e",
      currHash: "8e2a11b091f0",
      timestamp: "2026-09-19T07:41:02Z",
      policyVer: "POL-MENA-2026.04",
      status: "VERIFIED"
    },
    {
      id: "EV-89419",
      payoutId: "PO-101",
      merchantId: "MER-204",
      eventType: "SENTINEL_EVALUATED",
      actor: "Sentinel_Policy_V2",
      prevHash: "4c2a99e81b11",
      currHash: "7d1b32a9010e",
      timestamp: "2026-09-19T07:40:59Z",
      policyVer: "POL-MENA-2026.04",
      status: "VERIFIED"
    },
    {
      id: "EV-89418",
      payoutId: "PO-098",
      merchantId: "MER-102",
      eventType: "CHECKER_APPROVAL",
      actor: "ops_checker_92",
      prevHash: "1a8e99b2401f",
      currHash: "4c2a99e81b11",
      timestamp: "2026-09-19T07:38:12Z",
      policyVer: "POL-MENA-2026.04",
      status: "VERIFIED"
    },
    {
      id: "EV-89417",
      payoutId: "PO-098",
      merchantId: "MER-102",
      eventType: "MAKER_RECOMMENDATION",
      actor: "ops_maker_44",
      prevHash: "0f4a88c7128a",
      currHash: "1a8e99b2401f",
      timestamp: "2026-09-19T07:34:00Z",
      policyVer: "POL-MENA-2026.04",
      status: "VERIFIED"
    },
    {
      id: "EV-89416",
      payoutId: "PO-095",
      merchantId: "MER-105",
      eventType: "HOLD_RELEASED",
      actor: "Compliance_Interceptor",
      prevHash: "9a2e77b1009c",
      currHash: "0f4a88c7128a",
      timestamp: "2026-09-19T07:22:45Z",
      policyVer: "POL-MENA-2026.04",
      status: "VERIFIED"
    }
  ];

  const filteredEvents = auditEvents.filter(e => {
    if (selectedEventType !== 'ALL' && e.eventType !== selectedEventType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.id.toLowerCase().includes(q) ||
        e.payoutId.toLowerCase().includes(q) ||
        e.merchantId.toLowerCase().includes(q) ||
        e.actor.toLowerCase().includes(q) ||
        e.currHash.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold text-white">
              {isAr ? "سجل التدقيق غير القابل للتعديل (Immutable Audit Trail)" : "Immutable Audit & Regulatory Compliance Trail"}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr 
              ? "سلسلة أحداث تشفيرية (SHA-256 Hash Chain) توثق كل قرار مالي وإجراء بشري ومصرفي بشكل نهائي غير قابل للتراجع."
              : "Cryptographic tamper-evident ledger recording all payout states, Sentinel decisions, Maker/Checker authorizations and webhook confirmations."}
          </p>
        </div>

        <button
          onClick={() => setShowExportSuccess(true)}
          className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>{isAr ? "تصدير حزمة الامتثال التنظيمي" : "Export Compliance Package"}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'SETTLEMENT_COMPLETED', 'LEDGER_HOLD_CREATED', 'SENTINEL_EVALUATED', 'CHECKER_APPROVAL', 'MAKER_RECOMMENDATION'].map(t => (
            <button
              key={t}
              onClick={() => setSelectedEventType(t)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-colors cursor-pointer ${
                selectedEventType === t
                  ? 'bg-slate-800 text-teal-300 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "بحث بالبصمة، الفاعل أو رقم السحب..." : "Search hash, actor, or Payout ID..."}
            className="w-56 bg-slate-950 border border-slate-800 rounded-lg ps-8 pe-3 py-1 text-xs text-white focus:outline-none focus:border-teal-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute start-2.5 top-2" />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3 text-start">Event ID</th>
                <th className="p-3 text-start">Event Type</th>
                <th className="p-3 text-start">Payout Reference</th>
                <th className="p-3 text-start">Merchant ID</th>
                <th className="p-3 text-start">Actor / Service</th>
                <th className="p-3 text-start">Chained SHA-256 Digest</th>
                <th className="p-3 text-start">Policy Ver</th>
                <th className="p-3 text-start">Verification</th>
                <th className="p-3 text-start">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-800/40">
                  <td className="p-3 text-teal-400 font-bold">{ev.id}</td>
                  <td className="p-3 text-white font-sans font-medium">{ev.eventType}</td>
                  <td className="p-3 text-slate-300">{ev.payoutId}</td>
                  <td className="p-3 text-slate-400">{ev.merchantId}</td>
                  <td className="p-3 text-slate-300 font-sans text-xs">{ev.actor}</td>
                  <td className="p-3 text-slate-500 max-w-[130px] truncate select-all">{ev.currHash}</td>
                  <td className="p-3 text-slate-400 text-[10px]">{ev.policyVer}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      ✓ {ev.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 font-sans text-[11px]">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Compliance Modal Notification */}
      {showExportSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {isAr ? "تم إنشاء حزمة الامتثال والتدقيق" : "Compliance Package Assembled"}
                </h3>
              </div>
              <button onClick={() => setShowExportSuccess(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr 
                ? "تم تصدير حزمة السجلات والتحقيقات المالية الموقعة رقمياً لمطابقة معايير البنك المركزي ومراجعي الحسابات."
                : "The compliance package with full cryptographic audit verification has been generated and ready for regulatory distribution."}
            </p>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400">
              SHA-256 Manifest: 8a11b902efc440a18e2298b7d1b32a90
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowExportSuccess(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                {isAr ? "تم" : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
