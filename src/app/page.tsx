import MarketStats from '@/components/dashboard/MarketStats';
import MarketOverview from '@/components/dashboard/MarketOverview';
import WatchlistPanel from '@/components/dashboard/WatchlistPanel';
import NewsFeed from '@/components/news/NewsFeed';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import PriceChart from '@/components/charts/PriceChart';

export const metadata = {
  title: 'Dashboard — Tradyy',
};

export default function DashboardPage() {
  return (
    <div className="space-y-5 max-w-screen-2xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
          Market Overview
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Real-time prices, news, and portfolio insights
        </p>
      </div>

      <MarketStats />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Bitcoin (BTC)</CardTitle>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  Crypto · CoinGecko
                </p>
              </div>
            </CardHeader>
            <PriceChart
              symbol="BTC"
              assetClass="crypto"
              coinId="bitcoin"
              height={300}
              defaultRange="1M"
            />
          </Card>

          <MarketOverview />
        </div>

        <div className="space-y-5">
          <WatchlistPanel />

          <Card>
            <CardHeader>
              <CardTitle>Market News</CardTitle>
            </CardHeader>
            <NewsFeed limit={6} compact />
          </Card>
        </div>
      </div>
    </div>
  );
}
