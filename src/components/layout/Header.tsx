import { useState, useRef, useEffect } from 'react';
import { HardHat, UserCog, ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Role } from '@/types';

const roleOptions: { value: Role; label: string; icon: typeof HardHat }[] = [
  { value: 'worker', label: '工人', icon: HardHat },
  { value: 'manager', label: '项目经理', icon: UserCog },
];

// 顶部导航栏：Logo + 身份下拉切换
export function Header() {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentRole = roleOptions.find((r) => r.value === state.currentRole)!;

  // 点击外部关闭下拉
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-4">
      <div className="flex items-center justify-between">
        {/* Logo + 问候语 */}
        <div>
          <h1 className="text-lg font-bold text-neutral-900 tracking-tight">
            智慧工地
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {state.currentRole === 'worker'
              ? `你好，${state.currentUser?.name}`
              : '项目经理视图'}
          </p>
        </div>

        {/* 身份下拉 */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2
                       hover:bg-slate-200/70 transition-colors"
          >
            <span className="text-xs text-slate-500">身份</span>
            <span className="w-px h-4 bg-slate-300" />
            <currentRole.icon className="w-4 h-4 text-neutral-700" />
            <span className="text-sm font-medium text-neutral-900">
              {currentRole.label}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                open ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* 下拉列表 */}
          {open && (
            <div className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 overflow-hidden z-20">
              {roleOptions.map((role) => (
                <button
                  key={role.value}
                  onClick={() => {
                    dispatch({ type: 'SET_ROLE', payload: role.value });
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                    role.value === state.currentRole
                      ? 'bg-lime-50 text-lime-700 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
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
