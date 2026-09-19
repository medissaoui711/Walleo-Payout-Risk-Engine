import React, { useState } from "react";
import { 
  Shield, 
  Wallet, 
  Layers, 
  Activity, 
  Lock, 
  UserCheck, 
  Building2, 
  Globe, 
  Sliders, 
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  RefreshCw,
  Clock
} from "lucide-react";
import { Merchant } from "../types";

export type RoleMode = 'executive' | 'operations' | 'security' | 'merchant';

interface NavbarProps {
  activeTab: 'dashboard' | 'merchant' | 'maker-checker' | 'tests' | 'jev-simulator' | 'compliance' | 'metrics';
  setActiveTab: (tab: 'dashboard' | 'merchant' | 'maker-checker' | 'tests' | 'jev-simulator' | 'compliance' | 'metrics') => void;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  currency: string;
  setCurrency: (cur: string) => void;
  selectedMerchant: Merchant | null;
  merchants: Merchant[];
  onSelectMerchant: (m: Merchant) => void;
  pendingReviewCount: number;
  roleMode: RoleMode;
  setRoleMode: (mode: RoleMode) => void;
  onRefresh?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  currency,
  setCurrency,
  selectedMerchant,
  merchants,
  onSelectMerchant,
  pendingReviewCount,
  roleMode,
  setRoleMode,
  onRefresh,
}) => {
  const isAr = lang === 'ar';
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top Multi-Rail Control Strip */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-1 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/25 text-[10px]">
            {isAr ? "منظومة مرخصة" : "Licensed Sandbox"}
          </span>
          <span className="text-slate-400 text-[11px]">
            {isAr ? "تونس (BCT 2018-16) 🇹🇳 • قطر (QCB FinTech) 🇶🇦" : "Tunisia (BCT) 🇹🇳 • Qatar (QCB) 🇶🇦"}
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-emerald-400 font-mono text-[10px] hidden sm:inline">
            Bank Connector: Operational (99.98% SLA)
          </span>
        </div>

        {/* Role Mode Switcher (Executive / Operations / Security / Merchant) */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <span className="text-slate-500 px-1 text-[10px] font-semibold uppercase">
            {isAr ? "الوضع:" : "View:"}
          </span>
          
          <button
            onClick={() => {
              setRoleMode('executive');
              setActiveTab('dashboard');
            }}
            className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
              roleMode === 'executive' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? "تنفيذي" : "Executive"}
          </button>

          <button
            onClick={() => {
              setRoleMode('operations');
              setActiveTab('maker-checker');
            }}
            className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              roleMode === 'operations' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{isAr ? "تشغيلي" : "Operations"}</span>
            {pendingReviewCount > 0 && (
              <span className="px-1 text-[9px] font-bold rounded-full bg-amber-400 text-slate-950">
                {pendingReviewCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setRoleMode('security');
              setActiveTab('tests');
            }}
            className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
              roleMode === 'security' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? "أمني" : "Security"}
          </button>

          <button
            onClick={() => {
              setRoleMode('merchant');
              setActiveTab('merchant');
            }}
            className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
              roleMode === 'merchant' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? "بوابة التاجر" : "Merchant"}
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm group-hover:bg-emerald-500 transition-colors">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-white tracking-tight">Walleo</span>
                <span className="text-[10px] uppercase font-mono px-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Sentinel
                </span>
              </div>
            </div>
          </div>

          {/* Role-Aware Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
            {/* Common: Dashboard */}
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {isAr ? "مركز التحكم" : "Overview"}
            </button>

            {/* Merchant Portal / Payouts */}
            {(roleMode === 'merchant' || roleMode === 'executive' || roleMode === 'operations') && (
              <button
                id="nav-tab-merchant"
                onClick={() => setActiveTab('merchant')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'merchant'
                    ? 'bg-slate-800 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {roleMode === 'merchant' ? (isAr ? "بوابة التاجر والسحب" : "Merchant Portal") : (isAr ? "عمليات السحب" : "Payouts")}
              </button>
            )}

            {/* Decision & Maker/Checker (Operations, Executive, Security) */}
            {roleMode !== 'merchant' && (
              <button
                id="nav-tab-maker-checker"
                onClick={() => setActiveTab('maker-checker')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'maker-checker'
                    ? 'bg-slate-800 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>{isAr ? "طابور المراجعة والأستاذ" : "Review Queue & Ledger"}</span>
                {pendingReviewCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {pendingReviewCount}
                  </span>
                )}
              </button>
            )}

            {/* Risk Center / Jev Simulator (Operations, Security, Executive) */}
            {roleMode !== 'merchant' && (
              <button
                id="nav-tab-jev"
                onClick={() => setActiveTab('jev-simulator')}
                className={`hidden md:block px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'jev-simulator'
                    ? 'bg-slate-800 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {isAr ? "مركز المخاطر" : "Risk Center"}
              </button>
            )}

            {/* Security Suite (Security, Executive) */}
            {(roleMode === 'security' || roleMode === 'executive') && (
              <button
                id="nav-tab-tests"
                onClick={() => setActiveTab('tests')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'tests'
                    ? 'bg-slate-800 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>{isAr ? "منظومة الأمان" : "Security Suite"}</span>
              </button>
            )}

            {/* Telemetry & Compliance */}
            {roleMode === 'security' && (
              <button
                id="nav-tab-compliance"
                onClick={() => setActiveTab('compliance')}
                className={`hidden lg:block px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'compliance'
                    ? 'bg-slate-800 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {isAr ? "الامتثال" : "Compliance"}
              </button>
            )}
          </nav>

          {/* Right Controls: Refresh + Merchant + Currency + Lang */}
          <div className="flex items-center gap-2">
            {/* Fast Manual Refresh with Indicator */}
            <button
              onClick={handleRefreshClick}
              title={isAr ? "تحديث البيانات الآن" : "Refresh data now"}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {/* Merchant Quick Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <select
                id="select-active-merchant"
                value={selectedMerchant?.id || ''}
                onChange={(e) => {
                  const m = merchants.find(item => item.id === e.target.value);
                  if (m) onSelectMerchant(m);
                }}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
              >
                {merchants.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                    {isAr && m.businessNameAr ? m.businessNameAr : m.businessName} ({m.country === 'Tunisia' ? '🇹🇳' : '🇶🇦'})
                  </option>
                ))}
              </select>
            </div>

            {/* Currency Pill */}
            <div className="flex items-center bg-slate-800/60 rounded-lg border border-slate-700 p-0.5 text-xs">
              {['USD', 'TND', 'QAR'].map((c) => (
                <button
                  key={c}
                  id={`btn-currency-${c}`}
                  onClick={() => setCurrency(c)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    currency === c
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Language Switcher */}
            <button
              id="btn-toggle-lang"
              onClick={() => {
                const next = lang === 'ar' ? 'en' : 'ar';
                setLang(next);
                document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
                document.documentElement.lang = next;
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold">{lang === 'ar' ? 'EN' : 'العربية'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
