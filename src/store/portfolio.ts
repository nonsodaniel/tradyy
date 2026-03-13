'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PortfolioHolding, AlertRule } from '@/types/portfolio';

interface PortfolioState {
  holdings: PortfolioHolding[];
  alerts: AlertRule[];
  addHolding: (holding: Omit<PortfolioHolding, 'id'>) => void;
  updateHolding: (id: string, updates: Partial<PortfolioHolding>) => void;
  removeHolding: (id: string) => void;
  addAlert: (alert: Omit<AlertRule, 'id' | 'createdAt'>) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      holdings: [
        {
          id: generateId(),
          symbol: 'AAPL',
          name: 'Apple Inc.',
          assetClass: 'stock',
          quantity: 10,
          avgBuyPrice: 175.5,
          buyDate: '2024-01-15',
          currency: 'USD',
        },
        {
          id: generateId(),
          symbol: 'BTC',
          name: 'Bitcoin',
          assetClass: 'crypto',
          quantity: 0.5,
          avgBuyPrice: 42000,
          buyDate: '2024-02-01',
          currency: 'USD',
        },
        {
          id: generateId(),
          symbol: 'MSFT',
          name: 'Microsoft Corp.',
          assetClass: 'stock',
          quantity: 5,
          avgBuyPrice: 380,
          buyDate: '2024-01-20',
          currency: 'USD',
        },
        {
          id: generateId(),
          symbol: 'ETH',
          name: 'Ethereum',
          assetClass: 'crypto',
          quantity: 2,
          avgBuyPrice: 2200,
          buyDate: '2024-03-01',
          currency: 'USD',
        },
      ],
      alerts: [],
      addHolding: (holding) =>
        set((s) => ({
          holdings: [...s.holdings, { ...holding, id: generateId() }],
        })),
      updateHolding: (id, updates) =>
        set((s) => ({
          holdings: s.holdings.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })),
      removeHolding: (id) =>
        set((s) => ({ holdings: s.holdings.filter((h) => h.id !== id) })),
      addAlert: (alert) =>
        set((s) => ({
          alerts: [
            ...s.alerts,
            { ...alert, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      removeAlert: (id) =>
        set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
      toggleAlert: (id) =>
        set((s) => ({
          alerts: s.alerts.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
        })),
    }),
    { name: 'tradyy-portfolio' }
  )
);
