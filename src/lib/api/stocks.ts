import axios from 'axios';
import type { AssetPrice, OHLCVData } from '@/types/asset';

const YF_CHART = 'https://query1.finance.yahoo.com/v8/finance/chart';

const client = axios.create({
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  },
});

export const POPULAR_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'BRK-B',
  'JPM', 'V', 'JNJ', 'WMT', 'XOM', 'UNH', 'MA', 'HD', 'PG', 'CVX',
  'LLY', 'MRK', 'ABBV', 'KO', 'BAC', 'PFE', 'AVGO', 'COST', 'MCD',
  'TMO', 'CSCO', 'ACN', 'ABT', 'DHR', 'NEE', 'NKE', 'LIN', 'ORCL',
];

export const POPULAR_ETFS = [
  'SPY', 'QQQ', 'IWM', 'GLD', 'SLV', 'USO', 'TLT', 'EEM', 'VTI', 'VEA',
];

export const INDICES = [
  '^GSPC', '^IXIC', '^DJI', '^RUT', '^FTSE', '^N225', '^HSI', '^STOXX50E',
];

// Yahoo Finance futures symbols for commodities
export const COMMODITIES: { symbol: string; yf: string; name: string }[] = [
  { symbol: 'XAU', yf: 'GC=F',  name: 'Gold' },
  { symbol: 'XAG', yf: 'SI=F',  name: 'Silver' },
  { symbol: 'WTI', yf: 'CL=F',  name: 'WTI Crude Oil' },
  { symbol: 'BRENT', yf: 'BZ=F', name: 'Brent Crude' },
  { symbol: 'NATGAS', yf: 'NG=F', name: 'Natural Gas' },
  { symbol: 'XPT', yf: 'PL=F',  name: 'Platinum' },
  { symbol: 'XPD', yf: 'PA=F',  name: 'Palladium' },
  { symbol: 'COPPER', yf: 'HG=F', name: 'Copper' },
  { symbol: 'WHEAT', yf: 'ZW=F', name: 'Wheat' },
  { symbol: 'CORN', yf: 'ZC=F',  name: 'Corn' },
];

// Fetch a single symbol via v8/finance/chart (works for stocks, ETFs, indices, futures)
async function fetchQuote(yfSymbol: string, displaySymbol?: string): Promise<AssetPrice | null> {
  try {
    const { data } = await client.get(`${YF_CHART}/${encodeURIComponent(yfSymbol)}`, {
      params: { interval: '1d', range: '5d' },
    });

    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price: number = meta.regularMarketPrice ?? 0;
    const prevClose: number = meta.chartPreviousClose ?? meta.regularMarketPrice ?? 0;
    const change = price - prevClose;
    const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0;

    // Use displaySymbol if provided (e.g. 'XAU' instead of 'GC=F')
    const sym = displaySymbol || yfSymbol.replace('^', '').replace('=F', '');

    return {
      id: sym.toLowerCase(),
      symbol: sym,
      price,
      priceChange24h: change,
      priceChangePct24h: changePct,
      high24h: meta.regularMarketDayHigh ?? price,
      low24h: meta.regularMarketDayLow ?? price,
      volume24h: meta.regularMarketVolume ?? 0,
      lastUpdated: new Date().toISOString(),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
    };
  } catch {
    return null;
  }
}

// Fetch multiple symbols in parallel with bounded concurrency
async function batchFetchQuotes(
  entries: { yf: string; display?: string }[],
  concurrency = 6
): Promise<AssetPrice[]> {
  const results: AssetPrice[] = [];
  for (let i = 0; i < entries.length; i += concurrency) {
    const batch = entries.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((e) => fetchQuote(e.yf, e.display))
    );
    results.push(...(batchResults.filter(Boolean) as AssetPrice[]));
  }
  return results;
}

export async function getStockQuotes(symbols: string[]): Promise<AssetPrice[]> {
  return batchFetchQuotes(symbols.map((s) => ({ yf: s, display: s })));
}

export async function getCommodityPrices(): Promise<AssetPrice[]> {
  return batchFetchQuotes(
    COMMODITIES.map((c) => ({ yf: c.yf, display: c.symbol }))
  );
}

export async function getStockOHLCV(
  symbol: string,
  interval: string = '1d',
  range: string = '1y'
): Promise<OHLCVData[]> {
  try {
    const { data } = await client.get(`${YF_CHART}/${encodeURIComponent(symbol)}`, {
      params: { interval, range },
    });

    const chart = data?.chart?.result?.[0];
    if (!chart) return [];

    const timestamps: number[] = chart.timestamp || [];
    const quotes = chart.indicators?.quote?.[0] || {};

    return timestamps
      .map((t: number, i: number) => ({
        time: t,
        open: quotes.open?.[i] ?? 0,
        high: quotes.high?.[i] ?? 0,
        low: quotes.low?.[i] ?? 0,
        close: quotes.close?.[i] ?? 0,
        volume: quotes.volume?.[i] ?? 0,
      }))
      .filter((d) => d.close > 0);
  } catch {
    return [];
  }
}

// Map a display symbol back to its YF futures symbol for chart lookups
export function toYFSymbol(symbol: string): string {
  const commodity = COMMODITIES.find(
    (c) => c.symbol.toUpperCase() === symbol.toUpperCase()
  );
  return commodity ? commodity.yf : symbol;
}
