import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';

// 子页面顶部返回栏
export function BackBar() {
  const { dispatch } = useApp();

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-4">
      <button
        onClick={() => dispatch({ type: 'SET_PAGE', payload: 'home' })}
        className="flex items-center gap-1.5 text-neutral-900 font-medium hover:text-lime-600 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">返回工作台</span>
      </button>
    </header>
  );
}
