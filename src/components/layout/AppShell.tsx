'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import StoreHydration from './StoreHydration';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <StoreHydration />
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 pb-20 md:pb-6">
            {children}
          </main>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
