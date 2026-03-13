'use client';
import { useState } from 'react';
import NewsFeed from '@/components/news/NewsFeed';
import { Card } from '@/components/ui/Card';
import clsx from 'clsx';

const TOPICS = [
  { key: 'finance stock market', label: 'All Markets' },
  { key: 'cryptocurrency bitcoin', label: 'Crypto' },
  { key: 'stock earnings technology', label: 'Stocks' },
  { key: 'commodities gold oil', label: 'Commodities' },
  { key: 'forex currency exchange rate', label: 'Forex' },
  { key: 'federal reserve interest rate', label: 'Macro' },
];

export default function NewsPage() {
  const [topic, setTopic] = useState(TOPICS[0].key);

  return (
    <div className="space-y-4 max-w-screen-xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
          Financial News
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Real-time news from global financial markets
        </p>
      </div>

      {/* Topic filters */}
      <div className="flex flex-wrap gap-2">
        {TOPICS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTopic(t.key)}
            className={clsx(
              'px-3 py-1.5 rounded text-sm font-medium transition-fast',
              topic === t.key
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <Card>
            <NewsFeed limit={20} query={topic} />
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              Trending
            </h3>
            <NewsFeed limit={5} query="trending stocks crypto" compact />
          </Card>
          <Card>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              Earnings
            </h3>
            <NewsFeed limit={4} query="earnings results quarterly" compact />
          </Card>
        </div>
      </div>
    </div>
  );
}
