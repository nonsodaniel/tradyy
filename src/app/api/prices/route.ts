import { NextRequest, NextResponse } from 'next/server';
import { getTopCryptos, getCryptoPrices } from '@/lib/api/coingecko';
import { getStockQuotes, POPULAR_STOCKS, POPULAR_ETFS, INDICES } from '@/lib/api/stocks';
import type { AssetPrice } from '@/types/asset';

const cache = new Map<string, { data: AssetPrice[]; ts: number }>();
const CACHE_TTL = 30_000; // 30s

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get('type') || 'crypto';
  const symbols = searchParams.get('symbols')?.split(',') || [];
  const cacheKey = `${type}-${symbols.join(',')}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    let data: AssetPrice[] = [];

    if (type === 'crypto') {
      data = await getTopCryptos(50, 'usd');
    } else if (type === 'stock') {
      const toFetch = symbols.length > 0 ? symbols : POPULAR_STOCKS.slice(0, 20);
      data = await getStockQuotes(toFetch);
    } else if (type === 'etf') {
      data = await getStockQuotes(POPULAR_ETFS);
    } else if (type === 'index') {
      data = await getStockQuotes(INDICES);
    } else if (type === 'mixed') {
      const [cryptos, stocks] = await Promise.allSettled([
        getTopCryptos(10, 'usd'),
        getStockQuotes(POPULAR_STOCKS.slice(0, 10)),
      ]);
      if (cryptos.status === 'fulfilled') data.push(...cryptos.value);
      if (stocks.status === 'fulfilled') data.push(...stocks.value);
    }

    cache.set(cacheKey, { data, ts: Date.now() });

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 502 });
  }
}
