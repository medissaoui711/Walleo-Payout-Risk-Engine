import React from "react";
import { 
  LayoutDashboard, 
  ArrowDownToLine, 
  ListFilter, 
  Lock, 
  AlertOctagon, 
  CheckCheck, 
  ShieldAlert, 
  Sliders, 
  FileCode, 
  Activity, 
  BookOpenCheck, 
  Scale, 
  FileWarning, 
  Radio, 
  KeyRound, 
  Terminal, 
  Webhook, 
  History, 
  Archive, 
  Download, 
  Users, 
  Gauge, 
  Building2,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from "lucide-react";
import { ActivePage } from "../navigation";

interface NavigationSidebarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  lang: 'ar' | 'en';
  pendingReviewCount: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activePage,
  setActivePage,
  lang,
  pendingReviewCount,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const isAr = lang === 'ar';

  const navSections = [
    {
      title: isAr ? "نظرة عامة" : "Overview",
      items: [
        {
          id: 'overview' as ActivePage,
          label: isAr ? "مركز التحكم والعمليات" : "Executive Overview",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: isAr ? "عمليات السحب" : "Payout Operations",
      items: [
        {
          id: 'payouts-all' as ActivePage,
          label: isAr ? "جميع طلبات السحب" : "All Payout Requests",
          icon: ArrowDownToLine,
        },
        {
          id: 'payouts-review' as ActivePage,
          label: isAr ? "طابور المراجعة (Maker/Checker)" : "Manual Review Queue",
          icon: ListFilter,
          badge: pendingReviewCount > 0 ? `${pendingReviewCount}` : undefined,
          badgeColor: 'amber',
        },
        {
          id: 'payouts-case-detail' as ActivePage,
          label: isAr ? "ملف تحقيق السحب (Case PO-101)" : "Payout Case Dossier",
          icon: Sparkles,
        },
        {
          id: 'payouts-held' as ActivePage,
          label: isAr ? "العمليات المحجوزة" : "Held Payouts",
          icon: Lock,
        },
        {
          id: 'payouts-failed' as ActivePage,
          label: isAr ? "العمليات الفاشلة والعكسية" : "Failed & Reversed",
          icon: AlertOctagon,
        },
        {
          id: 'payouts-settlements' as ActivePage,
          label: isAr ? "التسويات المصرفية" : "Bank Settlements",
          icon: CheckCheck,
        },
      ],
    },
    {
      title: isAr ? "المخاطر و Sentinel" : "Risk & Sentinel",
      items: [
        {
          id: 'risk-decisions' as ActivePage,
          label: isAr ? "قرارات Sentinel" : "Risk Decisions",
          icon: ShieldAlert,
        },
        {
          id: 'risk-policies' as ActivePage,
          label: isAr ? "سياسات المخاطر" : "Risk Policies",
          icon: Sliders,
        },
        {
          id: 'risk-shadow' as ActivePage,
          label: isAr ? "Shadow Testing (المحاكاة)" : "Shadow Testing",
          icon: FileCode,
        },
        {
          id: 'risk-engine-health' as ActivePage,
          label: isAr ? "صحة المحرك والـ SLA" : "Engine Health & Telemetry",
          icon: Activity,
        },
      ],
    },
    {
      title: isAr ? "الرقابة المالية" : "Financial Control",
      items: [
        {
          id: 'financial-ledger' as ActivePage,
          label: isAr ? "دفتر الأستاذ (Double-Entry)" : "Ledger Invariants",
          icon: BookOpenCheck,
        },
        {
          id: 'financial-reconciliation' as ActivePage,
          label: isAr ? "المطابقة البنكية" : "Bank Reconciliation",
          icon: Scale,
        },
        {
          id: 'financial-exceptions' as ActivePage,
          label: isAr ? "الاستثناءات المالية" : "Financial Exceptions",
          icon: FileWarning,
        },
      ],
    },
    {
      title: isAr ? "الأمن" : "Sentinel Security",
      items: [
        {
          id: 'security-incidents' as ActivePage,
          label: isAr ? "التنبيهات واختبارات الأمان" : "Security Defense Suite",
          icon: Radio,
        },
        {
          id: 'security-access' as ActivePage,
          label: isAr ? "نشاط الوصول والجلسات" : "Access & Sessions",
          icon: KeyRound,
        },
        {
          id: 'security-api' as ActivePage,
          label: isAr ? "أحداث ومعدلات API" : "API Defense Activity",
          icon: Terminal,
        },
        {
          id: 'security-webhooks' as ActivePage,
          label: isAr ? "مراقبة الـ Webhooks" : "Webhook Monitor",
          icon: Webhook,
        },
      ],
    },
    {
      title: isAr ? "التدقيق والامتثال" : "Audit & Compliance",
      items: [
        {
          id: 'audit-log' as ActivePage,
          label: isAr ? "سجل التدقيق غير القابل للتعديل" : "Immutable Audit Trail",
          icon: History,
        },
        {
          id: 'audit-compliance' as ActivePage,
          label: isAr ? "حزم الامتثال التنظيمي" : "Compliance Packages",
          icon: Archive,
        },
        {
          id: 'audit-exports' as ActivePage,
          label: isAr ? "عمليات التصدير والأرشفة" : "Export History",
          icon: Download,
        },
      ],
    },
    {
      title: isAr ? "الإعدادات والنظام" : "Settings",
      items: [
        {
          id: 'settings-users' as ActivePage,
          label: isAr ? "المستخدمون والأدوار (RBAC)" : "Users & Roles",
          icon: Users,
        },
        {
          id: 'settings-limits' as ActivePage,
          label: isAr ? "حدود الصرف اليومية" : "Payout Limits",
          icon: Gauge,
        },
        {
          id: 'settings-integrations' as ActivePage,
          label: isAr ? "تكاملات البنوك و PSP" : "Bank Integrations",
          icon: Building2,
        },
      ],
    },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? "w-[72px]" : "w-72"
      } bg-slate-950 border-e border-slate-800 flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none overflow-y-auto overflow-x-hidden z-40 transition-all duration-200 ease-in-out shrink-0`}
    >
      {/* Sidebar Top Header & Collapse/Expand Toggle */}
      {onToggleCollapse && (
        <div className={`p-2.5 pb-2 border-b border-slate-800/80 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} transition-all duration-200`}>
          {!isCollapsed && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 font-sans">
              {isAr ? "القائمة الرئيسية" : "Navigation"}
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? (isAr ? "توسيع الشريط الجانبي" : "Expand Sidebar") : (isAr ? "طي الشريط الجانبي" : "Collapse Sidebar")}
            className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-center"
            aria-label={isCollapsed ? (isAr ? "توسيع الشريط الجانبي" : "Expand Sidebar") : (isAr ? "طي الشريط الجانبي" : "Collapse Sidebar")}
          >
            {isCollapsed ? (
              isAr ? <ChevronLeft className="w-4 h-4 text-teal-400" /> : <ChevronRight className="w-4 h-4 text-teal-400" />
            ) : (
              isAr ? <ChevronRight className="w-4 h-4 text-slate-400" /> : <ChevronLeft className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      )}

      {/* Nav Items List */}
      <div className={`space-y-4 ${isCollapsed ? 'p-2 py-3 space-y-4' : 'p-3.5 space-y-6'}`}>
        {navSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            {!isCollapsed ? (
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5 font-sans">
                {sec.title}
              </h4>
            ) : (
              secIdx > 0 && <div className="h-px bg-slate-800/60 my-2 mx-2" />
            )}
            <div className="space-y-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <div key={item.id} className="relative group/navItem flex justify-center">
                    <button
                      onClick={() => setActivePage(item.id)}
                      title={item.label}
                      className={`w-full flex items-center transition-colors cursor-pointer ${
                        isCollapsed 
                          ? "w-11 h-11 justify-center rounded-xl p-0" 
                          : "justify-between px-3 py-2 rounded-lg text-xs font-medium"
                      } ${
                        isActive
                          ? "bg-slate-900 text-teal-300 font-bold border border-slate-800 shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                      }`}
                    >
                      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                        <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} transition-colors shrink-0 ${isActive ? "text-teal-400" : "text-slate-400 group-hover/navItem:text-slate-300"}`} />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {item.badge}
                        </span>
                      )}

                      {isCollapsed && item.badge && (
                        <span className="absolute top-1 end-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-slate-950" />
                      )}
                    </button>

                    {/* Simple Arabic Tooltip on Hover / Focus in Collapsed Mode */}
                    {isCollapsed && (
                      <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover/navItem:opacity-100 group-focus-within/navItem:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 shadow-xl start-full ms-2 font-medium font-sans">
                        <div className="flex items-center gap-1.5">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
