import React from "react";
import { X, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";
import { StatusBadge, DecisionBadge, RiskIndicator } from "./design-system";

interface TransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    id: string;
    amount: number;
    currency: string;
    status: 'paid' | 'pending' | 'review' | 'blocked';
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    decision: 'AUTO_APPROVE' | 'MANUAL_REVIEW' | 'BLOCK' | 'FALLBACK_REVIEW';
    createdAt: string;
    merchantName?: string;
    bankName?: string;
    maskedIban?: string;
    trustScore?: number;
    kycVerified?: boolean;
    velocityScore?: number;
    reasons?: string[];
  } | null;
  lang?: 'ar' | 'en';
  onViewTechnicalEvidence?: (txId: string) => void;
}

export const TransactionDrawer: React.FC<TransactionDrawerProps> = ({
  isOpen,
  onClose,
  transaction,
  lang = 'ar',
  onViewTechnicalEvidence,
}) => {
  const isAr = lang === 'ar';

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-200">{transaction.id}</span>
              <StatusBadge
                type={transaction.status === 'paid' ? 'SUCCESS' : transaction.status === 'review' ? 'WARNING' : 'DANGER'}
                label={transaction.status.toUpperCase()}
                size="sm"
              />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{isAr ? "تفاصيل المعاملة وقرار الحراسة" : "Transaction & Risk Assessment"}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 flex-1">
          {/* Main Decision Block */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              {isAr ? "قرار المحرك اللحظي" : "Sentinel Engine Decision"}
            </span>
            <div className="flex items-center justify-between">
              <DecisionBadge decision={transaction.decision} lang={lang} />
              <RiskIndicator level={transaction.riskLevel} score={transaction.trustScore} />
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] mb-1">{isAr ? "المبلغ" : "Amount"}</span>
              <span className="font-mono text-base font-bold text-white">
                ${transaction.amount} {transaction.currency}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] mb-1">{isAr ? "الحساب المصرفي" : "Bank Account"}</span>
              <span className="font-mono text-xs font-semibold text-slate-200 block truncate">
                {transaction.maskedIban || "TN59••••••••1234"}
              </span>
            </div>
          </div>

          {/* Decision Justifications */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              {isAr ? "لماذا اتخذ النظام هذا القرار؟" : "Decision Justification & Signals"}
            </span>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isAr ? "التحقق من الهوية (KYC) مكتمل ومعتمد" : "Beneficiary KYC verified and in good standing"}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isAr ? "حجز رصيد الضمان (Ledger Hold) مؤكد ذرياً" : "Atomic Ledger Hold successfully placed"}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isAr ? "لا توجد قفزة غير اعتيادية في سرعة السحب" : "Velocity burst checks within 24h baseline limits"}</span>
              </div>
            </div>
          </div>

          {/* Process Timeline */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-slate-300 block">
              {isAr ? "مسار المعاملة (Lifecycle)" : "Transaction Lifecycle"}
            </span>
            <div className="space-y-2 text-xs border-l-2 border-slate-800 pl-3 ml-2">
              <div className="relative">
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -left-[17px] top-1" />
                <span className="text-white font-medium block">{isAr ? "إنشاء الطلب وحجز الرصيد" : "Created & Held"}</span>
                <span className="text-[10px] text-slate-400 font-mono">13:37:38</span>
              </div>
              <div className="relative">
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -left-[17px] top-1" />
                <span className="text-white font-medium block">{isAr ? "فحص Sentinel والتوجيه" : "Sentinel Risk Evaluation"}</span>
                <span className="text-[10px] text-slate-400 font-mono">13:37:40</span>
              </div>
              <div className="relative">
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -left-[17px] top-1" />
                <span className="text-white font-medium block">{isAr ? "اكتمال التسوية المصرفية" : "Settled to Bank"}</span>
                <span className="text-[10px] text-slate-400 font-mono">13:37:42</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={() => {
              if (onViewTechnicalEvidence) onViewTechnicalEvidence(transaction.id);
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? "عرض الأدلة التشفيرية" : "Technical Evidence (SHA-256)"}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            {isAr ? "إغلاق" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
