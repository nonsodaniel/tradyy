import WatchlistPanel from '@/components/dashboard/WatchlistPanel';

export const metadata = { title: 'Watchlist — Tradyy' };

export default function WatchlistPage() {
  return (
    <div className="space-y-4 max-w-screen-lg mx-auto">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
          Watchlist
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Monitor your saved assets in real time
        </p>
      </div>
      <WatchlistPanel />
    </div>
  );
}
