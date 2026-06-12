import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { getWeekRange, getMonthRange, getQuarterRange, offsetDate, randomTime, computeStatus } from '@/lib/utils';
import { PeriodSwitcher } from './PeriodSwitcher';
import type { Period } from './PeriodSwitcher';
import { StatsCards } from './StatsCards';
import { CalendarGrid } from './CalendarGrid';
import { DayDetail } from './DayDetail';
import { WorkerSelector } from './WorkerSelector';
import type { AttendanceRecord } from '@/types';

const slideUp = 'opacity-0 animate-[slideUp_0.4s_ease-out_forwards]';

// 为当前工人生成 7 天模拟考勤数据
function seedWorkerAttendance(workerId: string): AttendanceRecord[] {
  const statuses: Array<'normal' | 'late' | 'early' | 'absent'> = [
    'normal', 'normal', 'late', 'normal', 'early', 'normal', 'absent',
  ];
  return statuses.map((status, i) => {
    const date = offsetDate(new Date(), -(6 - i));
    let checkInTime: string | null = null;
    let checkOutTime: string | null = null;

    if (status === 'absent') {
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

    return {
      id: `${workerId}-${date}`,
      workerId,
      date,
      checkInTime,
      checkOutTime,
      checkInPhoto: null,
      checkOutPhoto: null,
      checkInLocation: null,
      checkOutLocation: null,
      status: computeStatus(checkInTime, checkOutTime),
    };
  });
}

export function AttendancePage() {
  const { state, dispatch } = useApp();
  const isManager = state.currentRole === 'manager';
  const workers = state.workers;
  const seeded = useRef(false);

  const [period, setPeriod] = useState<Period>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewedWorkerId, setViewedWorkerId] = useState<string | null>(null);

  const effectiveWorkerId = isManager ? viewedWorkerId : state.currentUser?.id ?? '';

  // 为无记录的工人自动生成模拟数据
  useEffect(() => {
    if (seeded.current || !effectiveWorkerId) return;
    const hasRecords = state.attendanceLogs.some((l) => l.workerId === effectiveWorkerId);
    if (!hasRecords) {
      seedWorkerAttendance(effectiveWorkerId).forEach((r) =>
        dispatch({ type: 'ADD_ATTENDANCE', payload: r })
      );
      seeded.current = true;
    }
  }, [effectiveWorkerId, state.attendanceLogs, dispatch]);

  // 经理默认选中第一个工人
  useEffect(() => {
    if (isManager && workers.length > 0 && !viewedWorkerId) {
      setViewedWorkerId(workers[0].id);
    }
  }, [isManager, workers, viewedWorkerId]);

  // 根据周期计算日期范围
  const now = new Date();
  let dateRange: { start: string; end: string };
  if (period === 'week') dateRange = getWeekRange(now);
  else if (period === 'month') dateRange = getMonthRange(now);
  else dateRange = getQuarterRange(now);

  // 过滤当前周期内的记录
  const periodLogs = state.attendanceLogs.filter(
    (l) =>
      l.workerId === effectiveWorkerId &&
      l.date >= dateRange.start &&
      l.date <= dateRange.end
  );

  // 统计
  const normalDays = periodLogs.filter((l) => l.status === 'normal').length;
  const absentDays = periodLogs.filter((l) => l.status === 'absent').length;
  const anomalyDays = periodLogs.filter(
    (l) => l.status === 'late' || l.status === 'early'
  ).length;

  // 选中日期记录
  const selectedLog: AttendanceRecord | undefined =
    selectedDate
      ? state.attendanceLogs.find(
          (l) => l.workerId === effectiveWorkerId && l.date === selectedDate
        )
      : undefined;

  function handleSelectDate(date: string) {
    setSelectedDate((prev) => (prev === date ? null : date));
  }

  function handlePeriodChange(p: Period) {
    setPeriod(p);
    // 如果选中日期不在新周期内则清除
    let nextRange: { start: string; end: string };
    if (p === 'week') nextRange = getWeekRange(now);
    else if (p === 'month') nextRange = getMonthRange(now);
    else nextRange = getQuarterRange(now);
    if (selectedDate && (selectedDate < nextRange.start || selectedDate > nextRange.end)) {
      setSelectedDate(null);
    }
  }

  return (
    <div className="p-4 pb-8 space-y-4">
      {/* 经理：工人选择器 */}
      {isManager && (
        <div className={slideUp} style={{ animationDelay: '0ms' }}>
          <WorkerSelector
            workers={workers}
            value={viewedWorkerId}
            onChange={setViewedWorkerId}
          />
        </div>
      )}

      {/* 周期切换 */}
      <div className={slideUp} style={{ animationDelay: `${isManager ? 80 : 0}ms` }}>
        <PeriodSwitcher value={period} onChange={handlePeriodChange} />
      </div>

      {/* 统计卡片 */}
      <div className={slideUp} style={{ animationDelay: '160ms' }}>
        <StatsCards
          normalDays={normalDays}
          absentDays={absentDays}
          anomalyDays={anomalyDays}
        />
      </div>

      {/* 日历网格 */}
      <div className={slideUp} style={{ animationDelay: '240ms' }}>
        <CalendarGrid
          referenceDate={now}
          logs={periodLogs}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
        />
      </div>

      {/* 日期详情 */}
      {selectedLog && (
        <div style={{ animationDelay: '320ms' }}>
          <DayDetail record={selectedLog} />
        </div>
      )}
    </div>
  );
}
