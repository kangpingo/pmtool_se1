'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { format, differenceInDays, startOfDay, addDays, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, getISOWeek, getISOWeekYear } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useApp } from './AppProvider'
import { Folder } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Task {
  id: string
  name: string
  startDate: string
  endDate: string
  status: string
  progress: number
  favorite: boolean
  project: { id: string; name: string }
}

interface Project {
  id: string
  name: string
}

interface GanttChartProps {
  tasks: Task[]
  projects: Project[]
  selectedProjectId?: string
  title: string
  selectLabel: string
  allLabel: string
  noTasksLabel: string
  countLabel: string
}

type ScaleType = 'day' | 'week' | 'month'

const statusColors = {
  TODO: { bar: 'bg-gray-300', text: 'text-gray-600', border: 'border-gray-400' },
  IN_PROGRESS: { bar: 'bg-blue-400', text: 'text-blue-700', border: 'border-blue-500' },
  OVERDUE: { bar: 'bg-red-400', text: 'text-red-700', border: 'border-red-500' },
  DONE: { bar: 'bg-green-400', text: 'text-green-700', border: 'border-green-500' },
}

export default function GanttChart({
  tasks,
  projects,
  selectedProjectId,
  title,
  selectLabel,
  allLabel,
  noTasksLabel,
  countLabel,
}: GanttChartProps) {
  const { lang } = useApp()
  const dateLocale = lang === 'zh' ? zhCN : enUS
  const [scale, setScale] = useState<ScaleType>('day')

  // Calculate the date range for the timeline
  const { startDate, endDate, totalDays } = useMemo(() => {
    if (tasks.length === 0) {
      const today = startOfDay(new Date())
      return {
        startDate: today,
        endDate: addDays(today, 30),
        totalDays: 31,
      }
    }

    const taskStarts = tasks.map(t => parseISO(t.startDate))
    const taskEnds = tasks.map(t => parseISO(t.endDate))

    const earliest = taskStarts.reduce((min, d) => d < min ? d : min)
    const latest = taskEnds.reduce((max, d) => d > max ? d : max)

    // Add padding: start 7 days before, end 7 days after
    const paddedStart = addDays(startOfDay(earliest), -7)
    const paddedEnd = addDays(startOfDay(latest), 7)

    const days = differenceInDays(paddedEnd, paddedStart) + 1

    return {
      startDate: paddedStart,
      endDate: paddedEnd,
      totalDays: Math.max(days, 7),
    }
  }, [tasks])

  // Calculate number of units based on scale
  const units = useMemo(() => {
    if (scale === 'day') return totalDays
    if (scale === 'week') return Math.ceil(totalDays / 7)
    return Math.ceil(totalDays / 30) // month
  }, [totalDays, scale])

  // Generate time columns based on scale
  const timeColumns = useMemo(() => {
    const cols = []
    const today = new Date()

    if (scale === 'day') {
      for (let i = 0; i < totalDays; i++) {
        const date = addDays(startDate, i)
        cols.push({
          date,
          label: format(date, 'd'),
          isWeekend: date.getDay() === 0 || date.getDay() === 6,
          isToday: format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
          span: 1,
        })
      }
    } else if (scale === 'week') {
      for (let i = 0; i < units; i++) {
        const weekStart = addDays(startDate, i * 7)
        const weekEnd = addDays(weekStart, 6)
        const spanDays = Math.min(7, differenceInDays(endDate, weekStart) + 1)
        cols.push({
          date: weekStart,
          label: `W${getISOWeek(weekStart)}`,
          isWeekend: false,
          isToday: differenceInDays(today, weekStart) >= 0 && differenceInDays(today, weekEnd) <= 0,
          span: spanDays,
        })
      }
    } else { // month
      let currentMonth = startOfMonth(startDate)
      while (currentMonth <= endDate) {
        const monthEnd = endOfMonth(currentMonth)
        const spanDays = Math.min(
          differenceInDays(monthEnd, currentMonth) + 1,
          differenceInDays(endDate, currentMonth) + 1
        )
        cols.push({
          date: currentMonth,
          label: format(currentMonth, 'MM'),
          isWeekend: false,
          isToday: currentMonth <= today && monthEnd >= today,
          span: spanDays,
        })
        currentMonth = addDays(monthEnd, 1)
      }
    }
    return cols
  }, [startDate, endDate, totalDays, scale, units])

  // Generate header labels (month or year-month)
  const headerLabels = useMemo(() => {
    const labels: { label: string; startIdx: number; span: number }[] = []

    if (scale === 'day') {
      // Group by month
      let currentMonth = ''
      let startIdx = 0
      let span = 0

      timeColumns.forEach((col, idx) => {
        const monthKey = format(col.date, 'yyyy-MM')
        if (monthKey !== currentMonth) {
          if (currentMonth) {
            labels.push({
              label: lang === 'zh'
                ? format(parseISO(`${currentMonth}-01`), 'yyyy年MM月', { locale: dateLocale })
                : format(parseISO(`${currentMonth}-01`), 'MMM yyyy', { locale: dateLocale }),
              startIdx,
              span,
            })
          }
          currentMonth = monthKey
          startIdx = idx
          span = 1
        } else {
          span++
        }
      })

      if (currentMonth) {
        labels.push({
          label: lang === 'zh'
            ? format(parseISO(`${currentMonth}-01`), 'yyyy年MM月', { locale: dateLocale })
            : format(parseISO(`${currentMonth}-01`), 'MMM yyyy', { locale: dateLocale }),
          startIdx,
          span,
        })
      }
    } else if (scale === 'week') {
      // Group by month for weeks
      let currentMonth = ''
      let startIdx = 0
      let span = 0

      timeColumns.forEach((col, idx) => {
        const monthKey = format(col.date, 'yyyy-MM')
        if (monthKey !== currentMonth) {
          if (currentMonth) {
            labels.push({
              label: lang === 'zh'
                ? format(parseISO(`${currentMonth}-01`), 'yyyy年MM月', { locale: dateLocale })
                : format(parseISO(`${currentMonth}-01`), 'MMM yyyy', { locale: dateLocale }),
              startIdx,
              span,
            })
          }
          currentMonth = monthKey
          startIdx = idx
          span = 1
        } else {
          span++
        }
      })

      if (currentMonth) {
        labels.push({
          label: lang === 'zh'
            ? format(parseISO(`${currentMonth}-01`), 'yyyy年MM月', { locale: dateLocale })
            : format(parseISO(`${currentMonth}-01`), 'MMM yyyy', { locale: dateLocale }),
          startIdx,
          span,
        })
      }
    } else {
      // For month view, show year
      const year = format(startDate, 'yyyy')
      labels.push({
        label: lang === 'zh' ? `${year}年` : year,
        startIdx: 0,
        span: timeColumns.length,
      })
    }

    return labels
  }, [timeColumns, scale, lang, dateLocale, startDate])

  // Calculate task bar position and width based on scale
  const getTaskBarStyle = (task: Task) => {
    const taskStart = parseISO(task.startDate)
    const taskEnd = parseISO(task.endDate)

    let startOffset: number
    let duration: number

    if (scale === 'day') {
      startOffset = Math.max(0, differenceInDays(taskStart, startDate))
      duration = differenceInDays(taskEnd, taskStart) + 1
      const left = (startOffset / totalDays) * 100
      const width = Math.max((duration / totalDays) * 100, 2)
      return { left: `${left}%`, width: `${width}%` }
    } else if (scale === 'week') {
      startOffset = Math.max(0, differenceInDays(taskStart, startDate))
      duration = differenceInDays(taskEnd, taskStart) + 1
      const left = (startOffset / totalDays) * 100
      const width = Math.max((duration / totalDays) * 100, 2)
      return { left: `${left}%`, width: `${width}%` }
    } else { // month
      const taskStartMonth = startOfMonth(taskStart)
      const taskEndMonth = startOfMonth(taskEnd)
      const totalMonths = Math.ceil(totalDays / 30)

      const startMonthOffset = Math.max(0, differenceInDays(taskStartMonth, startDate))
      const durationMonths = differenceInDays(taskEndMonth, taskStartMonth) + 1

      const left = (startMonthOffset / totalMonths) * 100
      const width = Math.max((durationMonths / totalMonths) * 100, 3)
      return { left: `${left}%`, width: `${width}%` }
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        <div className="flex items-center gap-3">
          {/* Scale selector */}
          <Select value={scale} onValueChange={(v: ScaleType) => setScale(v)}>
            <SelectTrigger className="h-8 w-[120px] text-xs font-bold bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">{lang === 'zh' ? '以天为单位' : 'By Day'}</SelectItem>
              <SelectItem value="week">{lang === 'zh' ? '以周为单位' : 'By Week'}</SelectItem>
              <SelectItem value="month">{lang === 'zh' ? '以月为单位' : 'By Month'}</SelectItem>
            </SelectContent>
          </Select>
          <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-200">
            {lang === 'zh' ? `任务总数量: ${tasks.length}` : `Total Tasks: ${tasks.length}`}
          </div>
        </div>
      </div>

      {/* Project filter links - moved to top */}
      <div className="mb-4 flex flex-wrap gap-2">
        <div
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-100 dark:from-blue-900/50 to-blue-50 dark:to-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 cursor-default select-none"
        >
          {lang === 'zh' ? '选择项目' : 'Select Project'}
        </div>
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/gantt?project=${project.id}`}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              selectedProjectId === project.id
                ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {project.name}
          </Link>
        ))}
      </div>

      {tasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 dark:text-gray-500">
            <Folder className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p>{noTasksLabel}</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Timeline header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            {/* Header labels row (month/year) */}
            <div className="flex h-6 border-b border-gray-100 dark:border-gray-700">
              {headerLabels.map((label, idx) => (
                <div
                  key={idx}
                  className="text-[10px] font-bold text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700 px-2 flex items-center"
                  style={{
                    width: `${(label.span / units) * 100}%`,
                    minWidth: `${label.span * 8}px`,
                  }}
                >
                  {label.label}
                </div>
              ))}
            </div>

            {/* Time unit row (day/week/month) */}
            <div className="flex h-5">
              {timeColumns.map((col, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'text-[9px] text-center flex items-center justify-center border-r border-gray-50 dark:border-gray-700',
                    col.isWeekend ? 'bg-gray-50 dark:bg-gray-700/50 text-gray-400' : 'text-gray-500 dark:text-gray-400',
                    col.isToday && 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                  )}
                  style={{ width: `${(col.span / totalDays) * 100}%` }}
                >
                  {col.label}
                </div>
              ))}
            </div>
          </div>

          {/* Task rows - 30% smaller */}
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {tasks.map((task) => {
              const taskStart = parseISO(task.startDate)
              const taskEnd = parseISO(task.endDate)
              const isOverdue = task.status !== 'DONE' && taskEnd < new Date()
              const displayStatus = isOverdue ? 'OVERDUE' : task.status as keyof typeof statusColors
              const colors = statusColors[displayStatus]
              const barStyle = getTaskBarStyle(task)

              // Calculate bar width in pixels for positioning adjacent elements
              const barLeft = parseFloat(barStyle.left)
              const barWidth = parseFloat(barStyle.width)

              return (
                <div
                  key={task.id}
                  className="flex items-center h-8 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  {/* Task name column - narrow, just for reference */}
                  <div className="w-0 shrink-0" />

                  {/* Timeline bar area */}
                  <div className="flex-1 relative h-full py-1">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex">
                      {timeColumns.map((col, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'h-full border-r',
                            col.isWeekend ? 'bg-gray-50/50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700' : 'border-gray-50 dark:border-gray-700',
                            col.isToday && 'bg-blue-50/30 dark:bg-blue-900/20'
                          )}
                          style={{ width: `${(col.span / totalDays) * 100}%` }}
                        />
                      ))}
                    </div>

                    {/* Task name - positioned to the left of the bar, adjacent */}
                    <div
                      className={cn(
                        'absolute top-1/2 -translate-y-1/2 text-[11px] font-medium truncate pr-1',
                        isOverdue ? 'text-red-500 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'
                      )}
                      style={{ right: `calc(100% - ${barLeft}% + 4px)`, width: '100px', maxWidth: '100px' }}
                    >
                      {task.name}
                    </div>

                    {/* Task bar */}
                    <div
                      className={cn(
                        'absolute top-1/2 -translate-y-1/2 h-4 rounded-full flex items-center px-1.5 cursor-pointer transition-all hover:shadow-md',
                        task.progress === 100 ? 'bg-black dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-600'
                      )}
                      style={{ ...barStyle, minWidth: '24px' }}
                      title={`${task.name}: ${format(taskStart, 'MM/dd')} - ${format(taskEnd, 'MM/dd')} (${task.progress}%)`}
                    >
                      {/* Progress fill - only show when not 100% complete */}
                      {task.progress < 100 && (
                        <div
                          className={cn(
                            'absolute left-0 top-0 h-full rounded-full',
                            isOverdue ? 'bg-red-500' : task.status === 'DONE' ? 'bg-black dark:bg-gray-500' : task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-400'
                          )}
                          style={{ width: `${task.progress}%` }}
                        />
                      )}
                      {/* Progress percentage inside bar */}
                      <span className="relative text-[9px] font-bold text-white truncate px-1">
                        {task.progress > 0 && `${task.progress}%`}
                      </span>
                    </div>

                    {/* End date - positioned to the right of the bar */}
                    <div
                      className={cn(
                        'absolute top-1/2 -translate-y-1/2 text-[11px] font-bold whitespace-nowrap',
                        isOverdue ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                      )}
                      style={{ left: `calc(${barLeft + barWidth}% + 4px)` }}
                    >
                      {format(taskEnd, 'MM/dd')}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend - right aligned */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-end gap-4">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Status:</span>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-black dark:bg-gray-500" />
              <span className="text-[10px] text-gray-600 dark:text-gray-300">{lang === 'zh' ? '已完成' : 'Done'}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-[10px] text-gray-600 dark:text-gray-300">{lang === 'zh' ? '已逾期' : 'Overdue'}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-[10px] text-gray-600 dark:text-gray-300">{lang === 'zh' ? '进行中' : 'In Progress'}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <span className="text-[10px] text-gray-600 dark:text-gray-300">{lang === 'zh' ? '待开始' : 'To Do'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
