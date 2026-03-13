import { NextRequest, NextResponse } from 'next/server';
import { searchCoins } from '@/lib/api/coingecko';

interface StaticAsset {
  id: string;
  symbol: string;
  name: string;
  type: string;
  exchange?: string;
}

const STATIC_ASSETS: StaticAsset[] = [
  // ── US Mega Cap Stocks ──────────────────────────────────────────────────────
  { id: 'AAPL', symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'MSFT', symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', exchange: 'NASDAQ' },
  { id: 'GOOGL', symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)', type: 'stock', exchange: 'NASDAQ' },
  { id: 'GOOG', symbol: 'GOOG', name: 'Alphabet Inc. (Class C)', type: 'stock', exchange: 'NASDAQ' },
  { id: 'AMZN', symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'META', symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'TSLA', symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'NVDA', symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', exchange: 'NASDAQ' },
  { id: 'BRK-B', symbol: 'BRK-B', name: 'Berkshire Hathaway Inc. Class B', type: 'stock', exchange: 'NYSE' },
  { id: 'JPM', symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock', exchange: 'NYSE' },
  { id: 'V', symbol: 'V', name: 'Visa Inc.', type: 'stock', exchange: 'NYSE' },
  { id: 'JNJ', symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock', exchange: 'NYSE' },
  { id: 'WMT', symbol: 'WMT', name: 'Walmart Inc.', type: 'stock', exchange: 'NYSE' },
  { id: 'XOM', symbol: 'XOM', name: 'Exxon Mobil Corporation', type: 'stock', exchange: 'NYSE' },
  { id: 'UNH', symbol: 'UNH', name: 'UnitedHealth Group Inc.', type: 'stock', exchange: 'NYSE' },
  { id: 'MA', symbol: 'MA', name: 'Mastercard Inc.', type: 'stock', exchange: 'NYSE' },
  { id: 'HD', symbol: 'HD', name: 'The Home Depot Inc.', type: 'stock', exchange: 'NYSE' },
  { id: 'PG', symbol: 'PG', name: 'Procter & Gamble Co.', type: 'stock', exchange: 'NYSE' },
  { id: 'CVX', symbol: 'CVX', name: 'Chevron Corporation', type: 'stock', exchange: 'NYSE' },
  { id: 'LLY', symbol: 'LLY', name: 'Eli Lilly and Company', type: 'stock', exchange: 'NYSE' },
  { id: 'MRK', symbol: 'MRK', name: 'Merck & Co. Inc.', type: 'stock', exchange: 'NYSE' },
  { id: 'ABBV', symbol: 'ABBV', name: 'AbbVie Inc.', type: 'stock', exchange: 'NYSE' },
  { id: 'KO', symbol: 'KO', name: 'The Coca-Cola Company', type: 'stock', exchange: 'NYSE' },
  { id: 'BAC', symbol: 'BAC', name: 'Bank of America Corp.', type: 'stock', exchange: 'NYSE' },
  { id: 'PFE', symbol: 'PFE', name: 'Pfizer Inc.', type: 'stock', exchange: 'NYSE' },
  { id: 'AVGO', symbol: 'AVGO', name: 'Broadcom Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'COST', symbol: 'COST', name: 'Costco Wholesale Corporation', type: 'stock', exchange: 'NASDAQ' },
  { id: 'MCD', symbol: 'MCD', name: "McDonald's Corporation", type: 'stock', exchange: 'NYSE' },
  { id: 'CSCO', symbol: 'CSCO', name: 'Cisco Systems Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'ACN', symbol: 'ACN', name: 'Accenture plc', type: 'stock', exchange: 'NYSE' },
  { id: 'ABT', symbol: 'ABT', name: 'Abbott Laboratories', type: 'stock', exchange: 'NYSE' },
  { id: 'NEE', symbol: 'NEE', name: 'NextEra Energy Inc.', type: 'stock', exchange: 'NYSE' },
  { id: 'NKE', symbol: 'NKE', name: 'Nike Inc.', type: 'stock', exchange: 'NYSE' },
  { id: 'ORCL', symbol: 'ORCL', name: 'Oracle Corporation', type: 'stock', exchange: 'NYSE' },
  { id: 'DIS', symbol: 'DIS', name: 'The Walt Disney Company', type: 'stock', exchange: 'NYSE' },
  { id: 'NFLX', symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'ADBE', symbol: 'ADBE', name: 'Adobe Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'AMD', symbol: 'AMD', name: 'Advanced Micro Devices Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'INTC', symbol: 'INTC', name: 'Intel Corporation', type: 'stock', exchange: 'NASDAQ' },
  { id: 'QCOM', symbol: 'QCOM', name: 'Qualcomm Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'PYPL', symbol: 'PYPL', name: 'PayPal Holdings Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'CRM', symbol: 'CRM', name: 'Salesforce Inc.', type: 'stock', exchange: 'NYSE' },
  { id: 'UBER', symbol: 'UBER', name: 'Uber Technologies Inc.', type: 'stock', exchange: 'NYSE' },
  { id: 'LYFT', symbol: 'LYFT', name: 'Lyft Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'SHOP', symbol: 'SHOP', name: 'Shopify Inc.', type: 'stock', exchange: 'NYSE' },
  { id: 'SQ', symbol: 'SQ', name: 'Block Inc.', type: 'stock', exchange: 'NYSE' },
  { id: 'COIN', symbol: 'COIN', name: 'Coinbase Global Inc.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'PLTR', symbol: 'PLTR', name: 'Palantir Technologies', type: 'stock', exchange: 'NYSE' },
  { id: 'SNOW', symbol: 'SNOW', name: 'Snowflake Inc.', type: 'stock', exchange: 'NYSE' },
  { id: 'SPOT', symbol: 'SPOT', name: 'Spotify Technology S.A.', type: 'stock', exchange: 'NYSE' },

  // ── International Stocks ────────────────────────────────────────────────────
  { id: 'TSM', symbol: 'TSM', name: 'Taiwan Semiconductor Mfg. Co.', type: 'stock', exchange: 'NYSE ADR' },
  { id: 'BABA', symbol: 'BABA', name: 'Alibaba Group Holding Ltd.', type: 'stock', exchange: 'NYSE ADR' },
  { id: 'ASML', symbol: 'ASML', name: 'ASML Holding N.V.', type: 'stock', exchange: 'NASDAQ' },
  { id: 'SAP', symbol: 'SAP', name: 'SAP SE', type: 'stock', exchange: 'NYSE ADR' },
  { id: 'SONY', symbol: 'SONY', name: 'Sony Group Corporation', type: 'stock', exchange: 'NYSE ADR' },
  { id: 'NVO', symbol: 'NVO', name: 'Novo Nordisk A/S', type: 'stock', exchange: 'NYSE ADR' },
  { id: 'HSBC', symbol: 'HSBC', name: 'HSBC Holdings plc', type: 'stock', exchange: 'NYSE ADR' },
  { id: 'BP', symbol: 'BP', name: 'BP plc', type: 'stock', exchange: 'NYSE ADR' },
  { id: 'RIO', symbol: 'RIO', name: 'Rio Tinto Group', type: 'stock', exchange: 'NYSE ADR' },
  { id: 'BHP', symbol: 'BHP', name: 'BHP Group Limited', type: 'stock', exchange: 'NYSE ADR' },
  { id: 'TM', symbol: 'TM', name: 'Toyota Motor Corporation', type: 'stock', exchange: 'NYSE ADR' },
  { id: 'NESN', symbol: 'NESN', name: 'Nestlé S.A.', type: 'stock', exchange: 'SWX' },

  // ── ETFs ────────────────────────────────────────────────────────────────────
  { id: 'SPY', symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'etf', exchange: 'NYSE' },
  { id: 'QQQ', symbol: 'QQQ', name: 'Invesco QQQ Trust (NASDAQ 100)', type: 'etf', exchange: 'NASDAQ' },
  { id: 'IWM', symbol: 'IWM', name: 'iShares Russell 2000 ETF', type: 'etf', exchange: 'NYSE' },
  { id: 'GLD', symbol: 'GLD', name: 'SPDR Gold Shares ETF', type: 'etf', exchange: 'NYSE' },
  { id: 'SLV', symbol: 'SLV', name: 'iShares Silver Trust ETF', type: 'etf', exchange: 'NYSE' },
  { id: 'USO', symbol: 'USO', name: 'United States Oil Fund LP', type: 'etf', exchange: 'NYSE' },
  { id: 'TLT', symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', type: 'etf', exchange: 'NASDAQ' },
  { id: 'EEM', symbol: 'EEM', name: 'iShares MSCI Emerging Markets ETF', type: 'etf', exchange: 'NYSE' },
  { id: 'VTI', symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'etf', exchange: 'NYSE' },
  { id: 'VEA', symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', type: 'etf', exchange: 'NYSE' },
  { id: 'ARKK', symbol: 'ARKK', name: 'ARK Innovation ETF', type: 'etf', exchange: 'NYSE' },
  { id: 'XLF', symbol: 'XLF', name: 'Financial Select Sector SPDR Fund', type: 'etf', exchange: 'NYSE' },
  { id: 'XLE', symbol: 'XLE', name: 'Energy Select Sector SPDR Fund', type: 'etf', exchange: 'NYSE' },
  { id: 'XLK', symbol: 'XLK', name: 'Technology Select Sector SPDR Fund', type: 'etf', exchange: 'NYSE' },

  // ── Indices ─────────────────────────────────────────────────────────────────
  { id: '^GSPC', symbol: 'SPX', name: 'S&P 500 Index', type: 'index', exchange: 'INDEX' },
  { id: '^IXIC', symbol: 'NDX', name: 'NASDAQ Composite', type: 'index', exchange: 'INDEX' },
  { id: '^DJI', symbol: 'DJI', name: 'Dow Jones Industrial Average', type: 'index', exchange: 'INDEX' },
  { id: '^RUT', symbol: 'RUT', name: 'Russell 2000 Index', type: 'index', exchange: 'INDEX' },
  { id: '^N225', symbol: 'N225', name: 'Nikkei 225', type: 'index', exchange: 'TSE' },
  { id: '^FTSE', symbol: 'FTSE', name: 'FTSE 100', type: 'index', exchange: 'LSE' },
  { id: '^STOXX50E', symbol: 'SX5E', name: 'Euro Stoxx 50', type: 'index', exchange: 'EURONEXT' },
  { id: '^HSI', symbol: 'HSI', name: 'Hang Seng Index', type: 'index', exchange: 'HKEX' },
  { id: '^SSEC', symbol: 'SSEC', name: 'Shanghai Composite', type: 'index', exchange: 'SSE' },
  { id: '^BSESN', symbol: 'SENSEX', name: 'S&P BSE SENSEX', type: 'index', exchange: 'BSE' },
  { id: '^AXJO', symbol: 'ASX200', name: 'S&P/ASX 200', type: 'index', exchange: 'ASX' },
  { id: '^DAX', symbol: 'DAX', name: 'DAX Performance Index', type: 'index', exchange: 'XETRA' },
  { id: '^CAC40', symbol: 'CAC40', name: 'CAC 40', type: 'index', exchange: 'EURONEXT' },

  // ── Commodities ─────────────────────────────────────────────────────────────
  { id: 'GC=F', symbol: 'XAU', name: 'Gold (Spot)', type: 'commodity', exchange: 'COMEX' },
  { id: 'SI=F', symbol: 'XAG', name: 'Silver (Spot)', type: 'commodity', exchange: 'COMEX' },
  { id: 'CL=F', symbol: 'WTI', name: 'Crude Oil WTI (Spot)', type: 'commodity', exchange: 'NYMEX' },
  { id: 'BZ=F', symbol: 'BRENT', name: 'Brent Crude Oil', type: 'commodity', exchange: 'ICE' },
  { id: 'NG=F', symbol: 'NATGAS', name: 'Natural Gas (Spot)', type: 'commodity', exchange: 'NYMEX' },
  { id: 'PL=F', symbol: 'XPT', name: 'Platinum (Spot)', type: 'commodity', exchange: 'COMEX' },
  { id: 'PA=F', symbol: 'XPD', name: 'Palladium (Spot)', type: 'commodity', exchange: 'COMEX' },
  { id: 'HG=F', symbol: 'COPPER', name: 'Copper (Spot)', type: 'commodity', exchange: 'COMEX' },
  { id: 'ZW=F', symbol: 'WHEAT', name: 'Wheat Futures', type: 'commodity', exchange: 'CBOT' },
  { id: 'ZC=F', symbol: 'CORN', name: 'Corn Futures', type: 'commodity', exchange: 'CBOT' },
  { id: 'ZS=F', symbol: 'SOYBEAN', name: 'Soybean Futures', type: 'commodity', exchange: 'CBOT' },
  { id: 'CC=F', symbol: 'COCOA', name: 'Cocoa Futures', type: 'commodity', exchange: 'ICE' },
  { id: 'KC=F', symbol: 'COFFEE', name: 'Coffee Futures', type: 'commodity', exchange: 'ICE' },
  { id: 'CT=F', symbol: 'COTTON', name: 'Cotton Futures', type: 'commodity', exchange: 'ICE' },

  // ── Forex Pairs ─────────────────────────────────────────────────────────────
  { id: 'EURUSD=X', symbol: 'EUR/USD', name: 'Euro / US Dollar', type: 'forex', exchange: 'FX' },
  { id: 'GBPUSD=X', symbol: 'GBP/USD', name: 'British Pound / US Dollar', type: 'forex', exchange: 'FX' },
  { id: 'USDJPY=X', symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', type: 'forex', exchange: 'FX' },
  { id: 'USDCHF=X', symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', type: 'forex', exchange: 'FX' },
  { id: 'AUDUSD=X', symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', type: 'forex', exchange: 'FX' },
  { id: 'USDCAD=X', symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', type: 'forex', exchange: 'FX' },
  { id: 'NZDUSD=X', symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', type: 'forex', exchange: 'FX' },
  { id: 'EURGBP=X', symbol: 'EUR/GBP', name: 'Euro / British Pound', type: 'forex', exchange: 'FX' },
  { id: 'EURJPY=X', symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', type: 'forex', exchange: 'FX' },
  { id: 'GBPJPY=X', symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', type: 'forex', exchange: 'FX' },
  { id: 'USDCNY=X', symbol: 'USD/CNY', name: 'US Dollar / Chinese Yuan', type: 'forex', exchange: 'FX' },
  { id: 'USDINR=X', symbol: 'USD/INR', name: 'US Dollar / Indian Rupee', type: 'forex', exchange: 'FX' },
  { id: 'USDNGN=X', symbol: 'USD/NGN', name: 'US Dollar / Nigerian Naira', type: 'forex', exchange: 'FX' },
  { id: 'USDBRL=X', symbol: 'USD/BRL', name: 'US Dollar / Brazilian Real', type: 'forex', exchange: 'FX' },
  { id: 'USDZAR=X', symbol: 'USD/ZAR', name: 'US Dollar / South African Rand', type: 'forex', exchange: 'FX' },
  { id: 'USDMXN=X', symbol: 'USD/MXN', name: 'US Dollar / Mexican Peso', type: 'forex', exchange: 'FX' },
  { id: 'USDAED=X', symbol: 'USD/AED', name: 'US Dollar / UAE Dirham', type: 'forex', exchange: 'FX' },
  { id: 'USDSAR=X', symbol: 'USD/SAR', name: 'US Dollar / Saudi Riyal', type: 'forex', exchange: 'FX' },
];

// Build a lookup index for fast prefix/fuzzy search
function scoreMatch(asset: StaticAsset, q: string): number {
  const sym = asset.symbol.toLowerCase();
  const name = asset.name.toLowerCase();
  if (sym === q) return 100;
  if (sym.startsWith(q)) return 90;
  if (sym.includes(q)) return 70;
  if (name.startsWith(q)) return 60;
  if (name.includes(q)) return 40;
  return 0;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get('q')?.toLowerCase().trim() || '';

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  // Score and filter static assets
  const staticResults = STATIC_ASSETS
    .map((a) => ({ ...a, score: scoreMatch(a, query) }))
    .filter((a) => a.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ score, ...rest }) => rest);

  // Also search CoinGecko for live crypto results
  try {
    const cryptoResults = await searchCoins(query);
    const cryptoMapped = cryptoResults.slice(0, 4).map((c) => ({
      id: c.id,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      type: 'crypto' as const,
      exchange: 'CRYPTO',
      rank: c.market_cap_rank,
    }));

    // Deduplicate: if a crypto symbol is already in static, skip it
    const existingSymbols = new Set(staticResults.map((r) => r.symbol));
    const dedupedCrypto = cryptoMapped.filter((c) => !existingSymbols.has(c.symbol));

    return NextResponse.json([...staticResults, ...dedupedCrypto].slice(0, 10));
  } catch {
    return NextResponse.json(staticResults);
  }
}
