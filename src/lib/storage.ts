import type { AppState } from '@/types';
import { STORAGE_KEY } from './constants';

// 从 localStorage 加载整个应用状态
export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// 将应用状态序列化写入 localStorage
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('保存状态失败:', e);
  }
}
