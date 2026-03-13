'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search, ExternalLink, Building2, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { COMPANIES, SECTORS, searchCompanies } from '@/lib/data/companies';
import type { Company, CompanyStatus } from '@/lib/data/companies';
import clsx from 'clsx';

export default function CompaniesPage() {
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('');
  const [status, setStatus] = useState<CompanyStatus | ''>('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const results = searchCompanies(query, sector || undefined, (status as CompanyStatus) || undefined);

  return (
    <div className="space-y-5 max-w-screen-2xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
          Companies
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Valuations, funding history, and leadership for leading companies worldwide
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, CEOs, sectors…"
            className="w-full pl-9 pr-3 py-2 rounded-md text-sm outline-none"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="px-3 py-2 rounded-md text-sm outline-none"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <option value="">All Sectors</option>
          {SECTORS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="flex gap-1.5">
          {(['', 'public', 'private'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={clsx(
                'px-3 py-2 rounded-md text-xs font-medium transition-fast',
                status === s
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              )}
              style={status !== s ? { border: '1px solid var(--border)', background: 'var(--surface)' } : {}}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs" style={{ color: 'var(--muted)' }}>
        {results.length} {results.length === 1 ? 'company' : 'companies'} found
      </p>

      {/* Company grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {results.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            expanded={expanded === company.id}
            onToggle={() => setExpanded(expanded === company.id ? null : company.id)}
          />
        ))}
      </div>

      {results.length === 0 && (
        <div className="py-16 text-center">
          <Building2 size={32} className="mx-auto mb-3" style={{ color: 'var(--muted-fg)' }} />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>No companies match your search.</p>
        </div>
      )}
    </div>
  );
}

function CompanyCard({
  company,
  expanded,
  onToggle,
}: {
  company: Company;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card padding={false} className="overflow-hidden">
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-4 hover:bg-[var(--surface-2)] transition-fast"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}
            >
              {company.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                  {company.name}
                </span>
                {company.ticker && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded font-mono"
                    style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}
                  >
                    {company.ticker}
                  </span>
                )}
                <Badge variant={company.status === 'public' ? 'up' : 'info'} size="sm">
                  {company.status}
                </Badge>
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                {company.industry} · {company.headquarters.split(',').slice(-1)[0].trim()}
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-sm font-semibold num" style={{ color: 'var(--foreground)' }}>
              {company.valuation}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              Founded {company.founded}
            </div>
          </div>
        </div>

        {/* CEO + Employees quick row */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <Users size={11} style={{ color: 'var(--muted)' }} />
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              CEO: <span style={{ color: 'var(--foreground)' }}>{company.ceo}</span>
            </span>
          </div>
          {company.employees && (
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              {company.employees} employees
            </span>
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div
          className="px-4 pb-4 space-y-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {/* Description */}
          <p className="text-sm leading-relaxed pt-3" style={{ color: 'var(--muted)' }}>
            {company.description}
          </p>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md p-3" style={{ background: 'var(--surface-2)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>CEO</p>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{company.ceo}</p>
            </div>
            <div className="rounded-md p-3" style={{ background: 'var(--surface-2)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Sector</p>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{company.sector}</p>
            </div>
            <div className="rounded-md p-3" style={{ background: 'var(--surface-2)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Founded</p>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{company.founded}</p>
            </div>
            <div className="rounded-md p-3" style={{ background: 'var(--surface-2)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Headquarters</p>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{company.headquarters}</p>
            </div>
            {company.exchange && (
              <div className="rounded-md p-3" style={{ background: 'var(--surface-2)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Exchange</p>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{company.exchange}</p>
              </div>
            )}
            {company.ipoDate && (
              <div className="rounded-md p-3" style={{ background: 'var(--surface-2)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>IPO Date</p>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  {new Date(company.ipoDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            )}
          </div>

          {/* Funding rounds (private companies) */}
          {company.funding && company.funding.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>
                FUNDING HISTORY
              </p>
              <div className="space-y-2">
                {company.funding.map((round, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-md"
                    style={{ background: 'var(--surface-2)' }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                          {round.round}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>{round.date}</span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{round.investors}</p>
                    </div>
                    <span
                      className="text-sm font-bold num flex-shrink-0"
                      style={{ color: 'var(--up)' }}
                    >
                      {round.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            {company.ticker && (
              <Link
                href={`/asset/${company.status === 'public' ? 'stock' : 'crypto'}/${company.ticker.toLowerCase()}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-fast"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                View Live Price
              </Link>
            )}
            <a
              href={`https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-fast"
              style={{
                background: 'var(--surface-2)',
                color: 'var(--muted)',
                border: '1px solid var(--border)',
              }}
            >
              <ExternalLink size={11} />
              Website
            </a>
          </div>
        </div>
      )}
    </Card>
  );
}
