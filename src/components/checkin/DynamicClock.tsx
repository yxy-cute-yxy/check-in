import { useState, useEffect } from 'react';

export function DynamicClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  const ss = String(time.getSeconds()).padStart(2, '0');

  return (
    <div className="text-center py-6">
      <p className="text-[11px] font-bold text-neutral-400 tracking-[0.2em] uppercase mb-2">
        当前时间
      </p>
      <p className="text-5xl font-extrabold text-neutral-900 tracking-normal tabular-nums">
        {hh}<span className="text-neutral-900">:</span>{mm}<span className="text-neutral-900">:</span>{ss}
      </p>
    </div>
  );
}
