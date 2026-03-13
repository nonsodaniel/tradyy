'use client';
import { useState, useCallback } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '@/types/currency';
import { formatCurrency } from '@/lib/formatters';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
}

export default function CurrencyConverter() {
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [amount, setAmount] = useState('1000');

  const numAmount = parseFloat(amount) || 0;

  const { data, isLoading } = useSWR<ConversionResult>(
    numAmount > 0
      ? `/api/forex?action=convert&base=${from}&to=${to}&amount=${numAmount}`
      : null,
    fetcher,
    { dedupingInterval: 5000 }
  );

  function swap() {
    setFrom(to);
    setTo(from);
  }

  const currencyOptions = SUPPORTED_CURRENCIES.map((c) => ({
    value: c.code,
    label: `${c.flag || ''} ${c.code} — ${c.name}`,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {/* Amount */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 rounded text-sm outline-none num"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
            placeholder="Enter amount"
            min="0"
          />
        </div>

        {/* From / To */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
              From
            </label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-2.5 py-2 rounded text-sm outline-none"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={swap}
            className="mt-5 p-2 rounded hover:bg-[var(--surface-2)] transition-fast flex-shrink-0"
            style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
            title="Swap currencies"
          >
            <ArrowLeftRight size={14} />
          </button>

          <div className="flex-1">
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
              To
            </label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-2.5 py-2 rounded text-sm outline-none"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Result */}
      <div
        className="rounded-lg p-4 mt-2"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        {isLoading ? (
          <div className="text-sm" style={{ color: 'var(--muted)' }}>Converting…</div>
        ) : data ? (
          <>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-semibold num" style={{ color: 'var(--foreground)' }}>
                  {formatCurrency(data.result, to)}
                </span>
              </div>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                1 {from} = {data.rate.toFixed(6)} {to}
              </span>
            </div>
            <p className="text-xs mt-1.5" style={{ color: 'var(--muted)' }}>
              {formatCurrency(numAmount, from)} = {formatCurrency(data.result, to)}
            </p>
          </>
        ) : (
          <div className="text-sm" style={{ color: 'var(--muted)' }}>
            Enter an amount to convert
          </div>
        )}
      </div>

      {/* Exchange rate grid */}
      <ExchangeRateGrid base={from} target={to} />
    </div>
  );
}

function ExchangeRateGrid({ base, target }: { base: string; target: string }) {
  const AMOUNTS = [1, 10, 100, 500, 1000, 5000, 10000, 50000];
  const { data } = useSWR<ConversionResult>(
    `/api/forex?action=convert&base=${base}&to=${target}&amount=1`,
    fetcher
  );

  if (!data) return null;

  return (
    <div>
      <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>
        Quick reference
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {AMOUNTS.map((amt) => (
          <div
            key={amt}
            className="flex justify-between px-2.5 py-1.5 rounded text-xs"
            style={{ background: 'var(--surface-2)' }}
          >
            <span className="num" style={{ color: 'var(--muted)' }}>
              {amt.toLocaleString()} {base}
            </span>
            <span className="num font-medium" style={{ color: 'var(--foreground)' }}>
              {formatCurrency(amt * data.rate, target)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
