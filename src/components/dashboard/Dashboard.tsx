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
  const anomalyDays = myLogs.filter((l) => l.status === 'late' || l.status === 'early').length;
  const rate = totalDays > 0 ? Math.round((normalDays / totalDays) * 100) : 0;

  // 今日是否正常
  const todayLog = myLogs.find((l) => l.date === today);
  const todayStatus = todayLog ? (todayLog.status === 'normal' ? '今日正常' : '今日异常') : '暂无数据';

  return { totalDays, normalDays, anomalyDays, rate, todayStatus };
}

export function Dashboard() {
  const { state, dispatch } = useApp();
  const isWorker = state.currentRole === 'worker';
  const today = new Date();
  const stats = useWorkerStats(state.attendanceLogs, state.currentUser?.id ?? '');

  const goTo = (page: Page) => dispatch({ type: 'SET_PAGE', payload: page });

  const workerCards = [
    { icon: <Camera className="w-5 h-5" />, title: '考勤打卡', desc: '每日上下班拍照打卡', iconBg: 'bg-lime-50', page: 'checkin' as Page },
    { icon: <IdCard className="w-5 h-5" />, title: '注册信息', desc: '查看或修改个人实名制资料', iconBg: 'bg-zinc-100', page: 'registration' as Page },
    { icon: <CalendarCheck className="w-5 h-5" />, title: '考勤记录', desc: '查看个人出勤日历与统计', iconBg: 'bg-sky-50', page: 'attendance' as Page },
  ];

  const managerCards = [
    { icon: <Camera className="w-5 h-5" />, title: '考勤打卡', desc: '模拟工人日常打卡测试', iconBg: 'bg-lime-50', page: 'checkin' as Page },
    { icon: <IdCard className="w-5 h-5" />, title: '注册信息', desc: '查看全工地工人实名制名册', iconBg: 'bg-zinc-100', page: 'registration' as Page },
    { icon: <BarChart3 className="w-5 h-5" />, title: '考勤数据统计', desc: '宏观可视化简报 + 全员考勤大总表', iconBg: 'bg-orange-50', page: 'manager' as Page },
  ];

  const cards = isWorker ? workerCards : managerCards;

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
            : '工地考勤数据总览'}
        </h2>
        <p className="text-[13px] font-medium text-lime-400 mt-2">
          {today.toLocaleDateString('zh-CN', {
            year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
          })}
        </p>
      </div>

      {/* ===== 中部：1:1 双列数据盘 ===== */}
      <div className="grid grid-cols-2 gap-3">
        {/* 左：出勤率 + 黑色标签 */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                        flex flex-col items-center text-center relative">
          {/* 黑曜石标签 */}
          <span className="bg-neutral-900 text-white rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide mb-3">
            {stats.todayStatus}
          </span>

          {/* 环形图 */}
          <div
            className="ring-chart"
            style={{
              background: `conic-gradient(#84cc16 0deg ${stats.rate * 3.6}deg, #f1f5f9 ${stats.rate * 3.6}deg 360deg)`,
            }}
          >
            <span className="relative z-10 text-xl font-black text-neutral-900 tabular-nums">
              {stats.rate}%
            </span>
          </div>
          <p className="text-[11px] text-industrial-700/50 font-medium mt-3">本月出勤率</p>
        </div>

        {/* 右：异常次数 */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                        flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black text-orange-500 tabular-nums">
            {stats.anomalyDays}
          </span>
          <span className="text-[11px] text-orange-500/70 font-medium mt-1">次异常</span>
          <p className="text-[10px] text-zinc-400 mt-1">迟到/早退</p>
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
    </div>
  );
}
