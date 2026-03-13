import { NextResponse } from 'next/server';
import { getGlobalStats } from '@/lib/api/coingecko';

let cache: { data: unknown; ts: number } | null = null;
const CACHE_TTL = 60_000;

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data, { headers: { 'X-Cache': 'HIT' } });
  }
  try {
    const data = await getGlobalStats();
    cache = { data, ts: Date.now() };
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch global stats' }, { status: 502 });
  }
}
