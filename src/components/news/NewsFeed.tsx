'use client';
import useSWR from 'swr';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { LoadingSkeleton } from '@/components/ui/Spinner';
import { formatRelativeTime } from '@/lib/formatters';
import type { NewsArticle, NewsSentiment } from '@/types/news';
import clsx from 'clsx';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function sentimentVariant(s: NewsSentiment): 'up' | 'down' | 'neutral' {
  if (s === 'bullish') return 'up';
  if (s === 'bearish') return 'down';
  return 'neutral';
}

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <article
      className="py-3.5 group hover:bg-[var(--surface-2)] rounded px-2 -mx-2 transition-fast cursor-pointer"
      onClick={() => window.open(article.url, '_blank', 'noopener')}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium leading-snug mb-1.5 group-hover:text-[var(--accent)] transition-fast line-clamp-2"
            style={{ color: 'var(--foreground)' }}>
            {article.title}
          </h4>
          <p className="text-xs leading-relaxed mb-2 line-clamp-2" style={{ color: 'var(--muted)' }}>
            {article.summary}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              {article.source}
            </span>
            <span className="text-xs" style={{ color: 'var(--muted-fg)' }}>·</span>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              {formatRelativeTime(article.publishedAt)}
            </span>
            <Badge variant={sentimentVariant(article.sentiment)} className="capitalize">
              {article.sentiment}
            </Badge>
            {article.relatedSymbols.slice(0, 3).map((sym) => (
              <Badge key={sym} variant="info">{sym}</Badge>
            ))}
          </div>
        </div>
        <ExternalLink
          size={12}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-fast mt-0.5"
          style={{ color: 'var(--muted)' }}
        />
      </div>
    </article>
  );
}

interface Props {
  limit?: number;
  query?: string;
  compact?: boolean;
}

export default function NewsFeed({ limit = 12, query = 'finance stock market', compact = false }: Props) {
  const { data, isLoading } = useSWR<NewsArticle[]>(
    `/api/news?q=${encodeURIComponent(query)}&limit=${limit}`,
    fetcher,
    { refreshInterval: 5 * 60_000 }
  );

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        {Array.from({ length: compact ? 4 : 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <LoadingSkeleton className="h-4 w-3/4" />
            <LoadingSkeleton className="h-3 w-full" />
            <LoadingSkeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  const articles = data || [];

  return (
    <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
      {articles.length === 0 && (
        <p className="py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
          No news articles available.
        </p>
      )}
    </div>
  );
}
