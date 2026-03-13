import axios from 'axios';
import type { AssetPrice, OHLCVData } from '@/types/asset';

// Yahoo Finance unofficial proxy via allorigins or similar
const YF_BASE = 'https://query1.finance.yahoo.com/v8/finance';
const YF_CHART = 'https://query1.finance.yahoo.com/v8/finance/chart';
const YF_QUOTE = 'https://query1.finance.yahoo.com/v7/finance/quote';

const client = axios.create({
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'User-Agent': 'Mozilla/5.0',
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

export async function getStockQuotes(symbols: string[]): Promise<AssetPrice[]> {
  try {
    const { data } = await client.get(`${YF_QUOTE}`, {
      params: {
        symbols: symbols.join(','),
        fields: 'regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,regularMarketDayHigh,regularMarketDayLow,marketCap,fiftyTwoWeekHigh,fiftyTwoWeekLow',
      },
    });

    const results = data?.quoteResponse?.result || [];
    return results.map((q: Record<string, number | string>) => {
      const change = (q.regularMarketChange as number) ?? 0;
      return {
        id: q.symbol as string,
        symbol: q.symbol as string,
        price: (q.regularMarketPrice as number) ?? 0,
        priceChange24h: change,
        priceChangePct24h: (q.regularMarketChangePercent as number) ?? 0,
        high24h: (q.regularMarketDayHigh as number) ?? 0,
        low24h: (q.regularMarketDayLow as number) ?? 0,
        volume24h: (q.regularMarketVolume as number) ?? 0,
        marketCap: (q.marketCap as number) ?? 0,
        lastUpdated: new Date().toISOString(),
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
      };
    });
  } catch {
    return [];
  }
}

export async function getStockOHLCV(
  symbol: string,
  interval: string = '1d',
  range: string = '1y'
): Promise<OHLCVData[]> {
  try {
    const { data } = await client.get(`${YF_CHART}/${symbol}`, {
      params: { interval, range },
    });

    const chart = data?.chart?.result?.[0];
    if (!chart) return [];

    const timestamps: number[] = chart.timestamp || [];
    const quotes = chart.indicators?.quote?.[0] || {};

    return timestamps.map((t: number, i: number) => ({
      time: t,
      open: quotes.open?.[i] ?? 0,
      high: quotes.high?.[i] ?? 0,
      low: quotes.low?.[i] ?? 0,
      close: quotes.close?.[i] ?? 0,
      volume: quotes.volume?.[i] ?? 0,
    })).filter((d) => d.close > 0);
  } catch {
    return [];
  }
}

export async function getStockInfo(symbol: string) {
  try {
    const { data } = await client.get(`${YF_BASE}/quoteSummary/${symbol}`, {
      params: {
        modules: 'summaryDetail,financialData,defaultKeyStatistics,assetProfile,recommendationTrend',
      },
    });

    const result = data?.quoteSummary?.result?.[0];
    if (!result) return null;

    const profile = result.assetProfile || {};
    const stats = result.defaultKeyStatistics || {};
    const financial = result.financialData || {};
    const detail = result.summaryDetail || {};

    return {
      description: profile.longBusinessSummary,
      sector: profile.sector,
      industry: profile.industry,
      employees: profile.fullTimeEmployees,
      website: profile.website,
      country: profile.country,
      peRatio: detail.trailingPE?.raw,
      forwardPE: detail.forwardPE?.raw,
      priceToBook: stats.priceToBook?.raw,
      enterpriseValue: stats.enterpriseValue?.raw,
      profitMargins: financial.profitMargins?.raw,
      revenueGrowth: financial.revenueGrowth?.raw,
      currentRatio: financial.currentRatio?.raw,
      returnOnEquity: financial.returnOnEquity?.raw,
      totalRevenue: financial.totalRevenue?.raw,
      totalCash: financial.totalCash?.raw,
      totalDebt: financial.totalDebt?.raw,
      dividendYield: detail.dividendYield?.raw,
      dividendRate: detail.dividendRate?.raw,
      beta: detail.beta?.raw,
      week52High: detail.fiftyTwoWeekHigh?.raw,
      week52Low: detail.fiftyTwoWeekLow?.raw,
      eps: stats.trailingEps?.raw,
      analystRating: financial.recommendationKey,
      priceTarget: financial.targetMeanPrice?.raw,
    };
  } catch {
    return null;
  }
}
