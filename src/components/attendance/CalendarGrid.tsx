import { todayStr, getDaysInMonth, getFirstDayOfMonth } from '@/lib/utils';
import type { AttendanceRecord, AttendanceStatus } from '@/types';

interface Props {
  referenceDate: Date;
  logs: AttendanceRecord[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

function dateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function dotColor(status: AttendanceStatus | undefined): string {
  if (!status) return 'bg-zinc-200';
  if (status === 'normal') return 'bg-lime-500';
  if (status === 'late' || status === 'early') return 'bg-orange-500';
  return 'bg-zinc-200';
}

export function CalendarGrid({ referenceDate, logs, selectedDate, onSelectDate }: Props) {
  const today = todayStr();
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // 构建日期→状态映射
  const statusMap = new Map<string, AttendanceStatus>();
  for (const log of logs) {
    statusMap.set(log.date, log.status);
  }

  // 计算前置空白格数量（周一为第一列）
  const leadingBlanks = firstDay === 0 ? 6 : firstDay - 1;
  const totalCells = leadingBlanks + daysInMonth;
  const trailingBlanks = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  return (
    <div className="bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
      {/* 星期表头 */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={`text-center text-[10px] font-bold tracking-wider py-1 ${
              i >= 5 ? 'text-neutral-300' : 'text-neutral-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-y-1">
        {/* 前置空白 */}
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {/* 日期格子 */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const thisDate = dateStr(year, month, day);
          const status = statusMap.get(thisDate);
          const isToday = thisDate === today;
          const isSelected = thisDate === selectedDate;
          const isFuture = thisDate > today;
          const isWeekend = (leadingBlanks + i) % 7 >= 5;

          let cellBg = '';
          let numColor = isWeekend ? 'text-neutral-400' : 'text-neutral-900';

          if (isSelected) {
            cellBg = 'bg-neutral-900 rounded-xl';
            numColor = 'text-white font-extrabold';
          } else if (isToday) {
            cellBg = 'bg-lime-50/60 rounded-xl';
            numColor = 'text-lime-600 font-extrabold';
          }

          if (isFuture && !isSelected) {
            numColor = 'text-neutral-300';
          }

          return (
            <button
              key={day}
              onClick={() => isFuture ? undefined : onSelectDate(thisDate)}
              disabled={isFuture}
              className={`flex flex-col items-center justify-center py-2 rounded-xl
                          transition-all duration-150 ${cellBg}
                          ${isFuture ? 'cursor-default' : 'hover:bg-zinc-50'}`}
            >
              <span className={`text-[13px] font-bold ${numColor}`}>
                {day}
              </span>
              {isFuture ? (
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-transparent" />
              ) : (
                <span className={`mt-0.5 w-1.5 h-1.5 rounded-full ${dotColor(status)}`} />
              )}
            </button>
          );
        })}

        {/* 末尾空白 */}
        {Array.from({ length: trailingBlanks }, (_, i) => (
          <div key={`trail-${i}`} />
        ))}
      </div>
    </div>
  );
}
