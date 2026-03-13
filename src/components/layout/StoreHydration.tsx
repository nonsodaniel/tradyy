'use client';
import { useEffect } from 'react';
import { useWatchlistStore } from '@/store/watchlist';
import { usePortfolioStore } from '@/store/portfolio';
import { useSettingsStore } from '@/store/settings';

export default function StoreHydration() {
  useEffect(() => {
    useWatchlistStore.persist.rehydrate();
    usePortfolioStore.persist.rehydrate();
    useSettingsStore.persist.rehydrate();
  }, []);

  return null;
}
