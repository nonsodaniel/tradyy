'use client';
import { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import useSWR from 'swr';
import { usePortfolioStore } from '@/store/portfolio';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, PctBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatPct, formatCompact } from '@/lib/formatters';
import { useHasMounted } from '@/hooks/useHasMounted';
import { LoadingSkeleton } from '@/components/ui/Spinner';
import type { AssetPrice } from '@/types/asset';
import clsx from 'clsx';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getSymbolToIdMap(): Record<string, string> {
  return {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    SOL: 'solana',
    BNB: 'binancecoin',
    ADA: 'cardano',
    DOGE: 'dogecoin',
    DOT: 'polkadot',
    MATIC: 'matic-network',
    AVAX: 'avalanche-2',
    LINK: 'chainlink',
    UNI: 'uniswap',
    XRP: 'ripple',
    LTC: 'litecoin',
  };
}

export default function PortfolioView() {
  const mounted = useHasMounted();
  const { holdings, removeHolding, addHolding } = usePortfolioStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    symbol: '',
    name: '',
    assetClass: 'stock',
    quantity: '',
    avgBuyPrice: '',
    buyDate: '2025-01-01',
    currency: 'USD',
  });

  const cryptoIds = holdings
    .filter((h) => h.assetClass === 'crypto')
    .map((h) => getSymbolToIdMap()[h.symbol] || h.symbol.toLowerCase())
    .join(',');

  const { data: cryptoPrices } = useSWR<AssetPrice[]>(
    cryptoIds ? `/api/prices?type=crypto` : null,
    fetcher,
    { refreshInterval: 30_000 }
  );

  const stockSymbols = holdings
    .filter((h) => h.assetClass === 'stock' || h.assetClass === 'etf')
    .map((h) => h.symbol)
    .join(',');

  const { data: stockPrices } = useSWR<AssetPrice[]>(
    stockSymbols ? `/api/prices?type=stock&symbols=${stockSymbols}` : null,
    fetcher,
    { refreshInterval: 60_000 }
  );

  function getCurrentPrice(symbol: string, assetClass: string): number | null {
    if (assetClass === 'crypto') {
      const idMap = getSymbolToIdMap();
      const found = cryptoPrices?.find(
        (p) => p.symbol === symbol || p.id === idMap[symbol]
      );
      return found?.price || null;
    } else {
      const found = stockPrices?.find((p) => p.symbol === symbol);
      return found?.price || null;
    }
  }

  function getPricePct(symbol: string, assetClass: string): number | null {
    if (assetClass === 'crypto') {
      const idMap = getSymbolToIdMap();
      const found = cryptoPrices?.find(
        (p) => p.symbol === symbol || p.id === idMap[symbol]
      );
      return found?.priceChangePct24h || null;
    } else {
      const found = stockPrices?.find((p) => p.symbol === symbol);
      return found?.priceChangePct24h || null;
    }
  }

  const enrichedHoldings = holdings.map((h) => {
    const currentPrice = getCurrentPrice(h.symbol, h.assetClass);
    const currentValue = currentPrice ? currentPrice * h.quantity : h.avgBuyPrice * h.quantity;
    const costBasis = h.avgBuyPrice * h.quantity;
    const gain = currentValue - costBasis;
    const gainPct = costBasis > 0 ? (gain / costBasis) * 100 : 0;
    const pct24h = getPricePct(h.symbol, h.assetClass);

    return { ...h, currentPrice, currentValue, costBasis, gain, gainPct, pct24h };
  });

  const totalValue = enrichedHoldings.reduce((s, h) => s + h.currentValue, 0);
  const totalCost = enrichedHoldings.reduce((s, h) => s + h.costBasis, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  function handleAdd() {
    if (!form.symbol || !form.quantity || !form.avgBuyPrice) return;
    addHolding({
      symbol: form.symbol.toUpperCase(),
      name: form.name || form.symbol.toUpperCase(),
      assetClass: form.assetClass,
      quantity: parseFloat(form.quantity),
      avgBuyPrice: parseFloat(form.avgBuyPrice),
      buyDate: form.buyDate,
      currency: form.currency,
    });
    setShowAddForm(false);
    setForm({
      symbol: '', name: '', assetClass: 'stock',
      quantity: '', avgBuyPrice: '',
      buyDate: new Date().toISOString().slice(0, 10), currency: 'USD',
    });
  }

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} className="h-20 rounded-lg" />)}
        </div>
        <LoadingSkeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Portfolio Value', value: formatCurrency(totalValue), raw: totalValue },
          { label: 'Total Cost', value: formatCurrency(totalCost), raw: totalCost },
          {
            label: 'Total P&L',
            value: `${totalGain >= 0 ? '+' : ''}${formatCurrency(totalGain)}`,
            color: totalGain >= 0 ? 'var(--up)' : 'var(--down)',
          },
          {
            label: 'Return',
            value: formatPct(totalGainPct),
            color: totalGainPct >= 0 ? 'var(--up)' : 'var(--down)',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg p-3.5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs mb-1.5" style={{ color: 'var(--muted)' }}>{s.label}</p>
            <p
              className="text-lg font-semibold num"
              style={{ color: s.color || 'var(--foreground)' }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Holdings table */}
      <Card padding={false}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <CardTitle>Holdings ({holdings.length})</CardTitle>
          <Button size="sm" variant="primary" onClick={() => setShowAddForm(true)}>
            <Plus size={13} /> Add Position
          </Button>
        </div>

        {showAddForm && (
          <div className="px-4 py-4 space-y-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'symbol', label: 'Symbol', placeholder: 'AAPL' },
                { key: 'name', label: 'Name', placeholder: 'Apple Inc.' },
                { key: 'quantity', label: 'Quantity', placeholder: '10', type: 'number' },
                { key: 'avgBuyPrice', label: 'Avg Buy Price', placeholder: '175.00', type: 'number' },
                { key: 'buyDate', label: 'Buy Date', type: 'date' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    value={(form as Record<string, string>)[field.key]}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-2.5 py-1.5 rounded text-sm outline-none"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>Asset Class</label>
                <select
                  value={form.assetClass}
                  onChange={(e) => setForm((f) => ({ ...f, assetClass: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded text-sm outline-none"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                >
                  {['stock', 'crypto', 'etf', 'commodity'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="primary" onClick={handleAdd}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Avg Price</th>
                <th className="text-right">Current</th>
                <th className="text-right">Value</th>
                <th className="text-right">P&L</th>
                <th className="text-right">24h</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {enrichedHoldings.map((h) => (
                <tr key={h.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
                      >
                        {h.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                          {h.symbol}
                        </div>
                        <div className="text-xs capitalize" style={{ color: 'var(--muted)' }}>
                          {h.assetClass}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right num text-sm" style={{ color: 'var(--foreground)' }}>
                    {h.quantity}
                  </td>
                  <td className="text-right num text-sm" style={{ color: 'var(--muted)' }}>
                    {formatCurrency(h.avgBuyPrice)}
                  </td>
                  <td className="text-right num text-sm" style={{ color: 'var(--foreground)' }}>
                    {h.currentPrice ? formatCurrency(h.currentPrice) : '—'}
                  </td>
                  <td className="text-right num text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    {formatCurrency(h.currentValue)}
                  </td>
                  <td className="text-right">
                    <div className={clsx('text-sm num', h.gain >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]')}>
                      {h.gain >= 0 ? '+' : ''}{formatCurrency(h.gain)}
                    </div>
                    <div className={clsx('text-xs num', h.gainPct >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]')}>
                      {formatPct(h.gainPct)}
                    </div>
                  </td>
                  <td className="text-right">
                    {h.pct24h !== null ? <PctBadge value={h.pct24h} /> : <span style={{ color: 'var(--muted)' }}>—</span>}
                  </td>
                  <td>
                    <button
                      onClick={() => removeHolding(h.id)}
                      className="p-1 rounded hover:bg-[var(--down-bg)] hover:text-[var(--down)] transition-fast"
                      style={{ color: 'var(--muted)' }}
                    >
                      <Trash2 size={13} />
                    </button>
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
