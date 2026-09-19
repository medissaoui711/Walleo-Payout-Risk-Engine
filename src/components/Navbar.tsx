import React from "react";
import { 
  ShieldAlert, 
  Wallet, 
  Cpu, 
  Scale, 
  BarChart3, 
  Globe, 
  Sparkles,
  Building2,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Merchant } from "../types";

interface NavbarProps {
  activeTab: 'merchant' | 'maker-checker' | 'tests' | 'jev-simulator' | 'compliance' | 'metrics';
  setActiveTab: (tab: 'merchant' | 'maker-checker' | 'tests' | 'jev-simulator' | 'compliance' | 'metrics') => void;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  currency: string;
  setCurrency: (cur: string) => void;
  selectedMerchant: Merchant | null;
  merchants: Merchant[];
  onSelectMerchant: (m: Merchant) => void;
  pendingReviewCount: number;
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
}) => {
  const isAr = lang === 'ar';

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Banner / Regional Presence */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border-b border-emerald-900/40 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium border border-emerald-500/30">
            {isAr ? "منظومة دفع مرخصة" : "Licensed PSP Gateway"}
          </span>
          <span className="text-slate-400">
            {isAr ? "تونس (BCT) 🇹🇳 | قطر (QCB FinTech Sandbox) 🇶🇦" : "Tunisia (BCT) 🇹🇳 | Qatar (QCB) 🇶🇦"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-400">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="font-mono text-[11px]">Walleo Sentinel Engine: Active</span>
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/40">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-bold tracking-tight text-white">Walleo</h1>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  Payout & Risk
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {isAr ? "بوابة سحب الأرباح وإدارة المخاطر للتجار" : "Merchant Payouts & Automated Risk Review"}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              id="nav-tab-merchant"
              onClick={() => setActiveTab('merchant')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'merchant'
                  ? 'bg-emerald-500 text-slate-950 shadow font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>{isAr ? "لوحة التاجر" : "Merchant Portal"}</span>
            </button>

            <button
              id="nav-tab-maker-checker"
              onClick={() => setActiveTab('maker-checker')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
                activeTab === 'maker-checker'
                  ? 'bg-emerald-500 text-slate-950 shadow font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isAr ? "عزل الصلاحيات Maker/Checker" : "Maker / Checker & Ledger"}</span>
              {pendingReviewCount > 0 && (
                <span className={`px-1.5 py-0.2 text-[11px] font-bold rounded-full ${
                  activeTab === 'maker-checker' ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {pendingReviewCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-tests"
              onClick={() => setActiveTab('tests')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'tests'
                  ? 'bg-emerald-500 text-slate-950 shadow font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAr ? "مصفوفة الاختبارات (22)" : "Invariant & Security Tests (22)"}</span>
            </button>

            <button
              id="nav-tab-jev"
              onClick={() => setActiveTab('jev-simulator')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'jev-simulator'
                  ? 'bg-emerald-500 text-slate-950 shadow font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>{isAr ? "محرك Sentinel ومحاكاة المخاطر" : "Sentinel Engine & Shadow"}</span>
            </button>

            <button
              id="nav-tab-compliance"
              onClick={() => setActiveTab('compliance')}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'compliance'
                  ? 'bg-emerald-500 text-slate-950 shadow font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>{isAr ? "الامتثال والترخيص" : "Compliance & AML"}</span>
            </button>

            <button
              id="nav-tab-metrics"
              onClick={() => setActiveTab('metrics')}
              className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'metrics'
                  ? 'bg-emerald-500 text-slate-950 shadow font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{isAr ? "مراقبة Grafana" : "Live Metrics"}</span>
            </button>
          </nav>

          {/* Controls: Merchant Switcher + Currency + Lang */}
          <div className="flex items-center gap-2">
            {/* Merchant Quick Selector */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <select
                id="select-active-merchant"
                value={selectedMerchant?.id || ''}
                onChange={(e) => {
                  const m = merchants.find(item => item.id === e.target.value);
                  if (m) onSelectMerchant(m);
                }}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer pr-1"
              >
                {merchants.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                    {isAr && m.businessNameAr ? m.businessNameAr : m.businessName} ({m.country === 'Tunisia' ? '🇹🇳 تونس' : '🇶🇦 قطر'})
                  </option>
                ))}
              </select>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center bg-slate-800/60 rounded-lg border border-slate-700 p-0.5 text-xs">
              {['USD', 'TND', 'QAR', 'EUR'].map((c) => (
                <button
                  key={c}
                  id={`btn-currency-${c}`}
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                    currency === c
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Language Toggle */}
            <button
              id="btn-toggle-lang"
              onClick={() => {
                const next = lang === 'ar' ? 'en' : 'ar';
                setLang(next);
                document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
                document.documentElement.lang = next;
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
              title="Toggle Language / تغيير اللغة"
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
