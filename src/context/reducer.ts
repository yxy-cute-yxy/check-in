import type { AppState, AppAction } from '@/types';

// 初始空白状态
export const initialState: AppState = {
  currentPage: 'home',
  currentRole: 'worker',
  currentUser: null,
  workers: [],
  attendanceLogs: [],
};

// 纯函数 reducer，处理所有状态变更
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };

    case 'SET_ROLE':
      return { ...state, currentRole: action.payload };

    case 'REGISTER_WORKER': {
      const newWorker = action.payload;
      return {
        ...state,
        workers: [...state.workers, newWorker],
        currentUser: newWorker,
        currentPage: 'home',
      };
    }

    case 'ADD_WORKER': {
      const worker = action.payload;
      if (state.workers.some((w) => w.id === worker.id)) return state;
      return { ...state, workers: [...state.workers, worker] };
    }

    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };

    case 'ADD_ATTENDANCE': {
      const record = action.payload;
      // 如果当天已有记录则更新，否则追加
      const existingIndex = state.attendanceLogs.findIndex(
        (r) => r.workerId === record.workerId && r.date === record.date
      );
      if (existingIndex >= 0) {
        const updated = [...state.attendanceLogs];
        updated[existingIndex] = record;
        return { ...state, attendanceLogs: updated };
      }
      return {
        ...state,
        attendanceLogs: [...state.attendanceLogs, record],
      };
    }

    case 'UPDATE_WORKER': {
      const updated = action.payload;
      const workers = state.workers.map((w) =>
        w.id === updated.id ? updated : w
      );
      const currentUser =
        state.currentUser?.id === updated.id ? updated : state.currentUser;
      return { ...state, workers, currentUser };
    }

    case 'CLEAR_DEMO_DATA':
      return {
        ...state,
        workers: state.workers.filter((w) => !w.id.startsWith('demo-')),
        attendanceLogs: state.attendanceLogs.filter((r) => !r.workerId.startsWith('demo-')),
      };

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}
