import { type ReactNode } from 'react';

type CalloutVariant = 'tip' | 'warning' | 'frc-connection' | 'deeper-dive';

const VARIANT_STYLES: Record<CalloutVariant, { border: string; bg: string; icon: string; defaultTitle: string }> = {
  tip: {
    border: 'border-green-400',
    bg:     'bg-green-50 dark:bg-green-950/30',
    icon:   '💡',
    defaultTitle: 'Pro tip',
  },
  warning: {
    border: 'border-amber-400',
    bg:     'bg-amber-50 dark:bg-amber-950/30',
    icon:   '⚠️',
    defaultTitle: 'Watch out',
  },
  'frc-connection': {
    border: 'border-brand-400',
    bg:     'bg-brand-50 dark:bg-brand-950/30',
    icon:   '🤖',
    defaultTitle: 'On the robot',
  },
  'deeper-dive': {
    border: 'border-purple-400',
    bg:     'bg-purple-50 dark:bg-purple-950/30',
    icon:   '📐',
    defaultTitle: 'Deeper dive',
  },
};

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
}

export function Callout({ variant = 'tip', title, children }: CalloutProps) {
  const styles = VARIANT_STYLES[variant];
  return (
    <div className={`my-6 rounded-lg border-l-4 ${styles.border} ${styles.bg} p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <span aria-hidden="true">{styles.icon}</span>
        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
          {title ?? styles.defaultTitle}
        </span>
      </div>
      <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{children}</div>
    </div>
  );
}
