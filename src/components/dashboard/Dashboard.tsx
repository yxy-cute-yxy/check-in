import { HardHat } from 'lucide-react';
import { IdCard, Camera, CalendarCheck, BarChart3 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { NavCard } from './NavCard';
import { todayStr } from '@/lib/utils';
import type { Page, AttendanceRecord } from '@/types';

function useWorkerStats(logs: AttendanceRecord[], workerId: string) {
  const today = todayStr();
  const thisMonth = today.slice(0, 7);

  const myLogs = logs.filter(
    (l) => l.workerId === workerId && l.date.startsWith(thisMonth)
  );

  const totalDays = myLogs.length;
  const normalDays = myLogs.filter((l) => l.status === 'normal').length;
  const lateCount = myLogs.filter((l) => l.status === 'late').length;
  const earlyCount = myLogs.filter((l) => l.status === 'early').length;
  const anomalyDays = lateCount + earlyCount;
  const rate = totalDays > 0 ? Math.round(((normalDays + lateCount + earlyCount) / totalDays) * 100) : 0;

  const todayLog = myLogs.find((l) => l.date === today);
  const todayStatus = todayLog ? (todayLog.status === 'normal' ? '今日正常' : '今日异常') : '暂无数据';

  return { totalDays, normalDays, anomalyDays, rate, todayStatus };
}

function useTeamStats(logs: AttendanceRecord[], workerIds: string[]) {
  const today = todayStr();
  const thisMonth = today.slice(0, 7);

  const monthLogs = logs.filter(
    (l) => workerIds.includes(l.workerId) && l.date.startsWith(thisMonth)
  );

  // 每人出勤率取平均
  const rates = workerIds.map((wid) => {
    const wLogs = logs.filter((l) => l.workerId === wid && l.date.startsWith(thisMonth));
    const wTotal = wLogs.length;
    if (wTotal === 0) return 0;
    const wArrived = wLogs.filter((l) => l.status === 'normal' || l.status === 'late' || l.status === 'early').length;
    return wArrived / wTotal;
  });
  const rate = rates.length > 0 ? Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 100) : 0;

  // 今日全队统计
  const todayLogs = monthLogs.filter((l) => l.date === today);
  const todayNormal = todayLogs.filter((l) => l.status === 'normal').length;
  const todayLate = todayLogs.filter((l) => l.status === 'late').length;
  const todayEarly = todayLogs.filter((l) => l.status === 'early').length;
  const todayAbsent = todayLogs.filter((l) => l.status === 'absent').length;
  const todayLeave = todayLogs.filter((l) => l.status === 'leave').length;
  const todayCheckedIn = todayNormal + todayLate + todayEarly;
  const todayAnomaly = todayLate + todayEarly + todayAbsent + todayLeave;

  return { rate, todayCheckedIn, todayAnomaly, todayLate, todayEarly, todayAbsent, todayLeave, totalWorkers: workerIds.length };
}

export function Dashboard() {
  const { state, dispatch } = useApp();
  const isWorker = state.currentRole === 'worker';
  const today = new Date();

  const workerIds = state.workers.map((w) => w.id);
  const personalStats = useWorkerStats(state.attendanceLogs, state.currentUser?.id ?? '');
  const teamStats = useTeamStats(state.attendanceLogs, workerIds);

  const goTo = (page: Page) => dispatch({ type: 'SET_PAGE', payload: page });

  const workerCards = [
    { icon: <Camera className="w-5 h-5" />, title: '考勤打卡', desc: '每日上下班拍照打卡', iconBg: 'bg-lime-50', page: 'checkin' as Page },
    { icon: <IdCard className="w-5 h-5" />, title: '注册信息', desc: '查看或修改个人实名制资料', iconBg: 'bg-zinc-100', page: 'registration' as Page },
    { icon: <CalendarCheck className="w-5 h-5" />, title: '考勤记录', desc: '查看个人出勤日历与统计', iconBg: 'bg-sky-50', page: 'attendance' as Page },
  ];

  const managerCards = [
    { icon: <Camera className="w-5 h-5" />, title: '考勤打卡', desc: '工人日常打卡测试', iconBg: 'bg-lime-50', page: 'checkin' as Page },
    { icon: <IdCard className="w-5 h-5" />, title: '注册信息', desc: '查看或修改个人实名制资料', iconBg: 'bg-zinc-100', page: 'registration' as Page },
    { icon: <BarChart3 className="w-5 h-5" />, title: '考勤数据统计', desc: '宏观可视化简报 + 全员考勤大总表', iconBg: 'bg-orange-50', page: 'manager' as Page },
  ];

  const cards = isWorker ? workerCards : managerCards;
  const stats = isWorker ? personalStats : teamStats;

  return (
    <div className="p-4 space-y-4 pb-8">
      {/* ===== 顶部：深炭黑大卡片 ===== */}
      <div className="bg-neutral-900 rounded-3xl p-6 text-white shadow-[0_12px_40px_rgb(0,0,0,0.15)]">
        <div className="flex items-center gap-2 mb-3">
          <HardHat className="w-4 h-4 text-lime-400" />
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-zinc-500">
            {isWorker ? 'Worker Dashboard' : 'Manager Console'}
          </p>
        </div>
        <h2 className="text-2xl font-black tracking-tight leading-tight">
          {isWorker
            ? `${state.currentUser?.name}，今天辛苦了！`
            : '工地考勤数据统计'}
        </h2>
        <p className="text-[13px] font-medium text-lime-400 mt-2">
          {today.toLocaleDateString('zh-CN', {
            year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
          })}
        </p>
      </div>

      {/* ===== 中部：1:1 双列数据盘 ===== */}
      <div className="grid grid-cols-2 gap-3">
        {/* 左：出勤率 + 环形图 */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                        flex flex-col items-center justify-center text-center relative">
          {isWorker && (
            <span className="bg-neutral-900 text-white rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide mb-3">
              {personalStats.todayStatus}
            </span>
          )}

          <div
            className="ring-chart"
            style={{
              background: `conic-gradient(#84cc16 0deg ${stats.rate * 3.6}deg, #f1f5f9 ${stats.rate * 3.6}deg 360deg)`,
            }}
          >
            <span className="relative z-10 text-xl font-black text-neutral-900 tabular-nums tracking-tight">
              {stats.rate}%
            </span>
          </div>
          <p className="text-[13px] font-bold text-neutral-900 mt-3">
            {isWorker ? '本月出勤率' : '全员本月出勤率'}
          </p>
          {!isWorker && (
            <span className="bg-zinc-100 text-neutral-500 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide mt-3">
              今日到岗 {teamStats.todayCheckedIn}/{teamStats.totalWorkers}
            </span>
          )}
        </div>

        {/* 右：今日异常人数 */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                        flex flex-col items-center justify-center text-center">
          {isWorker ? (
            <>
              <span className="text-4xl font-black text-orange-500 tabular-nums tracking-tight">
                {personalStats.anomalyDays}
              </span>
              <span className="text-[11px] text-orange-500/70 font-medium mt-1">次异常</span>
              <p className="text-[13px] font-bold text-neutral-900 mt-1">迟到/早退</p>
            </>
          ) : (
            <>
              <span className="text-4xl font-black text-orange-500 tabular-nums tracking-tight">
                {teamStats.todayAnomaly}
              </span>
              <span className="text-[11px] text-orange-500/70 font-medium mt-1">人</span>
              <p className="text-[13px] font-bold text-neutral-900 mt-1">今日异常</p>
              <p className="text-[10px] text-zinc-400 mt-1">
                迟到{teamStats.todayLate} · 早退{teamStats.todayEarly} · 缺勤{teamStats.todayAbsent} · 请假{teamStats.todayLeave}
              </p>
            </>
          )}
        </div>
      </div>

      {/* ===== 底部：功能入口卡片列表 ===== */}
      <div className="space-y-2.5">
        {cards.map((card, i) => (
          <NavCard
            key={card.page}
            index={i}
            icon={card.icon}
            title={card.title}
            description={card.desc}
            iconBg={card.iconBg}
            onClick={() => goTo(card.page)}
          />
        ))}
      </div>

      {isWorker ? (
        <p className="text-center text-[11px] text-zinc-300 font-medium mt-4">
          「 致敬每一位城市建设者 」
        </p>
      ) : (
        <p className="text-center text-[11px] text-zinc-300 font-medium mt-4">
          「 管理的本质不是约束，而是保障大家的安全与权益 」
        </p>
      )}
    </div>
  );
}
