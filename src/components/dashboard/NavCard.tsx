import type { ReactNode } from 'react';

interface Props {
  index: number;
  icon: ReactNode;
  title: string;
  description: string;
  iconBg: string;
  onClick: () => void;
}

export function NavCard({ index, icon, title, description, iconBg, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${index * 80}ms` }}
      className="w-full text-left bg-white rounded-3xl p-4
                 shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]
                 hover:-translate-y-0.5
                 transition-all duration-300 active:translate-y-0 active:shadow-[0_2px_10px_rgb(0,0,0,0.02)]
                 opacity-0 animate-[slideUp_0.4s_ease-out_forwards]
                 group"
    >
      <div className="flex items-center gap-4">
        {/* 图标 — 大圆角浅色背景 */}
        <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shrink-0
                        group-hover:scale-105 transition-transform duration-300`}>
          <div className="text-industrial-700 group-hover:text-industrial-900 transition-colors">
            {icon}
          </div>
        </div>

        {/* 文字 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-industrial-900 tracking-tight">
            {title}
          </h3>
          <p className="text-[11px] text-industrial-700/50 mt-0.5 leading-relaxed">
            {description}
          </p>
        </div>

        {/* 箭头 */}
        <div className="text-zinc-300 group-hover:text-lime-500 group-hover:translate-x-1 transition-all duration-200 shrink-0">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 4l6 6-6 6" />
          </svg>
        </div>
      </div>
    </button>
  );
}
