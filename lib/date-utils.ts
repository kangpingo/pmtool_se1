import { addDays, isWeekend, format, differenceInCalendarDays, isBefore, isAfter, startOfDay } from 'date-fns'

/**
 * 根据开始日期和工期计算结束日期
 * @param startDate 开始日期
 * @param duration 工期天数
 * @param includeWeekend 是否包含周末
 */
export function calcEndDate(startDate: Date, duration: number, includeWeekend: boolean): Date {
  if (includeWeekend) {
    return addDays(startDate, duration - 1)
  }
  // 不含周末：跳过周六周日
  let remaining = duration
  let current = new Date(startDate)
  while (remaining > 1) {
    current = addDays(current, 1)
    if (!isWeekend(current)) {
      remaining--
    }
  }
  return current
}

/**
 * 计算两个日期之间的实际工作日天数
 */
export function calcWorkDays(startDate: Date, endDate: Date): number {
  let count = 0
  let current = new Date(startDate)
  while (!isAfter(current, endDate)) {
    if (!isWeekend(current)) count++
    current = addDays(current, 1)
  }
  return count
}

/**
 * 判断任务是否即将到期（今天或明天到期）
 */
export function isTaskDueSoon(endDate: Date): boolean {
  const today = startOfDay(new Date())
  const end = startOfDay(endDate)
  const diff = differenceInCalendarDays(end, today)
  return diff >= 0 && diff <= 1
}

/**
 * 判断任务是否今天到期
 */
export function isTaskDueToday(endDate: Date): boolean {
  const today = startOfDay(new Date())
  const end = startOfDay(endDate)
  return differenceInCalendarDays(end, today) === 0
}

/**
 * 判断任务是否明天到期
 */
export function isTaskDueTomorrow(endDate: Date): boolean {
  const today = startOfDay(new Date())
  const end = startOfDay(endDate)
  return differenceInCalendarDays(end, today) === 1
}

/**
 * 判断任务是否已逾期
 */
export function isTaskOverdue(endDate: Date): boolean {
  return isBefore(startOfDay(endDate), startOfDay(new Date()))
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'yyyy-MM-dd')
}

export function formatDateCN(date: Date | string): string {
  return format(new Date(date), 'M月d日')
}

/**
 * 计算两个日期之间的天数差（包含首尾）
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export function calcDaysBetween(startDate: Date, endDate: Date): number {
  return Math.abs(differenceInCalendarDays(endDate, startDate)) + 1
}

/**
 * 根据开始日期和结束日期计算工期（不含周末）
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export function calcWorkDaysBetween(startDate: Date, endDate: Date): number {
  let count = 0
  let current = new Date(startDate)
  const end = new Date(endDate)
  while (!isAfter(current, end)) {
    if (!isWeekend(current)) count++
    current = addDays(current, 1)
  }
  return count
}
