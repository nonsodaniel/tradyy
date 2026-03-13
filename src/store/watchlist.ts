'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchlistState {
  symbols: string[];
  add: (symbol: string) => void;
  remove: (symbol: string) => void;
  toggle: (symbol: string) => void;
  has: (symbol: string) => boolean;
  clear: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      symbols: ['BTC', 'ETH', 'AAPL', 'MSFT', 'TSLA', 'NVDA', 'GOOGL', 'SOL', 'BNB', 'SPY'],
      add: (symbol) =>
        set((s) => ({
          symbols: s.symbols.includes(symbol) ? s.symbols : [...s.symbols, symbol],
        })),
      remove: (symbol) =>
        set((s) => ({ symbols: s.symbols.filter((sym) => sym !== symbol) })),
      toggle: (symbol) => {
        const { has, add, remove } = get();
        has(symbol) ? remove(symbol) : add(symbol);
      },
      has: (symbol) => get().symbols.includes(symbol),
      clear: () => set({ symbols: [] }),
    }),
    { name: 'tradyy-watchlist', skipHydration: true }
  )
);
