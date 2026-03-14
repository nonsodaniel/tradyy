'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import PriceChart from '@/components/charts/PriceChart';
import { PctBadge } from '@/components/ui/Badge';
import { formatCurrency, formatCompact, formatPct } from '@/lib/formatters';
import type { AssetPrice } from '@/types/asset';
import clsx from 'clsx';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const FEATURED = [
  { symbol: 'BTC', id: 'bitcoin', type: 'crypto', label: 'Bitcoin' },
  { symbol: 'ETH', id: 'ethereum', type: 'crypto', label: 'Ethereum' },
  { symbol: 'AAPL', id: 'AAPL', type: 'stock', label: 'Apple' },
  { symbol: 'TSLA', id: 'TSLA', type: 'stock', label: 'Tesla' },
];

export default function AnalyticsPage() {
  const [selected, setSelected] = useState(FEATURED[0]);

  const { data: cryptos } = useSWR<AssetPrice[]>('/api/prices?type=crypto', fetcher, { refreshInterval: 30_000 });
  const { data: stocks } = useSWR<AssetPrice[]>('/api/prices?type=stock', fetcher, { refreshInterval: 60_000 });

  const allPrices = [...(cryptos || []), ...(stocks || [])];

  const topGainers = [...allPrices]
    .filter((a) => a.priceChangePct24h > 0)
    .sort((a, b) => b.priceChangePct24h - a.priceChangePct24h)
    .slice(0, 5);

  const topLosers = [...allPrices]
    .filter((a) => a.priceChangePct24h < 0)
    .sort((a, b) => a.priceChangePct24h - b.priceChangePct24h)
    .slice(0, 5);

  const topVolume = [...allPrices]
    .sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0))
    .slice(0, 5);

  return (
    <div className="space-y-5 max-w-screen-2xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
          Analytics
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Performance, trends, and market insights
        </p>
      </div>

      {/* Asset selector + Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 flex-wrap">
            {FEATURED.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelected(f)}
                className={clsx(
                  'px-3 py-1.5 rounded text-sm font-medium transition-fast',
                  selected.id === f.id
                    ? 'bg-[var(--surface-2)] text-[var(--foreground)]'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <PriceChart
          symbol={selected.symbol}
          assetClass={selected.type}
          coinId={selected.id}
          height={350}
          defaultRange="1M"
        />
      </Card>

      {/* Movers / Volume */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Gainers</CardTitle>
          </CardHeader>
          <div className="space-y-2.5">
            {topGainers.map((a) => (
              <div key={a.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded text-xs font-bold flex items-center justify-center"
                    style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
                  >
                    {a.symbol.charAt(0)}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{a.symbol}</span>
                </div>
                <div className="text-right">
                  <PctBadge value={a.priceChangePct24h} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Losers</CardTitle>
          </CardHeader>
          <div className="space-y-2.5">
            {topLosers.map((a) => (
              <div key={a.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded text-xs font-bold flex items-center justify-center"
                    style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
                  >
                    {a.symbol.charAt(0)}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{a.symbol}</span>
                </div>
                <PctBadge value={a.priceChangePct24h} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Highest Volume</CardTitle>
          </CardHeader>
          <div className="space-y-2.5">
            {topVolume.map((a) => (
              <div key={a.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded text-xs font-bold flex items-center justify-center"
                    style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
                  >
                    {a.symbol.charAt(0)}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{a.symbol}</span>
                </div>
                <span className="text-sm num" style={{ color: 'var(--muted)' }}>
                  ${formatCompact(a.volume24h)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
