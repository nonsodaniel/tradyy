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
  const { data, isLoading } = useSWR<GlobalStats>(
    '/api/global',
    fetcher,
    { refreshInterval: 60_000 }
  );

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {[...Array(4)].map((_, i) => (
          <LoadingSkeleton key={i} className="h-[72px] rounded-lg" />
        ))}
      </div>
    );
  }

  const totalMcap = data.total_market_cap?.usd ?? 0;
  const totalVol = data.total_volume?.usd ?? 0;
  const btcDom = data.market_cap_percentage?.btc ?? 0;
  const mcapChange = data.market_cap_change_percentage_24h_usd ?? 0;
  const activeCoins = data.active_cryptocurrencies ?? 0;

  const stats = [
    {
      label: 'Crypto Mkt Cap',
      value: `$${formatCompact(totalMcap)}`,
      change: formatPct(mcapChange),
      positive: mcapChange >= 0,
      icon: Globe,
    },
    {
      label: '24h Volume',
      value: `$${formatCompact(totalVol)}`,
      change: 'rolling 24h',
      positive: true,
      icon: Activity,
    },
    {
      label: 'BTC Dominance',
      value: `${btcDom.toFixed(1)}%`,
      change: btcDom > 50 ? 'Leading' : 'Declining',
      positive: btcDom > 50,
      icon: btcDom > 50 ? TrendingUp : TrendingDown,
    },
    {
      label: 'Active Cryptos',
      value: activeCoins.toLocaleString(),
      change: 'tracked',
      positive: true,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-lg p-3 sm:p-3.5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{stat.label}</span>
              <Icon size={13} style={{ color: 'var(--muted)' }} />
            </div>
            <div className="font-semibold text-base sm:text-lg num" style={{ color: 'var(--foreground)' }}>
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
