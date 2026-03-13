import axios from 'axios';
import type { ExchangeRate, ConversionResult } from '@/types/currency';

const BASE_URL = 'https://api.frankfurter.app';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: { Accept: 'application/json' },
});

export async function getLatestRates(base = 'USD'): Promise<ExchangeRate> {
  const { data } = await client.get('/latest', { params: { base } });
  return {
    base: data.base,
    rates: { ...data.rates, [data.base]: 1 },
    timestamp: Date.now(),
  };
}

export async function convert(
  from: string,
  to: string,
  amount: number
): Promise<ConversionResult> {
  const { data } = await client.get('/latest', {
    params: { from, to, amount },
  });

  const rate = data.rates[to];
  return {
    from,
    to,
    amount,
    result: data.rates[to],
    rate,
    timestamp: Date.now(),
  };
}

export async function getHistoricalRates(
  base: string,
  start: string,
  end: string,
  symbols?: string[]
): Promise<Record<string, Record<string, number>>> {
  const { data } = await client.get(`/${start}..${end}`, {
    params: {
      base,
      ...(symbols ? { to: symbols.join(',') } : {}),
    },
  });
  return data.rates;
}

export async function getSupportedCurrencies(): Promise<Record<string, string>> {
  const { data } = await client.get('/currencies');
  return data;
}
