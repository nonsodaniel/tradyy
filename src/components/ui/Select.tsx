'use client';
import { SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
          {label}
        </label>
      )}
      <select
        className={clsx(
          'rounded px-2.5 py-1.5 text-sm outline-none cursor-pointer',
          className
        )}
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
        }}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
