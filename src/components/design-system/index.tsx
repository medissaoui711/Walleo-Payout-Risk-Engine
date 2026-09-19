import React from "react";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  ShieldAlert, 
  Loader2, 
  Copy, 
  Check, 
  Search, 
  ChevronRight, 
  ChevronLeft 
} from "lucide-react";
import { tokens } from "./tokens";

export * from "./tokens";

// ==========================================
// 1. Semantic Status Badge
// ==========================================
export type StatusType = 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO' | 'NEUTRAL';

export interface StatusBadgeProps {
  type: StatusType;
  label: string;
  variant?: 'dot' | 'subtle' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  label,
  variant = 'subtle',
  size = 'md',
  className = '',
}) => {
  const styles: Record<StatusType, { bg: string; text: string; border: string; dot: string }> = {
    SUCCESS: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/25',
      dot: 'bg-emerald-400',
    },
    WARNING: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/25',
      dot: 'bg-amber-400',
    },
    DANGER: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/25',
      dot: 'bg-rose-400',
    },
    INFO: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-400',
      border: 'border-sky-500/25',
      dot: 'bg-sky-400',
    },
    NEUTRAL: {
      bg: 'bg-slate-800/60',
      text: 'text-slate-300',
      border: 'border-slate-700/50',
      dot: 'bg-slate-400',
    },
  };

  const style = styles[type];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${style.bg} ${style.text} ${style.border} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span className="truncate">{label}</span>
    </span>
  );
};

// ==========================================
// 2. Decision Badge (AUTO_APPROVE, REVIEW, BLOCK)
// ==========================================
export type DecisionType = 'AUTO_APPROVE' | 'MANUAL_REVIEW' | 'BLOCK' | 'FALLBACK_REVIEW';

export interface DecisionBadgeProps {
  decision: DecisionType;
  lang?: 'ar' | 'en';
  className?: string;
}

export const DecisionBadge: React.FC<DecisionBadgeProps> = ({ decision, lang = 'ar', className = '' }) => {
  const isAr = lang === 'ar';

  switch (decision) {
    case 'AUTO_APPROVE':
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${className}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {isAr ? "موافقة فورية (AUTO APPROVE)" : "AUTO APPROVE"}
        </span>
      );
    case 'MANUAL_REVIEW':
    case 'FALLBACK_REVIEW':
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 ${className}`}>
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          {isAr ? "مراجعة بشرية (MANUAL REVIEW)" : "MANUAL REVIEW"}
        </span>
      );
    case 'BLOCK':
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 ${className}`}>
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          {isAr ? "حظر حتمي (BLOCK)" : "BLOCK"}
        </span>
      );
    default:
      return null;
  }
};

// ==========================================
// 3. Risk Indicator Component
// ==========================================
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskIndicatorProps {
  level: RiskLevel;
  score?: number;
  format?: 'compact' | 'badge' | 'detailed';
  className?: string;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  level,
  score,
  format = 'badge',
  className = '',
}) => {
  const colors: Record<RiskLevel, { text: string; bg: string; border: string; dot: string }> = {
    LOW: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', dot: 'bg-emerald-400' },
    MEDIUM: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25', dot: 'bg-amber-400' },
    HIGH: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/25', dot: 'bg-rose-400' },
    CRITICAL: { text: 'text-rose-400', bg: 'bg-rose-900/30', border: 'border-rose-500/50', dot: 'bg-rose-500' },
  };

  const style = colors[level];

  if (format === 'compact') {
    return (
      <span className={`inline-flex items-center gap-1 font-mono text-xs font-semibold ${style.text} ${className}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {level} {score !== undefined ? `(${score})` : ''}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span>{level}</span>
      {score !== undefined && <span className="opacity-70 font-mono">| {score}</span>}
    </span>
  );
};

// ==========================================
// 4. Security Health Component
// ==========================================
export interface SecurityHealthProps {
  totalControls: number;
  healthyControls: number;
  needReviewControls: number;
  onClick?: () => void;
  lang?: 'ar' | 'en';
  className?: string;
}

export const SecurityHealth: React.FC<SecurityHealthProps> = ({
  totalControls,
  healthyControls,
  needReviewControls,
  onClick,
  lang = 'ar',
  className = '',
}) => {
  const isAr = lang === 'ar';
  const percentage = totalControls > 0 ? Math.round((healthyControls / totalControls) * 100) : 100;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl bg-slate-900/90 border border-slate-800 transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-700' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400">
          {isAr ? "مؤشر صحة الأمان (Security Health)" : "Security Health"}
        </span>
        <span className="text-sm font-mono font-bold text-emerald-400">{percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span className="text-emerald-400 font-medium">
          ● {healthyControls} {isAr ? "ضابط سليم" : "Healthy"}
        </span>
        {needReviewControls > 0 ? (
          <span className="text-amber-400 font-medium">
            ⚠ {needReviewControls} {isAr ? "للمراجعة" : "Need Review"}
          </span>
        ) : (
          <span className="text-slate-500">0 {isAr ? "إنذارات" : "Alerts"}</span>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 5. Calm Card Container (Level 1, 2, 3)
// ==========================================
export interface CardProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3;
  className?: string;
  onClick?: () => void;
  id?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  level = 2,
  className = '',
  onClick,
  id,
}) => {
  const levelStyles = {
    1: 'bg-slate-900 border-slate-800 shadow-lg',
    2: 'bg-slate-900/80 border-slate-800/80',
    3: 'bg-slate-950/60 border-slate-850',
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`rounded-xl border p-4 sm:p-5 transition-all ${levelStyles[level]} ${
        onClick ? 'cursor-pointer hover:border-slate-700' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

// ==========================================
// 6. Foundation Button Component
// ==========================================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-xs sm:text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm font-semibold gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm focus:ring-2 focus:ring-emerald-500/50',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 focus:ring-2 focus:ring-slate-600',
    ghost: 'hover:bg-slate-800 text-slate-300 hover:text-white',
    danger: 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 focus:ring-2 focus:ring-rose-500/50',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {children && <span>{children}</span>}
    </button>
  );
};

// ==========================================
// 7. Foundation Input Component
// ==========================================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-slate-400">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <div className="absolute start-3 text-slate-400 pointer-events-none">{icon}</div>}
        <input
          id={id}
          className={`w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all ${
            icon ? 'ps-9' : ''
          } ${error ? 'border-rose-500/80 focus:border-rose-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] text-rose-400">{error}</p>}
    </div>
  );
};

// ==========================================
// 8. Technical Value & Evidence Components
// ==========================================
export interface TechnicalValueProps {
  label?: string;
  value: string;
  copyable?: boolean;
  className?: string;
}

export const TechnicalValue: React.FC<TechnicalValueProps> = ({
  label,
  value,
  copyable = true,
  className = '',
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      {label && <span className="text-[10px] uppercase font-semibold text-slate-400">{label}</span>}
      <div 
        dir="ltr"
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-200"
      >
        <span className="truncate max-w-[220px] sm:max-w-xs">{value}</span>
        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            title="Copy value"
            className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 9. Timeline Component
// ==========================================
export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status: 'COMPLETED' | 'CURRENT' | 'PENDING' | 'FAILED';
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className = '' }) => {
  return (
    <div className={`space-y-4 border-s-2 border-slate-800 ps-4 ms-2 ${className}`}>
      {items.map((item) => {
        const dotStyles = {
          COMPLETED: 'bg-emerald-400 border-slate-900',
          CURRENT: 'bg-sky-400 border-slate-900 animate-pulse',
          PENDING: 'bg-slate-600 border-slate-900',
          FAILED: 'bg-rose-500 border-slate-900',
        }[item.status];

        return (
          <div key={item.id} className="relative">
            <span
              className={`absolute -start-[23px] top-1 w-3 h-3 rounded-full border-2 ${dotStyles}`}
            />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">{item.title}</span>
                {item.timestamp && (
                  <span dir="ltr" className="text-[10px] font-mono text-slate-400">{item.timestamp}</span>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// 10. Feedback & Empty State Component
// ==========================================
export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800/80 ${className}`}>
      {icon ? (
        <div className="p-3 mb-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
          {icon}
        </div>
      ) : (
        <div className="p-3 mb-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
          <CheckCircle2 className="w-6 h-6 text-slate-500" />
        </div>
      )}
      <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
      {description && <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">{description}</p>}
      {action}
    </div>
  );
};
