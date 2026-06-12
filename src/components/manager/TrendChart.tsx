import { useState, useRef, useEffect } from 'react';

type Timeframe = 'week' | 'month';

interface DataPoint {
  label: string;
  hours: number;
  rate: number;
}

const WEEK_DATA: DataPoint[] = [
  { label: '周一', hours: 128, rate: 92 },
  { label: '周二', hours: 142, rate: 95 },
  { label: '周三', hours: 115, rate: 88 },
  { label: '周四', hours: 136, rate: 93 },
  { label: '周五', hours: 98, rate: 78 },
  { label: '周六', hours: 72, rate: 65 },
  { label: '周日', hours: 45, rate: 55 },
];

const MONTH_DATA: DataPoint[] = [
  { label: '1日', hours: 520, rate: 91 },
  { label: '5日', hours: 610, rate: 94 },
  { label: '10日', hours: 680, rate: 96 },
  { label: '15日', hours: 590, rate: 90 },
  { label: '20日', hours: 510, rate: 85 },
  { label: '25日', hours: 480, rate: 82 },
  { label: '30日', hours: 450, rate: 78 },
];

const CHART_H = 200;

const slideUp = 'opacity-0 animate-[slideUp_0.4s_ease-out_forwards]';

export function TrendChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>('week');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(360);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setChartWidth(el.offsetWidth);
    });
    ro.observe(el);
    setChartWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const data = timeframe === 'week' ? WEEK_DATA : MONTH_DATA;
  const maxY = timeframe === 'week' ? 160 : 720;
  const yTicks = timeframe === 'week'
    ? [160, 120, 80, 40, 0]
    : [720, 540, 360, 180, 0];

  // Bar geometry
  const barCount = data.length;
  const gapPx = 8;
  const colW = (chartWidth - gapPx * (barCount - 1)) / barCount;

  // Line points for SVG
  const points = data.map((d, i) => {
    const cx = colW * (i + 0.5) + gapPx * i;
    const cy = (1 - d.hours / maxY) * CHART_H;
    return { cx, cy, ...d };
  });
  const polylinePoints = points.map((p) => `${p.cx},${p.cy}`).join(' ');

  return (
    <div
      className={`${slideUp} bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]`}
      style={{ animationDelay: '280ms' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-extrabold text-neutral-900 tracking-tight">
          总出勤工时趋势
        </h3>
        <div className="flex bg-zinc-100 rounded-xl p-0.5 gap-0.5">
          <button
            onClick={() => { setTimeframe('week'); setHoveredIndex(null); }}
            className={`px-3.5 py-1.5 text-[10px] rounded-lg transition-all duration-200 ${
              timeframe === 'week'
                ? 'bg-white shadow-[0_1px_4px_rgb(0,0,0,0.06)] text-neutral-900 font-bold'
                : 'text-neutral-400 font-medium'
            }`}
          >
            周趋势
          </button>
          <button
            onClick={() => { setTimeframe('month'); setHoveredIndex(null); }}
            className={`px-3.5 py-1.5 text-[10px] rounded-lg transition-all duration-200 ${
              timeframe === 'month'
                ? 'bg-white shadow-[0_1px_4px_rgb(0,0,0,0.06)] text-neutral-900 font-bold'
                : 'text-neutral-400 font-medium'
            }`}
          >
            月趋势
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Y-axis + grid */}
        <div className="absolute left-0 top-0 flex flex-col justify-between"
          style={{ height: CHART_H, width: 32 }}>
          {yTicks.map((v) => (
            <span key={v} className="text-[9px] font-medium text-neutral-400 leading-none translate-y-[-50%] first:translate-y-0 last:translate-y-0">
              {v}h
            </span>
          ))}
        </div>

        {/* Bars + SVG line area */}
        <div className="ml-8 relative" ref={containerRef} style={{ height: CHART_H }}>
          {/* Horizontal grid lines */}
          {yTicks.slice(1, -1).map((v) => (
            <div
              key={v}
              className="absolute left-0 right-0 border-t border-zinc-100 pointer-events-none"
              style={{ top: `${(1 - v / maxY) * 100}%` }}
            />
          ))}

          {/* Bars */}
          <div className="flex gap-2 h-full items-end">
            {data.map((d, i) => {
              const hPct = (d.hours / maxY) * 100;
              return (
                <div
                  key={d.label}
                  className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer group"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip */}
                  <div
                    className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white
                      text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap z-10
                      transition-all duration-200 pointer-events-none
                      ${hoveredIndex === i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
                  >
                    总工时: {d.hours}h
                  </div>

                  {/* Bar */}
                  <div
                    className="w-full bg-lime-500 rounded-t-md transition-all duration-500 ease-out
                      group-hover:brightness-110"
                    style={{ height: `${hPct}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* SVG line overlay */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={chartWidth}
            height={CHART_H}
            viewBox={`0 0 ${chartWidth} ${CHART_H}`}
          >
            {/* Gradient area under line */}
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#171717" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#171717" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Line */}
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#171717"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.cx}
                cy={p.cy}
                r={hoveredIndex === i ? 5 : 3.5}
                fill="#84cc16"
                stroke="white"
                strokeWidth="2"
                className="transition-all duration-200"
              />
            ))}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="ml-8 flex gap-2 mt-1.5">
          {data.map((d) => (
            <span
              key={d.label}
              className="flex-1 text-center text-[9px] font-medium text-neutral-400"
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
