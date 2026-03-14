import CurrencyConverter from '@/components/currency/CurrencyConverter';
import { Card } from '@/components/ui/Card';

export const metadata = { title: 'Currency Converter — Tradyy' };

export default function ConverterPage() {
  return (
    <div className="space-y-4 max-w-screen-md mx-auto">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
          Currency Converter
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Convert between 30+ global currencies with live exchange rates
        </p>
      </div>

      <Card>
        <CurrencyConverter />
      </Card>

      <Card>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
          About Exchange Rates
        </h3>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Rates are sourced from the European Central Bank via Frankfurter API and updated every business day.
          They represent interbank mid-market rates and may differ from rates offered by financial institutions.
        </p>
      </Card>
    </div>
  );
}
