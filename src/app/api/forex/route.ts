import { NextRequest, NextResponse } from 'next/server';
import { getLatestRates, convert } from '@/lib/api/forex';

const ratesCache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60_000; // 1 min

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const action = searchParams.get('action') || 'rates';
  const base = searchParams.get('base') || 'USD';
  const to = searchParams.get('to') || '';
  const amount = parseFloat(searchParams.get('amount') || '1');

  if (action === 'convert' && to) {
    try {
      const result = await convert(base, to, amount);
      return NextResponse.json(result);
    } catch {
      return NextResponse.json({ error: 'Conversion failed' }, { status: 502 });
    }
  }

  const cacheKey = `rates-${base}`;
  const cached = ratesCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: { 'X-Cache': 'HIT' },
    });
  }

  try {
    const rates = await getLatestRates(base);
    ratesCache.set(cacheKey, { data: rates, ts: Date.now() });
    return NextResponse.json(rates, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 502 });
  }
}
