'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { PctBadge } from '@/components/ui/Badge';
import { formatCompact } from '@/lib/formatters';
import type { AssetPrice } from '@/types/asset';
import clsx from 'clsx';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Tab = 'crypto' | 'stock' | 'etf' | 'index' | 'commodity';

const TABS: { key: Tab; label: string }[] = [
  { key: 'crypto', label: 'Crypto' },
  { key: 'stock', label: 'Stocks' },
  { key: 'etf', label: 'ETFs' },
  { key: 'commodity', label: 'Commodities' },
  { key: 'index', label: 'Indices' },
];

function AssetRow({ asset, rank }: { asset: AssetPrice; rank: number }) {
  const href = `/asset/crypto/${asset.id}`;
  return (
    <Link href={href} className="block">
      <div className="flex items-center px-3 sm:px-4 py-2.5 hover:bg-[var(--surface-2)] transition-fast">
        <span className="w-7 text-xs text-center flex-shrink-0" style={{ color: 'var(--muted)' }}>{rank}</span>
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 mx-2"
          style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
        >
          {asset.symbol.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{asset.symbol}</div>
          {asset.marketCap ? (
            <div className="text-xs hidden sm:block" style={{ color: 'var(--muted)' }}>
              MCap ${formatCompact(asset.marketCap)}
            </div>
          ) : null}
        </div>
        {/* Price + change */}
        <div className="text-right ml-3">
          <div className="font-semibold text-sm num" style={{ color: 'var(--foreground)' }}>
            ${(asset.price ?? 0) < 1 ? (asset.price ?? 0).toFixed(6) : (asset.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <PctBadge value={asset.priceChangePct24h} />
        </div>
        {/* Volume — hidden on mobile */}
        <div className="hidden md:block text-right ml-6 w-24">
          <div className="text-sm num" style={{ color: 'var(--muted)' }}>${formatCompact(asset.volume24h)}</div>
          <div className="text-xs" style={{ color: 'var(--muted-fg)' }}>volume</div>
        </div>
        {/* Mkt cap — hidden on small */}
        <div className="hidden lg:block text-right ml-6 w-28">
          <div className="text-sm num" style={{ color: 'var(--muted)' }}>
            {asset.marketCap ? `$${formatCompact(asset.marketCap)}` : '—'}
          </div>
          <div className="text-xs" style={{ color: 'var(--muted-fg)' }}>mkt cap</div>
        </div>
      </div>
    </Link>
  );
}

export default function MarketsPage() {
  const [tab, setTab] = useState<Tab>('crypto');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useSWR<AssetPrice[]>(
    `/api/prices?type=${tab}`,
    fetcher,
    { refreshInterval: tab === 'crypto' ? 30_000 : 60_000 }
  );

  const filtered = (data || []).filter(
    (a) => !search || a.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-screen-2xl mx-auto">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Markets</h1>
        <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--muted)' }}>Live prices across all asset classes</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-lg flex-wrap" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                'px-3 py-1.5 rounded text-sm font-medium transition-fast',
                tab === t.key
                  ? 'bg-[var(--surface-2)] text-[var(--foreground)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Filter…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 rounded text-sm outline-none w-full sm:w-40"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
        />
      </div>

      {/* Table header */}
      <Card padding={false}>
        <div
          className="flex items-center px-3 sm:px-4 py-2 text-xs font-medium"
          style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}
        >
          <span className="w-7 text-center flex-shrink-0">#</span>
          <span className="flex-1 ml-10">Name</span>
          <span className="text-right">Price / 24h</span>
          <span className="hidden md:block text-right ml-6 w-24">Volume</span>
          <span className="hidden lg:block text-right ml-6 w-28">Mkt Cap</span>
        </div>

        {isLoading && !data
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="h-4 w-4 rounded animate-pulse" style={{ background: 'var(--surface-2)' }} />
                <div className="w-8 h-8 rounded-md animate-pulse" style={{ background: 'var(--surface-2)' }} />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-16 rounded animate-pulse" style={{ background: 'var(--surface-2)' }} />
                  <div className="h-2.5 w-24 rounded animate-pulse" style={{ background: 'var(--surface-2)' }} />
                </div>
                <div className="text-right space-y-1">
                  <div className="h-3 w-16 rounded animate-pulse ml-auto" style={{ background: 'var(--surface-2)' }} />
                  <div className="h-4 w-12 rounded animate-pulse ml-auto" style={{ background: 'var(--surface-2)' }} />
                </div>
              </div>
            ))
          : filtered.map((asset, idx) => (
              <AssetRow key={asset.id} asset={asset} rank={idx + 1} />
            ))
        }

        {!isLoading && filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
            No assets found.
          </p>
        )}
      </Card>
    </div>
  );
}
