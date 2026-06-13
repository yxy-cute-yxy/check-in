import { useRef, useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { todayStr, offsetDate, generateAvatar, calcWorkHours } from '@/lib/utils';
import { TRADE_LIST } from '@/lib/constants';
import { HardHat } from 'lucide-react';
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

// 演示团队数据 — 22人，今日: 到岗20(18正常+1迟到+1早退)/请假1/缺勤1
type WorkerProfile = 'perfect' | 'good' | 'poor';
const DEMO_WORKERS: Array<{ name: string; trade: Trade; team: string; phone: string; idNumber: string; profile: WorkerProfile }> = [
  // 满勤模范 10人 (indices 0-9): 月度出勤率 100%
  { name: '张建国', trade: '木工',   team: 'A班组', phone: '13810001001', idNumber: '110101198506120011', profile: 'perfect' },
  { name: '李铁柱', trade: '电工',   team: 'B班组', phone: '13810001002', idNumber: '110101199007230012', profile: 'perfect' },
  { name: '王芳',   trade: '焊工',   team: 'A班组', phone: '13810001003', idNumber: '110101199204150023', profile: 'perfect' },
  { name: '赵大锤', trade: '钢筋工', team: 'C班组', phone: '13810001004', idNumber: '110101198811050014', profile: 'perfect' },
  { name: '陈小兵', trade: '水泥工', team: 'B班组', phone: '13810001005', idNumber: '110101199503180015', profile: 'perfect' },
  { name: '刘安全', trade: '架子工', team: 'C班组', phone: '13810001006', idNumber: '110101198203220016', profile: 'perfect' },
  { name: '周师傅', trade: '木工',   team: 'A班组', phone: '13810001007', idNumber: '110101199109090017', profile: 'perfect' },
  { name: '吴工',   trade: '电工',   team: 'B班组', phone: '13810001008', idNumber: '110101199308080018', profile: 'perfect' },
  { name: '郑师傅', trade: '焊工',   team: 'C班组', phone: '13810001009', idNumber: '110101198705050019', profile: 'perfect' },
  { name: '钱大壮', trade: '钢筋工', team: 'A班组', phone: '13810001010', idNumber: '110101199410100020', profile: 'perfect' },
  // 良好 6人 (indices 10-15): 月度出勤率 88-99%
  { name: '孙立',   trade: '水泥工', team: 'C班组', phone: '13810001011', idNumber: '110101198912120021', profile: 'good' },
  { name: '马强',   trade: '架子工', team: 'A班组', phone: '13810001012', idNumber: '110101199107070022', profile: 'good' },
  { name: '黄师傅', trade: '木工',   team: 'B班组', phone: '13810001013', idNumber: '110101198404040023', profile: 'good' },
  { name: '朱建',   trade: '电工',   team: 'C班组', phone: '13810001014', idNumber: '110101199606060024', profile: 'good' },
  { name: '冯刚',   trade: '焊工',   team: 'B班组', phone: '13810001015', idNumber: '110101199312120025', profile: 'good' },
  { name: '胡国栋', trade: '钢筋工', team: 'B班组', phone: '13810001016', idNumber: '110101198808080026', profile: 'good' },
  // 不合格 6人 (indices 16-21): 月度出勤率 60-77%
  { name: '林建设', trade: '水泥工', team: 'A班组', phone: '13810001017', idNumber: '110101199001010027', profile: 'poor' },
  { name: '杨光明', trade: '木工',   team: 'C班组', phone: '13810001018', idNumber: '110101198512120028', profile: 'poor' },
  { name: '许志强', trade: '电工',   team: 'A班组', phone: '13810001019', idNumber: '110101199308080029', profile: 'poor' },
  { name: '何大伟', trade: '钢筋工', team: 'C班组', phone: '13810001020', idNumber: '110101198909090030', profile: 'poor' },
  { name: '沈师傅', trade: '架子工', team: 'B班组', phone: '13810001021', idNumber: '110101199105050031', profile: 'poor' },
  { name: '曹刚',   trade: '焊工',   team: 'A班组', phone: '13810001022', idNumber: '110101199407070032', profile: 'poor' },
];

// 确定性 hash，保证演示数据每次相同
function dHash(wi: number, offset: number, seed: number): number {
  return ((wi * 31 + offset * 17 + seed * 13 + 7) % 101) / 100;
}

// 确定性时间生成，替代 randomTime，确保每次数据一致
function dTime(hash: number, start: string, end: string): string {
  const [sh, sm, ss] = start.split(':').map(Number);
  const [eh, em, es] = end.split(':').map(Number);
  const startSec = sh * 3600 + sm * 60 + ss;
  const endSec = eh * 3600 + em * 60 + es;
  const sec = startSec + Math.floor(hash * (endSec - startSec));
  const hh = Math.floor(sec / 3600);
  const mm = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function generateDemoTeam(): { workers: Worker[]; records: AttendanceRecord[] } {
  const workers: Worker[] = DEMO_WORKERS.map(({ name, trade, team, phone, idNumber }, index) => ({
    id: `demo-${index}`,
    name, phone, idNumber, trade, team,
    photo: generateAvatar(name),
    registeredAt: new Date().toISOString(),
  }));

  const records: AttendanceRecord[] = [];
  const today = new Date();
  const TOTAL_DAYS = 30;

  workers.forEach((w, wi) => {
    const profile = DEMO_WORKERS[wi].profile;

    for (let offset = 0; offset < TOTAL_DAYS; offset++) {
      const date = offsetDate(today, -offset);
      let status: AttendanceStatus;

      // === 今天 (offset 0): 精确控制分布 ===
      if (offset === 0) {
        if (wi === 20)           status = 'leave';
        else if (wi === 21)      status = 'absent';
        else if (wi === 18)      status = 'late';
        else if (wi === 19)      status = 'early';
        else                     status = 'normal';
      }
      // === 周日 (offset 6): 低出勤，制造趋势图低谷 ===
      else if (offset === 6) {
        if (wi < 8)              status = 'normal';
        else if (wi < 11)        status = 'leave';
        else                     status = 'absent';
      }
      // === 近 7 天周一到周五 (offset 1-5): 全员出勤，仅区分正常/迟到/早退 ===
      else if (offset <= 5) {
        const h = dHash(wi, offset, 1);
        if (profile === 'perfect') {
          status = 'normal';
        } else if (profile === 'good') {
          status = h < 0.04 ? 'late' : h < 0.07 ? 'early' : 'normal';
        } else {
          status = h < 0.05 ? 'late' : h < 0.09 ? 'early' : 'normal';
        }
      }
      // === 历史数据 (offset 7-29): 决定月度统计 ===
      else {
        const h = dHash(wi, offset, 2);
        if (profile === 'perfect') {
          status = 'normal'; // 满勤: 从不缺勤
        } else if (profile === 'good') {
          if (h < 0.03) status = 'absent';
          else if (h < 0.06) status = 'late';
          else if (h < 0.09) status = 'early';
          else if (h < 0.11) status = 'leave';
          else status = 'normal';
        } else {
          // poor: ~65-75% normal
          if (h < 0.14) status = 'absent';
          else if (h < 0.22) status = 'late';
          else if (h < 0.28) status = 'early';
          else if (h < 0.32) status = 'leave';
          else status = 'normal';
        }
      }

      const tHash = dHash(wi, offset, 3); // 确定性时间种子
      let checkInTime: string | null = null;
      let checkOutTime: string | null = null;

      if (status === 'absent' || status === 'leave') {
        // no times
      } else if (status === 'late') {
        checkInTime = dTime(tHash, '08:00:00', '09:30:00');
        checkOutTime = dTime(tHash, '16:00:00', '18:00:00');
      } else if (status === 'early') {
        checkInTime = dTime(tHash, '06:00:00', '07:00:00');
        checkOutTime = dTime(tHash, '14:00:00', '15:30:00');
      } else if (wi === 0 || wi === 1) {
        // 张建国、李铁柱: 长工时标兵，月度>248h触发异常
        checkInTime = dTime(tHash, '06:00:00', '06:30:00');
        checkOutTime = dTime(tHash, '17:00:00', '18:00:00');
      } else {
        checkInTime = dTime(tHash, '07:00:00', '07:45:00');
        checkOutTime = dTime(tHash, '15:00:00', '16:00:00');
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

function Dot({ color }: { color: string }) {
  return <span className={`inline-block w-1.5 h-1.5 rounded-full mr-0.5 align-middle ${color}`} />;
}

export function ManagerPage() {
  const { state, dispatch } = useApp();
  const seeded = useRef(false);
  const today = todayStr();
  const now = new Date();
  const monthRange = { start: offsetDate(now, -29), end: today };
  const [selectedTrade, setSelectedTrade] = useState<Trade | 'all'>('all');
  const [selectedTeam, setSelectedTeam] = useState<string | 'all'>('all');
  const [anomalyWorkerId, setAnomalyWorkerId] = useState<string | null>(null);
  const [kpiDetail, setKpiDetail] = useState<'leave' | 'lateEarly' | 'absent' | null>(null);
  const [showAllTable, setShowAllTable] = useState(false);
  const [sortKey, setSortKey] = useState<'rate' | 'anomaly'>('rate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const MAX_DAILY = 8;
  const MAX_MONTHLY = 31 * 8;

  // 首次进入且没有今日演示数据时自动生成
  const DEMO_VERSION = 4;
  useEffect(() => {
    if (seeded.current) return;
    const storedVer = localStorage.getItem('demo_v');
    const demoWorkerCount = state.workers.filter((w) => w.id.startsWith('demo-')).length;
    const hasToday = state.attendanceLogs.some((r) => r.workerId.startsWith('demo-') && r.date === today);
    // 版本匹配 + 22人 + 今日有记录 → 跳过
    if (hasToday && demoWorkerCount === DEMO_WORKERS.length && storedVer === String(DEMO_VERSION)) {
      seeded.current = true;
      return;
    }
    seeded.current = true;
    // 版本不匹配或数据异常：彻底清除旧数据
    if (demoWorkerCount > 0 || storedVer !== String(DEMO_VERSION)) {
      localStorage.removeItem('checkin_state');
      dispatch({ type: 'CLEAR_DEMO_DATA' });
    }
    localStorage.setItem('demo_v', String(DEMO_VERSION));
    const { workers, records } = generateDemoTeam();
    workers.forEach((w) => dispatch({ type: 'ADD_WORKER', payload: w }));
    records.forEach((r) => dispatch({ type: 'ADD_ATTENDANCE', payload: r }));
  }, [state.attendanceLogs, state.workers, dispatch, today]);

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
  const todayCheckedIn = todayNormal + todayLate + todayEarly;
  const todayRate = workers.length > 0 ? Math.round((todayCheckedIn / workers.length) * 100) : 0;

  // 今日各类别人员明细
  const todayLateEarlyWorkers = todayLogs.filter((l) => l.status === 'late' || l.status === 'early')
    .map((l) => ({ ...l, worker: workers.find((w) => w.id === l.workerId)! })).filter((x) => x.worker);
  const todayLeaveWorkers = todayLogs.filter((l) => l.status === 'leave')
    .map((l) => ({ ...l, worker: workers.find((w) => w.id === l.workerId)! })).filter((x) => x.worker);
  const todayAbsentWorkers = todayLogs.filter((l) => l.status === 'absent')
    .map((l) => ({ ...l, worker: workers.find((w) => w.id === l.workerId)! })).filter((x) => x.worker);

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

  // 周趋势数据（近7天，每日独立工时）
  const weekLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekTrend = Array.from({ length: 7 }, (_, i) => {
    const d = offsetDate(new Date(), -(6 - i));
    const label = weekLabels[new Date(d).getDay()];
    const dayLogs = logs.filter((l) => l.date === d && workerIds.has(l.workerId));
    let hours = 0;
    let arrived = 0;
    let total = 0;
    dayLogs.forEach((l) => {
      hours += calcWorkHours(l.checkInTime, l.checkOutTime);
      if (l.status === 'normal' || l.status === 'late' || l.status === 'early') arrived++;
      total++;
    });
    const rate = total > 0 ? Math.round((arrived / total) * 100) : 0;
    return { label, hours: Math.round(hours), rate };
  });

  // 月趋势数据（30天滚动，6个5天桶，每段独立工时，体现波动）
  const monthStarts = [30, 25, 20, 15, 10, 5];
  const monthLabels = ['30日前', '25日前', '20日前', '15日前', '10日前', '5日前'];
  const monthTrend = monthStarts.map((start, i) => {
    const end = i < monthStarts.length - 1 ? monthStarts[i + 1] : 0;
    let hours = 0;
    let arrived = 0;
    let total = 0;
    for (let offset = start - 1; offset >= end; offset--) {
      const date = offsetDate(new Date(), -offset);
      const dayLogs = logs.filter((l) => l.date === date && workerIds.has(l.workerId));
      dayLogs.forEach((l) => {
        hours += calcWorkHours(l.checkInTime, l.checkOutTime);
        if (l.status === 'normal' || l.status === 'late' || l.status === 'early') arrived++;
        total++;
      });
    }
    const rate = total > 0 ? Math.round((arrived / total) * 100) : 0;
    return { label: monthLabels[i], hours: Math.round(hours), rate };
  });

  // Y 轴最大值：周=每日独立，月=每段独立（5天/段）
  const weekMaxY = workers.length * 12;
  const monthMaxY = Math.ceil(workers.length * MAX_DAILY * 5 * 1.25);

  // 每人月度统计（基于30天滚动窗口）
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
    const lateCount = monthLogs.filter((l) => l.status === 'late').length;
    const earlyCount = monthLogs.filter((l) => l.status === 'early').length;
    const leaveCount = monthLogs.filter((l) => l.status === 'leave').length;
    const absentCount = monthLogs.filter((l) => l.status === 'absent').length;
    const rate = totalDays > 0 ? Math.round(((normalDays + lateCount + earlyCount) / totalDays) * 100) : 0;
    const todayRecord = todayLogs.find((l) => l.workerId === w.id);
    const todayStatus: AttendanceStatus | 'none' = todayRecord ? todayRecord.status : 'none';
    const isAnomaly = totalHours > MAX_MONTHLY;

    return { worker: w, totalDays, totalHours, rate, todayStatus, isAnomaly, anomalyDays, normalDays, lateCount, earlyCount, leaveCount, absentCount };
  });

  // 组别筛选（仅工种视图）
  const filteredStats = selectedTeam === 'all' || selectedTrade === 'all'
    ? workerStats
    : workerStats.filter((s) => s.worker.team === selectedTeam);

  // 动态排序
  const sortedStats = [...filteredStats].sort((a, b) => {
    if (sortKey === 'rate') {
      return sortDir === 'asc' ? a.rate - b.rate : b.rate - a.rate;
    }
    return sortDir === 'desc' ? b.lateCount - a.lateCount : a.lateCount - b.lateCount;
  });

  const COLLAPSE_THRESHOLD = 12;
  const tooMany = filteredStats.length > COLLAPSE_THRESHOLD;
  const displayedStats = tooMany && !showAllTable
    ? sortedStats.slice(0, COLLAPSE_THRESHOLD)
    : sortedStats;

  // 异常详情子页面
  if (anomalyWorkerId) {
    const stat = workerStats.find((s) => s.worker.id === anomalyWorkerId);
    if (!stat) return null;
    const { worker, totalHours, anomalyDays } = stat;
    return (
      <div className="p-4 pb-8 space-y-4 animate-[slideUp_0.3s_ease-out_forwards]">
        {/* 返回栏 */}
        <button
          onClick={() => setAnomalyWorkerId(null)}
          className="flex items-center gap-1.5 text-[13px] font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <span className="text-lg leading-none">&larr;</span> 返回统计看板
        </button>

        {/* 工人信息卡 */}
        <div className="bg-neutral-900 rounded-3xl p-6 text-white shadow-[0_12px_40px_rgb(0,0,0,0.15)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-lime-500 flex items-center justify-center text-white font-extrabold text-lg">
              {worker.name.charAt(worker.name.length - 1)}
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">{worker.name}</h2>
              <p className="text-[12px] text-zinc-400">{worker.trade} · {worker.team}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-2xl p-3">
              <p className="text-[10px] text-zinc-400 mb-0.5">月总工时</p>
              <p className="text-2xl font-extrabold text-orange-400 tracking-tight">
                {totalHours.toFixed(1)}<span className="text-sm text-zinc-400 font-medium">h</span>
              </p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3">
              <p className="text-[10px] text-zinc-400 mb-0.5">异常阈值</p>
              <p className="text-2xl font-extrabold text-white tracking-tight">
                {MAX_MONTHLY}<span className="text-sm text-zinc-400 font-medium">h</span>
              </p>
            </div>
          </div>
          {totalHours > MAX_MONTHLY && (
            <p className="text-[11px] text-orange-400 font-medium mt-3">
              超出阈值 {(totalHours - MAX_MONTHLY).toFixed(1)}h
            </p>
          )}
        </div>

        {/* 每日异常明细 */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <h3 className="text-[13px] font-extrabold text-neutral-900 mb-4">
            {anomalyDays.length > 0 ? `日工时 > ${MAX_DAILY}h 明细（${anomalyDays.length}天）` : '月度工时汇总'}
          </h3>
          {anomalyDays.length > 0 ? (
            <div className="space-y-2">
              {anomalyDays.map((d) => (
                <div key={d.date} className="flex items-center gap-3 py-2 border-b border-zinc-100 last:border-0">
                  <span className="text-[13px] font-bold text-neutral-700 w-24 shrink-0">{d.date}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusMap[d.status].cls}`}>
                    {statusMap[d.status].label}
                  </span>
                  <span className="flex-1" />
                  <span className="text-[15px] font-extrabold text-orange-500 tabular-nums">{d.hours.toFixed(1)}h</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-neutral-500">
              该工人月总工时 {totalHours.toFixed(1)}h，超过月度上限 {MAX_MONTHLY}h，但无单日超 {MAX_DAILY}h 记录。
            </p>
          )}
        </div>
      </div>
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
          工地考勤数据统计
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

      {/* KPI 今日卡片 */}
      <div className={`${slideUp} grid grid-cols-4 gap-2`} style={{ animationDelay: '160ms' }}>
        <div className="bg-white rounded-2xl py-4 px-2 shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                        flex flex-col items-center justify-center text-center">
          <span className="text-[28px] font-extrabold text-lime-500 tracking-tight tabular-nums leading-none">
            {todayCheckedIn}<span className="text-[16px] text-zinc-300">/{workers.length}</span>
          </span>
          <span className="text-[11px] text-neutral-400 font-medium mt-1.5">今日到岗</span>
        </div>

        <button
          onClick={() => setKpiDetail(kpiDetail === 'leave' ? null : 'leave')}
          className={`bg-white rounded-2xl py-4 px-2 shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                        flex flex-col items-center justify-center text-center transition-all duration-200
                        ${kpiDetail === 'leave' ? 'ring-2 ring-sky-300' : 'hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)]'}`}>
          <span className="text-[28px] font-extrabold text-neutral-900 tracking-tight tabular-nums leading-none">
            {todayLeave}
          </span>
          <span className="text-[11px] text-neutral-400 font-medium mt-1.5">请假</span>
        </button>

        <button
          onClick={() => setKpiDetail(kpiDetail === 'lateEarly' ? null : 'lateEarly')}
          className={`bg-white rounded-2xl py-4 px-2 shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                        flex flex-col items-center justify-center text-center transition-all duration-200
                        ${kpiDetail === 'lateEarly' ? 'ring-2 ring-orange-300' : 'hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)]'}`}>
          <span className="text-[28px] font-extrabold text-orange-500 tracking-tight tabular-nums leading-none">
            {todayLate + todayEarly}
          </span>
          <span className="text-[11px] text-neutral-400 font-medium mt-1.5">迟到早退</span>
        </button>

        <button
          onClick={() => setKpiDetail(kpiDetail === 'absent' ? null : 'absent')}
          className={`bg-white rounded-2xl py-4 px-2 shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                        flex flex-col items-center justify-center text-center transition-all duration-200
                        ${kpiDetail === 'absent' ? 'ring-2 ring-zinc-300' : 'hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)]'}`}>
          <span className="text-[28px] font-extrabold text-zinc-300 tracking-tight tabular-nums leading-none">
            {todayAbsent}
          </span>
          <span className="text-[11px] text-neutral-400 font-medium mt-1.5">缺勤</span>
        </button>
      </div>

      {/* KPI 点击详情 */}
      {kpiDetail && (() => {
        const detailData = kpiDetail === 'lateEarly' ? todayLateEarlyWorkers
          : kpiDetail === 'leave' ? todayLeaveWorkers
          : todayAbsentWorkers;
        const titleMap = { lateEarly: '今日迟到 / 早退', leave: '今日请假', absent: '今日缺勤' };
        const colorMap = { lateEarly: 'text-orange-500', leave: 'text-sky-500', absent: 'text-zinc-400' };
        return (
          <div className={`${slideUp} bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]`}
            style={{ animationDelay: '0ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-[14px] font-extrabold ${colorMap[kpiDetail]}`}>
                {titleMap[kpiDetail]} <span className="text-neutral-400 font-medium">· {detailData.length}人</span>
              </h3>
              <button
                onClick={() => setKpiDetail(null)}
                className="text-[11px] font-bold text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                收起 ▲
              </button>
            </div>
            <div className="space-y-2">
              {detailData.map(({ worker, status, checkInTime, checkOutTime }) => (
                <div key={worker.id} className="flex items-center gap-3 py-2 border-b border-zinc-50 last:border-0">
                  <div className="w-8 h-8 rounded-xl bg-lime-500 flex items-center justify-center text-white font-extrabold text-xs shrink-0">
                    {worker.name.charAt(worker.name.length - 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-neutral-900">{worker.name}</div>
                    <div className="text-[10px] text-neutral-400">{worker.trade} · {worker.team}</div>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusMap[status].cls}`}>
                      {statusMap[status].label}
                    </span>
                    {checkInTime && checkOutTime && (
                      <div className="text-[9px] text-neutral-400 mt-0.5">
                        {checkInTime} ~ {checkOutTime}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* 到岗率环形图 */}
      {(() => {
        const gEnd = workers.length > 0 ? (todayCheckedIn / workers.length) * 360 : 0;
        const bars = selectedTrade === 'all' ? tradeRates : teamRates;
        return (
          <div className={`${slideUp} bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]`}
            style={{ animationDelay: '240ms' }}>
            <h3 className="text-[18px] font-bold text-neutral-900 tracking-tight mb-3">
              今日到岗率
            </h3>
            <div className="flex items-start gap-5">
              <div className="flex flex-col items-center shrink-0">
                <div
                  className="ring-chart-xl"
                  style={{ backgroundImage: `conic-gradient(#84cc16 0deg ${gEnd}deg, #e4e4e7 ${gEnd}deg 360deg)` }}
                >
                  <span className="relative z-10 text-2xl font-extrabold text-neutral-900 tabular-nums tracking-tight">
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
                    <span className="text-[11px] text-neutral-500 font-medium w-10 shrink-0">{item.label}</span>
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
      <TrendChart weekData={weekTrend} monthData={monthTrend} weekMaxY={weekMaxY} monthMaxY={monthMaxY} />

      {/* 全员月度考勤卡片列表 */}
      <div className={`${slideUp} bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)]`}
        style={{ animationDelay: '320ms' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase">
            {selectedTrade === 'all' ? '全员月度考勤' : `${selectedTrade}月度考勤`}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (sortKey === 'rate') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                else { setSortKey('rate'); setSortDir('asc'); }
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                sortKey === 'rate' ? 'bg-neutral-900 text-white' : 'bg-zinc-100 text-neutral-400'
              }`}
            >
              出勤率{sortKey === 'rate' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
            </button>
            <button
              onClick={() => {
                if (sortKey === 'anomaly') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                else { setSortKey('anomaly'); setSortDir('desc'); }
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                sortKey === 'anomaly' ? 'bg-neutral-900 text-white' : 'bg-zinc-100 text-neutral-400'
              }`}
            >
              纪律{sortKey === 'anomaly' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
            </button>
          </div>
        </div>

        {selectedTrade !== 'all' && (
          <div className="flex bg-zinc-100 rounded-xl p-0.5 gap-0.5 mb-3">
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

        <div className="space-y-2">
          {displayedStats.map(({ worker, totalHours, rate, isAnomaly, normalDays, lateCount, earlyCount, leaveCount, absentCount }) => (
            <div
              key={worker.id}
              onClick={() => setAnomalyWorkerId(worker.id)}
              className="bg-zinc-50 rounded-2xl p-3 hover:bg-zinc-100/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-lime-500 flex items-center justify-center text-white font-extrabold text-[11px] shrink-0">
                  {worker.name.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-neutral-900">{worker.name}</span>
                    {isAnomaly && (
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 ring-2 ring-orange-100 shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400">{worker.trade} · {worker.team}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right min-w-[42px]">
                    <span className="text-[15px] font-extrabold text-neutral-900 tabular-nums tracking-tight block leading-none">
                      {totalHours.toFixed(1)}
                    </span>
                    <span className="text-[9px] text-neutral-400 font-medium">h</span>
                  </div>
                  <div className="text-right min-w-[36px]">
                    <span className={`text-[15px] font-extrabold tabular-nums tracking-tight block leading-none ${
                      rate >= 80 ? 'text-lime-500' : rate > 0 ? 'text-orange-500' : 'text-zinc-300'
                    }`}>
                      {rate}%
                    </span>
                    <span className="text-[9px] text-neutral-400 font-medium">出勤</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-2 text-[10px] font-medium">
                {normalDays + lateCount + earlyCount + leaveCount + absentCount === 0 ? (
                  <span className="text-zinc-300">暂无记录</span>
                ) : (
                  <>
                    {normalDays > 0 && (
                      <span className="inline-flex items-center text-lime-500">
                        <Dot color="bg-lime-500" />正常{normalDays}
                      </span>
                    )}
                    {lateCount > 0 && (
                      <span className="inline-flex items-center text-orange-500">
                        <Dot color="bg-orange-500" />迟到{lateCount}
                      </span>
                    )}
                    {earlyCount > 0 && (
                      <span className="inline-flex items-center text-orange-500">
                        <Dot color="bg-orange-500" />早退{earlyCount}
                      </span>
                    )}
                    {leaveCount > 0 && (
                      <span className="inline-flex items-center text-blue-500">
                        <Dot color="bg-blue-500" />请假{leaveCount}
                      </span>
                    )}
                    {absentCount > 0 && (
                      <span className="inline-flex items-center text-zinc-400">
                        <Dot color="bg-zinc-400" />缺勤{absentCount}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {tooMany && (
          <button
            onClick={() => setShowAllTable(!showAllTable)}
            className="w-full mt-3 py-2.5 text-[12px] font-bold text-neutral-500 hover:text-neutral-700 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-all duration-200"
          >
            {showAllTable ? '收起' : `展开全部（${sortedStats.length}人）`}
          </button>
        )}
      </div>    </div>
  );
}
