import { useState, useRef, useEffect } from 'react';
import { HardHat, UserCog, ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Role } from '@/types';

const roleOptions: { value: Role; label: string; icon: typeof HardHat }[] = [
  { value: 'worker', label: '工人', icon: HardHat },
  { value: 'manager', label: '项目经理', icon: UserCog },
];

export function Header() {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentRole = roleOptions.find((r) => r.value === state.currentRole)!;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-10 bg-[#f4f7f4] px-5 pt-5 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-industrial-900 tracking-tighter leading-none">
            智慧工地
          </h1>
          <p className="text-[11px] text-industrial-700/50 tracking-wider mt-1">
            {state.currentRole === 'worker'
              ? `劳务人员 · ${state.currentUser?.name}`
              : '项目管理 · 数据总控'}
          </p>
        </div>

        {/* 身份下拉 */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 bg-white rounded-2xl px-3.5 py-2.5
                       shadow-[0_2px_12px_rgb(0,0,0,0.03)] transition-all duration-150"
          >
            <span className="text-[10px] text-industrial-700/50 tracking-widest uppercase">身份</span>
            <currentRole.icon className="w-4 h-4 text-lime-500" />
            <span className="text-[13px] font-bold text-industrial-900">{currentRole.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-industrial-700/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-2xl
                            shadow-[0_12px_40px_rgb(0,0,0,0.08)] py-1.5 z-20">
              {roleOptions.map((role) => (
                <button
                  key={role.value}
                  onClick={() => { dispatch({ type: 'SET_ROLE', payload: role.value }); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors
                    ${role.value === state.currentRole
                      ? 'text-lime-600 font-bold'
                      : 'text-industrial-700 hover:bg-zinc-50'}`}
                >
                  <role.icon className="w-4 h-4" />
                  <span>{role.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
