import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { AttendanceStatus } from '@/types'
import { LATE_THRESHOLD, EARLY_THRESHOLD } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 校验手机号（11位，1开头）
export function validatePhone(phone: string): boolean {
  return /^1\d{10}$/.test(phone)
}

// 校验身份证号（18位）
export function validateIdNumber(id: string): boolean {
  return /^\d{17}[\dXx]$/.test(id)
}

// 根据上下班时间计算考勤状态
export function computeStatus(
  checkInTime: string | null,
  checkOutTime: string | null
): AttendanceStatus {
  if (!checkInTime && !checkOutTime) return 'absent'
  if (checkInTime && checkInTime > LATE_THRESHOLD) return 'late'
  if (checkOutTime && checkOutTime < EARLY_THRESHOLD) return 'early'
  return 'normal'
}

// 获取今天的日期字符串 YYYY-MM-DD
export function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 获取当前时间字符串 HH:mm:ss
export function nowTimeStr(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

// 日期偏移辅助
export function offsetDate(base: Date, days: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 生成随机时间，在 start 到 end 之间
export function randomTime(start: string, end: string): string {
  const [sh, sm, ss] = start.split(':').map(Number)
  const [eh, em, es] = end.split(':').map(Number)
  const startSec = sh * 3600 + sm * 60 + ss
  const endSec = eh * 3600 + em * 60 + es
  const rand = startSec + Math.floor(Math.random() * (endSec - startSec))
  const h = Math.floor(rand / 3600)
  const m = Math.floor((rand % 3600) / 60)
  const s = rand % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// === 日历辅助函数 ===

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function getWeekRange(date: Date): { start: string; end: string } {
  const day = date.getDay()
  const monDiff = day === 0 ? -6 : 1 - day
  const mon = new Date(date)
  mon.setDate(date.getDate() + monDiff)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  return { start: dateToStr(mon), end: dateToStr(sun) }
}

export function getMonthRange(date: Date): { start: string; end: string } {
  const y = date.getFullYear()
  const m = date.getMonth()
  return {
    start: `${y}-${String(m + 1).padStart(2, '0')}-01`,
    end: `${y}-${String(m + 1).padStart(2, '0')}-${String(getDaysInMonth(y, m)).padStart(2, '0')}`,
  }
}

export function getQuarterRange(date: Date): { start: string; end: string } {
  const y = date.getFullYear()
  const q = Math.floor(date.getMonth() / 3)
  const startM = q * 3
  const endM = q * 3 + 2
  return {
    start: `${y}-${String(startM + 1).padStart(2, '0')}-01`,
    end: `${y}-${String(endM + 1).padStart(2, '0')}-${String(getDaysInMonth(y, endM)).padStart(2, '0')}`,
  }
}

function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 安全 Base64 编码（支持中文等 UTF-8 字符）
function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  const binString = Array.from(bytes, (b) => String.fromCharCode(b)).join('')
  return btoa(binString)
}

// 生成 SVG 默认头像
export function generateAvatar(name: string): string {
  const colors = ['#84cc16', '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b']
  const color = colors[name.charCodeAt(0) % colors.length]
  const initial = name.charAt(name.length - 1)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${color}" rx="16"/><text x="50" y="68" text-anchor="middle" fill="white" font-size="48" font-family="sans-serif" font-weight="bold">${initial}</text></svg>`
  return `data:image/svg+xml;base64,${toBase64(svg)}`
}
