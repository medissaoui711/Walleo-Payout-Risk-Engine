import React, { useState } from "react";
import { 
  Scale, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Building,
  Lock,
  Globe2
} from "lucide-react";
import { Merchant } from "../types";

interface ComplianceLegalProps {
  merchants: Merchant[];
  lang: 'ar' | 'en';
}

export const ComplianceLegal: React.FC<ComplianceLegalProps> = ({ merchants, lang }) => {
  const isAr = lang === 'ar';
  const [selectedMerchantId, setSelectedMerchantId] = useState(merchants[0]?.id || "");
  const [isGeneratingAudit, setIsGeneratingAudit] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  // Sanctions screening interactive tool
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<{ status: 'clean' | 'flagged'; details: string } | null>(null);

  async function handleGenerateAiAudit() {
    setIsGeneratingAudit(true);
    try {
      const res = await fetch("/api/gemini/risk-deep-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId: selectedMerchantId }),
      });
      const data = await res.json();
      setAiReport(data.report);
    } catch (err) {
      console.error("AI audit error:", err);
    } finally {
      setIsGeneratingAudit(false);
    }
  }

  function handleSanctionsSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Simulated Sanctions Screening against OFAC / UN / Tunisian CT List
    const blockedKeywords = ["al-qaeda", "isis", "daesh", "hezbollah", "sanctioned", "zarrouk_blocked", "terror"];
    const isHit = blockedKeywords.some(k => searchQuery.toLowerCase().includes(k));

    if (isHit) {
      setSearchResult({
        status: 'flagged',
        details: isAr 
          ? "⚠️ تنبيه أمني عاجل: تم رصد تطابق مع قوائم العقوبات الدولية (UN / OFAC / AML). يجب تجميد الحساب فوراً وإشعار وحدة الاستعلام المالي."
          : "🚨 Critical AML Match: Entity matched UN/OFAC/National sanctions list. Account frozen."
      });
    } else {
      setSearchResult({
        status: 'clean',
        details: isAr
          ? "✅ نتيجة الفحص نظيفة: الكيان/التاجر غير مدرج في أي من قوائم العقوبات الأممية أو التونسية أو القطرية."
          : "✅ Clean Record: No matches found across OFAC, UN Sanctions, or Regional Watchlists."
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">
              {isAr ? "الامتثال القانوني والتنظيمي (Phase 0 Compliance)" : "Regulatory Compliance & Legal Framework"}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr 
              ? "متابعة متطلبات ترخيص البنك المركزي التونسي (BCT)، ومصرف قطر المركزي (QCB)، وقوانين مكافحة غسيل الأموال AML/CFT وحماية البيانات"
              : "Central Bank of Tunisia (BCT) Circular 2018-16, Qatar Central Bank (QCB) Sandbox, AML/CFT & GDPR Compliance"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="export-compliance-pkg-btn"
            onClick={async () => {
              try {
                const res = await fetch("/api/compliance/export?country=Tunisia");
                const data = await res.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Walleo_Regulatory_Audit_Package_${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              } catch (err) {
                console.error("Export error:", err);
              }
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span>{isAr ? "تحميل حزمة الامتثال والتدقيق (BCT/QCB)" : "Download Audit Package (JSON)"}</span>
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
            {isAr ? "الترخيص: TN-PSP-2024-88" : "License: TN-PSP-2024-88"}
          </span>
        </div>
      </div>

      {/* Regulatory Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Tunisia BCT */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇹🇳</span>
              <h3 className="font-bold text-white text-sm">
                {isAr ? "البنك المركزي التونسي" : "Tunisia BCT"}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Approved
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isAr 
              ? "الامتثال لمنشور 2018-16 لمزودي خدمات الدفع (PSP) والمحافظ الرقمية الوطنية مع فصل أموال التجار (Ring-fenced accounts)."
              : "Compliant with BCT Circular 2018-16 for Payment Service Providers (PSP) with segregated merchant trust accounts."}
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{isAr ? "مقاصة محلية" : "Settlement"}</span>
            <span className="text-white font-mono">BIAT / Attijari</span>
          </div>
        </div>

        {/* Qatar QCB */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇶🇦</span>
              <h3 className="font-bold text-white text-sm">
                {isAr ? "مصرف قطر المركزي" : "Qatar QCB"}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Sandbox Live
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isAr 
              ? "مختبر التكنولوجيا المالية التنظيمي (FinTech Sandbox) متصل بنظام المقاصة الوطنية NAPS وبوابات QPay."
              : "QCB FinTech Regulatory Sandbox compliance with automated real-time settlement rails and NAPS integration."}
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{isAr ? "البنك الشريك" : "Partner Bank"}</span>
            <span className="text-white font-mono">QNB / CBQ</span>
          </div>
        </div>

        {/* AML / CFT Screening */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">
                {isAr ? "مكافحة غسيل الأموال" : "AML / CFT"}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isAr 
              ? "فحص مستمر لقوائم العقوبات الدولية (UN Sanctions, OFAC) ولجان مكافحة الإرهاب مع رصد المعاملات المشبوهة (STR)."
              : "Continuous screening against UN & OFAC sanctions lists with automated Suspicious Transaction Reporting (STR)."}
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{isAr ? "التدقيق" : "Frequency"}</span>
            <span className="text-emerald-400 font-bold">Real-time / API</span>
          </div>
        </div>

        {/* Data Protection GDPR / 2004-63 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-400" />
              <h3 className="font-bold text-white text-sm">
                {isAr ? "حماية البيانات" : "GDPR & Law 2004"}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Certified
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isAr 
              ? "مطابقة تامة للقانون التونسي 2004-63 ولائحة GDPR الأوروبية مع تشفير كامل للبيانات البنكية ومعلومات التجار."
              : "Compliant with Tunisian Law 2004-63 and EU GDPR for cross-border European cardholders and merchants."}
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{isAr ? "التشفير" : "Encryption"}</span>
            <span className="text-white font-mono">AES-256 / TLS 1.3</span>
          </div>
        </div>
      </div>

      {/* Interactive Sanctions Screening Tool */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
          <Search className="w-5 h-5 text-indigo-400" />
          {isAr ? "فاحص قوائم العقوبات اللحظي (Sanctions & AML Screener)" : "Live Sanctions Screening Tool"}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          {isAr 
            ? "اختبر فحص اسم التاجر أو المستفيد الحقيقي (UBO) للتأكد من خلوه من قوائم الحظر الدولية"
            : "Simulate real-time checking of merchant names, IBANs, or beneficial owners against global watchlists"}
        </p>

        <form onSubmit={handleSanctionsSearch} className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "أدخل اسم التاجر أو الشركة للتحقق (مثال: Carthage Organic Exports)..." : "Enter business or person name to screen..."}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>{isAr ? "فحص فوري" : "Screen"}</span>
          </button>
        </form>

        {searchResult && (
          <div className={`mt-4 p-4 rounded-xl text-xs flex items-start gap-3 border ${
            searchResult.status === 'flagged'
              ? 'bg-red-950/50 border-red-500/40 text-red-200'
              : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
          }`}>
            {searchResult.status === 'flagged' ? (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div>{searchResult.details}</div>
          </div>
        )}
      </div>

      {/* Server-Side AI Forensic Compliance Auditor (Gemini) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                {isAr ? "تقرير التدقيق الجنائي بالذكاء الاصطناعي (AI Forensic Compliance Auditor)" : "AI Executive AML & Forensic Audit"}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? "توليد تقرير امتثال شامل مدعوم بنموذج Gemini 3.8 Flash لتحليل مخاطر التاجر وفق معايير BCT وQCB"
                : "Generates an executive forensic compliance memo analyzing velocity, AML flags, and merchant KYC"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedMerchantId}
              onChange={(e) => setSelectedMerchantId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.businessName} ({m.country})
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerateAiAudit}
              disabled={isGeneratingAudit}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all"
            >
              {isGeneratingAudit ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isAr ? "جاري التدقيق..." : "Auditing..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? "توليد تقرير الامتثال الذكي" : "Generate AI Memo"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {aiReport && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line animate-in fade-in duration-300">
            {aiReport}
          </div>
        )}
      </div>
    </div>
  );
};
