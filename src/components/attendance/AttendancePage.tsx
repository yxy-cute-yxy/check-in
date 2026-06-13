import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

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

  const isAbnormal = selectedLog && (selectedLog.status === 'late' || selectedLog.status === 'early' || selectedLog.status === 'absent');

  const handleSubmitFeedback = useCallback(() => {
    if (!feedback.trim() || !selectedLog) return;
    setFeedbackSubmitting(true);
    setTimeout(() => {
      setFeedbackSubmitting(false);
      setFeedback('');
      setSelectedDate(null);
    }, 600);
  }, [feedback, selectedLog]);

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
        <div className={slideUp} style={{ animationDelay: '320ms' }}>
          <DayDetail record={selectedLog} />
        </div>
      )}

      {/* 异常反馈 */}
      {selectedLog && isAbnormal && (
        <div className={`${slideUp} bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]`}
          style={{ animationDelay: '400ms' }}>
          <h3 className="text-[13px] font-extrabold text-neutral-900 mb-3">异常反馈</h3>
          {feedbackSubmitting ? (
            <div className="flex items-center gap-2 text-lime-500">
              <span className="text-lg">&#10003;</span>
              <span className="text-[13px] font-bold">反馈已提交</span>
            </div>
          ) : (
            <>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="简述异常原因（如：交通拥堵、身体不适...）"
                rows={3}
                className="w-full rounded-2xl bg-zinc-50 p-3 text-[13px] text-neutral-900 placeholder:text-zinc-300
                           outline-none resize-none transition-all duration-200
                           focus:bg-white focus:ring-2 focus:ring-lime-500/20"
              />
              <button
                onClick={handleSubmitFeedback}
                disabled={!feedback.trim()}
                className="w-full mt-3 py-2.5 rounded-2xl text-[13px] font-bold transition-all duration-200
                           bg-neutral-900 text-white hover:bg-neutral-800
                           disabled:bg-zinc-100 disabled:text-zinc-300"
              >
                提交反馈
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
