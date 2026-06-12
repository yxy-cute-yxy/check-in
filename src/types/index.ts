// 角色类型
export type Role = 'worker' | 'manager';

// 页面路由（状态驱动）
export type Page =
  | 'home'
  | 'registration'
  | 'checkin'
  | 'attendance'
  | 'manager';

// 工种
export type Trade = '木工' | '电工' | '水泥工' | '焊工' | '钢筋工' | '架子工';

// 打卡类型
export type CheckInType = 'in' | 'out';

// 考勤状态
export type AttendanceStatus = 'normal' | 'late' | 'early' | 'absent';

// 统计周期
export type Period = 'week' | 'month' | 'quarter';

// 工人数据模型
export interface Worker {
  id: string;
  name: string;
  phone: string;
  idNumber: string;
  trade: Trade;
  team: string;
  photo: string; // Base64 头像
  registeredAt: string; // ISO 8601
}

// 考勤记录模型
export interface AttendanceRecord {
  id: string;
  workerId: string;
  date: string; // "YYYY-MM-DD"
  checkInTime: string | null; // "HH:mm:ss"
  checkOutTime: string | null;
  checkInPhoto: string | null; // Base64
  checkOutPhoto: string | null;
  checkInLocation: string | null;
  checkOutLocation: string | null;
  status: AttendanceStatus;
}

// 全局应用状态
export interface AppState {
  currentPage: Page;
  currentRole: Role;
  currentUser: Worker | null;
  workers: Worker[];
  attendanceLogs: AttendanceRecord[];
}

// 所有 dispatch action 的联合类型
export type AppAction =
  | { type: 'SET_PAGE'; payload: Page }
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'REGISTER_WORKER'; payload: Worker }
  | { type: 'SET_CURRENT_USER'; payload: Worker }
  | { type: 'ADD_ATTENDANCE'; payload: AttendanceRecord }
  | { type: 'UPDATE_WORKER'; payload: Worker }
  | { type: 'LOAD_STATE'; payload: AppState };
