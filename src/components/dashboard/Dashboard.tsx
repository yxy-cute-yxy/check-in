import {
  IdCard,
  Camera,
  CalendarCheck,
  BarChart3,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { NavCard } from './NavCard';
import type { Page } from '@/types';

// 首页工作台：根据角色渲染不同的卡片流
export function Dashboard() {
  const { state, dispatch } = useApp();
  const isWorker = state.currentRole === 'worker';

  const goTo = (page: Page) => dispatch({ type: 'SET_PAGE', payload: page });

  return (
    <div className="p-5 space-y-4">
      {/* 欢迎横幅 */}
      <div className="bg-gradient-to-br from-lime-50 to-emerald-50 rounded-2xl p-5 border border-lime-100">
        <p className="text-sm text-slate-500">
          {isWorker ? '工人工作台' : '项目经理工作台'}
        </p>
        <p className="text-lg font-bold text-neutral-900 mt-0.5">
          {isWorker
            ? `${state.currentUser?.name}，今天辛苦了`
            : '工地考勤数据总览'}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </p>
      </div>

      {/* 卡片导航 */}
      <div className="space-y-3">
        {isWorker ? (
          // 工人模式三张卡
          <>
            <NavCard
              icon={<IdCard className="w-6 h-6" />}
              title="注册信息"
              description="查看或修改个人实名制资料"
              accent="bg-lime-500"
              onClick={() => goTo('registration')}
            />
            <NavCard
              icon={<Camera className="w-6 h-6" />}
              title="考勤打卡"
              description="每日上下班拍照打卡"
              accent="bg-emerald-500"
              onClick={() => goTo('checkin')}
            />
            <NavCard
              icon={<CalendarCheck className="w-6 h-6" />}
              title="考勤记录"
              description="查看个人出勤日历与统计"
              accent="bg-sky-500"
              onClick={() => goTo('attendance')}
            />
          </>
        ) : (
          // 项目经理模式三张卡
          <>
            <NavCard
              icon={<IdCard className="w-6 h-6" />}
              title="注册信息"
              description="查看全工地工人实名制名册"
              accent="bg-lime-500"
              onClick={() => goTo('registration')}
            />
            <NavCard
              icon={<Camera className="w-6 h-6" />}
              title="考勤打卡"
              description="模拟工人日常打卡测试"
              accent="bg-emerald-500"
              onClick={() => goTo('checkin')}
            />
            <NavCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="考勤数据统计"
              description="宏观可视化简报 + 全员考勤大总表"
              accent="bg-orange-500"
              onClick={() => goTo('manager')}
            />
          </>
        )}
      </div>
    </div>
  );
}
