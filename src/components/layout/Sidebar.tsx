'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Newspaper,
  ArrowLeftRight,
  Star,
  Bell,
  Settings,
  X,
  BarChart2,
  Lightbulb,
  Building2,
} from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/markets', label: 'Markets', icon: TrendingUp },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/advice', label: 'Advice', icon: Lightbulb },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/converter', label: 'Converter', icon: ArrowLeftRight },
  { href: '/watchlist', label: 'Watchlist', icon: Star },
  { href: '/alerts', label: 'Alerts', icon: Bell },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex flex-col w-60 transition-transform duration-200 md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between h-14 px-5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded flex items-center justify-center font-bold text-sm text-white"
              style={{ background: 'var(--accent)' }}
            >
              T
            </div>
            <span className="font-semibold text-base tracking-tight" style={{ color: 'var(--foreground)' }}>
              Tradyy
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded hover:bg-[var(--surface-2)] transition-fast"
            style={{ color: 'var(--muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          <div className="space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-fast',
                    active
                      ? 'text-[var(--foreground)] bg-[var(--surface-2)]'
                      : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]'
                  )}
                >
                  <Icon
                    size={16}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={active ? 'text-[var(--accent)]' : ''}
                  />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="p-2" style={{ borderTop: '1px solid var(--border)' }}>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-fast text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
          >
            <Settings size={16} strokeWidth={1.8} />
            Settings
          </Link>
        </div>
      </aside>
    </>
  );
}
