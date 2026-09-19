import React, { useState, useEffect } from "react";
import { FinancialTestResult } from "../types";
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  RefreshCw, 
  ShieldCheck, 
  Layers, 
  Lock, 
  FileCode, 
  Scale, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";

interface FinancialTestSuiteProps {
  lang: 'ar' | 'en';
}

export function FinancialTestSuite({ lang }: FinancialTestSuiteProps) {
  const isAr = lang === 'ar';
  const [tests, setTests] = useState<FinancialTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastExecuted, setLastExecuted] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<FinancialTestResult | null>(null);

  async function runTests() {
    setIsRunning(true);
    try {
      const res = await fetch("/api/tests/run", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setTests(data.results);
        setLastExecuted(data.executedAt);
        if (data.results.length > 0) {
          setSelectedTest(data.results[0]);
        }
      }
    } catch (err) {
      console.error("Test execution failed:", err);
    } finally {
      setIsRunning(false);
    }
  }

  useEffect(() => {
    runTests();
  }, []);

  const total = tests.length;
  const passed = tests.filter(t => t.passed).length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'FINANCIAL' | 'SECURITY'>('ALL');

  const filteredTests = tests.filter(t => {
    if (activeCategory === 'FINANCIAL') return t.id.startsWith('FT-');
    if (activeCategory === 'SECURITY') return t.id.startsWith('SEC-');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                {isAr ? "نظام التدقيق المالي ومصفوفة الأمان السيبراني" : "Financial Invariants & Sentinel Security Suite"}
              </span>
              <span className="text-xs text-slate-400 font-mono">NIST CSF 2.0 / OWASP API Top 10</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isAr ? "مصفوفة اختبارات الأمان المالي والسيبراني (22 اختباراً)" : "Financial Invariants & Walleo Sentinel Security Suite (22 Tests)"}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {isAr 
                ? "تنفيذ مؤتمت لـ 8 اختبارات لسلامة القيود المحاسبية، متبوعة بـ 14 اختباراً أمنياً شاملاً (BOLA, BFLA, HMAC, Replay, Mass Assignment, SSRF, Rate Limiting, Upstream Anomaly)."
                : "Automated regression tests proving double-entry ledger invariants (FT-01..08) alongside 14 critical cyber defenses (SEC-001..014)."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400">{isAr ? "نسبة النجاح" : "Pass Rate"}</div>
              <div className="text-2xl font-black font-mono text-emerald-400">{passRate}%</div>
            </div>
            <button
              id="run-all-tests-btn"
              onClick={runTests}
              disabled={isRunning}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isAr ? "جاري تشغيل الاختبارات..." : "Executing Tests..."}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isAr ? "إعادة تشغيل المصفوفة الكاملة" : "Run All 22 Tests"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'ALL'
                ? 'bg-slate-100 text-slate-950 font-bold'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? `الكل (${tests.length})` : `All (${tests.length})`}
          </button>
          <button
            onClick={() => setActiveCategory('FINANCIAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'FINANCIAL'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isAr ? "سلامة دفتر الأستاذ (FT-01 - FT-08)" : "Ledger Invariants (FT-01 - FT-08)"}</span>
          </button>
          <button
            onClick={() => setActiveCategory('SECURITY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'SECURITY'
                ? 'bg-teal-500 text-slate-950 font-bold'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isAr ? "أمان واجهات API ومكافحة الاختراق (SEC-001 - SEC-014)" : "API Cyber Defenses (SEC-001 - SEC-014)"}</span>
          </button>
        </div>
      </div>

      {/* Tests Grid & Inspection Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Test Case Cards */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              {isAr ? `حالات الاختبار المعروضة (${filteredTests.length})` : `Filtered Test Cases (${filteredTests.length})`}
            </span>
            <span>{lastExecuted ? new Date(lastExecuted).toLocaleTimeString() : ""}</span>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredTests.map((test) => {
              const isSelected = selectedTest?.id === test.id;
              const isSecurityTest = test.id.startsWith('SEC-');
              return (
                <div
                  key={test.id}
                  id={`test-item-${test.id}`}
                  onClick={() => setSelectedTest(test)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-800/90 border-emerald-500/50 shadow-md shadow-emerald-950/40"
                      : "bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {test.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-xs font-bold px-1.5 py-0.2 rounded ${
                            isSecurityTest ? "bg-teal-500/10 text-teal-400 border border-teal-500/30" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          }`}>
                            {test.id}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-white">
                            {isAr ? test.titleAr : test.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {test.details}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        test.passed ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {test.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Inspection Inspector */}
        <div className="lg:col-span-6">
          {selectedTest ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-emerald-400 text-xs">
                    {selectedTest.id}
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {isAr ? selectedTest.titleAr : selectedTest.title}
                    </h3>
                    <span className="text-xs text-slate-400">{selectedTest.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isAr ? "تم التحقق حتمياً" : "Verified Invariant"}</span>
                </div>
              </div>

              {/* Functional Explanation */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                  {isAr ? "وصف الاختبار والهدف الأمني" : "Test Description & Objective"}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  {selectedTest.details}
                </p>
              </div>

              {/* Expected vs Actual Outcomes */}
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">
                    {isAr ? "النتيجة المتوقعة حسب الضوابط المالية:" : "Expected Outcome (Policy Invariant):"}
                  </span>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono">
                    {selectedTest.expectedOutcome}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">
                    {isAr ? "النتيجة الفعلية المنفذة في النظام:" : "Actual Realized Outcome:"}
                  </span>
                  <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/30 text-xs text-emerald-300 font-mono">
                    {selectedTest.actualOutcome}
                  </div>
                </div>
              </div>

              {/* Cryptographic Audit Proof */}
              {selectedTest.auditHash && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-teal-400" />
                    <span>{isAr ? "البصمة التشفيرية لدفتر الأستاذ (SHA-256 Chained Hash)" : "Ledger Cryptographic Audit Hash"}</span>
                  </h4>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-teal-400 break-all select-all">
                    {selectedTest.auditHash}
                  </div>
                </div>
              )}

              {/* Architectural Safety Guarantees */}
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-4 rounded-xl border border-slate-800/80 text-xs space-y-2">
                <div className="font-bold text-slate-200 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? "الضمانات التنظيمية والامتثال" : "Regulatory & Accounting Invariants"}</span>
                </div>
                <ul className="space-y-1.5 text-slate-400 text-[11px]">
                  <li>• {isAr ? "لا يتم تحويل أي مليم إلا بعد حجز الرصيد في قيد مزدوج." : "Zero fund transfers occur before an atomic HOLD ledger entry."}</li>
                  <li>• {isAr ? "فصل مطلق بين من يقترح القرار (Maker) ومن يعتمده (Checker)." : "Strict Segregation of Duties: Maker and Checker cannot be the same user."}</li>
                  <li>• {isAr ? "إخفاء تام لرموز الآيبان والحسابات البنكية وفق القانون التونسي 2004-63 و GDPR." : "Zero PII leakage: IBANs and customer identifiers are strictly masked."}</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              {isAr ? "اختر اختباراً من القائمة لمعاينة التفاصيل" : "Select a test case to inspect results"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
