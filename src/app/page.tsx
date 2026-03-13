import MarketStats from '@/components/dashboard/MarketStats';
import MarketOverview from '@/components/dashboard/MarketOverview';
import WatchlistPanel from '@/components/dashboard/WatchlistPanel';
import NewsFeed from '@/components/news/NewsFeed';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import PriceChart from '@/components/charts/PriceChart';

export const metadata = { title: 'Dashboard — Tradyy' };

export default function DashboardPage() {
  return (
    <div className="space-y-4 max-w-screen-2xl mx-auto">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
          Market Overview
        </h1>
        <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Real-time prices, news, and market insights
        </p>
      </div>

      <MarketStats />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left */}
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Bitcoin / USD</CardTitle>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  BTC · CoinGecko Live
                </p>
              </div>
            </CardHeader>
            <PriceChart
              symbol="BTC"
              assetClass="crypto"
              coinId="bitcoin"
              height={280}
              defaultRange="1M"
            />
          </Card>

          <MarketOverview />
        </div>

        {/* Right */}
        <div className="space-y-4">
          <WatchlistPanel />
          <Card>
            <CardHeader>
              <CardTitle>Market News</CardTitle>
            </CardHeader>
            <NewsFeed limit={5} compact />
          </Card>
        </div>
      </div>
    </div>
  );
}
