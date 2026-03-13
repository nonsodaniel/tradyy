'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  currency: string;
  locale: string;
  setCurrency: (code: string) => void;
  setLocale: (locale: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'USD',
      locale: 'en-US',
      setCurrency: (currency) => set({ currency }),
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'tradyy-settings', skipHydration: true }
  )
);
