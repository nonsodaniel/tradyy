'use client';
import useSWR from 'swr';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle,
  Zap, ShieldCheck, BarChart2, Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, PctBadge } from '@/components/ui/Badge';
import { LoadingSkeleton } from '@/components/ui/Spinner';
import { formatCompact } from '@/lib/formatters';
import type { AssetPrice } from '@/types/asset';
import clsx from 'clsx';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Signal = 'strong_buy' | 'buy' | 'hold' | 'watch' | 'caution';

interface Recommendation {
  asset: AssetPrice;
  signal: Signal;
  reason: string;
  risk: 'low' | 'medium' | 'high';
  assetType: string;
}

function computeSignal(asset: AssetPrice): { signal: Signal; reason: string; risk: 'low' | 'medium' | 'high' } {
  const pct = asset.priceChangePct24h ?? 0;
  const absPct = Math.abs(pct);

  const risk: 'low' | 'medium' | 'high' =
    absPct > 8 ? 'high' : absPct > 3 ? 'medium' : 'low';

  if (pct >= 6) return { signal: 'strong_buy', reason: `Up ${pct.toFixed(1)}% — strong 24h momentum`, risk };
  if (pct >= 3) return { signal: 'buy', reason: `Up ${pct.toFixed(1)}% — positive trend`, risk };
  if (pct >= -1) return { signal: 'hold', reason: `${pct.toFixed(1)}% — consolidating near current price`, risk };
  if (pct >= -5) return { signal: 'watch', reason: `Down ${Math.abs(pct).toFixed(1)}% — potential dip opportunity`, risk };
  return { signal: 'caution', reason: `Down ${Math.abs(pct).toFixed(1)}% — significant selling pressure`, risk };
}

const SIGNAL_STYLES: Record<Signal, { label: string; color: string; bg: string }> = {
  strong_buy: { label: 'Strong Buy', color: 'var(--up)',     bg: 'var(--up-bg)' },
  buy:        { label: 'Buy',         color: 'var(--up)',     bg: 'var(--up-bg)' },
  hold:       { label: 'Hold',        color: 'var(--muted)',  bg: 'var(--surface-2)' },
  watch:      { label: 'Watch',       color: '#f59e0b',       bg: '#fef3c7' },
  caution:    { label: 'Caution',     color: 'var(--down)',   bg: 'var(--down-bg)' },
};

const RISK_LABEL: Record<string, string> = { low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk' };
const RISK_COLOR: Record<string, string> = { low: 'var(--up)', medium: '#f59e0b', high: 'var(--down)' };

const MARKET_TIPS = [
  {
    icon: ShieldCheck,
    title: 'Diversify your exposure',
    body: 'Spreading across asset classes (crypto, equities, commodities) reduces concentration risk. No single asset should dominate your strategy.',
  },
  {
    icon: BarChart2,
    title: 'Watch volume, not just price',
    body: 'A price move backed by high volume is more meaningful than a low-volume spike. Volume confirms the conviction behind a move.',
  },
  {
    icon: Zap,
    title: 'Momentum follows trend',
    body: 'Assets with consistent positive price action tend to continue outperforming in the short term. Trend-following beats trying to catch exact bottoms.',
  },
  {
    icon: AlertTriangle,
    title: 'Set stop-losses in advance',
    body: 'Decide your maximum acceptable loss before entering a position. Emotion-driven decisions during drawdowns are the #1 cause of avoidable losses.',
  },
];

export default function AdvicePage() {
  const { data: cryptos, isLoading: loadingCrypto } = useSWR<AssetPrice[]>(
    '/api/prices?type=crypto', fetcher, { refreshInterval: 30_000 }
  );
  const { data: stocks, isLoading: loadingStocks } = useSWR<AssetPrice[]>(
    '/api/prices?type=stock', fetcher, { refreshInterval: 60_000 }
  );
  const { data: etfs } = useSWR<AssetPrice[]>(
    '/api/prices?type=etf', fetcher, { refreshInterval: 60_000 }
  );

  const isLoading = loadingCrypto || loadingStocks;

  const allPrices = [
    ...(cryptos || []).map((a) => ({ ...a, _type: 'crypto' })),
    ...(stocks || []).map((a) => ({ ...a, _type: 'stock' })),
    ...(etfs || []).map((a) => ({ ...a, _type: 'etf' })),
  ];

  // Compute market sentiment
  const gainers = allPrices.filter((a) => (a.priceChangePct24h ?? 0) > 0).length;
  const losers  = allPrices.filter((a) => (a.priceChangePct24h ?? 0) < 0).length;
  const total = gainers + losers;
  const gainerRatio = total > 0 ? gainers / total : 0.5;
  const sentiment = gainerRatio > 0.6 ? 'Bullish' : gainerRatio < 0.4 ? 'Bearish' : 'Neutral';
  const sentimentColor = sentiment === 'Bullish' ? 'var(--up)' : sentiment === 'Bearish' ? 'var(--down)' : 'var(--muted)';

  // Build recommendations
  const recommendations: Recommendation[] = allPrices
    .filter((a) => (a.price ?? 0) > 0)
    .map((a) => {
      const { signal, reason, risk } = computeSignal(a);
      return { asset: a, signal, reason, risk, assetType: a._type };
    });

  const strongBuys   = recommendations.filter((r) => r.signal === 'strong_buy').slice(0, 5);
  const buys         = recommendations.filter((r) => r.signal === 'buy').slice(0, 5);
  const dipWatches   = recommendations.filter((r) => r.signal === 'watch').slice(0, 5);

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
          Market Insights & Advice
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Signals computed from live market data. For informational purposes only — not financial advice.
        </p>
      </div>

      {/* Disclaimer */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-lg text-sm"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <Info size={15} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
        <p style={{ color: 'var(--muted)' }}>
          Signals are computed algorithmically from 24h price movement and volume data. They do not
          constitute investment advice. Always do your own research and consider your risk tolerance
          before making any trading decisions.
        </p>
      </div>

      {/* Market Sentiment */}
      {!isLoading && allPrices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Market Sentiment</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Overall Mood</p>
              <p className="text-xl font-bold" style={{ color: sentimentColor }}>{sentiment}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Gainers</p>
              <p className="text-xl font-bold" style={{ color: 'var(--up)' }}>{gainers}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Losers</p>
              <p className="text-xl font-bold" style={{ color: 'var(--down)' }}>{losers}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Assets Tracked</p>
              <p className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{allPrices.length}</p>
            </div>
          </div>
          {/* Sentiment bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--muted)' }}>
              <span>Bearish</span>
              <span>Neutral</span>
              <span>Bullish</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${gainerRatio * 100}%`,
                  background: gainerRatio > 0.6 ? 'var(--up)' : gainerRatio < 0.4 ? 'var(--down)' : '#f59e0b',
                }}
              />
            </div>
            <p className="text-xs mt-1.5 text-right" style={{ color: 'var(--muted)' }}>
              {(gainerRatio * 100).toFixed(0)}% of tracked assets are up today
            </p>
          </div>
        </Card>
      )}

      {/* Recommendation columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RecommendationColumn title="Strong Momentum" icon={TrendingUp} color="var(--up)" items={strongBuys} isLoading={isLoading} emptyText="No strong momentum signals right now." />
        <RecommendationColumn title="Positive Trend"  icon={TrendingUp} color="#22d3ee" items={buys}        isLoading={isLoading} emptyText="No buy signals right now." />
        <RecommendationColumn title="Dip Opportunities" icon={TrendingDown} color="#f59e0b" items={dipWatches} isLoading={isLoading} emptyText="No dip opportunities right now." />
      </div>

      {/* Full signal table */}
      {!isLoading && recommendations.length > 0 && (
        <Card padding={false}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              All Signals
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {recommendations
              .sort((a, b) => (b.asset.priceChangePct24h ?? 0) - (a.asset.priceChangePct24h ?? 0))
              .slice(0, 30)
              .map(({ asset, signal, reason, risk, assetType }) => {
                const ss = SIGNAL_STYLES[signal];
                return (
                  <Link
                    key={asset.id}
                    href={assetType === 'crypto' ? `/asset/crypto/${asset.id}` : `/asset/${assetType}/${asset.id}`}
                    className="flex items-center px-4 py-3 hover:bg-[var(--surface-2)] transition-fast gap-3"
                  >
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
                    >
                      {asset.symbol.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                          {asset.symbol}
                        </span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded font-medium"
                          style={{ background: ss.bg, color: ss.color }}
                        >
                          {ss.label}
                        </span>
                      </div>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted)' }}>{reason}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <PctBadge value={asset.priceChangePct24h} />
                      <p className="text-xs mt-0.5" style={{ color: RISK_COLOR[risk] }}>{RISK_LABEL[risk]}</p>
                    </div>
                  </Link>
                );
              })}
          </div>
        </Card>
      )}

      {/* Market tips */}
      <div>
        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
          Trading Principles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MARKET_TIPS.map((tip) => {
            const Icon = tip.icon;
            return (
              <div
                key={tip.title}
                className="flex gap-3 p-4 rounded-lg"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--surface-2)' }}
                >
                  <Icon size={15} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{tip.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{tip.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RecommendationColumn({
  title, icon: Icon, color, items, isLoading, emptyText,
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  items: Recommendation[];
  isLoading: boolean;
  emptyText: string;
}) {
  return (
    <Card padding={false}>
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <Icon size={14} style={{ color }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h3>
      </div>
      <div className="p-3 space-y-2">
        {isLoading ? (
          [...Array(4)].map((_, i) => <LoadingSkeleton key={i} className="h-12 rounded-md" />)
        ) : items.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: 'var(--muted)' }}>{emptyText}</p>
        ) : (
          items.map(({ asset, signal, reason, risk, assetType }) => {
            const ss = SIGNAL_STYLES[signal];
            return (
              <Link
                key={asset.id}
                href={assetType === 'crypto' ? `/asset/crypto/${asset.id}` : `/asset/${assetType}/${asset.id}`}
                className="flex items-center justify-between gap-2 p-2.5 rounded-md hover:bg-[var(--surface-2)] transition-fast"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {asset.symbol}
                    </span>
                    <span className="text-xs capitalize" style={{ color: 'var(--muted)' }}>
                      {assetType}
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{reason}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <PctBadge value={asset.priceChangePct24h} />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
