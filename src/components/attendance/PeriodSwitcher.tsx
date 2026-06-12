export type Period = 'week' | 'month' | 'quarter';

interface Props {
  value: Period;
  onChange: (p: Period) => void;
}

const items: { value: Period; label: string }[] = [
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季度' },
];

export function PeriodSwitcher({ value, onChange }: Props) {
  return (
    <div className="flex justify-center">
      <div className="flex bg-zinc-100 rounded-2xl p-1 gap-1">
        {items.map((item) => {
          const active = value === item.value;
          return (
            <button
              key={item.value}
              onClick={() => onChange(item.value)}
              className={`px-5 py-2 text-[13px] rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-white shadow-[0_2px_8px_rgb(0,0,0,0.06)] text-neutral-900 font-bold'
                  : 'text-neutral-400 font-medium'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
