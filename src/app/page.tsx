'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, BarChart2, ArrowLeftRight,
  Building2, Lightbulb, Newspaper, Bell, Star,
  ChevronRight, Zap, ShieldCheck, Globe, Activity,
  ArrowRight, Check, Play,
} from 'lucide-react';

/* ─── Mock prices that animate ─── */
const MOCK_ASSETS = [
  { symbol: 'BTC',   name: 'Bitcoin',         price: 97840,  pct:  2.34,  type: 'crypto' },
  { symbol: 'ETH',   name: 'Ethereum',         price: 3621,   pct:  1.87,  type: 'crypto' },
  { symbol: 'AAPL',  name: 'Apple Inc.',       price: 250.12, pct: -0.52,  type: 'stock'  },
  { symbol: 'NVDA',  name: 'NVIDIA',           price: 134.80, pct:  3.21,  type: 'stock'  },
  { symbol: 'TSLA',  name: 'Tesla',            price: 281.44, pct: -1.14,  type: 'stock'  },
  { symbol: 'XAU',   name: 'Gold',             price: 3021,   pct:  0.68,  type: 'commodity'},
  { symbol: 'SPY',   name: 'S&P 500 ETF',      price: 662.29, pct: -0.41,  type: 'etf'    },
  { symbol: 'SOL',   name: 'Solana',           price: 168.40, pct:  5.12,  type: 'crypto' },
];

const FEATURES = [
  { icon: BarChart2,      title: 'Live Charts',          desc: 'Candlestick, area, and line charts for every asset class — crypto, stocks, ETFs, and commodities.' },
  { icon: TrendingUp,     title: 'Real-Time Prices',     desc: 'Live prices refreshed every 30 seconds across 80+ assets including crypto, equities, and commodities.' },
  { icon: ArrowLeftRight, title: 'Currency Converter',   desc: 'Convert between 30+ currencies instantly using live Frankfurter exchange rates with a quick-reference table.' },
  { icon: Lightbulb,      title: 'Market Advice',        desc: 'Algorithmic buy/sell/hold signals computed from 24h price momentum, market sentiment, and volume data.' },
  { icon: Building2,      title: 'Company Profiles',     desc: '23 major companies with CEO details, valuations, funding rounds, and descriptions — public and private.' },
  { icon: Newspaper,      title: 'Financial News',       desc: 'Curated financial news with automatic sentiment analysis — bullish, bearish, or neutral tagging.' },
  { icon: Star,           title: 'Watchlist',            desc: 'Build a personal watchlist of any asset. Data persists in your browser — no account needed.' },
  { icon: Bell,           title: 'Price Alerts',         desc: 'Set price-above, price-below, or change-% alerts on any symbol and track them in one place.' },
];

const STATS = [
  { label: 'Asset Classes', value: '5+',  sub: 'Crypto, Stocks, ETFs, Commodities, Forex' },
  { label: 'Assets Tracked', value: '80+', sub: 'Updated every 30 seconds' },
  { label: 'Companies',      value: '23',  sub: 'With CEO & funding data' },
  { label: 'Currencies',     value: '30+', sub: 'Live exchange rates' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Pick any asset',   desc: 'Search across crypto, stocks, ETFs, commodities, and indices. Find anything with the instant search bar.' },
  { step: '02', title: 'Analyse the data', desc: 'View interactive price charts, key metrics, recent news, and live market signals for the asset.' },
  { step: '03', title: 'Stay informed',    desc: 'Add to your watchlist, set price alerts, and check the Advice page for market signals and opportunities.' },
];

/* ─── Ticker row that auto-scrolls ─── */
function TickerBar({ prices }: { prices: typeof MOCK_ASSETS }) {
  return (
    <div className="ticker-bar overflow-hidden border-y" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
      <div className="ticker-track flex gap-8 py-2.5 px-4 whitespace-nowrap">
        {[...prices, ...prices].map((a, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-xs flex-shrink-0">
            <span className="font-semibold" style={{ color: '#e5e7eb' }}>{a.symbol}</span>
            <span className="font-mono" style={{ color: '#d1d5db' }}>
              ${a.price >= 1000 ? a.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : a.price.toFixed(2)}
            </span>
            <span style={{ color: a.pct >= 0 ? '#22c55e' : '#ef4444' }}>
              {a.pct >= 0 ? '+' : ''}{a.pct.toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Animated price card (hero) ─── */
function PriceCard({ asset, delay = 0 }: { asset: typeof MOCK_ASSETS[0]; delay?: number }) {
  const [price, setPrice] = useState(asset.price);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const id = setInterval(() => {
        setPrice((p) => {
          const delta = p * (Math.random() * 0.006 - 0.003);
          const next = Math.max(p + delta, 0.01);
          setFlash(delta >= 0 ? 'up' : 'down');
          setTimeout(() => setFlash(null), 400);
          return next;
        });
      }, 1800 + Math.random() * 1200);
      return () => clearInterval(id);
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  const up = asset.pct >= 0;
  return (
    <div
      className="price-card rounded-xl p-4 flex flex-col gap-2 backdrop-blur-sm transition-all duration-200"
      style={{
        background: flash === 'up'
          ? 'rgba(34,197,94,0.12)'
          : flash === 'down'
          ? 'rgba(239,68,68,0.12)'
          : 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        minWidth: '140px',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}
        >
          {asset.symbol.charAt(0)}
        </div>
        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{
            background: up ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: up ? '#22c55e' : '#ef4444',
          }}
        >
          {up ? '+' : ''}{asset.pct.toFixed(2)}%
        </span>
      </div>
      <div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{asset.symbol}</p>
        <p
          className="text-sm font-bold font-mono mt-0.5 transition-colors duration-200"
          style={{ color: flash === 'up' ? '#22c55e' : flash === 'down' ? '#ef4444' : '#f9fafb' }}
        >
          ${price >= 1000 ? price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : price.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

/* ─── Demo simulator tabs ─── */
type DemoTab = 'markets' | 'converter' | 'advice';

function DemoMarkets() {
  const [prices, setPrices] = useState(MOCK_ASSETS);
  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) =>
        prev.map((a) => {
          const delta = a.price * (Math.random() * 0.008 - 0.004);
          return { ...a, price: Math.max(a.price + delta, 0.01), pct: a.pct + (Math.random() * 0.1 - 0.05) };
        })
      );
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-1">
      <div className="flex items-center text-xs px-3 py-2 rounded-t-lg" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' }}>
        <span className="w-8 text-center">#</span>
        <span className="flex-1 ml-8">Asset</span>
        <span>Price / 24h</span>
        <span className="hidden sm:block ml-6 w-20 text-right">Volume</span>
      </div>
      {prices.map((a, i) => (
        <div
          key={a.symbol}
          className="flex items-center px-3 py-2.5 rounded transition-colors duration-300"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <span className="w-8 text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>{i + 1}</span>
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold mx-2 flex-shrink-0"
            style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}
          >
            {a.symbol.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: '#f9fafb' }}>{a.symbol}</p>
            <p className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.4)' }}>{a.type}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold font-mono" style={{ color: '#f9fafb' }}>
              ${a.price >= 1000 ? a.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : a.price.toFixed(2)}
            </p>
            <p className="text-xs" style={{ color: a.pct >= 0 ? '#22c55e' : '#ef4444' }}>
              {a.pct >= 0 ? '+' : ''}{a.pct.toFixed(2)}%
            </p>
          </div>
          <div className="hidden sm:block ml-6 w-20 text-right">
            <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
              ${(Math.random() * 5 + 0.5).toFixed(1)}B
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DemoConverter() {
  const [amount, setAmount] = useState('1000');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [rate] = useState(0.9231);
  const result = (parseFloat(amount) || 0) * rate;

  const pairs = [['USD','EUR',0.9231],['USD','GBP',0.7912],['USD','NGN',1580],['USD','JPY',149.2],['EUR','GBP',0.857]] as const;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Amount</p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f9fafb' }}
          />
        </div>
        <div>
          <p className="text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>From</p>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f9fafb' }}
          >
            {['USD','EUR','GBP','NGN','JPY'].map((c) => <option key={c} value={c} style={{ background: '#1a1a2e' }}>{c}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>To</p>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f9fafb' }}
          >
            {['EUR','USD','GBP','NGN','JPY'].map((c) => <option key={c} value={c} style={{ background: '#1a1a2e' }}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="rounded-xl p-4" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)' }}>
        <p className="text-2xl font-bold font-mono" style={{ color: '#f9fafb' }}>
          {result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {to}
        </p>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
          1 {from} = {rate.toFixed(4)} {to} · Live rate
        </p>
      </div>
      <div>
        <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Popular pairs</p>
        <div className="grid grid-cols-1 gap-1">
          {pairs.map(([f, t, r]) => (
            <div key={`${f}-${t}`} className="flex justify-between px-3 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{f} → {t}</span>
              <span className="font-mono" style={{ color: '#f9fafb' }}>{typeof r === 'number' && r > 1 ? r.toLocaleString() : r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoAdvice() {
  const signals = [
    { symbol: 'SOL',  signal: 'Strong Buy', pct: +5.12, risk: 'High',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    { symbol: 'NVDA', signal: 'Buy',         pct: +3.21, risk: 'Medium', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
    { symbol: 'BTC',  signal: 'Buy',         pct: +2.34, risk: 'Medium', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
    { symbol: 'SPY',  signal: 'Hold',        pct: -0.41, risk: 'Low',    color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
    { symbol: 'TSLA', signal: 'Watch',       pct: -1.14, risk: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  ];

  const gainers = signals.filter((s) => s.pct > 0).length;
  const gainerRatio = gainers / signals.length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Market Sentiment</p>
            <p className="text-lg font-bold" style={{ color: '#22c55e' }}>Bullish</p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Gainers vs Losers</p>
            <p className="text-sm font-semibold" style={{ color: '#f9fafb' }}>{gainers}/{signals.length}</p>
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full" style={{ width: `${gainerRatio * 100}%`, background: '#22c55e' }} />
        </div>
      </div>
      <div className="space-y-1.5">
        {signals.map((s) => (
          <div key={s.symbol} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: s.bg, border: `1px solid ${s.color}22` }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
                {s.symbol.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#f9fafb' }}>{s.symbol}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.risk} Risk</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}44` }}>
                {s.signal}
              </p>
              <p className="text-xs mt-0.5" style={{ color: s.pct >= 0 ? '#22c55e' : '#ef4444' }}>
                {s.pct >= 0 ? '+' : ''}{s.pct.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [demoTab, setDemoTab] = useState<DemoTab>('markets');
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f', color: '#f9fafb' }}>

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b" style={{ background: 'rgba(10,10,15,0.85)', borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>T</div>
            <span className="font-bold text-base tracking-tight" style={{ color: '#f9fafb' }}>Tradyy</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            {['Features', 'Demo', 'How it works'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`} className="transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {item}
              </a>
            ))}
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}
          >
            Launch App <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-14 overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', transform: 'translate(-50%,-50%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)' }} />

        <div
          className="relative z-10 max-w-4xl transition-all duration-700"
          style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)' }}
        >
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6 border" style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live market data · 80+ assets tracked
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
            <span style={{ color: '#f9fafb' }}>Global Market</span>
            <br />
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Intelligence
            </span>
          </h1>

          <p className="text-base sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Real-time prices for crypto, stocks, ETFs & commodities. Live charts, currency conversion,
            AI-driven market signals, company profiles, and financial news — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}
            >
              <Zap size={15} />
              Launch Platform
            </Link>
            <a
              href="#demo"
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/10 border"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}
            >
              <Play size={13} />
              View Demo
            </a>
          </div>

          {/* Floating price cards */}
          <div className="flex flex-wrap justify-center gap-3">
            {MOCK_ASSETS.slice(0, 6).map((a, i) => (
              <PriceCard key={a.symbol} asset={a} delay={i * 300} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Ticker bar ── */}
      <TickerBar prices={MOCK_ASSETS} />

      {/* ── Stats ── */}
      <section className="py-16 px-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-black mb-1" style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {s.value}
              </p>
              <p className="text-sm font-semibold mb-0.5" style={{ color: '#f9fafb' }}>{s.label}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo Simulator ── */}
      <section id="demo" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6366f1' }}>Interactive Demo</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#f9fafb' }}>See it in action</h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Try the platform features below. Prices update in real time — just like the live app.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', boxShadow: '0 25px 80px rgba(0,0,0,0.6)' }}>
            {/* Browser chrome */}
            <div className="px-4 py-3 flex items-center gap-3 border-b" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {(['markets', 'converter', 'advice'] as DemoTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDemoTab(tab)}
                      className="px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all"
                      style={{
                        background: demoTab === tab ? 'rgba(99,102,241,0.3)' : 'transparent',
                        color: demoTab === tab ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
                        border: demoTab === tab ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                      }}
                    >
                      {tab === 'markets' ? 'Live Markets' : tab === 'converter' ? 'Converter' : 'Advice'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live
              </div>
            </div>

            {/* Demo content */}
            <div className="p-4 sm:p-6 min-h-[420px]">
              {demoTab === 'markets'   && <DemoMarkets />}
              {demoTab === 'converter' && <DemoConverter />}
              {demoTab === 'advice'    && <DemoAdvice />}
            </div>
          </div>

          <div className="text-center mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-white"
              style={{ color: '#818cf8' }}
            >
              Open the full platform <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6366f1' }}>Everything you need</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#f9fafb' }}>Powerful features, zero complexity</h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Every tool you need to track global markets, research companies, and stay ahead of price movements.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="p-5 rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}
                  >
                    <Icon size={18} style={{ color: '#818cf8' }} />
                  </div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: '#f9fafb' }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-20 px-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6366f1' }}>Simple by design</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#f9fafb' }}>How it works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(100%+0px)] w-full h-px" style={{ background: 'linear-gradient(to right, rgba(99,102,241,0.4), transparent)' }} />
                )}
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }}
                  >
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold mb-1.5" style={{ color: '#f9fafb' }}>{step.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Tradyy ── */}
      <section className="py-20 px-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#f9fafb' }}>Why Tradyy?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, title: 'No account required', desc: 'Your watchlist and alerts are stored locally in your browser. No sign-up, no data collection, no subscriptions.' },
              { icon: Globe,        title: 'Global coverage',    desc: 'Tracks assets across US, European, and Asian markets — stocks, indices, currencies, and commodities worldwide.' },
              { icon: Activity,    title: 'Always up to date',  desc: 'Crypto prices refresh every 30 seconds. Stock and ETF data updates every minute. News is curated continuously.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex flex-col items-center text-center p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(99,102,241,0.15)' }}>
                    <Icon size={20} style={{ color: '#818cf8' }} />
                  </div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: '#f9fafb' }}>{item.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-black mb-5" style={{ color: '#f9fafb' }}>
            Start tracking markets
            <br />
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>right now</span>
          </h2>
          <p className="text-base mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            No account. No credit card. Just open the platform and start exploring global markets.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', boxShadow: '0 0 40px rgba(99,102,241,0.35)' }}
            >
              <Zap size={16} />
              Launch Tradyy
            </Link>
            <Link
              href="/markets"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold border transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}
            >
              Browse Markets <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {['No sign-up', 'Free forever', 'Live data', '80+ assets'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check size={11} style={{ color: '#22c55e' }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-10 px-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>T</div>
            <span className="font-bold text-sm" style={{ color: '#f9fafb' }}>Tradyy</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-5 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Markets',   href: '/markets' },
              { label: 'Advice',    href: '/advice' },
              { label: 'Companies', href: '/companies' },
              { label: 'Converter', href: '/converter' },
              { label: 'News',      href: '/news' },
              { label: 'Settings',  href: '/settings' },
            ].map(({ label, href }) => (
              <Link key={href} href={href} className="hover:text-white transition-colors">{label}</Link>
            ))}
          </nav>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            © {new Date().getFullYear()} Tradyy. For informational use only.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-track {
          animation: ticker 28s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
