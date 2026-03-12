import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, leftIcon, rightIcon, children, className, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

    const variants = {
      primary: 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:from-indigo-700 hover:to-cyan-600 focus-visible:ring-indigo-500 shadow-lg shadow-indigo-500/25',
      secondary: 'bg-violet-600 text-white hover:bg-violet-700 focus-visible:ring-violet-500',
      ghost: 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500',
      outline: 'border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] focus-visible:ring-indigo-500',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);
Button.displayName = 'Button';

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({ hover, gradient, children, className, ...props }) => (
  <div
    className={cn(
      'rounded-2xl border p-6 transition-all duration-200',
      'bg-[var(--bg-card)] border-[var(--border-color)]',
      'shadow-[var(--shadow-sm)]',
      hover && 'hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 cursor-pointer',
      gradient && 'gradient-card',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', dot, children, className, ...props }) => {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  };

  const dotColors: Record<BadgeVariant, string> = {
    default: 'bg-slate-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-blue-500',
    purple: 'bg-violet-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 rounded-xl border px-3 text-sm transition-all duration-200',
              'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)]',
              'placeholder:text-[var(--text-muted)]',
              'focus:outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-indigo-500/20',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('skeleton rounded-lg', className)} />
);

// ─── Divider ──────────────────────────────────────────────────────────────────
export const Divider: React.FC<{ className?: string }> = ({ className }) => (
  <hr className={cn('border-[var(--border-color)]', className)} />
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className }) => {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-bold text-white',
      'bg-gradient-to-br from-indigo-600 to-cyan-500',
      sizes[size],
      className,
    )}>
      {initials}
    </div>
  );
};
