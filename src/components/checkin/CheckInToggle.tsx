import type { CheckInType } from '@/types';

interface Props {
  value: CheckInType;
  onChange: (v: CheckInType) => void;
}

export function CheckInToggle({ value, onChange }: Props) {
  const isIn = value === 'in';

  return (
    <div className="flex justify-center">
      <div className="flex bg-zinc-100 rounded-2xl p-1 gap-1">
        <button
          onClick={() => onChange('in')}
          className={`flex flex-col items-center px-6 py-2 rounded-xl transition-all duration-200 ${
            isIn
              ? 'bg-white shadow-[0_2px_8px_rgb(0,0,0,0.06)]'
              : ''
          }`}
        >
          <span className={`text-[14px] font-bold ${isIn ? 'text-neutral-900' : 'text-neutral-400'}`}>
            上班打卡
          </span>
          <span className={`text-[10px] font-medium mt-0.5 ${isIn ? 'text-lime-500' : 'text-neutral-300'}`}>
            08:00
          </span>
        </button>

        <button
          onClick={() => onChange('out')}
          className={`flex flex-col items-center px-6 py-2 rounded-xl transition-all duration-200 ${
            !isIn
              ? 'bg-white shadow-[0_2px_8px_rgb(0,0,0,0.06)]'
              : ''
          }`}
        >
          <span className={`text-[14px] font-bold ${!isIn ? 'text-neutral-900' : 'text-neutral-400'}`}>
            下班打卡
          </span>
          <span className={`text-[10px] font-medium mt-0.5 ${!isIn ? 'text-orange-500' : 'text-neutral-300'}`}>
            18:00
          </span>
        </button>
      </div>
    </div>
  );
}
