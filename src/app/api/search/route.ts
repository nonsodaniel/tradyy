import { NextRequest, NextResponse } from 'next/server';
import { searchCoins } from '@/lib/api/coingecko';

const STATIC_STOCKS = [
  { id: 'AAPL', symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'MSFT', symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', exchange: 'NASDAQ' },
  { id: 'GOOGL', symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'AMZN', symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'META', symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'TSLA', symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'NVDA', symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', exchange: 'NASDAQ' },
  { id: 'JPM', symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock', exchange: 'NYSE' },
  { id: 'V', symbol: 'V', name: 'Visa Inc.', type: 'stock', exchange: 'NYSE' },
  { id: 'JNJ', symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock', exchange: 'NYSE' },
  { id: 'WMT', symbol: 'WMT', name: 'Walmart Inc.', type: 'stock', exchange: 'NYSE' },
  { id: 'BRK-B', symbol: 'BRK-B', name: 'Berkshire Hathaway Inc.', type: 'stock', exchange: 'NYSE' },
  { id: 'XOM', symbol: 'XOM', name: 'Exxon Mobil Corporation', type: 'stock', exchange: 'NYSE' },
  { id: 'KO', symbol: 'KO', name: 'The Coca-Cola Company', type: 'stock', exchange: 'NYSE' },
  { id: 'DIS', symbol: 'DIS', name: 'The Walt Disney Company', type: 'stock', exchange: 'NYSE' },
  { id: 'NFLX', symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'AMD', symbol: 'AMD', name: 'Advanced Micro Devices', type: 'stock', exchange: 'NASDAQ' },
  { id: 'INTC', symbol: 'INTC', name: 'Intel Corporation', type: 'stock', exchange: 'NASDAQ' },
  { id: 'SPY', symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'etf', exchange: 'NYSE' },
  { id: 'QQQ', symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'etf', exchange: 'NASDAQ' },
  { id: 'GLD', symbol: 'GLD', name: 'SPDR Gold Shares', type: 'etf', exchange: 'NYSE' },
  { id: 'TLT', symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', type: 'etf', exchange: 'NASDAQ' },
  { id: '^GSPC', symbol: '^GSPC', name: 'S&P 500', type: 'index', exchange: 'INDEX' },
  { id: '^IXIC', symbol: '^IXIC', name: 'NASDAQ Composite', type: 'index', exchange: 'INDEX' },
  { id: '^DJI', symbol: '^DJI', name: 'Dow Jones Industrial Average', type: 'index', exchange: 'INDEX' },
  { id: '^N225', symbol: '^N225', name: 'Nikkei 225', type: 'index', exchange: 'INDEX' },
  { id: '^FTSE', symbol: '^FTSE', name: 'FTSE 100', type: 'index', exchange: 'INDEX' },
];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get('q')?.toLowerCase() || '';

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  const stockResults = STATIC_STOCKS.filter(
    (s) =>
      s.symbol.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query)
  ).slice(0, 5);

  try {
    const cryptoResults = await searchCoins(query);
    const cryptoMapped = cryptoResults.slice(0, 5).map((c) => ({
      id: c.id,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      type: 'crypto' as const,
      rank: c.market_cap_rank,
    }));

    return NextResponse.json([...stockResults, ...cryptoMapped]);
  } catch {
    return NextResponse.json(stockResults);
  }
}
