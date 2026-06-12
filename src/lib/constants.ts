import type { Trade } from '@/types';

// 工种列表
export const TRADE_LIST: Trade[] = ['木工', '电工', '水泥工', '焊工', '钢筋工', '架子工'];

// 班组列表
export const TEAM_LIST = ['A班组', 'B班组', 'C班组', 'D班组'];

// 模拟 GPS 位置（打卡时随机分配一个）
export const MOCK_LOCATIONS = [
  { name: '项目南门施工区', lat: 30.2741, lng: 120.1551 },
  { name: '项目东门材料区', lat: 30.2743, lng: 120.1555 },
  { name: '项目主楼作业区', lat: 30.2740, lng: 120.1548 },
  { name: '项目北侧钢筋棚', lat: 30.2745, lng: 120.1545 },
];

// 考勤时间判定阈值
export const LATE_THRESHOLD = '08:00:00'; // 晚于此时间打卡算迟到
export const EARLY_THRESHOLD = '18:00:00'; // 早于此时间打卡算早退

// localStorage key
export const STORAGE_KEY = 'checkin_state';
export const SEEDED_KEY = 'checkin_seeded';
