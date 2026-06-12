import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
  accent: string; // Tailwind 色值，如 'bg-lime-500'
  onClick: () => void;
}

// 首页导航卡片
export function NavCard({ icon, title, description, accent, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-slate-100 p-5
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]"
    >
      <div className="flex items-start gap-4">
        {/* 图标区域 */}
        <div
          className={`w-12 h-12 rounded-xl ${accent} flex items-center justify-center shrink-0`}
        >
          <div className="text-white">{icon}</div>
        </div>

        {/* 文字区域 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-neutral-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        {/* 箭头 */}
        <div className="text-slate-300 shrink-0 mt-1">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M7 4l6 6-6 6" />
          </svg>
        </div>
      </div>
    </button>
  );
}
