import type { NewsArticle, NewsSentiment } from '@/types/news';

// Using GNews API (free tier) and Marketaux
// Fallback: mock curated news for offline/demo mode

const GNEWS_BASE = 'https://gnews.io/api/v4';

function assignSentiment(title: string, description: string): NewsSentiment {
  const text = `${title} ${description}`.toLowerCase();
  const bullishWords = ['surge', 'rally', 'gain', 'rise', 'bull', 'record', 'profit', 'growth', 'beats', 'exceed', 'strong', 'boost', 'soar', 'jump', 'up', 'high'];
  const bearishWords = ['fall', 'drop', 'crash', 'bear', 'loss', 'decline', 'miss', 'weak', 'concern', 'risk', 'plunge', 'slump', 'cut', 'down', 'low', 'fear'];

  const bullScore = bullishWords.filter((w) => text.includes(w)).length;
  const bearScore = bearishWords.filter((w) => text.includes(w)).length;

  if (bullScore > bearScore) return 'bullish';
  if (bearScore > bullScore) return 'bearish';
  return 'neutral';
}

export async function fetchFinancialNews(
  query = 'stock market finance',
  limit = 20
): Promise<NewsArticle[]> {
  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey) {
    return getMockNews(limit);
  }

  try {
    const res = await fetch(
      `${GNEWS_BASE}/search?q=${encodeURIComponent(query)}&lang=en&country=us&max=${limit}&apikey=${apiKey}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return getMockNews(limit);

    const data = await res.json();
    return (data.articles || []).map((a: Record<string, unknown>, i: number) => ({
      id: `gnews-${i}-${Date.now()}`,
      title: a.title as string,
      summary: (a.description as string) || '',
      url: a.url as string,
      source: (a.source as Record<string, string>)?.name || 'Unknown',
      publishedAt: a.publishedAt as string,
      sentiment: assignSentiment(a.title as string, (a.description as string) || ''),
      relatedSymbols: [],
      imageUrl: a.image as string | undefined,
      category: 'markets',
    }));
  } catch {
    return getMockNews(limit);
  }
}

export function getMockNews(limit = 20): NewsArticle[] {
  const articles: NewsArticle[] = [
    {
      id: 'n1',
      title: 'S&P 500 Reaches New All-Time High Amid Strong Earnings Season',
      summary: 'The benchmark index closed at a record high as major technology companies reported better-than-expected quarterly results, boosting investor confidence.',
      url: '#',
      source: 'Financial Times',
      publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      sentiment: 'bullish',
      relatedSymbols: ['SPY', 'AAPL', 'MSFT', 'GOOGL'],
      category: 'markets',
      region: 'US',
    },
    {
      id: 'n2',
      title: 'Bitcoin Surpasses $95,000 as Institutional Demand Accelerates',
      summary: 'The world\'s largest cryptocurrency reached a new milestone following reports of increased institutional buying and ETF inflows.',
      url: '#',
      source: 'CoinDesk',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      sentiment: 'bullish',
      relatedSymbols: ['BTC', 'ETH'],
      category: 'crypto',
    },
    {
      id: 'n3',
      title: 'Federal Reserve Signals Cautious Approach to Future Rate Cuts',
      summary: 'Fed officials reiterated a data-dependent stance on monetary policy, tempering expectations for aggressive easing in the coming months.',
      url: '#',
      source: 'Reuters',
      publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      sentiment: 'neutral',
      relatedSymbols: ['TLT', 'GLD', 'USD'],
      category: 'macro',
      region: 'US',
    },
    {
      id: 'n4',
      title: 'Gold Prices Dip as Dollar Strengthens on Strong US Jobs Data',
      summary: 'Spot gold fell 0.8% as better-than-expected employment figures pushed the US dollar higher, reducing demand for the safe-haven metal.',
      url: '#',
      source: 'Bloomberg',
      publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      sentiment: 'bearish',
      relatedSymbols: ['GLD', 'XAU', 'USD'],
      category: 'commodities',
    },
    {
      id: 'n5',
      title: 'NVIDIA Reports Record Revenue Driven by AI Chip Demand',
      summary: 'The chipmaker posted quarterly revenue of $35.1 billion, surpassing analyst estimates by 12%, with data center sales up 112% year-over-year.',
      url: '#',
      source: 'Wall Street Journal',
      publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      sentiment: 'bullish',
      relatedSymbols: ['NVDA'],
      category: 'earnings',
      region: 'US',
    },
    {
      id: 'n6',
      title: 'European Markets Mixed as ECB Holds Rates Steady',
      summary: 'The European Central Bank maintained its benchmark rate as policymakers balance persistent inflation with signs of economic slowdown in the eurozone.',
      url: '#',
      source: 'CNBC',
      publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      sentiment: 'neutral',
      relatedSymbols: ['EUR', '^STOXX50E', 'EEM'],
      category: 'macro',
      region: 'Europe',
    },
    {
      id: 'n7',
      title: 'Tesla Faces Increased Competition in Chinese EV Market',
      summary: 'Market share data shows Tesla\'s sales in China declined for the third consecutive quarter as domestic rivals BYD and NIO gain ground.',
      url: '#',
      source: 'Reuters',
      publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      sentiment: 'bearish',
      relatedSymbols: ['TSLA'],
      category: 'equities',
      region: 'Asia',
    },
    {
      id: 'n8',
      title: 'Oil Prices Rise on Tightening Supply Outlook and OPEC+ Compliance',
      summary: 'Brent crude climbed to $88 per barrel as OPEC+ members maintained production cuts and demand forecasts from Asia improved.',
      url: '#',
      source: 'Energy Monitor',
      publishedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      sentiment: 'bullish',
      relatedSymbols: ['USO', 'XOM', 'CVX'],
      category: 'commodities',
    },
    {
      id: 'n9',
      title: 'JPMorgan Upgrades Apple to Overweight With $215 Price Target',
      summary: 'Analysts cite iPhone 16 cycle momentum and expanding Services revenue as key drivers for upgrading the stock from Neutral.',
      url: '#',
      source: 'Barron\'s',
      publishedAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
      sentiment: 'bullish',
      relatedSymbols: ['AAPL', 'JPM'],
      category: 'analyst',
      region: 'US',
    },
    {
      id: 'n10',
      title: 'Nikkei 225 Hits Multi-Decade High on Weak Yen and Export Gains',
      summary: 'Japan\'s benchmark index surged to levels not seen since 1989 as the yen\'s weakness boosted earnings prospects for export-oriented companies.',
      url: '#',
      source: 'Nikkei Asia',
      publishedAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
      sentiment: 'bullish',
      relatedSymbols: ['^N225', 'JPY', 'EWJ'],
      category: 'markets',
      region: 'Asia',
    },
    {
      id: 'n11',
      title: 'Ethereum ETFs See Record Inflows Following Spot Approval',
      summary: 'Newly approved spot Ethereum ETFs attracted over $800 million in their first week of trading, surpassing early Bitcoin ETF debuts.',
      url: '#',
      source: 'The Block',
      publishedAt: new Date(Date.now() - 1000 * 60 * 540).toISOString(),
      sentiment: 'bullish',
      relatedSymbols: ['ETH', 'BTC'],
      category: 'crypto',
    },
    {
      id: 'n12',
      title: 'US Treasury Yields Climb Ahead of Key Inflation Data',
      summary: 'The 10-year Treasury yield rose to 4.62% as traders positioned ahead of Wednesday\'s CPI release, with expectations for a slight uptick in core inflation.',
      url: '#',
      source: 'MarketWatch',
      publishedAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
      sentiment: 'neutral',
      relatedSymbols: ['TLT', 'USD'],
      category: 'macro',
      region: 'US',
    },
  ];

  return articles.slice(0, limit);
}
