'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, BarChart2, ArrowLeftRight,
  Building2, Lightbulb, Newspaper, Bell, Star,
  Zap, ShieldCheck, Globe, Activity, ArrowRight,
  ChevronRight, Check, Play, RefreshCw, ArrowUpDown,
} from 'lucide-react';

/* ── Design tokens ── */
const C = {
  bg:      '#07101f',
  surface: '#0c1829',
  card:    '#101f36',
  border:  'rgba(255,255,255,0.07)',
  borderM: 'rgba(255,255,255,0.12)',
  blue:    '#3b82f6',
  blueDim: 'rgba(59,130,246,0.1)',
  blueBdr: 'rgba(59,130,246,0.22)',
  t1:      '#eef2ff',
  t2:      '#8ba3c7',
  t3:      '#3d5270',
  green:   '#22c55e',
  red:     '#ef4444',
  amber:   '#f59e0b',
};

/* ── Mock data ── */
const MOCK = [
  { symbol: 'BTC',  name: 'Bitcoin',     price: 97840,  pct:  2.34, type: 'crypto'    },
  { symbol: 'ETH',  name: 'Ethereum',    price: 3621,   pct:  1.87, type: 'crypto'    },
  { symbol: 'AAPL', name: 'Apple',       price: 250.12, pct: -0.52, type: 'stock'     },
  { symbol: 'NVDA', name: 'NVIDIA',      price: 134.80, pct:  3.21, type: 'stock'     },
  { symbol: 'TSLA', name: 'Tesla',       price: 281.44, pct: -1.14, type: 'stock'     },
  { symbol: 'XAU',  name: 'Gold',        price: 3021,   pct:  0.68, type: 'commodity' },
  { symbol: 'SPY',  name: 'S&P 500 ETF', price: 662.29, pct: -0.41, type: 'etf'       },
  { symbol: 'SOL',  name: 'Solana',      price: 168.40, pct:  5.12, type: 'crypto'    },
];

const STATS = [
  { num: 80,  suffix: '+', label: 'Assets tracked',  sub: 'Live 30s refresh'    },
  { num: 5,   suffix: '+', label: 'Asset classes',   sub: 'Crypto · Stocks · ETFs' },
  { num: 23,  suffix: '',  label: 'Company profiles', sub: 'CEO & funding data'  },
  { num: 30,  suffix: '+', label: 'Currencies',      sub: 'Live exchange rates'  },
];

const AUTO_PAIRS = [
  { from: 'USD', to: 'EUR', amount: 1000,  baseRate: 0.9231  },
  { from: 'USD', to: 'GBP', amount: 2500,  baseRate: 0.7912  },
  { from: 'USD', to: 'JPY', amount: 500,   baseRate: 149.20  },
  { from: 'EUR', to: 'USD', amount: 1500,  baseRate: 1.0834  },
  { from: 'GBP', to: 'USD', amount: 800,   baseRate: 1.2638  },
  { from: 'USD', to: 'NGN', amount: 100,   baseRate: 1580    },
  { from: 'USD', to: 'CAD', amount: 3000,  baseRate: 1.3612  },
  { from: 'USD', to: 'CHF', amount: 750,   baseRate: 0.8843  },
];

const FEATURES = [
  { icon: BarChart2,      title: 'Live Charts',       desc: 'Professional candlestick, area, and line charts with multiple time ranges for every asset class.', large: true  },
  { icon: TrendingUp,     title: 'Real-Time Prices',  desc: '80+ assets refreshed every 30 seconds — never stale.',                                             large: false },
  { icon: ArrowLeftRight, title: 'Currency Converter',desc: 'Instant conversion across 30+ currencies with live rates.',                                        large: false },
  { icon: Lightbulb,      title: 'Market Advice',     desc: 'Algorithmic buy/sell/hold signals from 24h momentum, sentiment, and volume data — not guesswork.', large: true  },
  { icon: Building2,      title: 'Companies',         desc: 'CEO, valuation & funding for 23 major companies.',                                                 large: false },
  { icon: Newspaper,      title: 'News',              desc: 'Financial headlines with sentiment tagging.',                                                      large: false },
  { icon: Star,           title: 'Watchlist',         desc: 'Personal tracker, stored locally — no account needed.',                                           large: false },
  { icon: Bell,           title: 'Alerts',            desc: 'Above / below / % price alerts on any symbol.',                                                   large: false },
];

/* ── Hooks ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return val;
}

/* ── Utilities ── */
function fmt(price: number) {
  return price >= 1000
    ? price.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : price.toFixed(2);
}

function fmtRate(rate: number) {
  return rate >= 100
    ? rate.toLocaleString('en-US', { maximumFractionDigits: 2 })
    : rate >= 1
    ? rate.toFixed(4)
    : rate.toFixed(4);
}

/* ── Ticker ── */
function Ticker() {
  return (
    <div style={{ overflow: 'hidden', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.015)' }}>
      <div className="ticker-scroll" style={{ display: 'flex', gap: 40, padding: '10px 16px', whiteSpace: 'nowrap' }}>
        {[...MOCK, ...MOCK, ...MOCK].map((a, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0, fontSize: 11 }}>
            <span style={{ color: C.t2, fontWeight: 700 }}>{a.symbol}</span>
            <span style={{ color: C.t3, fontFamily: 'var(--font-geist-mono)' }}>${fmt(a.price)}</span>
            <span style={{ color: a.pct >= 0 ? C.green : C.red, fontWeight: 700 }}>{a.pct >= 0 ? '+' : ''}{a.pct.toFixed(2)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Mini sparkline ── */
function Sparkline({ up, w = 56, h = 20 }: { up: boolean; w?: number; h?: number }) {
  const pts = up
    ? '0,17 9,13 18,11 27,13 36,8 45,5 54,3'
    : '0,3 9,6 18,5 27,9 36,13 45,11 54,17';
  return (
    <svg width={w} height={h} viewBox={`0 0 54 20`} fill="none">
      <polyline points={pts} stroke={up ? C.green : C.red} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  );
}

/* ── Rate sparkline from history array ── */
function RateSparkline({ history, color, w = 240, h = 48 }: { history: number[]; color: string; w?: number; h?: number }) {
  if (history.length < 2) return null;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 0.0001;
  const pad = 4;
  const pts = history.map((r, i) => {
    const x = pad + (i / (history.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (r - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const last = history[history.length - 1];
  const lastX = w - pad;
  const lastY = pad + (1 - (last - min) / range) * (h - pad * 2);

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      {/* Area fill */}
      <polyline
        points={`${pad},${h - pad} ${pts} ${w - pad},${h - pad}`}
        fill={`${color}12`}
        stroke="none"
      />
      {/* Line */}
      <polyline points={pts} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dot at end */}
      <circle cx={lastX} cy={lastY} r="3" fill={color} />
      <circle cx={lastX} cy={lastY} r="5" fill={`${color}30`} />
    </svg>
  );
}

/* ── Animated price card ── */
function PriceCard({ a, delay = 0, visible }: { a: typeof MOCK[0]; delay?: number; visible: boolean }) {
  const [price, setPrice] = useState(a.price);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const id = setInterval(() => {
        setPrice((p) => {
          const d = p * (Math.random() * 0.006 - 0.003);
          setFlash(d >= 0 ? 'up' : 'down');
          setTimeout(() => setFlash(null), 600);
          return Math.max(p + d, 0.01);
        });
      }, 2000 + Math.random() * 1200);
      return () => clearInterval(id);
    }, delay + 800);
    return () => clearTimeout(t);
  }, [delay]);

  const up = a.pct >= 0;
  return (
    <div style={{
      borderRadius: 16,
      padding: '14px',
      background: flash === 'up' ? 'rgba(34,197,94,0.07)' : flash === 'down' ? 'rgba(239,68,68,0.07)' : C.card,
      border: `1px solid ${flash ? (flash === 'up' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)') : C.border}`,
      transition: 'all 0.5s ease',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 10, background: C.blueDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: C.blue }}>
          {a.symbol.charAt(0)}
        </div>
        <Sparkline up={up} />
      </div>
      <p style={{ fontSize: 10, color: C.t3, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>{a.symbol}</p>
      <p style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-geist-mono)', color: flash === 'up' ? C.green : flash === 'down' ? C.red : C.t1, transition: 'color 0.3s', marginBottom: 2 }}>
        ${fmt(price)}
      </p>
      <p style={{ fontSize: 11, fontWeight: 600, color: up ? C.green : C.red }}>{up ? '+' : ''}{a.pct.toFixed(2)}%</p>
    </div>
  );
}

/* ── Demo: Live Markets ── */
function DemoMarkets() {
  const [prices, setPrices] = useState(MOCK);
  useEffect(() => {
    const id = setInterval(() => {
      setPrices((p) => p.map((a) => {
        const d = a.price * (Math.random() * 0.008 - 0.004);
        return { ...a, price: Math.max(a.price + d, 0.01), pct: a.pct + (Math.random() * 0.1 - 0.05) };
      }));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: '0 12px', padding: '6px 12px', fontSize: 10, color: C.t3, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
        <span style={{ textAlign: 'center' }}>#</span>
        <span>Asset</span>
        <span style={{ textAlign: 'right' }}>Price / 24h</span>
      </div>
      {prices.map((a, i) => (
        <div key={a.symbol} style={{
          display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: '0 12px',
          padding: '10px 12px', borderRadius: 12, marginBottom: 2,
          background: 'rgba(255,255,255,0.02)', transition: 'background 0.2s',
        }}>
          <span style={{ fontSize: 11, color: C.t3, fontFamily: 'var(--font-geist-mono)', textAlign: 'center', alignSelf: 'center' }}>{i + 1}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 9, background: C.blueDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: C.blue, flexShrink: 0 }}>
              {a.symbol.charAt(0)}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.t1, lineHeight: 1.2 }}>{a.symbol}</p>
              <p style={{ fontSize: 10, color: C.t3, textTransform: 'capitalize', lineHeight: 1.2 }}>{a.type}</p>
            </div>
          </div>
          <div style={{ textAlign: 'right', alignSelf: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-geist-mono)', color: C.t1 }}>${fmt(a.price)}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: a.pct >= 0 ? C.green : C.red }}>{a.pct >= 0 ? '+' : ''}{a.pct.toFixed(2)}%</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Demo: Enhanced Currency Converter ── */
function DemoConverter() {
  const [autoMode, setAutoMode]     = useState(true);
  const [pairIdx, setPairIdx]       = useState(0);
  const [transitioning, setTrans]   = useState(false);
  const [rate, setRate]             = useState(AUTO_PAIRS[0].baseRate);
  const [history, setHistory]       = useState<number[]>(() =>
    Array.from({ length: 30 }, (_, i) =>
      AUTO_PAIRS[0].baseRate * (1 + Math.sin(i * 0.4) * 0.003 + (Math.random() - 0.5) * 0.002)
    )
  );
  // Manual mode state
  const [manualAmt, setManualAmt]   = useState('1000');
  const [manualFrom, setManualFrom] = useState('USD');
  const [manualTo, setManualTo]     = useState('EUR');
  const [manualRate, setManualRate] = useState(0.9231);
  const [swapping, setSwapping]     = useState(false);

  const pair   = AUTO_PAIRS[pairIdx];
  const curAmt = autoMode ? pair.amount : (parseFloat(manualAmt) || 0);
  const curFrom = autoMode ? pair.from : manualFrom;
  const curTo   = autoMode ? pair.to   : manualTo;
  const curRate = autoMode ? rate : manualRate;
  const result  = curAmt * curRate;

  const rateUp = history.length > 1 && history[history.length - 1] >= history[0];
  const dailyPct = ((curRate / (autoMode ? pair.baseRate : 0.9231) - 1) * 100);

  /* Fluctuate rate every 800ms */
  useEffect(() => {
    const id = setInterval(() => {
      if (autoMode) {
        setRate((r) => {
          const n = r * (1 + (Math.random() - 0.5) * 0.0012);
          setHistory((h) => [...h.slice(-29), n]);
          return n;
        });
      } else {
        setManualRate((r) => {
          const n = r * (1 + (Math.random() - 0.5) * 0.0012);
          setHistory((h) => [...h.slice(-29), n]);
          return n;
        });
      }
    }, 800);
    return () => clearInterval(id);
  }, [autoMode]);

  /* Auto-cycle pairs every 3.5s */
  useEffect(() => {
    if (!autoMode) return;
    const id = setInterval(() => {
      setTrans(true);
      setTimeout(() => {
        setPairIdx((i) => {
          const next = (i + 1) % AUTO_PAIRS.length;
          const base = AUTO_PAIRS[next].baseRate;
          setRate(base * (1 + (Math.random() - 0.5) * 0.002));
          setHistory(Array.from({ length: 30 }, (_, j) =>
            base * (1 + Math.sin(j * 0.5) * 0.003 + (Math.random() - 0.5) * 0.002)
          ));
          return next;
        });
        setTrans(false);
      }, 280);
    }, 3500);
    return () => clearInterval(id);
  }, [autoMode]);

  /* Swap currencies (manual) */
  const handleSwap = useCallback(() => {
    setSwapping(true);
    setTimeout(() => {
      setManualFrom(manualTo);
      setManualTo(manualFrom);
      setManualRate((r) => 1 / r);
      setHistory((h) => [...h].reverse());
      setSwapping(false);
    }, 200);
  }, [manualFrom, manualTo]);

  const selectStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: '9px 10px',
    color: C.t1,
    fontSize: 13,
    width: '100%',
    outline: 'none',
    cursor: 'pointer',
  };

  const currencies = ['USD','EUR','GBP','JPY','NGN','CAD','CHF','AUD','CNY'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header row: mode toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block', animation: 'lpulse 2s infinite' }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.t3 }}>
            {autoMode ? 'Auto-simulation' : 'Manual mode'}
          </span>
        </div>
        <button
          onClick={() => setAutoMode((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 8, border: `1px solid ${C.border}`,
            background: autoMode ? C.blueDim : 'transparent',
            color: autoMode ? C.blue : C.t3,
            fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
          }}>
          <RefreshCw size={10} style={{ animation: autoMode ? 'spin 3s linear infinite' : 'none' }} />
          {autoMode ? 'Auto' : 'Manual'}
        </button>
      </div>

      {/* From / To display */}
      {autoMode ? (
        /* Auto mode: animated currency pair display */
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10,
          opacity: transitioning ? 0 : 1, transform: transitioning ? 'scale(0.98)' : 'scale(1)',
          transition: 'opacity 0.28s ease, transform 0.28s ease',
        }}>
          <div style={{ textAlign: 'center', padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 10, color: C.t3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>From</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: C.t1, fontFamily: 'var(--font-geist-mono)', lineHeight: 1 }}>{curFrom}</p>
            <p style={{ fontSize: 12, color: C.t2, marginTop: 4, fontFamily: 'var(--font-geist-mono)' }}>
              {curAmt.toLocaleString()}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <ArrowRight size={16} style={{ color: C.blue }} />
          </div>
          <div style={{ textAlign: 'center', padding: '14px', borderRadius: 14, background: C.blueDim, border: `1px solid ${C.blueBdr}` }}>
            <p style={{ fontSize: 10, color: C.t3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>To</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: C.blue, fontFamily: 'var(--font-geist-mono)', lineHeight: 1 }}>{curTo}</p>
            <p style={{ fontSize: 12, color: C.t2, marginTop: 4, fontFamily: 'var(--font-geist-mono)' }}>
              {result >= 1000
                ? result.toLocaleString('en-US', { maximumFractionDigits: 2 })
                : result.toFixed(4)}
            </p>
          </div>
        </div>
      ) : (
        /* Manual mode: inputs */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'end', gap: 8 }}>
          <div>
            <p style={{ fontSize: 10, color: C.t3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>From</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <input
                type="number"
                value={manualAmt}
                onChange={(e) => setManualAmt(e.target.value)}
                style={{ ...selectStyle, fontFamily: 'var(--font-geist-mono)' }}
                placeholder="Amount"
              />
              <select value={manualFrom} onChange={(e) => setManualFrom(e.target.value)} style={selectStyle}>
                {currencies.map((c) => <option key={c} value={c} style={{ background: C.bg }}>{c}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={handleSwap}
            style={{
              width: 34, height: 34, borderRadius: 10, border: `1px solid ${C.borderM}`,
              background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, marginBottom: 1,
              transform: swapping ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}>
            <ArrowUpDown size={14} style={{ color: C.blue }} />
          </button>
          <div>
            <p style={{ fontSize: 10, color: C.t3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>To</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ padding: '9px 10px', borderRadius: 10, background: C.blueDim, border: `1px solid ${C.blueBdr}`, fontSize: 13, fontFamily: 'var(--font-geist-mono)', color: C.t1, fontWeight: 700 }}>
                {result >= 1000
                  ? result.toLocaleString('en-US', { maximumFractionDigits: 2 })
                  : result.toFixed(4)}
              </div>
              <select value={manualTo} onChange={(e) => setManualTo(e.target.value)} style={selectStyle}>
                {currencies.map((c) => <option key={c} value={c} style={{ background: C.bg }}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Rate info row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {[
          { label: 'Exchange Rate', value: `1 ${curFrom} = ${fmtRate(curRate)} ${curTo}` },
          { label: '24h Change',    value: `${dailyPct >= 0 ? '+' : ''}${dailyPct.toFixed(4)}%`, color: dailyPct >= 0 ? C.green : C.red },
          { label: 'Spread',        value: `${(curRate * 0.0015).toFixed(curRate < 1 ? 4 : 2)}` },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '10px 10px', borderRadius: 12, background: 'rgba(255,255,255,0.025)', border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 9, color: C.t3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: color ?? C.t1, fontFamily: 'var(--font-geist-mono)', lineHeight: 1.3 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Rate chart */}
      <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 9, color: C.t3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rate history (live)</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: rateUp ? C.green : C.red, display: 'flex', alignItems: 'center', gap: 3 }}>
            {rateUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {rateUp ? 'rising' : 'falling'}
          </span>
        </div>
        <div style={{ overflow: 'hidden', borderRadius: 8 }}>
          <RateSparkline history={history} color={rateUp ? C.green : C.red} w={360} h={56} />
        </div>
      </div>

      {/* Auto: cycling pair indicators */}
      {autoMode && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {AUTO_PAIRS.map((p, i) => (
            <div
              key={i}
              style={{
                padding: '3px 9px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                background: i === pairIdx ? C.blueDim : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === pairIdx ? C.blueBdr : C.border}`,
                color: i === pairIdx ? C.blue : C.t3,
                transition: 'all 0.3s ease',
              }}>
              {p.from}/{p.to}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Demo: Advice ── */
function DemoAdvice() {
  const signals = [
    { symbol: 'SOL',  signal: 'Strong Buy', pct: +5.12, risk: 'High',   color: C.green },
    { symbol: 'NVDA', signal: 'Buy',         pct: +3.21, risk: 'Medium', color: C.green },
    { symbol: 'BTC',  signal: 'Buy',         pct: +2.34, risk: 'Medium', color: C.green },
    { symbol: 'SPY',  signal: 'Hold',        pct: -0.41, risk: 'Low',    color: C.t2   },
    { symbol: 'TSLA', signal: 'Watch',       pct: -1.14, risk: 'Medium', color: C.amber },
  ];
  const gainers = signals.filter((s) => s.pct > 0).length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 14, padding: '14px 16px' }}>
          <p style={{ fontSize: 9, color: C.t3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Sentiment</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: C.green }}>Bullish</p>
        </div>
        <div style={{ background: C.blueDim, border: `1px solid ${C.blueBdr}`, borderRadius: 14, padding: '14px 16px' }}>
          <p style={{ fontSize: 9, color: C.t3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Gainers</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: C.blue }}>{gainers}<span style={{ fontSize: 13, color: C.t3 }}>/{signals.length}</span></p>
        </div>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, background: C.green, width: `${(gainers / signals.length) * 100}%`, transition: 'width 0.8s ease' }} />
      </div>
      {signals.map((s, i) => (
        <div key={s.symbol}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 12px', borderRadius: 12,
            background: 'rgba(255,255,255,0.025)', border: `1px solid ${C.border}`,
            opacity: 0, animation: `fadeUp 0.4s ease forwards`,
            animationDelay: `${i * 60}ms`,
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 10, background: C.blueDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: C.blue }}>
              {s.symbol.charAt(0)}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.t1, lineHeight: 1.2 }}>{s.symbol}</p>
              <p style={{ fontSize: 10, color: C.t3, lineHeight: 1.2 }}>{s.risk} risk</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: s.color, background: `${s.color}18`, padding: '3px 10px', borderRadius: 99 }}>{s.signal}</p>
            <p style={{ fontSize: 11, fontFamily: 'var(--font-geist-mono)', marginTop: 3, color: s.pct >= 0 ? C.green : C.red }}>
              {s.pct >= 0 ? '+' : ''}{s.pct.toFixed(2)}%
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Animated section wrapper ── */
function AnimSection({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* ── Bento card ── */
function BentoCard({ span, icon: Icon, title, desc, large, small, delay = 0, inView }: {
  span: number; icon: React.ElementType; title: string; desc: string;
  large?: boolean; small?: boolean; delay?: number; inView: boolean;
}) {
  return (
    <div
      style={{
        gridColumn: `span ${span}`,
        borderRadius: 18,
        padding: large ? '26px 26px 30px' : small ? '20px 20px 24px' : '22px 22px 26px',
        background: C.card,
        border: `1px solid ${C.border}`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        display: 'flex', flexDirection: 'column', gap: 12,
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms, border-color 0.2s`,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        cursor: 'default',
      }}
      onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = C.blueBdr; el.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = C.border; el.style.transform = 'translateY(0)'; }}
    >
      <div style={{ width: large ? 44 : 36, height: large ? 44 : 36, borderRadius: 12, background: C.blueDim, border: `1px solid ${C.blueBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={large ? 20 : 16} style={{ color: C.blue }} />
      </div>
      <div>
        <h3 style={{ fontSize: large ? 15 : 13, fontWeight: 800, color: C.t1, marginBottom: 6, letterSpacing: '-0.02em' }}>{title}</h3>
        <p style={{ fontSize: small ? 12 : 13, color: C.t2, lineHeight: 1.62 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ── Stat counter ── */
function StatCounter({ num, suffix, label, sub, inView, delay }: { num: number; suffix: string; label: string; sub: string; inView: boolean; delay: number }) {
  const val = useCountUp(num, inView, 1400);
  return (
    <div style={{
      padding: '40px 0', textAlign: 'center',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(16px)',
    }}>
      <p style={{ fontWeight: 900, lineHeight: 1, marginBottom: 6, fontFamily: 'var(--font-geist-mono)', fontSize: 'clamp(2rem,4vw,3rem)', color: C.blue }}>
        {val}{suffix}
      </p>
      <p style={{ fontSize: 13, fontWeight: 700, color: C.t2, marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 11, color: C.t3 }}>{sub}</p>
    </div>
  );
}

/* ── Page ── */
export default function LandingPage() {
  const [demoTab, setDemoTab]   = useState<'markets' | 'converter' | 'advice'>('converter');
  const [heroVisible, setHeroVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);

  const [statsRef, statsInView]     = useInView(0.2);
  const [bentoRef, bentoInView]     = useInView(0.1);
  const [howRef,   howInView]       = useInView(0.15);
  const [whyRef,   whyInView]       = useInView(0.15);
  const [ctaRef,   ctaInView]       = useInView(0.2);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (heroVisible) {
      const t = setTimeout(() => setCardsVisible(true), 400);
      return () => clearTimeout(t);
    }
  }, [heroVisible]);

  return (
    <div style={{ background: C.bg, color: C.t1, minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 56,
        borderBottom: `1px solid ${C.border}`,
        background: 'rgba(7,16,31,0.88)',
        backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center',
      }}>
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff' }}>T</div>
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.03em', color: C.t1 }}>Tradyy</span>
          </div>
          <div className="hidden md:flex items-center gap-8" style={{ fontSize: 13 }}>
            {[['Features','#features'],['Demo','#demo'],['How it works','#how']].map(([l,h]) => (
              <a key={l} href={h} style={{ color: C.t3, transition: 'color 0.15s' }} className="hover:text-white">{l}</a>
            ))}
          </div>
          <Link href="/dashboard"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, background: C.blue, color: '#fff', fontSize: 13, fontWeight: 700 }}
            className="hover:opacity-90 active:scale-95 transition-all">
            Open app <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', paddingTop: 56, display: 'flex', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div className="hero-grid max-w-7xl w-full mx-auto px-4 sm:px-6 py-16" style={{ display: 'grid', gap: 48 }}>
          {/* Left */}
          <div>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '5px 12px 5px 8px', borderRadius: 99,
              border: `1px solid ${C.blueBdr}`, background: C.blueDim, marginBottom: 28,
              opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.5s ease 0ms, transform 0.5s ease 0ms',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, animation: 'lpulse 2s infinite' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: C.blue, letterSpacing: '0.03em' }}>Live · 80+ assets tracked in real time</span>
            </div>
            {/* H1 */}
            <h1 style={{
              fontWeight: 900, lineHeight: 1.02, letterSpacing: '-0.04em', marginBottom: 20,
              fontSize: 'clamp(2.8rem,7vw,5.5rem)',
              opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.55s ease 80ms, transform 0.55s ease 80ms',
            }}>
              <span style={{ color: C.t1 }}>Global market</span><br />
              <span style={{ color: C.blue }}>intelligence.</span>
            </h1>
            {/* Subtext */}
            <p style={{
              fontSize: 'clamp(0.95rem,2vw,1.1rem)', color: C.t2, lineHeight: 1.7, marginBottom: 36, maxWidth: 500,
              opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(14px)',
              transition: 'opacity 0.55s ease 160ms, transform 0.55s ease 160ms',
            }}>
              Real-time prices for crypto, stocks, ETFs &amp; commodities.
              Charts, currency conversion, algorithmic signals, and company profiles — all in one place.
            </p>
            {/* CTAs */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 40,
              opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.55s ease 240ms, transform 0.55s ease 240ms',
            }}>
              <Link href="/dashboard"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 24px', borderRadius: 12, background: C.blue, color: '#fff', fontSize: 14, fontWeight: 700 }}
                className="hover:opacity-90 active:scale-95 transition-all">
                <Zap size={15} /> Launch Platform
              </Link>
              <a href="#demo"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 24px', borderRadius: 12, border: `1px solid ${C.borderM}`, color: C.t2, fontSize: 14, fontWeight: 600 }}
                className="hover:text-white hover:border-white/30 transition-all">
                <Play size={13} /> See demo
              </a>
            </div>
            {/* Trust */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 20,
              opacity: heroVisible ? 1 : 0,
              transition: 'opacity 0.55s ease 320ms',
            }}>
              {['No sign-up required','Free forever','Live data'].map((item) => (
                <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.t3, fontWeight: 500 }}>
                  <Check size={11} style={{ color: C.green }} /> {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right: price cards */}
          <div className="hidden lg:grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, alignSelf: 'center' }}>
            {MOCK.slice(0, 6).map((a, i) => (
              <PriceCard key={a.symbol} a={a} delay={i * 120} visible={cardsVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── STATS ── */}
      <section style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div ref={statsRef} className="stats-grid max-w-7xl mx-auto px-4 sm:px-6" style={{ display: 'grid' }}>
          {STATS.map((s, i) => (
            <StatCounter key={s.label} {...s} inView={statsInView} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* ── DEMO ── */}
      <section id="demo" style={{ padding: '96px 16px', background: C.bg }}>
        <div className="max-w-5xl mx-auto">
          <AnimSection>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 48 }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.blue, marginBottom: 12 }}>Live Demo</span>
              <h2 style={{ fontWeight: 900, letterSpacing: '-0.035em', fontSize: 'clamp(1.75rem,4vw,2.75rem)', color: C.t1, marginBottom: 14 }}>The platform, live.</h2>
              <p style={{ fontSize: 14, color: C.t2, maxWidth: 400, lineHeight: 1.65 }}>
                Real prices, real conversion, real signals — updating every second.
              </p>
            </div>
          </AnimSection>

          <AnimSection delay={100}>
            <div style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${C.borderM}`, boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
              {/* Browser chrome */}
              <div style={{ background: '#091424', borderBottom: `1px solid ${C.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 11, height: 11, borderRadius: '50%', background: C.red }} />
                  <div style={{ width: 11, height: 11, borderRadius: '50%', background: C.amber }} />
                  <div style={{ width: 11, height: 11, borderRadius: '50%', background: C.green }} />
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '2px 3px', gap: 2 }}>
                    {(['markets','converter','advice'] as const).map((tab) => (
                      <button key={tab} onClick={() => setDemoTab(tab)}
                        style={{
                          padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          background: demoTab === tab ? C.blue : 'transparent',
                          color: demoTab === tab ? '#fff' : C.t3,
                          border: 'none', transition: 'all 0.2s',
                        }}>
                        {tab === 'markets' ? 'Markets' : tab === 'converter' ? 'Converter' : 'Advice'}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', fontSize: 11, fontWeight: 700, color: C.green }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, display: 'inline-block', animation: 'lpulse 2s infinite' }} />
                  Live
                </div>
              </div>
              {/* Content */}
              <div style={{ background: C.card, padding: '20px 20px 24px', minHeight: 480 }}>
                <div style={{ opacity: 1, transition: 'opacity 0.25s', animation: 'fadeUp 0.3s ease forwards' }} key={demoTab}>
                  {demoTab === 'markets'   && <DemoMarkets />}
                  {demoTab === 'converter' && <DemoConverter />}
                  {demoTab === 'advice'    && <DemoAdvice />}
                </div>
              </div>
            </div>
          </AnimSection>

          <AnimSection delay={200}>
            <p style={{ textAlign: 'center', marginTop: 20 }}>
              <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: C.blue }} className="hover:opacity-75 transition-opacity">
                Open the full platform <ChevronRight size={14} />
              </Link>
            </p>
          </AnimSection>
        </div>
      </section>

      {/* ── FEATURES BENTO ── */}
      <section id="features" style={{ padding: '96px 16px', background: C.surface, borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto">
          <AnimSection>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.blue }}>Features</span>
              <h2 style={{ fontWeight: 900, letterSpacing: '-0.035em', fontSize: 'clamp(1.75rem,4vw,2.75rem)', color: C.t1, marginTop: 12, marginBottom: 14 }}>Everything. One platform.</h2>
              <p style={{ fontSize: 14, color: C.t2, maxWidth: 380, margin: '0 auto', lineHeight: 1.65 }}>
                Every tool you need to track, analyse, and stay ahead of global markets.
              </p>
            </div>
          </AnimSection>

          <div ref={bentoRef} className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 12 }}>
            <BentoCard span={7} icon={BarChart2}      title="Live Charts"        desc="Interactive candlestick, area, and line charts with multiple time ranges for every asset class — crypto, stocks, ETFs, and commodities."  large delay={0}   inView={bentoInView} />
            <BentoCard span={5} icon={TrendingUp}     title="Real-Time Prices"   desc="80+ assets updated every 30 seconds. Never stale."                                                                                             delay={60}  inView={bentoInView} />
            <BentoCard span={5} icon={ArrowLeftRight} title="Currency Converter" desc="Convert between 30+ currencies instantly. Live Frankfurter rates with quick-reference table."                                                 delay={120} inView={bentoInView} />
            <BentoCard span={7} icon={Lightbulb}      title="Market Advice"      desc="Algorithmic buy/sell/hold signals from 24h momentum, market sentiment, and volume data. Data-driven, not guesswork."                         large delay={180} inView={bentoInView} />
            <BentoCard span={3} icon={Building2}      title="Companies"          desc="CEO, valuation & funding for 23 major companies."                                                                             small delay={240} inView={bentoInView} />
            <BentoCard span={3} icon={Newspaper}      title="News"               desc="Financial headlines with sentiment tagging."                                                                                   small delay={280} inView={bentoInView} />
            <BentoCard span={3} icon={Star}           title="Watchlist"          desc="Personal tracker, no account required."                                                                                        small delay={320} inView={bentoInView} />
            <BentoCard span={3} icon={Bell}           title="Alerts"             desc="Above / below / % alerts on any symbol."                                                                                       small delay={360} inView={bentoInView} />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: '96px 16px', background: C.bg, borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-4xl mx-auto">
          <AnimSection>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.blue }}>How it works</span>
              <h2 style={{ fontWeight: 900, letterSpacing: '-0.035em', fontSize: 'clamp(1.75rem,4vw,2.75rem)', color: C.t1, marginTop: 12 }}>Three steps, that's it.</h2>
            </div>
          </AnimSection>
          <div ref={howRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 2 }}>
            {[
              { n: '01', title: 'Search any asset',  desc: 'Crypto, stocks, ETFs, commodities, or indices — the global search finds anything instantly.' },
              { n: '02', title: 'Analyse the data',  desc: 'Price charts, metrics, news, and algorithmic signals — everything for that asset in one view.' },
              { n: '03', title: 'Stay ahead',        desc: 'Watchlist, price alerts, and the Advice dashboard keep you informed as markets move.' },
            ].map((s, i) => (
              <div key={s.n} style={{
                padding: '32px 28px', borderRadius: 18,
                background: i === 1 ? C.card : 'transparent',
                border: `1px solid ${i === 1 ? C.borderM : C.border}`,
                boxShadow: i === 1 ? 'inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
                opacity: howInView ? 1 : 0,
                transform: howInView ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.55s ease ${i * 100}ms, transform 0.55s ease ${i * 100}ms`,
              }}>
                <p style={{ fontSize: 11, fontWeight: 900, fontFamily: 'var(--font-geist-mono)', color: C.blue, letterSpacing: '0.06em', marginBottom: 14 }}>{s.n}</p>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: C.t1, marginBottom: 10, letterSpacing: '-0.02em' }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ── */}
      <section style={{ padding: '96px 16px', background: C.surface, borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-5xl mx-auto">
          <AnimSection>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontWeight: 900, letterSpacing: '-0.035em', fontSize: 'clamp(1.75rem,4vw,2.75rem)', color: C.t1, marginBottom: 10 }}>Why Tradyy?</h2>
              <p style={{ fontSize: 14, color: C.t2 }}>Built for traders, investors, and the financially curious.</p>
            </div>
          </AnimSection>
          <div ref={whyRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 12 }}>
            {[
              { icon: ShieldCheck, title: 'No account, ever',  desc: 'Watchlist and alerts live in your browser. Nothing is collected. No emails, no tracking, no upsells.' },
              { icon: Globe,        title: 'Global coverage',  desc: 'US, European, and Asian markets — stocks, indices, forex, crypto, and commodities worldwide.' },
              { icon: Activity,    title: 'Always current',   desc: 'Crypto every 30s, stocks every minute. News curated continuously. Data you can trust.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={title} style={{
                padding: '28px 26px', borderRadius: 18,
                background: C.card, border: `1px solid ${C.border}`,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                display: 'flex', flexDirection: 'column', gap: 14,
                opacity: whyInView ? 1 : 0,
                transform: whyInView ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.55s ease ${i * 100}ms, transform 0.55s ease ${i * 100}ms`,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.blueBdr; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.border; }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 13, background: C.blueDim, border: `1px solid ${C.blueBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} style={{ color: C.blue }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: C.t1, marginBottom: 7, letterSpacing: '-0.02em' }}>{title}</h3>
                  <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section ref={ctaRef} style={{ padding: '112px 16px', background: C.bg, borderTop: `1px solid ${C.border}` }}>
        <div style={{
          maxWidth: 640, margin: '0 auto', textAlign: 'center',
          opacity: ctaInView ? 1 : 0,
          transform: ctaInView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <h2 style={{ fontWeight: 900, letterSpacing: '-0.04em', fontSize: 'clamp(2.2rem,6vw,4rem)', color: C.t1, lineHeight: 1.05, marginBottom: 20 }}>
            Track markets.<br /><span style={{ color: C.blue }}>Start now.</span>
          </h2>
          <p style={{ fontSize: 15, color: C.t2, marginBottom: 40, lineHeight: 1.65 }}>
            No account. No credit card. Open the platform and explore global markets immediately.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 36 }}>
            <Link href="/dashboard"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 14, background: C.blue, color: '#fff', fontSize: 15, fontWeight: 800 }}
              className="hover:opacity-90 active:scale-95 transition-all">
              <Zap size={16} /> Launch Tradyy
            </Link>
            <Link href="/markets"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 14, border: `1px solid ${C.borderM}`, color: C.t2, fontSize: 15, fontWeight: 700 }}
              className="hover:text-white hover:border-white/25 transition-all">
              Browse Markets <ArrowRight size={15} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24 }}>
            {['No sign-up','Free forever','Live data','80+ assets'].map((t) => (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.t3, fontWeight: 500 }}>
                <Check size={11} style={{ color: C.green }} />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, background: C.surface, padding: '40px 16px' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 9, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff' }}>T</div>
            <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em', color: C.t1 }}>Tradyy</span>
          </div>
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', justifyContent: 'center' }}>
            {[['/dashboard','Dashboard'],['/markets','Markets'],['/advice','Advice'],['/companies','Companies'],['/converter','Converter'],['/news','News']].map(([href,label]) => (
              <Link key={href} href={href} style={{ fontSize: 12, color: C.t3 }} className="hover:text-white transition-colors">{label}</Link>
            ))}
          </nav>
          <p style={{ fontSize: 11, color: C.t3 }}>© {new Date().getFullYear()} Tradyy · informational use only</p>
        </div>
      </footer>

      <style>{`
        @keyframes ticker  { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
        @keyframes lpulse  { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
        @keyframes spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .ticker-scroll { animation: ticker 32s linear infinite; }
        .ticker-scroll:hover { animation-play-state: paused; }
        .hero-grid { grid-template-columns: 1fr; }
        .stats-grid { grid-template-columns: repeat(2,1fr); }
        @media (min-width: 1024px) { .hero-grid { grid-template-columns: 1.1fr 0.9fr !important; align-items: center; } }
        @media (min-width: 768px) {
          .stats-grid { grid-template-columns: repeat(4,1fr) !important; }
          .stats-grid > div { border-bottom: none !important; }
        }
        @media (max-width: 767px) { .bento-grid > div { grid-column: span 12 !important; } }
      `}</style>
    </div>
  );
}
