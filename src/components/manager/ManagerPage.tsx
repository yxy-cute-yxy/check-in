import { useRef, useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { todayStr, getMonthRange, offsetDate, randomTime, computeStatus, generateAvatar, calcWorkHours } from '@/lib/utils';
import { TRADE_LIST } from '@/lib/constants';
import { HardHat } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { TrendChart } from '@/components/manager/TrendChart';
import type { AttendanceStatus, Worker, AttendanceRecord, Trade } from '@/types';

const slideUp = 'opacity-0 animate-[slideUp_0.4s_ease-out_forwards]';

const statusMap: Record<AttendanceStatus, { label: string; cls: string }> = {
  normal: { label: '正常', cls: 'bg-lime-50 text-lime-600' },
  late: { label: '迟到', cls: 'bg-orange-50 text-orange-500' },
  early: { label: '早退', cls: 'bg-orange-50 text-orange-500' },
  absent: { label: '缺勤', cls: 'bg-zinc-100 text-zinc-400' },
  leave: { label: '请假', cls: 'bg-sky-50 text-sky-500' },
};

// 演示团队数据 — 15 人，今日: 到岗11/迟到2/请假1/缺勤1
const DEMO_WORKERS: Array<{ name: string; trade: Trade; team: string; phone: string; idNumber: string }> = [
  { name: '张建国', trade: '木工', team: 'A班组', phone: '13810001001', idNumber: '110101198506120011' },
  { name: '李铁柱', trade: '电工', team: 'B班组', phone: '13810001002', idNumber: '110101199007230012' },
  { name: '王芳',   trade: '焊工', team: 'A班组', phone: '13810001003', idNumber: '110101199204150023' },
  { name: '赵大锤', trade: '钢筋工', team: 'C班组', phone: '13810001004', idNumber: '110101198811050014' },
  { name: '陈小兵', trade: '水泥工', team: 'B班组', phone: '13810001005', idNumber: '110101199503180015' },
  { name: '刘安全', trade: '架子工', team: 'C班组', phone: '13810001006', idNumber: '110101198203220016' },
  { name: '周师傅', trade: '木工', team: 'A班组', phone: '13810001007', idNumber: '110101199109090017' },
  { name: '吴工',   trade: '电工', team: 'B班组', phone: '13810001008', idNumber: '110101199308080018' },
  { name: '郑师傅', trade: '焊工', team: 'C班组', phone: '13810001009', idNumber: '110101198705050019' },
  { name: '钱大壮', trade: '钢筋工', team: 'A班组', phone: '13810001010', idNumber: '110101199410100020' },
  { name: '孙立',   trade: '水泥工', team: 'C班组', phone: '13810001011', idNumber: '110101198912120021' },
  { name: '马强',   trade: '架子工', team: 'A班组', phone: '13810001012', idNumber: '110101199107070022' },
  { name: '黄师傅', trade: '木工', team: 'B班组', phone: '13810001013', idNumber: '110101198404040023' },
  { name: '朱建',   trade: '电工', team: 'C班组', phone: '13810001014', idNumber: '110101199606060024' },
  { name: '冯刚',   trade: '焊工', team: 'B班组', phone: '13810001015', idNumber: '110101199312120025' },
];

function generateDemoTeam(): { workers: Worker[]; records: AttendanceRecord[] } {
  // 15 人 × 7 天状态序列 [6天前...今天]
  // 今日到岗 11 人(normal) / 迟到 2 人(late) / 请假 1 人(leave) / 缺勤 1 人(absent)
  const n='normal', l='late', e='early', a='absent', v='leave';
  const perWorkerPatterns: AttendanceStatus[][] = [
    [n,n,n,n,n,l,n], [n,n,n,n,e,n,n], [n,n,n,l,n,n,n], [n,n,n,n,n,a,n], // 1-4 今日=到岗
    [n,n,a,n,n,n,n], [n,n,n,n,n,l,n], [n,e,n,n,n,n,n], [n,n,n,a,n,n,n], // 5-8 今日=到岗
    [n,n,n,n,l,n,n], [n,n,e,n,n,n,n], [n,a,n,n,n,n,n],                   // 9-11 今日=到岗
    [n,n,n,n,n,n,l], [n,n,e,n,n,n,l],                                     // 12-13 今日=迟到
    [n,n,n,n,l,n,v],                                                     // 14 今日=请假
    [n,n,n,n,n,n,a],                                                     // 15 今日=缺勤
  ];

  const workers: Worker[] = DEMO_WORKERS.map(({ name, trade, team, phone, idNumber }, index) => ({
    id: `demo-${index}`,
    name,
    phone,
    idNumber,
    trade,
    team,
    photo: generateAvatar(name),
    registeredAt: new Date().toISOString(),
  }));

  const records: AttendanceRecord[] = [];
  workers.forEach((w, wi) => {
    const pattern = perWorkerPatterns[wi];
    for (let i = 0; i < 7; i++) {
      const date = offsetDate(new Date(), -(6 - i));
      const status = pattern[i];
      let checkInTime: string | null = null;
      let checkOutTime: string | null = null;

      if (status === 'absent' || status === 'leave') {
        // both null
      } else if (status === 'late') {
        checkInTime = randomTime('08:00:00', '09:30:00');
        checkOutTime = randomTime('18:00:00', '20:00:00');
      } else if (status === 'early') {
        checkInTime = randomTime('06:30:00', '07:55:00');
        checkOutTime = randomTime('16:00:00', '17:55:00');
      } else {
        checkInTime = randomTime('06:30:00', '07:55:00');
        checkOutTime = randomTime('18:00:00', '20:00:00');
      }

      records.push({
        id: `demo-${wi}-${date}`,
        workerId: w.id,
        date,
        checkInTime,
        checkOutTime,
        checkInPhoto: null,
        checkOutPhoto: null,
        checkInLocation: null,
        checkOutLocation: null,
        status,
      });
    }
  });

  return { workers, records };
}

export function ManagerPage() {
  const { state, dispatch } = useApp();
  const seeded = useRef(false);
  const today = todayStr();
  const now = new Date();
  const monthRange = getMonthRange(now);
  const [selectedTrade, setSelectedTrade] = useState<Trade | 'all'>('all');
  const [selectedTeam, setSelectedTeam] = useState<string | 'all'>('all');
  const [anomalyWorkerId, setAnomalyWorkerId] = useState<string | null>(null);
  const MAX_DAILY = 8;
  const MAX_MONTHLY = 160;

  // 首次进入且没有今日演示数据时自动生成
  useEffect(() => {
    if (seeded.current) return;
    const hasToday = state.attendanceLogs.some((r) => r.workerId.startsWith('demo-') && r.date === today);
    if (hasToday) { seeded.current = true; return; }
    seeded.current = true;
    const { workers, records } = generateDemoTeam();
    workers.forEach((w) => dispatch({ type: 'ADD_WORKER', payload: w }));
    records.forEach((r) => dispatch({ type: 'ADD_ATTENDANCE', payload: r }));
  }, [state.attendanceLogs, dispatch, today]);

  const allWorkers = state.workers;
  const logs = state.attendanceLogs;

  // 按工种过滤
  const workers = selectedTrade === 'all'
    ? allWorkers
    : allWorkers.filter((w) => w.trade === selectedTrade);

  const workerIds = new Set(workers.map((w) => w.id));
  const totalHeadcount = selectedTrade === 'all' ? allWorkers.length : allWorkers.filter((w) => w.trade === selectedTrade).length;

  // 今日全局统计（仅过滤后工人）
  const todayLogs = logs.filter((l) => l.date === today && workerIds.has(l.workerId));
  const todayNormal = todayLogs.filter((l) => l.status === 'normal').length;
  const todayLate = todayLogs.filter((l) => l.status === 'late').length;
  const todayEarly = todayLogs.filter((l) => l.status === 'early').length;
  const todayAbsent = todayLogs.filter((l) => l.status === 'absent').length;
  const todayLeave = todayLogs.filter((l) => l.status === 'leave').length;
  // 真正到岗 = 正常 + 迟到 + 早退（排除请假、缺勤）
  const todayCheckedIn = todayNormal + todayLate + todayEarly;
  const todayRate = workers.length > 0 ? Math.round((todayCheckedIn / workers.length) * 100) : 0;

  // 各工种今日到岗率（全部视图进度条）
  const tradeRates = TRADE_LIST.map((trade) => {
    const tw = allWorkers.filter((w) => w.trade === trade);
    const tIds = new Set(tw.map((w) => w.id));
    const tLogs = logs.filter((l) => l.date === today && tIds.has(l.workerId));
    const arrived = tLogs.filter((l) => l.status === 'normal' || l.status === 'late' || l.status === 'early').length;
    return { label: trade, total: tw.length, arrived, rate: tw.length > 0 ? Math.round((arrived / tw.length) * 100) : 0 };
  });

  // 各小组今日到岗率（工种视图进度条）
  const teams = [...new Set(workers.map((w) => w.team))].sort();
  const teamRates = teams.map((team) => {
    const tw = workers.filter((w) => w.team === team);
    const tIds = new Set(tw.map((w) => w.id));
    const tLogs = logs.filter((l) => l.date === today && tIds.has(l.workerId));
    const arrived = tLogs.filter((l) => l.status === 'normal' || l.status === 'late' || l.status === 'early').length;
    return { label: team, total: tw.length, arrived, rate: tw.length > 0 ? Math.round((arrived / tw.length) * 100) : 0 };
  });

  // 每人月度统计
  const workerStats = workers.map((w) => {
    const monthLogs = logs.filter(
      (l) =>
        l.workerId === w.id &&
        l.date >= monthRange.start &&
        l.date <= monthRange.end
    );
    let totalHours = 0;
    const anomalyDays: { date: string; hours: number; status: AttendanceStatus }[] = [];
    monthLogs.forEach((l) => {
      const h = calcWorkHours(l.checkInTime, l.checkOutTime);
      totalHours += h;
      if (h > MAX_DAILY && l.status !== 'absent' && l.status !== 'leave') {
        anomalyDays.push({ date: l.date, hours: h, status: l.status });
      }
    });
    const totalDays = monthLogs.length;
    const normalDays = monthLogs.filter((l) => l.status === 'normal').length;
    const rate = totalDays > 0 ? Math.round((normalDays / totalDays) * 100) : 0;
    const todayRecord = todayLogs.find((l) => l.workerId === w.id);
    const todayStatus: AttendanceStatus | 'none' = todayRecord ? todayRecord.status : 'none';
    const isAnomaly = totalHours > MAX_MONTHLY;

    return { worker: w, totalDays, totalHours, rate, todayStatus, isAnomaly, anomalyDays };
  });

  workerStats.sort((a, b) => b.rate - a.rate);

  // 组别筛选（仅工种视图）
  const filteredStats = selectedTeam === 'all' || selectedTrade === 'all'
    ? workerStats
    : workerStats.filter((s) => s.worker.team === selectedTeam);

  function StatusBadge({ status }: { status: AttendanceStatus | 'none' }) {
    if (status === 'none') {
      return (
        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-zinc-50 text-zinc-300">
          未打卡
        </span>
      );
    }
    const { label, cls } = statusMap[status];
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${cls}`}>
        {label}
      </span>
    );
  }

  return (
    <div className="p-4 pb-8 space-y-4">
      {/* 顶部深炭黑大卡 */}
      <div className={`${slideUp} bg-neutral-900 rounded-3xl p-6 text-white shadow-[0_12px_40px_rgb(0,0,0,0.15)]`}
        style={{ animationDelay: '0ms' }}>
        <div className="flex items-center gap-2 mb-3">
          <HardHat className="w-4 h-4 text-lime-400" />
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-zinc-500">
            Manager Console
          </p>
        </div>
        <h2 className="text-2xl font-black tracking-tight leading-tight">
          工地考勤数据总览
        </h2>
        <p className="text-[13px] font-medium text-lime-400 mt-2">
          {now.toLocaleDateString('zh-CN', {
            year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
          })}
        </p>
      </div>

      {/* 工种筛选器 */}
      <div className={`${slideUp}`} style={{ animationDelay: '80ms' }}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-neutral-400 tracking-wider">筛选</span>
          <div className="flex bg-zinc-100 rounded-2xl p-1 gap-1 flex-wrap">
            <button
              onClick={() => { setSelectedTrade('all'); setSelectedTeam('all'); }}
              className={`px-4 py-1.5 text-[11px] rounded-xl transition-all duration-200 ${
                selectedTrade === 'all'
                  ? 'bg-white shadow-[0_2px_8px_rgb(0,0,0,0.06)] text-neutral-900 font-bold'
                  : 'text-neutral-400 font-medium'
              }`}
            >
              全部
            </button>
            {TRADE_LIST.map((trade) => (
              <button
                key={trade}
                onClick={() => { setSelectedTrade(trade); setSelectedTeam('all'); }}
                className={`px-4 py-1.5 text-[11px] rounded-xl transition-all duration-200 ${
                  selectedTrade === trade
                    ? 'bg-white shadow-[0_2px_8px_rgb(0,0,0,0.06)] text-neutral-900 font-bold'
                    : 'text-neutral-400 font-medium'
                }`}
              >
                {trade}
              </button>
            ))}
          </div>
          {selectedTrade !== 'all' && (
            <span className="text-[10px] font-medium text-lime-600 bg-lime-50 px-2.5 py-1 rounded-full shrink-0">
              {selectedTrade}在册 {totalHeadcount} 人
            </span>
          )}
        </div>
      </div>

      {/* KPI 四列数字卡 */}
      <div className={`${slideUp} grid grid-cols-4 gap-2`} style={{ animationDelay: '160ms' }}>
        <div className="bg-white rounded-2xl p-2.5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                        flex flex-col items-center text-center">
          <span className="text-[22px] font-extrabold text-lime-500 tracking-tight tabular-nums leading-none">
            {todayCheckedIn}<span className="text-[14px] text-zinc-300">/{workers.length}</span>
          </span>
          <span className="text-[10px] text-neutral-400 font-medium mt-1">今日到岗</span>
        </div>

        <div className="bg-white rounded-2xl p-2.5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                        flex flex-col items-center text-center">
          <span className="text-[22px] font-extrabold text-neutral-900 tracking-tight tabular-nums leading-none">
            {todayLeave}
          </span>
          <span className="text-[10px] text-neutral-400 font-medium mt-1">请假</span>
        </div>

        <div className="bg-white rounded-2xl p-2.5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                        flex flex-col items-center text-center">
          <span className="text-[22px] font-extrabold text-orange-500 tracking-tight tabular-nums leading-none">
            {todayLate + todayEarly}
          </span>
          <span className="text-[10px] text-neutral-400 font-medium mt-1">迟到早退</span>
        </div>

        <div className="bg-white rounded-2xl p-2.5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                        flex flex-col items-center text-center">
          <span className="text-[22px] font-extrabold text-zinc-300 tracking-tight tabular-nums leading-none">
            {todayAbsent}
          </span>
          <span className="text-[10px] text-neutral-400 font-medium mt-1">缺勤</span>
        </div>
      </div>

      {/* 到岗率环形图 */}
      {(() => {
        const gEnd = workers.length > 0 ? (todayCheckedIn / workers.length) * 360 : 0;
        const bars = selectedTrade === 'all' ? tradeRates : teamRates;
        return (
          <div className={`${slideUp} bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]`}
            style={{ animationDelay: '240ms' }}>
            <h3 className="text-[15px] font-extrabold text-neutral-900 tracking-tight mb-3">
              到岗率
            </h3>
            <div className="flex items-start gap-5">
              <div className="flex flex-col items-center shrink-0">
                <div
                  className="ring-chart-lg"
                  style={{ backgroundImage: `conic-gradient(#84cc16 0deg ${gEnd}deg, #e4e4e7 ${gEnd}deg 360deg)` }}
                >
                  <span className="relative z-10 text-xl font-extrabold text-neutral-900 tabular-nums tracking-tight">
                    {todayRate}%
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-medium mt-2 text-center leading-relaxed">
                  应到{workers.length}人，实到{todayCheckedIn}人
                </p>
              </div>
              <div className="flex-1 space-y-3 pt-1">
                {bars.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-[11px] text-neutral-500 font-medium w-12 shrink-0">{item.label}</span>
                    <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-lime-500 rounded-full transition-all duration-500"
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-extrabold text-neutral-900 tabular-nums w-8 text-right">
                      {item.rate}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );})()}

      {/* 总出勤工时趋势图 */}
      <TrendChart />

      {/* 异常打卡详情 */}
      {anomalyWorkerId && (() => {
        const stat = workerStats.find((s) => s.worker.id === anomalyWorkerId);
        if (!stat) return null;
        const { worker, totalHours, anomalyDays } = stat;
        return (
          <div className="bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] animate-[slideUp_0.3s_ease-out_forwards]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[13px] font-extrabold text-neutral-900">
                {worker.name} · 异常打卡
              </h4>
              <button
                onClick={() => setAnomalyWorkerId(null)}
                className="text-[11px] font-bold text-zinc-300 hover:text-zinc-500 transition-colors"
              >
                收起
              </button>
            </div>
            {anomalyDays.length > 0 ? (
              <div className="space-y-1.5">
                {anomalyDays.map((d) => (
                  <div key={d.date} className="flex items-center gap-3 text-[12px]">
                    <span className="text-neutral-500 w-20 shrink-0">{d.date}</span>
                    <StatusBadge status={d.status} />
                    <span className="flex-1" />
                    <span className="font-extrabold text-orange-500 tabular-nums">{d.hours.toFixed(1)}h</span>
                    <span className="text-[10px] text-zinc-400">超 {MAX_DAILY}h/天</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-neutral-500">
                月总工时 <span className="font-extrabold text-orange-500">{totalHours.toFixed(1)}h</span>，超出 {MAX_MONTHLY}h 上限
              </p>
            )}
          </div>
        );
      })()}

      {/* 考勤表格 */}
      <div className={`${slideUp} bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)]`}
        style={{ animationDelay: '320ms' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase">
            {selectedTrade === 'all' ? '全员月度考勤' : `${selectedTrade}月度考勤`}
          </p>
          {selectedTrade !== 'all' && (
            <div className="flex bg-zinc-100 rounded-xl p-0.5 gap-0.5">
              <button
                onClick={() => setSelectedTeam('all')}
                className={`px-3 py-1 text-[10px] rounded-lg transition-all duration-200 ${
                  selectedTeam === 'all'
                    ? 'bg-white shadow-[0_1px_4px_rgb(0,0,0,0.06)] text-neutral-900 font-bold'
                    : 'text-neutral-400 font-medium'
                }`}
              >
                全部
              </button>
              {teams.map((team) => (
                <button
                  key={team}
                  onClick={() => setSelectedTeam(team)}
                  className={`px-3 py-1 text-[10px] rounded-lg transition-all duration-200 ${
                    selectedTeam === team
                      ? 'bg-white shadow-[0_1px_4px_rgb(0,0,0,0.06)] text-neutral-900 font-bold'
                      : 'text-neutral-400 font-medium'
                  }`}
                >
                  {team}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="overflow-x-auto -mx-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] font-bold text-neutral-400">姓名</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400">工种</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400">班组</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400">月总工时</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400">出勤率</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400">今日状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStats.map(({ worker, totalHours, rate, todayStatus, isAnomaly }) => (
                <TableRow key={worker.id}>
                  <TableCell className="text-[13px] font-bold text-neutral-900">
                    {worker.name}
                  </TableCell>
                  <TableCell className="text-[12px] text-neutral-500 font-medium">
                    {worker.trade}
                  </TableCell>
                  <TableCell className="text-[12px] text-neutral-500 font-medium">
                    {worker.team}
                  </TableCell>
                  <TableCell className="text-[13px] font-extrabold text-neutral-900 tabular-nums tracking-tight">
                    <button
                      onClick={() => setAnomalyWorkerId(anomalyWorkerId === worker.id ? null : worker.id)}
                      className="flex items-center gap-1.5 group"
                    >
                      <span>{totalHours.toFixed(1)}h</span>
                      {isAnomaly && (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 ring-2 ring-orange-100" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-[13px] font-extrabold tabular-nums tracking-tight">
                    <span className={rate >= 80 ? 'text-lime-500' : rate > 0 ? 'text-orange-500' : 'text-zinc-300'}>
                      {rate}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={todayStatus} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
