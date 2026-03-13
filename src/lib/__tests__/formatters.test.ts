import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatCurrency,
  formatNumber,
  formatCompact,
  formatPct,
  formatChange,
  formatRelativeTime,
  formatPrice,
} from '../formatters';

describe('formatCurrency', () => {
  it('formats USD amounts correctly', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
    // minimumFractionDigits: 2, so 0.5 → $0.50 (trailing zero stripped by Intl)
    expect(formatCurrency(0.5, 'USD')).toBe('$0.50');
    expect(formatCurrency(0.000123, 'USD')).toBe('$0.000123');
  });

  it('formats EUR amounts correctly', () => {
    const result = formatCurrency(100, 'EUR');
    expect(result).toContain('100');
    expect(result).toContain('€');
  });

  it('formats compact large numbers', () => {
    const result = formatCurrency(1_500_000_000, 'USD', true);
    expect(result).toContain('B');
    expect(result).toContain('$');
  });

  it('formats compact millions', () => {
    const result = formatCurrency(2_500_000, 'USD', true);
    expect(result).toContain('M');
  });

  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });

  it('handles negative values', () => {
    const result = formatCurrency(-500, 'USD');
    expect(result).toContain('-');
    expect(result).toContain('500');
  });
});

describe('formatNumber', () => {
  it('formats with default 2 decimals', () => {
    expect(formatNumber(1234.5678)).toBe('1,234.57');
  });

  it('formats with custom decimals', () => {
    expect(formatNumber(1234.5678, 4)).toBe('1,234.5678');
    expect(formatNumber(1234.5678, 0)).toBe('1,235');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0.00');
  });

  it('handles negative numbers', () => {
    expect(formatNumber(-1234.56)).toBe('-1,234.56');
  });
});

describe('formatCompact', () => {
  it('formats trillions', () => {
    expect(formatCompact(2_500_000_000_000)).toBe('2.50T');
  });

  it('formats billions', () => {
    expect(formatCompact(1_200_000_000)).toBe('1.20B');
  });

  it('formats millions', () => {
    expect(formatCompact(3_400_000)).toBe('3.40M');
  });

  it('formats thousands', () => {
    expect(formatCompact(5_600)).toBe('5.60K');
  });

  it('formats small numbers as-is', () => {
    expect(formatCompact(999)).toBe('999.00');
  });

  it('formats zero', () => {
    expect(formatCompact(0)).toBe('0.00');
  });

  it('handles negative billions', () => {
    expect(formatCompact(-1_000_000_000)).toBe('-1.00B');
  });
});

describe('formatPct', () => {
  it('prefixes positive values with +', () => {
    expect(formatPct(3.14)).toBe('+3.14%');
  });

  it('does not double-prefix negative values', () => {
    expect(formatPct(-2.5)).toBe('-2.50%');
  });

  it('formats zero without a sign', () => {
    // 0 is not > 0, so no + prefix
    expect(formatPct(0)).toBe('0.00%');
  });

  it('respects custom decimals', () => {
    expect(formatPct(1.23456, 4)).toBe('+1.2346%');
  });
});

describe('formatChange', () => {
  it('prefixes positive change with +', () => {
    const result = formatChange(150, 'USD');
    expect(result).toContain('+');
    expect(result).toContain('150');
  });

  it('does not double-prefix negative change', () => {
    const result = formatChange(-75, 'USD');
    expect(result).toMatch(/^-/);
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for very recent dates', () => {
    const recent = new Date('2025-06-01T11:59:45Z').toISOString();
    expect(formatRelativeTime(recent)).toBe('just now');
  });

  it('returns minutes ago', () => {
    const fiveMin = new Date('2025-06-01T11:55:00Z').toISOString();
    expect(formatRelativeTime(fiveMin)).toBe('5m ago');
  });

  it('returns hours ago', () => {
    const twoHours = new Date('2025-06-01T10:00:00Z').toISOString();
    expect(formatRelativeTime(twoHours)).toBe('2h ago');
  });

  it('returns days ago', () => {
    const twoDays = new Date('2025-05-30T12:00:00Z').toISOString();
    expect(formatRelativeTime(twoDays)).toBe('2d ago');
  });

  it('returns formatted date for older items', () => {
    const old = new Date('2025-05-01T12:00:00Z').toISOString();
    const result = formatRelativeTime(old);
    expect(result).toMatch(/May/);
  });
});

describe('formatPrice', () => {
  it('returns em dash for zero or NaN', () => {
    expect(formatPrice(0)).toBe('—');
    expect(formatPrice(NaN)).toBe('—');
  });

  it('uses exponential notation for very small prices', () => {
    const result = formatPrice(0.0000001);
    expect(result).toContain('e');
  });

  it('returns 6 decimals for sub-1 prices', () => {
    expect(formatPrice(0.5)).toBe('0.500000');
  });

  it('returns 4 decimals for prices under 100', () => {
    expect(formatPrice(45.123456)).toBe('45.1235');
  });

  it('returns 2 decimals for prices 100+', () => {
    expect(formatPrice(42000)).toBe('42000.00');
  });
});
