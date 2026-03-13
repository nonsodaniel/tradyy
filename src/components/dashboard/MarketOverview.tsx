'use client';
import useSWR from 'swr';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { LoadingSkeleton } from '@/components/ui/Spinner';
import { formatCurrency, formatPct, formatCompact } from '@/lib/formatters';
import type { AssetPrice } from '@/types/asset';
import Link from 'next/link';
import clsx from 'clsx';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MARKET_SECTIONS = [
  { label: 'Crypto', type: 'crypto', limit: 5 },
  { label: 'Stocks', type: 'stock', limit: 5 },
  { label: 'ETFs', type: 'etf', limit: 4 },
];

function PriceRow({ asset }: { asset: AssetPrice }) {
  const up = asset.priceChangePct24h > 0;
  const down = asset.priceChangePct24h < 0;

  return (
    <Link href={`/asset/crypto/${asset.id}`} className="block">
      <div className="flex items-center py-2.5 px-1 hover:bg-[var(--surface-2)] rounded transition-fast cursor-pointer">
        <div className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0"
          style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}>
          {asset.symbol.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate" style={{ color: 'var(--foreground)' }}>
            {asset.symbol}
          </div>
          {asset.marketCap ? (
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              MCap {formatCompact(asset.marketCap)}
            </div>
          ) : null}
        </div>
        <div className="text-right ml-3">
          <div className="text-sm font-medium num" style={{ color: 'var(--foreground)' }}>
            ${(asset.price ?? 0) < 1 ? (asset.price ?? 0).toFixed(6) : (asset.price ?? 0).toFixed(2)}
          </div>
          <div
            className={clsx('text-xs num flex items-center justify-end gap-0.5', {
              'text-[var(--up)]': up,
              'text-[var(--down)]': down,
              'text-[var(--muted)]': !up && !down,
            })}
          >
            {up ? <TrendingUp size={10} /> : down ? <TrendingDown size={10} /> : <Minus size={10} />}
            {formatPct(asset.priceChangePct24h)}
          </div>
        </div>
      </div>
    </Link>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <LoadingSkeleton className="w-8 h-8 rounded-md" />
          <div className="flex-1 space-y-1">
            <LoadingSkeleton className="h-3 w-16" />
            <LoadingSkeleton className="h-2.5 w-24" />
          </div>
          <div className="text-right space-y-1">
            <LoadingSkeleton className="h-3 w-14 ml-auto" />
            <LoadingSkeleton className="h-2.5 w-10 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MarketOverview() {
  const { data: cryptos, isLoading: loadingCrypto } = useSWR<AssetPrice[]>(
    '/api/prices?type=crypto',
    fetcher,
    { refreshInterval: 30_000 }
  );
  const { data: stocks, isLoading: loadingStocks } = useSWR<AssetPrice[]>(
    '/api/prices?type=stock',
    fetcher,
    { refreshInterval: 60_000 }
  );
  const { data: etfs, isLoading: loadingEtfs } = useSWR<AssetPrice[]>(
    '/api/prices?type=etf',
    fetcher,
    { refreshInterval: 60_000 }
  );

  const datasets = [
    { label: 'Crypto', data: cryptos, loading: loadingCrypto, limit: 8 },
    { label: 'Stocks', data: stocks, loading: loadingStocks, limit: 8 },
    { label: 'ETFs', data: etfs, loading: loadingEtfs, limit: 5 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {datasets.map(({ label, data, loading, limit }) => (
        <Card key={label} padding={false} className="overflow-hidden">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              {label}
            </h3>
          </div>
          <div className="px-3 py-1">
            {loading && !data ? (
              <SectionSkeleton />
            ) : (
              (data || []).slice(0, limit).map((asset) => (
                <PriceRow key={asset.id} asset={asset} />
              ))
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
