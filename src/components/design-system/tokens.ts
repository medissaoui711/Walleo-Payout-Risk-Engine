// Centralized Walleo Sentinel Design Tokens

export const tokens = {
  colors: {
    bg: {
      primary: '#030712',    // Deep Navy Base
      secondary: '#0b0f17',  // Elevated Navy
      surface: '#0f172a',    // Component Surface
      elevated: '#1e293b',   // Floating/Modal Surface
      hover: '#1e293b/70',   // Interactive Hover
    },
    text: {
      primary: '#f8fafc',    // Slate 50
      secondary: '#94a3b8',  // Slate 400
      muted: '#64748b',      // Slate 500
      disabled: '#475569',   // Slate 600
    },
    border: {
      subtle: 'rgba(30, 41, 59, 0.5)',
      default: 'rgba(51, 65, 85, 0.6)',
      strong: 'rgba(71, 85, 105, 0.8)',
      focus: 'rgba(16, 185, 129, 0.6)', // Emerald focus
    },
    status: {
      success: {
        bg: 'rgba(16, 185, 129, 0.1)',
        text: '#34d399',
        border: 'rgba(16, 185, 129, 0.25)',
        dot: '#34d399',
      },
      warning: {
        bg: 'rgba(245, 158, 11, 0.1)',
        text: '#fbbf24',
        border: 'rgba(245, 158, 11, 0.25)',
        dot: '#fbbf24',
      },
      danger: {
        bg: 'rgba(244, 63, 94, 0.1)',
        text: '#fb7185',
        border: 'rgba(244, 63, 94, 0.25)',
        dot: '#fb7185',
      },
      info: {
        bg: 'rgba(14, 165, 233, 0.1)',
        text: '#38bdf8',
        border: 'rgba(14, 165, 233, 0.25)',
        dot: '#38bdf8',
      },
      neutral: {
        bg: 'rgba(30, 41, 59, 0.6)',
        text: '#cbd5e1',
        border: 'rgba(51, 65, 85, 0.5)',
        dot: '#94a3b8',
      },
    },
    risk: {
      low: { text: '#34d399', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.25)' },
      medium: { text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.25)' },
      high: { text: '#fb7185', bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.25)' },
      critical: { text: '#f43f5e', bg: 'rgba(244, 63, 94, 0.2)', border: 'rgba(244, 63, 94, 0.5)' },
    }
  },
  radius: {
    sm: 'rounded-md',   // 6px
    md: 'rounded-lg',   // 8px
    lg: 'rounded-xl',   // 12px
    xl: 'rounded-2xl',  // 16px
    full: 'rounded-full'
  },
  typography: {
    pageTitle: 'text-xl sm:text-2xl font-bold tracking-tight text-white',
    sectionTitle: 'text-base sm:text-lg font-semibold text-slate-200',
    cardTitle: 'text-sm font-semibold text-slate-300',
    body: 'text-sm text-slate-300',
    bodySmall: 'text-xs text-slate-400',
    metadata: 'text-[11px] text-slate-500 font-medium',
    techData: 'font-mono text-xs tracking-wide',
  }
} as const;
