'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Badge, PctBadge } from '@/components/ui/Badge';
import { formatCurrency, formatCompact, formatPct } from '@/lib/formatters';
import type { AssetPrice } from '@/types/asset';
import clsx from 'clsx';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Tab = 'crypto' | 'stock' | 'etf' | 'index';

const TABS: { key: Tab; label: string }[] = [
  { key: 'crypto', label: 'Crypto' },
  { key: 'stock', label: 'Stocks' },
  { key: 'etf', label: 'ETFs' },
  { key: 'index', label: 'Indices' },
];

export default function MarketsPage() {
  const [tab, setTab] = useState<Tab>('crypto');
  const [sort, setSort] = useState<keyof AssetPrice>('marketCap');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useSWR<AssetPrice[]>(
    `/api/prices?type=${tab}`,
    fetcher,
    { refreshInterval: tab === 'crypto' ? 30_000 : 60_000 }
  );

  function handleSort(col: keyof AssetPrice) {
    if (sort === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(col);
      setSortDir('desc');
    }
  }

  const filtered = (data || [])
    .filter(
      (a) =>
        !search ||
        a.symbol.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sort] as number || 0;
      const bv = b[sort] as number || 0;
      return sortDir === 'desc' ? bv - av : av - bv;
    });

  function SortHeader({ col, label, align = 'right' }: { col: keyof AssetPrice; label: string; align?: string }) {
    const active = sort === col;
    return (
      <th
        className={`text-${align}`}
        onClick={() => handleSort(col)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        <span className={clsx(active && 'text-[var(--foreground)]')}>
          {label} {active ? (sortDir === 'desc' ? '↓' : '↑') : ''}
        </span>
      </th>
    );
  }

  return (
    <div className="space-y-4 max-w-screen-2xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
          Markets
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Live prices across all asset classes
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
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

        {/* Search */}
        <input
          type="text"
          placeholder="Filter symbol…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 rounded text-sm outline-none w-48"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        />
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <SortHeader col="price" label="Price" />
                <SortHeader col="priceChangePct24h" label="24h %" />
                <SortHeader col="priceChange24h" label="24h Change" />
                <SortHeader col="marketCap" label="Mkt Cap" />
                <SortHeader col="volume24h" label="Volume 24h" />
                <SortHeader col="high24h" label="High 24h" />
                <SortHeader col="low24h" label="Low 24h" />
              </tr>
            </thead>
            <tbody>
              {isLoading && !data
                ? Array.from({ length: 15 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j}>
                          <div className="h-4 rounded animate-pulse" style={{ background: 'var(--surface-2)', width: j === 1 ? 120 : 80 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map((asset, idx) => (
                    <tr key={asset.id}>
                      <td className="text-sm" style={{ color: 'var(--muted)' }}>
                        {idx + 1}
                      </td>
                      <td>
                        <Link href={`/asset/${tab}/${asset.id}`} className="flex items-center gap-2.5 hover:text-[var(--accent)] transition-fast">
                          <div
                            className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
                          >
                            {asset.symbol.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-sm" style={{ color: 'inherit' }}>
                              {asset.symbol}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="text-right num text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        ${asset.price < 1 ? asset.price.toFixed(6) : asset.price.toFixed(2)}
                      </td>
                      <td className="text-right">
                        <PctBadge value={asset.priceChangePct24h} />
                      </td>
                      <td className={clsx('text-right num text-sm', asset.priceChange24h >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]')}>
                        {asset.priceChange24h >= 0 ? '+' : ''}{formatCurrency(asset.priceChange24h)}
                      </td>
                      <td className="text-right num text-sm" style={{ color: 'var(--foreground)' }}>
                        {asset.marketCap ? formatCompact(asset.marketCap) : '—'}
                      </td>
                      <td className="text-right num text-sm" style={{ color: 'var(--muted)' }}>
                        {formatCompact(asset.volume24h)}
                      </td>
                      <td className="text-right num text-sm" style={{ color: 'var(--muted)' }}>
                        ${asset.high24h?.toFixed(2)}
                      </td>
                      <td className="text-right num text-sm" style={{ color: 'var(--muted)' }}>
                        ${asset.low24h?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
