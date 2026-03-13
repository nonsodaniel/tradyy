import { NextRequest, NextResponse } from 'next/server';
import { getCryptoOHLCV } from '@/lib/api/coingecko';
import { getStockOHLCV, toYFSymbol } from '@/lib/api/stocks';

const chartCache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60_000;

function rangeToYFParams(range: string): { interval: string; range: string } {
  switch (range) {
    case '1m': return { interval: '1m', range: '1d' };
    case '5m': return { interval: '5m', range: '5d' };
    case '1h': return { interval: '60m', range: '1mo' };
    case '1D': return { interval: '1d', range: '1mo' };
    case '1W': return { interval: '1wk', range: '6mo' };
    case '1M': return { interval: '1mo', range: '5y' };
    case '1Y': return { interval: '1d', range: '1y' };
    case 'MAX': return { interval: '1mo', range: 'max' };
    default: return { interval: '1d', range: '1y' };
  }
}

function rangeToCGDays(range: string): number | 'max' {
  switch (range) {
    case '1m': return 1;
    case '5m': return 5;
    case '1h': return 14;
    case '1D': return 30;
    case '1W': return 90;
    case '1M': return 365;
    case '1Y': return 365;
    case 'MAX': return 'max';
    default: return 90;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const symbol = searchParams.get('symbol') || '';
  const range = searchParams.get('range') || '1Y';
  const assetClass = searchParams.get('type') || 'crypto';
  const coinId = searchParams.get('id') || symbol.toLowerCase();

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  const cacheKey = `chart-${symbol}-${range}-${assetClass}`;
  const cached = chartCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data, { headers: { 'X-Cache': 'HIT' } });
  }

  try {
    let data;
    if (assetClass === 'crypto') {
      const days = rangeToCGDays(range);
      data = await getCryptoOHLCV(coinId, days);
    } else {
      const { interval, range: yfRange } = rangeToYFParams(range);
      // Resolve commodity display symbols (e.g. XAU → GC=F) before querying YF
      const yfSymbol = toYFSymbol(symbol);
      data = await getStockOHLCV(yfSymbol, interval, yfRange);
    }

    chartCache.set(cacheKey, { data, ts: Date.now() });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 502 });
  }
}
