export type NewsSentiment = 'bullish' | 'bearish' | 'neutral';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: NewsSentiment;
  relatedSymbols: string[];
  imageUrl?: string;
  category?: string;
  region?: string;
}

export interface NewsFilter {
  symbols?: string[];
  sentiment?: NewsSentiment;
  region?: string;
  category?: string;
  limit?: number;
  offset?: number;
}
