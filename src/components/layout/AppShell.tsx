import type { ReactNode } from 'react';
import { Header } from './Header';
import { BackBar } from './BackBar';
import { useApp } from '@/context/AppContext';

interface Props { children: ReactNode }

export function AppShell({ children }: Props) {
  const { state } = useApp();
  const showHeader = state.currentPage === 'home';

  return (
    <div className="min-h-screen flex justify-center px-0 md:px-4 md:py-6">
      <div className="w-full max-w-xl min-h-screen bg-[#f4f7f4] flex flex-col
                      md:min-h-0 md:rounded-[32px] md:shadow-[0_20px_60px_rgb(0,0,0,0.08)]
                      overflow-hidden">
        {showHeader ? <Header /> : <BackBar />}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
