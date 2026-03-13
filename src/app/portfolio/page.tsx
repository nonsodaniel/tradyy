import PortfolioView from '@/components/portfolio/PortfolioView';

export const metadata = { title: 'Portfolio — Tradyy' };

export default function PortfolioPage() {
  return (
    <div className="space-y-4 max-w-screen-2xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
          Portfolio
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Track your positions and overall performance
        </p>
      </div>
      <PortfolioView />
    </div>
  );
}
