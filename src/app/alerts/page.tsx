'use client';
import { useState } from 'react';
import { Bell, BellOff, Plus, Trash2 } from 'lucide-react';
import { usePortfolioStore } from '@/store/portfolio';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/formatters';

export default function AlertsPage() {
  const { alerts, addAlert, removeAlert, toggleAlert } = usePortfolioStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    symbol: '',
    type: 'price_above' as const,
    threshold: '',
  });

  function handleAdd() {
    if (!form.symbol || !form.threshold) return;
    addAlert({
      symbol: form.symbol.toUpperCase(),
      type: form.type,
      threshold: parseFloat(form.threshold),
      active: true,
    });
    setShowForm(false);
    setForm({ symbol: '', type: 'price_above', threshold: '' });
  }

  const alertTypeLabel: Record<string, string> = {
    price_above: 'Price above',
    price_below: 'Price below',
    change_pct: 'Change % exceeds',
  };

  return (
    <div className="space-y-4 max-w-screen-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
            Price Alerts
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
            Set notifications for price movements
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={13} /> New Alert
        </Button>
      </div>

      {showForm && (
        <Card>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            Create Alert
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>Symbol</label>
              <input
                type="text"
                value={form.symbol}
                onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))}
                placeholder="BTC, AAPL…"
                className="w-full px-2.5 py-1.5 rounded text-sm outline-none"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>Condition</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as typeof form.type }))}
                className="w-full px-2.5 py-1.5 rounded text-sm outline-none"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                <option value="price_above">Price rises above</option>
                <option value="price_below">Price falls below</option>
                <option value="change_pct">Change % exceeds</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>Threshold</label>
              <input
                type="number"
                value={form.threshold}
                onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))}
                placeholder="e.g. 50000"
                className="w-full px-2.5 py-1.5 rounded text-sm outline-none num"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleAdd}>Create Alert</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <Card padding={false}>
        {alerts.length === 0 ? (
          <div className="py-12 text-center">
            <Bell size={32} className="mx-auto mb-3" style={{ color: 'var(--muted-fg)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>No alerts configured</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-fg)' }}>
              Create alerts to get notified on price movements
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded flex items-center justify-center`}
                    style={{ background: alert.active ? 'var(--up-bg)' : 'var(--surface-2)' }}>
                    {alert.active
                      ? <Bell size={14} style={{ color: 'var(--up)' }} />
                      : <BellOff size={14} style={{ color: 'var(--muted)' }} />}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {alert.symbol}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>
                      {alertTypeLabel[alert.type]} {alert.threshold.toLocaleString()}
                      {alert.type === 'change_pct' ? '%' : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={alert.active ? 'up' : 'neutral'}>
                    {alert.active ? 'Active' : 'Paused'}
                  </Badge>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    {formatDate(alert.createdAt)}
                  </span>
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className="text-xs px-2 py-1 rounded transition-fast"
                    style={{
                      background: 'var(--surface-2)',
                      color: 'var(--muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {alert.active ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="p-1 rounded hover:bg-[var(--down-bg)] transition-fast"
                    style={{ color: 'var(--muted)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
