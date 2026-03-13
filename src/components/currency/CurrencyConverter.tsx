'use client';
import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '@/types/currency';
import { formatCurrency } from '@/lib/formatters';
import { useHasMounted } from '@/hooks/useHasMounted';
import { LoadingSkeleton } from '@/components/ui/Spinner';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
}

const AMOUNTS = [1, 10, 100, 500, 1000, 5000, 10000, 50000];

export default function CurrencyConverter() {
  const mounted = useHasMounted();
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [amount, setAmount] = useState('1000');

  const numAmount = parseFloat(amount) || 0;

  const { data, isLoading } = useSWR<ConversionResult>(
    mounted && numAmount > 0
      ? `/api/forex?action=convert&base=${from}&to=${to}&amount=${numAmount}`
      : null,
    fetcher,
    { dedupingInterval: 5000 }
  );

  const { data: rateData } = useSWR<ConversionResult>(
    mounted ? `/api/forex?action=convert&base=${from}&to=${to}&amount=1` : null,
    fetcher,
    { dedupingInterval: 30_000 }
  );

  function swap() {
    setFrom(to);
    setTo(from);
  }

  if (!mounted) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-10 rounded-md" />
        <LoadingSkeleton className="h-10 rounded-md" />
        <LoadingSkeleton className="h-24 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Amount */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
          Amount
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2.5 rounded-md text-base outline-none num"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
          placeholder="Enter amount"
          min="0"
          inputMode="decimal"
        />
      </div>

      {/* From / Swap / To */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
            From
          </label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-2.5 py-2.5 rounded-md text-sm outline-none"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={swap}
          className="mb-0.5 p-2.5 rounded-md hover:bg-[var(--accent)] hover:text-white transition-fast flex-shrink-0"
          style={{ color: 'var(--muted)', border: '1px solid var(--border)', background: 'var(--surface-2)' }}
          title="Swap currencies"
        >
          <ArrowLeftRight size={15} />
        </button>

        <div className="flex-1">
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
            To
          </label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-2.5 py-2.5 rounded-md text-sm outline-none"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result */}
      <div
        className="rounded-lg p-4"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        {isLoading ? (
          <LoadingSkeleton className="h-8 w-48" />
        ) : data ? (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-2xl font-bold num" style={{ color: 'var(--foreground)' }}>
                {formatCurrency(data.result, to)}
              </span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                1 {from} = {data.rate.toFixed(6)} {to}
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              {formatCurrency(numAmount, from)} → {formatCurrency(data.result, to)}
            </p>
          </>
        ) : (
          <span className="text-sm" style={{ color: 'var(--muted)' }}>Enter an amount above</span>
        )}
      </div>

      {/* Quick reference table */}
      {rateData && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>
            Quick reference — {from} to {to}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {AMOUNTS.map((amt) => (
              <div
                key={amt}
                className="flex justify-between px-3 py-2 rounded-md text-xs"
                style={{ background: 'var(--surface-2)' }}
              >
                <span className="num" style={{ color: 'var(--muted)' }}>
                  {amt.toLocaleString()} {from}
                </span>
                <span className="num font-semibold" style={{ color: 'var(--foreground)' }}>
                  {formatCurrency(amt * rateData.rate, to)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
