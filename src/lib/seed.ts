import type { Worker, AttendanceRecord } from '@/types';
import { SEEDED_KEY, STORAGE_KEY, MOCK_LOCATIONS } from './constants';
import { generateAvatar, computeStatus, randomTime, offsetDate } from './utils';

// 首次加载时预填充模拟数据（仅执行一次）
export function seedIfNeeded(): boolean {
  if (localStorage.getItem(SEEDED_KEY)) return false;

  const today = new Date();

  // 3 个模拟工人
  const workers: Worker[] = [
    {
      id: 'w1',
      name: '张建国',
      phone: '13812345678',
      idNumber: '330102199005081234',
      trade: '木工',
      team: 'A班组',
      photo: generateAvatar('张建国'),
      registeredAt: offsetDate(today, -10),
    },
    {
      id: 'w2',
      name: '李铁柱',
      phone: '13987654321',
      idNumber: '330102198812151234',
      trade: '电工',
      team: 'B班组',
      photo: generateAvatar('李铁柱'),
      registeredAt: offsetDate(today, -8),
    },
    {
      id: 'w3',
      name: '王芳',
      phone: '13711223344',
      idNumber: '330102199503201234',
      trade: '焊工',
      team: 'A班组',
      photo: generateAvatar('王芳'),
      registeredAt: offsetDate(today, -5),
    },
  ];

  // 为每个工人生成最近 7 天的考勤记录
  const logs: AttendanceRecord[] = [];
  const statusDistribution = ['normal', 'normal', 'normal', 'normal', 'normal', 'normal', 'late', 'early', 'normal', 'absent'];

  for (const worker of workers) {
    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
      const date = offsetDate(today, -daysAgo);
      const randomStatus = statusDistribution[Math.floor(Math.random() * statusDistribution.length)];

      // 跳过今天的记录（等待真实打卡）
      if (daysAgo === 0) continue;

      let checkInTime: string | null = null;
      let checkOutTime: string | null = null;
      let checkInLocation: string | null = null;
      let checkOutLocation: string | null = null;

      if (randomStatus !== 'absent') {
        // 上班打卡时间
        if (randomStatus === 'late') {
          checkInTime = randomTime('08:00:00', '09:30:00');
        } else {
          checkInTime = randomTime('06:30:00', '07:55:00');
        }

        // 下班打卡时间
        if (randomStatus === 'early') {
          checkOutTime = randomTime('16:00:00', '17:55:00');
        } else {
          checkOutTime = randomTime('18:00:00', '20:00:00');
        }

        checkInLocation = MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)].name;
        checkOutLocation = MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)].name;
      }

      const status = computeStatus(checkInTime, checkOutTime);

      logs.push({
        id: `${worker.id}-${date}`,
        workerId: worker.id,
        date,
        checkInTime,
        checkOutTime,
        checkInPhoto: null,
        checkOutPhoto: null,
        checkInLocation,
        checkOutLocation,
        status,
      });
    }
  }

  // 写入 localStorage
  const state = {
    currentPage: 'home' as const,
    currentRole: 'worker' as const,
    currentUser: null, // 不预设有用户，强制走首次注册拦截
    workers,
    attendanceLogs: logs,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(SEEDED_KEY, 'true');
  return true;
}
