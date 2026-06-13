import { useState, useRef, useEffect } from 'react';

type Timeframe = 'week' | 'month';

export interface DataPoint {
  label: string;
  hours: number;
  rate: number;
}

interface Props {
  weekData: DataPoint[];
  monthData: DataPoint[];
  weekMaxY: number;
  monthMaxY: number;
}

const CHART_H = 200;

const slideUp = 'opacity-0 animate-[slideUp_0.4s_ease-out_forwards]';

export function TrendChart({ weekData, monthData, weekMaxY, monthMaxY }: Props) {
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

  const data = timeframe === 'week' ? weekData : monthData;
  const maxY = timeframe === 'week' ? weekMaxY : monthMaxY;
  const yTicks = timeframe === 'week'
    ? [weekMaxY, Math.round(weekMaxY * 0.75), Math.round(weekMaxY * 0.5), Math.round(weekMaxY * 0.25), 0]
    : [monthMaxY, Math.round(monthMaxY * 0.75), Math.round(monthMaxY * 0.5), Math.round(monthMaxY * 0.25), 0];

  // Bar geometry: justify-around, each column center at chartWidth * (i+0.5) / N
  const barCount = data.length;

  // Line points for SVG (clamp to chart bounds)
  const points = data.map((d, i) => {
    const cx = chartWidth * (i + 0.5) / barCount;
    const cy = Math.max(0, Math.min(CHART_H, (1 - d.hours / maxY) * CHART_H));
    return { cx, cy, ...d };
  });

  // Monotone cubic bezier — stays within data bounds, no overshoot
  function smoothPath(pts: { cx: number; cy: number }[]): string {
    if (pts.length < 2) return '';
    const n = pts.length;
    let d = `M ${pts[0].cx},${pts[0].cy}`;
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, n - 1)];
      const tension = i === 0 || i === n - 2 ? 3 : 6;
      const cp1y = clampY(p1.cy + (p2.cy - p0.cy) / (tension * 2));
      const cp2y = clampY(p2.cy - (p3.cy - p1.cy) / (tension * 2));
      d += ` C ${p1.cx + (p2.cx - p0.cx) / tension},${cp1y} ${p2.cx - (p3.cx - p1.cx) / tension},${cp2y} ${p2.cx},${p2.cy}`;
    }
    return d;
  }
  function clampY(y: number) { return Math.max(0, Math.min(CHART_H, y)); }
  const smoothLinePath = smoothPath(points);

  return (
    <div
      className={`${slideUp} bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]`}
      style={{ animationDelay: '280ms' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-[13px] font-extrabold text-neutral-900 tracking-tight  mb-5">
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
          style={{ height: CHART_H, width: 36 }}>
          {yTicks.map((v, i) => (
            <span key={v}
              className="text-[9px] font-medium text-neutral-400 leading-none"
              style={{ transform: i === 0 ? 'translateY(0)' : i === yTicks.length - 1 ? 'translateY(0)' : 'translateY(-50%)' }}>
              {v}h
            </span>
          ))}
        </div>

        {/* Bars + SVG line area */}
        <div className="ml-8 relative border-l border-b border-zinc-200" ref={containerRef} style={{ height: CHART_H }}>
          {/* Horizontal grid lines */}
          {yTicks.slice(0, -1).map((v) => (
            <div
              key={v}
              className="absolute left-0 right-0 border-t border-dashed border-zinc-200 pointer-events-none"
              style={{ top: `${(1 - v / maxY) * 100}%` }}
            />
          ))}
          {/* Zero line */}
          <div className="absolute left-0 right-0 border-t border-zinc-300 pointer-events-none" style={{ top: '100%' }} />

          {/* Bars */}
          <div className="flex justify-around items-end h-full">
            {data.map((d, i) => {
              const hPct = Math.min(100, (d.hours / maxY) * 100);
              const isActive = hoveredIndex === i;
              return (
                <div
                  key={d.label}
                  className="flex flex-col items-center justify-end h-full relative"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip bubble */}
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none
                      transition-all duration-300
                      ${isActive ? 'opacity-100 -translate-y-0' : 'opacity-0 translate-y-1'}`}
                    style={{ top: `${100 - hPct}%`, marginTop: -36 }}
                  >
                    <div className="bg-neutral-900 text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap">
                      {d.hours}h
                    </div>
                    {/* Triangle pointer */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-neutral-900 rotate-45" />
                  </div>

                  {/* Bar */}
                  <div
                    className={`w-7 rounded-t-md transition-all duration-500 ease-out cursor-pointer
                      ${isActive
                        ? 'bg-lime-500 shadow-lg shadow-lime-500/30'
                        : 'bg-lime-500/10 bg-gradient-to-t from-lime-500/20 to-transparent'
                      }`}
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
            overflow="visible"
          >
            {/* Gradient area under line */}
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#171717" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#171717" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Smooth line */}
            <path
              d={smoothLinePath}
              fill="none"
              stroke="#84cc16"
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
                fill="#171717"
                stroke="white"
                strokeWidth="2"
                className="transition-all duration-200"
              />
            ))}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="ml-8 flex justify-around mt-1.5">
          {data.map((d) => (
            <span
              key={d.label}
              className="w-7 text-center text-[9px] font-medium text-neutral-400"
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
