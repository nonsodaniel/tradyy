import { NextRequest, NextResponse } from 'next/server';
import { fetchFinancialNews } from '@/lib/api/news';

const newsCache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 300_000; // 5 min

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get('q') || 'finance stock market';
  const limit = parseInt(searchParams.get('limit') || '20');
  const cacheKey = `news-${query}-${limit}`;

  const cached = newsCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data, { headers: { 'X-Cache': 'HIT' } });
  }

  try {
    const articles = await fetchFinancialNews(query, limit);
    newsCache.set(cacheKey, { data: articles, ts: Date.now() });
    return NextResponse.json(articles, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 502 });
  }
}
