import type { AttendanceRecord, AttendanceStatus } from '@/types';

interface Props {
  record: AttendanceRecord;
}

const statusMap: Record<AttendanceStatus, { label: string; cls: string }> = {
  normal: { label: '正常', cls: 'bg-lime-50 text-lime-600' },
  late: { label: '迟到', cls: 'bg-orange-50 text-orange-500' },
  early: { label: '早退', cls: 'bg-orange-50 text-orange-500' },
  absent: { label: '缺勤', cls: 'bg-zinc-100 text-zinc-400' },
};

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const { label, cls } = statusMap[status];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${cls}`}>
      {label}
    </span>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
}

export function DayDetail({ record }: Props) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-4
                    animate-[slideUp_0.3s_ease-out_forwards]">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-extrabold text-neutral-900 tracking-tight">
          {formatDate(record.date)}
        </h3>
        <StatusBadge status={record.status} />
      </div>

      <div className="h-px bg-zinc-100" />

      <div className="flex items-center justify-between">
        <span className="text-[12px] text-neutral-400 font-medium">上班打卡</span>
        <span className={`text-[15px] font-extrabold tabular-nums tracking-tight ${
          record.checkInTime ? 'text-neutral-900' : 'text-zinc-300'
        }`}>
          {record.checkInTime ?? '--:--'}
        </span>
      </div>

      <div className="h-px bg-zinc-100" />

      <div className="flex items-center justify-between">
        <span className="text-[12px] text-neutral-400 font-medium">下班打卡</span>
        <span className={`text-[15px] font-extrabold tabular-nums tracking-tight ${
          record.checkOutTime ? 'text-neutral-900' : 'text-zinc-300'
        }`}>
          {record.checkOutTime ?? '--:--'}
        </span>
      </div>
    </div>
  );
}
