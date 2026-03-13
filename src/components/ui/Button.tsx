import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'ghost',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded font-medium transition-fast focus:outline-none';

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 h-7',
    md: 'text-sm px-3 py-2 h-8',
    lg: 'text-sm px-4 py-2.5 h-9',
  };

  const variants = {
    primary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]',
    ghost: 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]',
    outline: 'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-2)]',
    danger: 'text-[var(--down)] hover:bg-[var(--down-bg)] hover:text-[var(--down)]',
  };

  return (
    <button className={clsx(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
