'use client';
import { useState } from 'react';
import { Star, StarOff, Plus, X } from 'lucide-react';
import useSWR from 'swr';
import { useWatchlistStore } from '@/store/watchlist';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { PctBadge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/formatters';
import type { AssetPrice } from '@/types/asset';
import clsx from 'clsx';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function WatchlistPanel() {
  const { symbols, remove, add } = useWatchlistStore();
  const [addInput, setAddInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  const { data: cryptos } = useSWR<AssetPrice[]>('/api/prices?type=crypto', fetcher, { refreshInterval: 30_000 });
  const { data: stocks } = useSWR<AssetPrice[]>('/api/prices?type=stock', fetcher, { refreshInterval: 60_000 });
  const { data: etfs } = useSWR<AssetPrice[]>('/api/prices?type=etf', fetcher, { refreshInterval: 60_000 });

  const allPrices = [...(cryptos || []), ...(stocks || []), ...(etfs || [])];

  const watchedPrices = symbols.map((sym) => {
    const found = allPrices.find(
      (p) => p.symbol === sym || p.symbol === sym.toUpperCase()
    );
    return { symbol: sym, price: found };
  });

  function handleAdd() {
    const sym = addInput.trim().toUpperCase();
    if (sym) {
      add(sym);
      setAddInput('');
      setShowInput(false);
    }
  }

  return (
    <Card padding={false}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <CardTitle>Watchlist</CardTitle>
        <button
          onClick={() => setShowInput(!showInput)}
          className="p-1 rounded hover:bg-[var(--surface-2)] transition-fast"
          style={{ color: 'var(--muted)' }}
        >
          {showInput ? <X size={14} /> : <Plus size={14} />}
        </button>
      </div>

      {showInput && (
        <div
          className="px-3 py-2.5 flex gap-2"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}
        >
          <input
            type="text"
            value={addInput}
            onChange={(e) => setAddInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Symbol (e.g. AAPL, BTC)"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--foreground)' }}
            autoFocus
          />
          <button
            onClick={handleAdd}
            className="text-xs px-2 py-1 rounded transition-fast"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            Add
          </button>
        </div>
      )}

      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {watchedPrices.length === 0 && (
          <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--muted)' }}>
            No assets in watchlist. Add some above.
          </p>
        )}
        {watchedPrices.map(({ symbol, price }) => (
          <div key={symbol} className="flex items-center px-4 py-2.5 hover:bg-[var(--surface-2)] transition-fast group">
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0"
              style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
            >
              {symbol.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{symbol}</div>
              {price ? (
                <div className="text-xs num" style={{ color: 'var(--muted)' }}>
                  ${price.price < 1 ? price.price.toFixed(6) : price.price.toFixed(2)}
                </div>
              ) : (
                <div className="text-xs" style={{ color: 'var(--muted-fg)' }}>Loading…</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {price && <PctBadge value={price.priceChangePct24h} />}
              <button
                onClick={() => remove(symbol)}
                className="opacity-0 group-hover:opacity-100 transition-fast p-1 rounded hover:bg-[var(--surface-2)]"
                style={{ color: 'var(--muted)' }}
              >
                <X size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
