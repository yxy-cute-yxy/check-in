import { useApp } from '@/context/AppContext';
import { todayStr } from '@/lib/utils';
import { offsetDate } from '@/lib/utils';

export function TimelineDots() {
  const { state } = useApp();
  const today = todayStr();
  const workerId = state.currentUser?.id ?? '';

  // 最近 5 天
  const days = Array.from({ length: 5 }, (_, i) => {
    const date = offsetDate(new Date(), -(4 - i));
    const log = state.attendanceLogs.find(
      (l) => l.workerId === workerId && l.date === date
    );
    return {
      date,
      label: `${new Date(date).getMonth() + 1}/${new Date(date).getDate()}`,
      checked: !!log && log.status !== 'absent',
    };
  });

  return (
    <div className="px-8 py-6">
      <p className="text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase text-center mb-4">
        最近打卡
      </p>
      <div className="flex items-center justify-center gap-0">
        {days.map((day, i) => (
          <div key={day.date} className="flex items-center">
            {/* 圆点 + 日期 */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-3 h-3 rounded-full transition-colors ${
                  day.checked
                    ? day.date === today
                      ? 'bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.4)]'
                      : 'bg-lime-400'
                    : 'bg-zinc-200'
                }`}
              />
              <span className={`text-[9px] font-medium ${
                day.date === today ? 'text-neutral-900' : 'text-neutral-400'
              }`}>
                {day.label}
              </span>
            </div>
            {/* 连线 */}
            {i < days.length - 1 && (
              <div className={`w-8 h-px mb-4 ${
                day.checked && days[i + 1].checked ? 'bg-lime-300' : 'bg-zinc-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
