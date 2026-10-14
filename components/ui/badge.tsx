import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'neon' | 'success' | 'danger' | 'warning' | 'outline' | 'neutral';
}

export function Badge({
  className,
  variant = 'neutral',
  ...props
}: BadgeProps) {
  const variants = {
    neon: 'bg-neon-muted text-neon border-neon/40',
    success: 'bg-income-muted text-income border-income/30',
    danger: 'bg-expense-muted text-expense border-expense/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    neutral: 'bg-graphite-800 text-graphite-300 border-border',
    outline: 'border-border text-graphite-300 bg-transparent',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors select-none',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

