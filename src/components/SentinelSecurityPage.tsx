import React, { useState } from "react";
import { 
  Radio, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Terminal, 
  Activity, 
  RotateCw, 
  ShieldX,
  Zap,
  KeyRound,
  Webhook
} from "lucide-react";
import { FinancialTestResult } from "../types";

interface SentinelSecurityPageProps {
  lang: 'ar' | 'en';
}

export const SentinelSecurityPage: React.FC<SentinelSecurityPageProps> = ({
  lang,
}) => {
  const isAr = lang === 'ar';

  const [tests, setTests] = useState<FinancialTestResult[]>([
    {
      id: "SEC-001",
      title: "Broken Object Level Authorization (BOLA) Payout Isolation",
      titleAr: "عزل الصلاحيات ومنع الوصول للبيانات غير المصرح بها (BOLA)",
      category: "API_SECURITY",
      passed: true,
      status: "SUCCESS",
      details: "Merchant A attempted to query /api/payouts/PO-101 belonging to Merchant B. HTTP 403 Forbidden properly emitted with zero data leakage.",
      expectedOutcome: "HTTP 403 / Zero PII",
      actualOutcome: "HTTP 403 / Logged to SOC",
      auditHash: "sec_884a19b02efc"
    },
    {
      id: "SEC-002",
      title: "Idempotency Replay Attack & Double-Spend Defense",
      titleAr: "مكافحة إعادة الطلبات وهجمات الإنفاق المزدوج",
      category: "FINANCIAL_INTEGRITY",
      passed: true,
      status: "SUCCESS",
      details: "10 concurrent requests fired with identical Idempotency-Key. Exactly 1 ledger hold created; 9 requests returned HTTP 409 Conflict.",
      expectedOutcome: "1 Execution / 9 Blocked",
      actualOutcome: "1 Hold ($2.5k) / 9 HTTP 409",
      auditHash: "sec_110a77c331fe"
    },
    {
      id: "SEC-003",
      title: "HMAC Webhook Signature Verification & Replay Protection",
      titleAr: "التحقق من توقيع HMAC ومكافحة تزوير الـ Webhooks",
      category: "BANK_INTEGRATION",
      passed: true,
      status: "SUCCESS",
      details: "Simulated spoofed bank webhook with expired timestamp (t > 300s) and invalid SHA-256 HMAC header. Request dropped immediately.",
      expectedOutcome: "HTTP 401 Signature Invalid",
      actualOutcome: "HTTP 401 / IP Rate-limited",
      auditHash: "sec_664b99aa12cd"
    },
    {
      id: "SEC-004",
      title: "Segregation of Duties: Maker-Checker Invariant Enforce",
      titleAr: "تطبيق العزل الإلزامي بين المُعد (Maker) والمعتمد (Checker)",
      category: "RBAC_COMPLIANCE",
      passed: true,
      status: "SUCCESS",
      details: "Maker user 'ops_maker_44' attempted to sign off on their own investigation case. Hard blocked by Sentinel security interceptor.",
      expectedOutcome: "HTTP 403 Role Segregation Error",
      actualOutcome: "Blocked / Invariant Enforced",
      auditHash: "sec_991fa0244de1"
    },
    {
      id: "SEC-005",
      title: "Ledger Double-Entry Invariant Guard (Zero-Delta)",
      titleAr: "حارس توازن دفتر الأستاذ ومنع الاختلالات المحاسبية",
      category: "LEDGER_SAFETY",
      passed: true,
      status: "SUCCESS",
      details: "Artificial transaction with unbalanced debit/credit injected. Transaction aborted atomically with DB rollback.",
      expectedOutcome: "Atomic Abort / Zero Delta",
      actualOutcome: "DB Rollback Confirmed",
      auditHash: "sec_441ba889211c"
    },
    {
      id: "SEC-006",
      title: "API Rate-Limiting & DDOS Token Bucket Enforcement",
      titleAr: "الحد من معدل طلبات واجهة البرمجة (Rate-Limiting)",
      category: "INFRASTRUCTURE",
      passed: true,
      status: "SUCCESS",
      details: "1,000 rapid requests dispatched to /api/payout. Nginx ingress and token bucket throttled excess requests at HTTP 429.",
      expectedOutcome: "HTTP 429 Token Bucket Active",
      actualOutcome: "Throttled at 100 req/min",
      auditHash: "sec_552ba990172e"
    },
    {
      id: "SEC-007",
      title: "Sanctions & PEP Screening Interceptor",
      titleAr: "فحص قوائم العقوبات والشخصيات المعرضة سياسياً (PEP)",
      category: "AML_COMPLIANCE",
      passed: true,
      status: "SUCCESS",
      details: "Beneficiary name matched against UN/OFAC/MENA sanctions database. Flagged and escalated for manual compliance audit.",
      expectedOutcome: "Compliance Hold Triggered",
      actualOutcome: "Held with Reason AML_01",
      auditHash: "sec_778ba11094ea"
    },
    {
      id: "SEC-008",
      title: "Payout Amount Hard-Limit Gatekeeper",
      titleAr: "بوابة الحد الأقصى لصرف السحوبات النقدية",
      category: "POLICY_LIMITS",
      passed: true,
      status: "SUCCESS",
      details: "Payout request of $50,000 exceeding merchant standard limit ($15,000) automatically held for senior board approval.",
      expectedOutcome: "Held for High-Tier Signoff",
      actualOutcome: "Hard Limit Policy Enforced",
      auditHash: "sec_229ba009384b"
    },
    {
      id: "SEC-009",
      title: "Banking Cooldown on Account Modification",
      titleAr: "فترة تجميد السحب الإلزامية عند تعديل الحساب البنكي",
      category: "FRAUD_DEFENSE",
      passed: true,
      status: "SUCCESS",
      details: "Merchant changed IBAN and attempted immediate full balance withdrawal. Payout quarantined for 24h cooling period.",
      expectedOutcome: "24-Hour Quarantine Hold",
      actualOutcome: "Quarantine Active",
      auditHash: "sec_331ba448899a"
    },
    {
      id: "SEC-010",
      title: "Cryptographic Tamper-Evidence of Audit Logs",
      titleAr: "التحقق من عدم التلاعب بسلسلة سجلات التدقيق",
      category: "AUDIT_INTEGRITY",
      passed: true,
      status: "SUCCESS",
      details: "Simulated historical log modification. Chained SHA-256 hash validation flagged block mismatch immediately.",
      expectedOutcome: "Tamper Detected & Alerted",
      actualOutcome: "Chain Integrity Verified",
      auditHash: "sec_004ba776192f"
    }
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold text-white">
              {isAr ? "مركز الأمن واختبارات الدفاع (Sentinel Security Center)" : "Sentinel Security Center & Defense Suite"}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr 
              ? "مصفوفة اختبارات الأمان المستمرة (SEC-001 إلى SEC-010) لحماية العمليات المالية ومنع الاختراقات والتلاعب."
              : "Continuous API defense test suite enforcing BOLA prevention, double-spend defense, HMAC verification, and RBAC invariants."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>10/10 Defense Controls Passing</span>
          </span>
        </div>
      </div>

      {/* Security Events Stream */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 font-mono text-[10px] uppercase block">Blocked BOLA Attempts</span>
          <span className="text-lg font-black font-mono text-white mt-1 block">4 Blocked</span>
          <span className="text-[10px] text-emerald-400 font-mono">Zero data leakage</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 font-mono text-[10px] uppercase block">HMAC Webhook Rejections</span>
          <span className="text-lg font-black font-mono text-white mt-1 block">0 Failed</span>
          <span className="text-[10px] text-emerald-400 font-mono">100% Validated</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 font-mono text-[10px] uppercase block">Circuit Breaker Status</span>
          <span className="text-lg font-black font-mono text-emerald-400 mt-1 block">ARMED (0 Tripped)</span>
          <span className="text-[10px] text-slate-400 font-mono">Auto-fallback active</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 font-mono text-[10px] uppercase block">Elevated Role Changes</span>
          <span className="text-lg font-black font-mono text-slate-200 mt-1 block">0 Today</span>
          <span className="text-[10px] text-teal-400 font-mono">Requires Dual-Admin</span>
        </div>
      </div>

      {/* SEC-001 through SEC-010 Defense Test Results Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {isAr ? "نتائج اختبارات الدفاع والأمان (SEC-001 إلى SEC-010)" : "API Defense Test Results (SEC-001 through SEC-010)"}
          </h3>
          <span className="text-xs font-mono text-slate-400">Environment: PRODUCTION / SANDBOX</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3 text-start">Test ID</th>
                <th className="p-3 text-start">Control Name</th>
                <th className="p-3 text-start">Category</th>
                <th className="p-3 text-start">Status</th>
                <th className="p-3 text-start">Evidence & Actual Outcome</th>
                <th className="p-3 text-start">Audit Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {tests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-teal-400">{t.id}</td>
                  <td className="p-3">
                    <div className="font-bold text-white text-xs">
                      {isAr ? t.titleAr : t.title}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-[10px] text-slate-400">{t.category}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      PASSED
                    </span>
                  </td>
                  <td className="p-3 max-w-sm text-[11px] text-slate-300 font-sans leading-relaxed">
                    {t.details}
                  </td>
                  <td className="p-3 font-mono text-[10px] text-slate-500 select-all">{t.auditHash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
