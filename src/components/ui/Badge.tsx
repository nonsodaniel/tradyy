import clsx from 'clsx';

type Variant = 'up' | 'down' | 'neutral' | 'info' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  size?: 'sm' | 'md';
}

const variantStyles: Record<Variant, string> = {
  up: 'text-[var(--up)] bg-[var(--up-bg)]',
  down: 'text-[var(--down)] bg-[var(--down-bg)]',
  neutral: 'text-[var(--muted)] bg-[var(--surface-2)]',
  info: 'text-[var(--accent)] bg-[var(--surface-2)]',
  default: 'text-[var(--muted)] bg-[var(--surface-2)]',
};

export function Badge({ children, variant = 'default', className, size = 'sm' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded font-medium',
        size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function PctBadge({ value, className }: { value: number; className?: string }) {
  const variant = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral';
  return (
    <Badge variant={variant} className={className}>
      {value > 0 ? '+' : ''}{value.toFixed(2)}%
    </Badge>
  );
}
