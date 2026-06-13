import { useState } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { DynamicClock } from './DynamicClock';
import { CheckInToggle } from './CheckInToggle';
import { CheckInButton } from './CheckInButton';
import { CameraModal } from './CameraModal';
import { TimelineDots } from './TimelineDots';
import { todayStr, nowTimeStr, computeStatus } from '@/lib/utils';
import type { CheckInType, AttendanceRecord } from '@/types';

export function CheckInPage() {
  const { state, dispatch } = useApp();
  const [checkType, setCheckType] = useState<CheckInType>('in');
  const [showCamera, setShowCamera] = useState(false);

  const today = todayStr();

  function handleConfirm(photo: string, location: string) {
    const now = nowTimeStr();
    const existing = state.attendanceLogs.find(
      (l) => l.workerId === state.currentUser?.id && l.date === today
    );

    let record: AttendanceRecord;

    if (existing) {
      // 更新已有记录
      record = {
        ...existing,
        ...(checkType === 'in'
          ? { checkInTime: now, checkInPhoto: photo, checkInLocation: location }
          : { checkOutTime: now, checkOutPhoto: photo, checkOutLocation: location }),
      };
    } else {
      // 新建记录
      record = {
        id: crypto.randomUUID(),
        workerId: state.currentUser?.id ?? '',
        date: today,
        checkInTime: checkType === 'in' ? now : null,
        checkOutTime: checkType === 'out' ? now : null,
        checkInPhoto: checkType === 'in' ? photo : null,
        checkOutPhoto: checkType === 'out' ? photo : null,
        checkInLocation: checkType === 'in' ? location : null,
        checkOutLocation: checkType === 'out' ? location : null,
        status: computeStatus(
          checkType === 'in' ? now : null,
          checkType === 'out' ? now : null
        ),
      };
    }

    // 更新最终状态
    const finalCheckIn = checkType === 'in' ? now : record.checkInTime;
    const finalCheckOut = checkType === 'out' ? now : record.checkOutTime;
    record.status = computeStatus(finalCheckIn, finalCheckOut);

    dispatch({ type: 'ADD_ATTENDANCE', payload: record });

    const isLate = checkType === 'in' && now > '08:00:00';
    const isEarly = checkType === 'out' && now < '18:00:00';

    if (isLate) {
      toast.warning('打卡成功，但已迟到');
    } else if (isEarly) {
      toast.warning('打卡成功，但为早退');
    } else if (checkType === 'in') {
      toast.success('打卡成功，今天也要注意安全，规范施工');
    } else {
      toast.success('打卡成功，今日工时已记录，好好休息');
    }
  }

  return (
    <div className="p-4 pb-8">
      <DynamicClock />
      <CheckInToggle value={checkType} onChange={setCheckType} />
      <CheckInButton onClick={() => setShowCamera(true)} />
      <TimelineDots />

      <p className="text-center text-[11px] text-zinc-300 font-medium mt-8">
        「 每一次打卡，都是对家人的承诺 」
      </p>

      <CameraModal
        open={showCamera}
        onClose={() => setShowCamera(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
