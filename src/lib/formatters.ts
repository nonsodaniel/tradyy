import { getCurrencyByCode } from '@/types/currency';

export function formatCurrency(
  value: number,
  currencyCode = 'USD',
  compact = false
): string {
  const currency = getCurrencyByCode(currencyCode);
  const locale = currency?.locale || 'en-US';

  if (compact && Math.abs(value) >= 1_000_000_000) {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
    return formatted;
  }

  if (compact && Math.abs(value) >= 1_000_000) {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
    return formatted;
  }

  const decimals = value < 1 ? 6 : value < 100 ? 4 : 2;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCompact(value: number): string {
  const v = (value ?? 0);
  if (isNaN(v) || !isFinite(v)) return '—';
  if (Math.abs(v) >= 1_000_000_000_000) {
    return `${(v / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (Math.abs(v) >= 1_000_000_000) {
    return `${(v / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(v) >= 1_000_000) {
    return `${(v / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(v) >= 1_000) {
    return `${(v / 1_000).toFixed(2)}K`;
  }
  return v.toFixed(2);
}

export function formatPct(value: number, decimals = 2): string {
  const v = value ?? 0;
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(decimals)}%`;
}

export function formatChange(value: number, currencyCode = 'USD'): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatCurrency(value, currencyCode)}`;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}

export function formatPrice(price: number, symbol?: string): string {
  const p = price ?? 0;
  if (p === 0 || isNaN(p)) return '—';
  if (p < 0.001) return p.toExponential(4);
  if (p < 1) return p.toFixed(6);
  if (p < 100) return p.toFixed(4);
  return p.toFixed(2);
}
