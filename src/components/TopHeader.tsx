import React, { useState } from "react";
import { 
  Shield, 
  Search, 
  Bell, 
  Globe, 
  UserCheck, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Clock, 
  RefreshCw,
  Building2,
  Lock,
  Layers,
  X
} from "lucide-react";

interface TopHeaderProps {
  lang: 'ar' | 'en';
  setLang: (l: 'ar' | 'en') => void;
  environment: 'SANDBOX' | 'PRODUCTION';
  setEnvironment: (env: 'SANDBOX' | 'PRODUCTION') => void;
  onSearch: (query: string) => void;
  onRefresh: () => void;
  unreadAlertCount: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  lang,
  setLang,
  environment,
  setEnvironment,
  onSearch,
  onRefresh,
  unreadAlertCount,
}) => {
  const isAr = lang === 'ar';
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 700);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800 sticky top-0 z-50 flex items-center justify-between px-6 select-none">
      {/* Brand & Environment Section */}
      <div className="flex items-center gap-4 min-w-[280px]">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-500/30 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-950/50">
            <Shield className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-sans">
                Walleo
              </span>
              <span className="text-[11px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900 text-teal-300 border border-slate-800 font-bold">
                Sentinel
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block -mt-0.5">
              {isAr ? "مركز الرقابة والعمليات المالية" : "Financial Control Center"}
            </span>
          </div>
        </div>

        {/* Environment Toggle Badge */}
        <button
          onClick={() => setEnvironment(environment === 'SANDBOX' ? 'PRODUCTION' : 'SANDBOX')}
          title={isAr ? "التبديل بين بيئة المحاكاة والإنتاج" : "Toggle Sandbox / Production"}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold tracking-wider border cursor-pointer transition-all ${
            environment === 'PRODUCTION'
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-950/80'
              : 'bg-amber-950/50 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-950/80'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${environment === 'PRODUCTION' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span>{environment}</span>
        </button>
      </div>

      {/* Global Search Bar (Desktop) */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-6 hidden md:block">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "ابحث برقم السحب (PO-101) أو التاجر أو حدث التدقيق..." : "Search by Payout ID (PO-101), Merchant, or Audit Hash..."}
            className="w-full h-9 bg-slate-900/90 border border-slate-800 rounded-lg ps-9 pe-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-sans"
          />
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5 pointer-events-none" />
        </div>
      </form>

      {/* System Status Indicators & Connectors */}
      <div className="flex items-center gap-4">
        {/* Bank Connector Status */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">{isAr ? "الموصل المصرفي:" : "Bank Connector:"}</span>
            <span className="font-bold text-slate-200 font-mono">Operational</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">{isAr ? "المحرك:" : "Sentinel Engine:"}</span>
            <span className="font-bold text-emerald-400 font-mono">Active (142ms)</span>
          </div>
        </div>

        {/* Manual Refresh Trigger */}
        <button
          onClick={handleRefreshClick}
          title={isAr ? "تحديث البيانات الآن" : "Sync live data now"}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
        </button>

        {/* Critical Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-mono font-bold flex items-center justify-center border-2 border-slate-950 animate-pulse">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute end-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {isAr ? "التنبيهات والإنذارات الحرجة" : "Critical Operations Alerts"}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                  {unreadAlertCount} {isAr ? "نشط" : "Active"}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <div className="flex items-center justify-between font-semibold text-rose-400">
                    <span>Velocity Spike (MER-204)</span>
                    <span className="text-[10px] text-slate-500 font-mono">4m ago</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isAr ? "سحب متكرر بقيمة $2,500 يتجاوز المعدل الطبيعي." : "Burst payout of $2,500 requires dual Maker/Checker."}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <div className="flex items-center justify-between font-semibold text-amber-400">
                    <span>QCB Webhook Latency</span>
                    <span className="text-[10px] text-slate-500 font-mono">18m ago</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isAr ? "زمن استجابة الـ Webhook وصل إلى 850ms (عادي)." : "Bank settlement webhook delivered successfully."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => {
            const next = lang === 'ar' ? 'en' : 'ar';
            setLang(next);
            document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = next;
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-teal-400" />
          <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        {/* Logged-In User Profile */}
        <div className="flex items-center gap-3 ps-2 border-s border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-300 font-bold text-xs">
            OP
          </div>
          <div className="hidden lg:block text-start">
            <div className="text-xs font-bold text-white leading-none">
              Tariq Ben Salem
            </div>
            <span className="text-[10px] font-mono text-teal-400 mt-0.5 block">
              Risk Operations Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
