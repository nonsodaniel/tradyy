'use client';
import useSWR from 'swr';
import { TrendingUp, TrendingDown, Activity, Globe } from 'lucide-react';
import { formatCompact, formatPct } from '@/lib/formatters';
import { LoadingSkeleton } from '@/components/ui/Spinner';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface GlobalStats {
  total_market_cap: Record<string, number>;
  total_volume: Record<string, number>;
  market_cap_percentage: Record<string, number>;
  market_cap_change_percentage_24h_usd: number;
  active_cryptocurrencies: number;
}

export default function MarketStats() {
  const { data: cryptoPrices } = useSWR<{ length: number }[]>(
    '/api/prices?type=crypto',
    fetcher
  );

  const stats = [
    {
      label: 'Total Crypto Mkt Cap',
      value: '$2.41T',
      change: '+1.24%',
      positive: true,
      icon: Globe,
    },
    {
      label: '24h Volume',
      value: '$89.2B',
      change: '+5.7%',
      positive: true,
      icon: Activity,
    },
    {
      label: 'BTC Dominance',
      value: '51.8%',
      change: '-0.3%',
      positive: false,
      icon: TrendingDown,
    },
    {
      label: 'Active Assets',
      value: '10,400+',
      change: 'live',
      positive: true,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-lg p-3.5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {stat.label}
              </span>
              <Icon size={14} style={{ color: 'var(--muted)' }} />
            </div>
            <div className="font-semibold text-lg num" style={{ color: 'var(--foreground)' }}>
              {stat.value}
            </div>
            <div
              className="text-xs mt-0.5 num"
              style={{ color: stat.positive ? 'var(--up)' : 'var(--down)' }}
            >
              {stat.change}
            </div>
          </div>
        );
      })}
    </div>
  );
}
