import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'neon' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'neon', size = 'md', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon/40 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

    const variants = {
      neon: 'bg-neon text-graphite-950 font-semibold hover:bg-neon-hover shadow-neon-sm hover:shadow-neon-md',
      secondary:
        'bg-surface hover:bg-surface-hover text-graphite-100 border border-border',
      outline:
        'border border-border text-graphite-300 hover:text-graphite-100 hover:border-graphite-500 bg-transparent',
      ghost:
        'text-graphite-300 hover:text-graphite-100 hover:bg-surface/60 bg-transparent',
      danger:
        'bg-expense/10 text-expense border border-expense/30 hover:bg-expense/20',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

