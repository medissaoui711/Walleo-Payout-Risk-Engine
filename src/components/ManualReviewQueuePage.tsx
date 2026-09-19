import React, { useState } from "react";
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Clock, 
  AlertTriangle, 
  Eye, 
  FileSearch, 
  CheckCircle2, 
  Lock,
  Building2,
  Users,
  ChevronDown
} from "lucide-react";
import { ReviewQueueItem } from "../types";
import { formatMoney, maskAccountNumber } from "../lib/currency";

interface ManualReviewQueuePageProps {
  queue: ReviewQueueItem[];
  lang: 'ar' | 'en';
  onOpenCase: (payoutId: string) => void;
}

export const ManualReviewQueuePage: React.FC<ManualReviewQueuePageProps> = ({
  queue,
  lang,
  onOpenCase,
}) => {
  const isAr = lang === 'ar';
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'age' | 'amount' | 'risk'>('age');

  const filteredQueue = queue.filter(item => {
    if (filterType === 'CRITICAL' && item.riskLevel !== 'High_Risk') return false;
    if (filterType === 'HIGH_AMOUNT' && item.amount < 5000) return false;
    if (filterType === 'VELOCITY' && !item.velocityConcern) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.id.toLowerCase().includes(q) ||
        item.merchantName.toLowerCase().includes(q) ||
        (item.businessNameAr && item.businessNameAr.toLowerCase().includes(q)) ||
        item.merchantId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header & Page Description */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              {isAr ? "طابور المراجعة اليدوية للمخاطر (Manual Review Queue)" : "Payout Risk & Operations Review Queue"}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr 
              ? "الطلبات المحجوزة في حساب الضمان (Escrow) والتي تتطلب قراراً بشرياً مزدوجاً (Maker/Checker) قبل التوجيه المصرفي."
              : "Held payout cases requiring dual Maker/Checker authorization before routing to the partner bank."}
          </p>
        </div>

        {/* Bulk Action Safety Notice */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">{isAr ? "الإجراءات الجماعية:" : "Bulk Actions:"}</span>
            <span className="text-slate-300 font-mono font-bold">{isAr ? "معطلة أمنياً" : "Disabled (Enforced)"}</span>
          </div>
          <div className="bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-xs font-mono font-bold text-amber-400">{queue.length} {isAr ? "حالات معلقة" : "Pending"}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', labelAr: 'الكل', labelEn: 'All Cases' },
            { id: 'CRITICAL', labelAr: 'عالي الخطورة (Critical)', labelEn: 'Critical' },
            { id: 'HIGH_AMOUNT', labelAr: 'مبالغ كبرى (> $5K)', labelEn: 'High Amount' },
            { id: 'VELOCITY', labelAr: 'اضطراب السرعة (Velocity)', labelEn: 'Velocity Spike' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === f.id
                  ? 'bg-slate-800 text-teal-300 font-bold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
              }`}
            >
              {isAr ? f.labelAr : f.labelEn}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "تصفية بالمعرّف أو التاجر..." : "Filter case / merchant..."}
              className="w-48 sm:w-60 bg-slate-950 border border-slate-800 rounded-lg ps-8 pe-3 py-1 text-xs text-white focus:outline-none focus:border-teal-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute start-2.5 top-2" />
          </div>
        </div>
      </div>

      {/* Dense Operational Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {filteredQueue.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">
              {isAr ? "لا توجد طلبات سحب معلقة في هذا التصنيف" : "No Pending Payouts in This View"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isAr ? "جميع الطلبات تمت معالجتها أو تم اعتمادها آلياً عبر محرك Walleo Sentinel." : "All payout requests are processed or passed straight-through STP routing."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3 text-start">{isAr ? "رقم الطلب" : "Payout ID"}</th>
                  <th className="p-3 text-start">{isAr ? "التاجر والهوية" : "Merchant & Identity"}</th>
                  <th className="p-3 text-start">{isAr ? "المبلغ" : "Amount"}</th>
                  <th className="p-3 text-start">{isAr ? "مستوى الخطورة" : "Risk Tier"}</th>
                  <th className="p-3 text-start">{isAr ? "ثقة Sentinel" : "Sentinel Confidence"}</th>
                  <th className="p-3 text-start">{isAr ? "رمز السبب" : "Reason Code"}</th>
                  <th className="p-3 text-start">{isAr ? "عمر الطابور والـ SLA" : "Queue Age / SLA"}</th>
                  <th className="p-3 text-start">{isAr ? "المُعد (Maker)" : "Maker State"}</th>
                  <th className="p-3 text-center">{isAr ? "الإجراء" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredQueue.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => onOpenCase(item.id)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-mono font-bold text-teal-400">
                      {item.id}
                    </td>

                    <td className="p-3">
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span>{isAr && item.businessNameAr ? item.businessNameAr : item.merchantName}</span>
                          <span className="text-[11px]">{item.country === 'Tunisia' ? '🇹🇳' : '🇶🇦'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {item.merchantId} • {item.bankName} (•••• {item.accountNumber.slice(-4)})
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="font-mono font-bold text-white text-xs">
                        {formatMoney(item.amount, item.currency, lang)}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                        item.riskLevel === 'High_Risk'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          : item.riskLevel === 'Medium_Risk'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {item.riskLevel.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${Math.round(item.autoApproveConfidence * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-300 text-[11px]">
                          {(item.autoApproveConfidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    <td className="p-3 max-w-xs">
                      <div className="text-[11px] text-slate-300 line-clamp-1 font-mono">
                        {item.reason}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-mono text-[11px] flex items-center gap-1 text-amber-400">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>18m (SLA: 45m)</span>
                      </div>
                    </td>

                    <td className="p-3 font-mono text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        AWAITING_MAKER
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCase(item.id);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] font-bold border border-slate-700 transition-colors cursor-pointer"
                      >
                        {isAr ? "فحص الملف" : "Investigate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
