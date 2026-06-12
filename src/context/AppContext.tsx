import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { AppState, AppAction } from '@/types';
import { appReducer, initialState } from './reducer';
import { loadState, saveState } from '@/lib/storage';

// Context 类型
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | null>(null);

// Provider 组件
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(appReducer, initialState, () => {
    // 初始化时优先从 localStorage 恢复
    const saved = loadState();
    return saved ?? initialState;
  });

  // 每次 dispatch 后自动持久化
  const dispatch = useCallback(
    (action: AppAction) => {
      rawDispatch(action);
    },
    []
  );

  // state 变化时自动写入 localStorage
  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// 便捷 hook
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp 必须在 AppProvider 内部使用');
  }
  return ctx;
}
