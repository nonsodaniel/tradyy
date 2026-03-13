'use client';
import { useTheme } from 'next-themes';
import { useSettingsStore } from '@/store/settings';
import { Card } from '@/components/ui/Card';
import { SUPPORTED_CURRENCIES } from '@/types/currency';
import { useHasMounted } from '@/hooks/useHasMounted';
import { LoadingSkeleton } from '@/components/ui/Spinner';
import clsx from 'clsx';

const THEMES = ['dark', 'light', 'system'];

export default function SettingsPage() {
  const mounted = useHasMounted();
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useSettingsStore();

  return (
    <div className="space-y-4 max-w-screen-md mx-auto">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
          Settings
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Personalize your experience
        </p>
      </div>

      <Card>
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Appearance
        </h3>
        {!mounted ? (
          <div className="flex gap-2">
            {THEMES.map((t) => <LoadingSkeleton key={t} className="h-9 w-20 rounded" />)}
          </div>
        ) : (
          <div className="flex gap-2">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={clsx(
                  'px-4 py-2 rounded text-sm capitalize transition-fast',
                  theme === t
                    ? 'bg-[var(--accent)] text-white'
                    : 'border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Display Currency
        </h3>
        {!mounted ? (
          <LoadingSkeleton className="h-9 w-64 rounded" />
        ) : (
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-3 py-2 rounded text-sm outline-none w-full max-w-xs"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        )}
        <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
          Sets the default display currency across the platform.
        </p>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Data & Privacy
        </h3>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          All data (watchlist, portfolio, alerts) is stored locally in your browser.
          No account or sign-up required.
        </p>
      </Card>
    </div>
  );
}
