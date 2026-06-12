import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function BackBar() {
  const { dispatch } = useApp();

  return (
    <header className="sticky top-0 z-10 bg-[#f4f7f4] px-5 pt-5 pb-4">
      <button
        onClick={() => dispatch({ type: 'SET_PAGE', payload: 'home' })}
        className="flex items-center gap-2 text-industrial-700 hover:text-lime-600 transition-colors"
      >
        <span className="w-9 h-9 flex items-center justify-center bg-white rounded-2xl
                         shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
          <ArrowLeft className="w-4 h-4" />
        </span>
        <span className="text-[13px] font-bold tracking-wide">返回工作台</span>
      </button>
    </header>
  );
}
