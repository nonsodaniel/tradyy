'use client';
import { useState, useRef, useEffect } from 'react';
import { Menu, Search, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { formatCurrency, formatPct } from '@/lib/formatters';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface SearchResult {
  id: string;
  symbol: string;
  name: string;
  type: string;
  exchange?: string;
}

interface Props {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: Props) {
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const debouncedQ = useDebounce(query, 250);
  const { data: results = [] } = useSWR<SearchResult[]>(
    debouncedQ.length >= 1 ? `/api/search?q=${encodeURIComponent(debouncedQ)}` : null,
    fetcher
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

  function handleSelect(r: SearchResult) {
    setQuery('');
    setFocused(false);
    router.push(`/asset/${r.type}/${r.id}`);
  }

  const showDrop = focused && query.length >= 1 && results.length > 0;

  return (
    <header
      className="h-14 flex items-center px-4 gap-3 flex-shrink-0"
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <button
        onClick={onMenuClick}
        className="md:hidden p-1.5 rounded hover:bg-[var(--surface-2)] transition-fast"
        style={{ color: 'var(--muted)' }}
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md relative" ref={dropRef}>
        <div
          className="flex items-center gap-2 px-3 rounded-md h-8"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          <Search size={14} style={{ color: 'var(--muted)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search assets, stocks, crypto…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted-fg)]"
            style={{ color: 'var(--foreground)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[var(--muted)] hover:text-[var(--foreground)] text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {showDrop && (
          <div
            className="absolute top-full mt-1 left-0 right-0 rounded-md shadow-lg z-50 py-1 fade-in"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {results.map((r) => (
              <button
                key={r.id}
                onMouseDown={() => handleSelect(r)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--surface-2)] text-left transition-fast"
              >
                <div
                  className="w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
                >
                  {r.symbol.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                    {r.symbol}
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                    {r.name}
                  </div>
                </div>
                <span
                  className="text-xs px-1.5 py-0.5 rounded capitalize flex-shrink-0"
                  style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
                >
                  {r.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs px-2 py-1 rounded" style={{ color: 'var(--up)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--up)] pulse-dot" />
          Live
        </div>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded hover:bg-[var(--surface-2)] transition-fast"
          style={{ color: 'var(--muted)' }}
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          className="p-1.5 rounded hover:bg-[var(--surface-2)] transition-fast"
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
