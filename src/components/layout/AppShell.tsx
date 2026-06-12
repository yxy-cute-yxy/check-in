import type { ReactNode } from 'react';
import { Header } from './Header';
import { BackBar } from './BackBar';
import { useApp } from '@/context/AppContext';

interface Props {
  children: ReactNode;
}

// 移动端优先容器：桌面端居中 480px，移动端全屏
export function AppShell({ children }: Props) {
  const { state } = useApp();
  const showHeader = state.currentPage === 'home';

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-xl min-h-screen bg-white shadow-md flex flex-col relative">
        {showHeader ? <Header /> : <BackBar />}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
