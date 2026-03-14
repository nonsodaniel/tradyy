'use client';
import { use } from 'react';
import useSWR from 'swr';
import { Star } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import PriceChart from '@/components/charts/PriceChart';
import { PctBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import NewsFeed from '@/components/news/NewsFeed';
import { useWatchlistStore } from '@/store/watchlist';
import { formatCurrency, formatCompact, formatPct } from '@/lib/formatters';
import type { AssetPrice } from '@/types/asset';
import clsx from 'clsx';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Props {
  params: Promise<{ type: string; id: string }>;
}

export default function AssetPage({ params }: Props) {
  const { type, id } = use(params);
  const symbol = id.toUpperCase();
  const isCrypto = type === 'crypto';

  const { has, toggle } = useWatchlistStore();
  const inWatchlist = has(symbol);

  const { data: prices } = useSWR<AssetPrice[]>(
    `/api/prices?type=${isCrypto ? 'crypto' : 'stock'}`,
    fetcher,
    { refreshInterval: 30_000 }
  );

  const asset = prices?.find((p) => {
    if (isCrypto) return p.id === id || p.symbol === symbol;
    return p.symbol === symbol;
  });

  const metrics = [
    { label: '24h High', value: asset ? `$${asset.high24h?.toFixed(2)}` : '—' },
    { label: '24h Low', value: asset ? `$${asset.low24h?.toFixed(2)}` : '—' },
    { label: '24h Volume', value: asset ? formatCompact(asset.volume24h) : '—' },
    { label: 'Market Cap', value: asset?.marketCap ? formatCompact(asset.marketCap) : '—' },
    { label: '24h Change', value: asset ? formatPct(asset.priceChangePct24h) : '—', colored: true, value_raw: asset?.priceChangePct24h },
  ];

  return (
    <div className="space-y-5 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-base font-bold"
            style={{ background: 'var(--surface-2)', color: 'var(--foreground)' }}
          >
            {symbol.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                {symbol}
              </h1>
              <span
                className="text-xs px-1.5 py-0.5 rounded capitalize"
                style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
              >
                {type}
              </span>
            </div>
            {asset && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold num" style={{ color: 'var(--foreground)' }}>
                  ${(asset.price ?? 0) < 1 ? (asset.price ?? 0).toFixed(6) : (asset.price ?? 0).toFixed(2)}
                </span>
                <PctBadge value={asset.priceChangePct24h} />
              </div>
            )}
          </div>
        </div>

        <Button
          variant={inWatchlist ? 'outline' : 'primary'}
          size="sm"
          onClick={() => toggle(symbol)}
        >
          <Star size={13} fill={inWatchlist ? 'currentColor' : 'none'} />
          {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
        </Button>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-lg p-3"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{m.label}</p>
            <p
              className={clsx('text-sm font-medium num', m.colored && (m.value_raw || 0) >= 0 ? 'text-[var(--up)]' : m.colored ? 'text-[var(--down)]' : '')}
              style={!m.colored ? { color: 'var(--foreground)' } : {}}
            >
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Chart + news */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Price Chart</CardTitle>
            </CardHeader>
            <PriceChart
              symbol={symbol}
              assetClass={type}
              coinId={id}
              height={380}
              defaultRange="1M"
            />
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Related News</CardTitle>
          </CardHeader>
          <NewsFeed limit={8} query={`${symbol} ${type === 'crypto' ? 'crypto' : 'stock'}`} compact />
        </Card>
      </div>
    </div>
  );
}
