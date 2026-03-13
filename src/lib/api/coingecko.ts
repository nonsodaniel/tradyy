import axios from 'axios';
import type { AssetPrice, OHLCVData } from '@/types/asset';

const BASE_URL = 'https://api.coingecko.com/api/v3';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { Accept: 'application/json' },
});

export interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  last_updated: string;
}

export async function getCryptoPrices(
  ids: string[],
  vsCurrency = 'usd'
): Promise<AssetPrice[]> {
  const { data } = await client.get<CoinGeckoCoin[]>('/coins/markets', {
    params: {
      vs_currency: vsCurrency,
      ids: ids.join(','),
      order: 'market_cap_desc',
      per_page: ids.length || 50,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h',
    },
  });

  return data.map((coin) => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    price: coin.current_price,
    priceChange24h: coin.price_change_24h,
    priceChangePct24h: coin.price_change_percentage_24h,
    high24h: coin.high_24h,
    low24h: coin.low_24h,
    volume24h: coin.total_volume,
    marketCap: coin.market_cap,
    lastUpdated: coin.last_updated,
    trend: coin.price_change_24h > 0 ? 'up' : coin.price_change_24h < 0 ? 'down' : 'flat',
  }));
}

export async function getTopCryptos(limit = 50, vsCurrency = 'usd'): Promise<AssetPrice[]> {
  const { data } = await client.get<CoinGeckoCoin[]>('/coins/markets', {
    params: {
      vs_currency: vsCurrency,
      order: 'market_cap_desc',
      per_page: limit,
      page: 1,
      sparkline: false,
    },
  });

  return data.map((coin) => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    price: coin.current_price,
    priceChange24h: coin.price_change_24h,
    priceChangePct24h: coin.price_change_percentage_24h,
    high24h: coin.high_24h,
    low24h: coin.low_24h,
    volume24h: coin.total_volume,
    marketCap: coin.market_cap,
    lastUpdated: coin.last_updated,
    trend: coin.price_change_24h > 0 ? 'up' : coin.price_change_24h < 0 ? 'down' : 'flat',
  }));
}

export async function getCryptoOHLCV(
  id: string,
  days: number | 'max' = 30,
  vsCurrency = 'usd'
): Promise<OHLCVData[]> {
  const { data } = await client.get(`/coins/${id}/ohlc`, {
    params: { vs_currency: vsCurrency, days },
  });

  return (data as number[][]).map(([time, open, high, low, close]) => ({
    time: Math.floor(time / 1000),
    open,
    high,
    low,
    close,
    volume: 0,
  }));
}

export async function searchCoins(query: string) {
  const { data } = await client.get('/search', { params: { query } });
  return data.coins as Array<{
    id: string;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
  }>;
}

export async function getGlobalStats() {
  const { data } = await client.get('/global');
  return data.data as {
    total_market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    market_cap_percentage: Record<string, number>;
    market_cap_change_percentage_24h_usd: number;
    active_cryptocurrencies: number;
  };
}
