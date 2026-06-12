interface Props {
  normalDays: number;
  absentDays: number;
  anomalyDays: number;
}

export function StatsCards({ normalDays, absentDays, anomalyDays }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      <div className="bg-white rounded-2xl p-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                      flex flex-col items-center text-center">
        <span className="text-[28px] font-extrabold text-lime-500 tracking-tight tabular-nums">
          {normalDays}
        </span>
        <span className="text-[10px] text-neutral-400 font-medium mt-0.5">成功打卡</span>
        <span className="text-[10px] text-neutral-300 mt-0.5">天</span>
      </div>

      <div className="bg-white rounded-2xl p-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                      flex flex-col items-center text-center">
        <span className="text-[28px] font-extrabold text-zinc-300 tracking-tight tabular-nums">
          {absentDays}
        </span>
        <span className="text-[10px] text-neutral-400 font-medium mt-0.5">请假</span>
        <span className="text-[10px] text-neutral-300 mt-0.5">天</span>
      </div>

      <div className="bg-white rounded-2xl p-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                      flex flex-col items-center text-center">
        <span className="text-[28px] font-extrabold text-orange-500 tracking-tight tabular-nums">
          {anomalyDays}
        </span>
        <span className="text-[10px] text-neutral-400 font-medium mt-0.5">迟到早退</span>
        <span className="text-[10px] text-neutral-300 mt-0.5">天</span>
      </div>
    </div>
  );
}
