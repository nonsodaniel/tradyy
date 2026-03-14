'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, TrendingUp, Lightbulb, Building2, ArrowLeftRight } from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/markets', label: 'Markets', icon: TrendingUp },
  { href: '/advice', label: 'Advice', icon: Lightbulb },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/converter', label: 'Convert', icon: ArrowLeftRight },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-center safe-area-bottom"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        height: '56px',
      }}
    >
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-fast"
            style={{ color: active ? 'var(--accent)' : 'var(--muted)' }}
          >
            <Icon size={19} strokeWidth={active ? 2.2 : 1.7} />
            <span className={clsx('text-[10px] font-medium', active ? 'opacity-100' : 'opacity-70')}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
