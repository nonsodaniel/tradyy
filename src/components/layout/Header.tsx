'use client';
import { useState, useRef, useEffect } from 'react';
import { Menu, Search, Sun, Moon, Bell, X, TrendingUp, DollarSign, BarChart2, Layers } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useHasMounted } from '@/hooks/useHasMounted';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface SearchResult {
  id: string;
  symbol: string;
  name: string;
  type: string;
  exchange?: string;
  rank?: number;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  crypto: <TrendingUp size={12} />,
  stock: <BarChart2 size={12} />,
  etf: <Layers size={12} />,
  index: <BarChart2 size={12} />,
  commodity: <DollarSign size={12} />,
  forex: <DollarSign size={12} />,
};

const TYPE_COLOR: Record<string, string> = {
  crypto: '#f59e0b',
  stock: '#3b82f6',
  etf: '#8b5cf6',
  index: '#6366f1',
  commodity: '#f97316',
  forex: '#10b981',
};

interface Props {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const debouncedQ = useDebounce(query, 200);
  const { data: results = [] } = useSWR<SearchResult[]>(
    debouncedQ.length >= 1 ? `/api/search?q=${encodeURIComponent(debouncedQ)}` : null,
    fetcher,
    { dedupingInterval: 300 }
  );

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setFocused(true);
      }
      if (e.key === 'Escape') {
        setFocused(false);
        setQuery('');
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function handleSelect(r: SearchResult) {
    setQuery('');
    setFocused(false);
    router.push(`/asset/${r.type}/${r.id}`);
  }

  const showDrop = focused && debouncedQ.length >= 1;

  return (
    <header
      className="h-14 flex items-center px-3 sm:px-4 gap-2 sm:gap-3 flex-shrink-0"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
    >
      <button
        onClick={onMenuClick}
        className="md:hidden p-1.5 rounded hover:bg-[var(--surface-2)] transition-fast flex-shrink-0"
        style={{ color: 'var(--muted)' }}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-xl relative" ref={dropRef}>
        <div
          className="flex items-center gap-2 px-3 rounded-md h-8 transition-fast"
          style={{
            background: 'var(--surface-2)',
            border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
          }}
        >
          <Search size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search stocks, crypto, commodities… (⌘K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            className="flex-1 bg-transparent text-sm outline-none min-w-0 placeholder:text-[var(--muted-fg)]"
            style={{ color: 'var(--foreground)' }}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="flex-shrink-0 transition-fast hover:text-[var(--foreground)]"
              style={{ color: 'var(--muted)' }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {showDrop && (
          <div
            className="absolute top-full mt-1 left-0 w-full rounded-lg shadow-xl z-50 overflow-hidden fade-in"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', minWidth: 280 }}
          >
            {results.length === 0 ? (
              <div className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>
                No results for &ldquo;{debouncedQ}&rdquo;
              </div>
            ) : (
              <>
                <div className="px-3 pt-2 pb-1 text-xs font-medium" style={{ color: 'var(--muted)' }}>
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </div>
                {results.map((r) => (
                  <button
                    key={`${r.type}-${r.id}`}
                    onMouseDown={() => handleSelect(r)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--surface-2)] text-left transition-fast"
                  >
                    {/* Icon */}
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: 'var(--surface-2)', color: TYPE_COLOR[r.type] || 'var(--muted)' }}
                    >
                      {r.symbol.charAt(0)}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                          {r.symbol}
                        </span>
                        {r.exchange && (
                          <span className="text-xs" style={{ color: 'var(--muted-fg)' }}>
                            {r.exchange}
                          </span>
                        )}
                      </div>
                      <div className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                        {r.name}
                      </div>
                    </div>
                    {/* Type badge */}
                    <div
                      className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded flex-shrink-0 capitalize"
                      style={{ background: 'var(--surface-2)', color: TYPE_COLOR[r.type] || 'var(--muted)' }}
                    >
                      {TYPE_ICON[r.type]}
                      {r.type}
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 text-xs px-2 py-1 rounded" style={{ color: 'var(--up)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--up)] pulse-dot" />
          <span className="hidden md:inline">Live</span>
        </div>

        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded hover:bg-[var(--surface-2)] transition-fast"
          style={{ color: 'var(--muted)' }}
          title="Toggle theme"
          suppressHydrationWarning
        >
          {mounted ? (
            resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />
          ) : (
            <div className="w-4 h-4" />
          )}
        </button>

        <button
          className="p-1.5 rounded hover:bg-[var(--surface-2)] transition-fast relative"
          style={{ color: 'var(--muted)' }}
          title="Alerts"
        >
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
