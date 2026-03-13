export type AssetClass = 'stock' | 'crypto' | 'commodity' | 'etf' | 'index' | 'forex' | 'bond';

export type TrendDirection = 'up' | 'down' | 'flat';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  exchange?: string;
  currency: string;
  sector?: string;
  region?: string;
  logoUrl?: string;
}

export interface AssetPrice {
  id: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  priceChangePct24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap?: number;
  lastUpdated: string;
  trend: TrendDirection;
}

export interface AssetMetrics {
  id: string;
  symbol: string;
  marketCap?: number;
  enterpriseValue?: number;
  peRatio?: number;
  pbRatio?: number;
  psRatio?: number;
  ebitda?: number;
  eps?: number;
  dividendYield?: number;
  dividendPerShare?: number;
  revenue?: number;
  netIncome?: number;
  debtToEquity?: number;
  roe?: number;
  week52High?: number;
  week52Low?: number;
  avgVolume30d?: number;
  beta?: number;
  analystRating?: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  priceTarget?: number;
  industry?: string;
  employees?: number;
  description?: string;
  website?: string;
  ipoDate?: string;
}

export interface OHLCVData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartInterval {
  label: string;
  value: string;
  resolution: string;
}

export const CHART_INTERVALS: ChartInterval[] = [
  { label: '1m', value: '1m', resolution: '1' },
  { label: '5m', value: '5m', resolution: '5' },
  { label: '1h', value: '1h', resolution: '60' },
  { label: '1D', value: '1D', resolution: 'D' },
  { label: '1W', value: '1W', resolution: 'W' },
  { label: '1M', value: '1M', resolution: 'M' },
  { label: '1Y', value: '1Y', resolution: '365' },
  { label: 'MAX', value: 'MAX', resolution: 'MAX' },
];
