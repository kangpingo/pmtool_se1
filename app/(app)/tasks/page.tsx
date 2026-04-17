import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'
import { ChevronDown, Calendar, Layers } from 'lucide-react'
import TaskCard from '@/components/TaskCard'
import TaskViewToggle from '@/components/TaskViewToggle'
import ProjectGroupView from '@/components/ProjectGroupView'
import ProjectGroupClient from '@/components/ProjectGroupClient'

export const dynamic = 'force-dynamic'

type Window = '1' | '3' | '7' | '30' | '365' | 'all'
type GroupBy = 'time' | 'project'

const labels = {
  zh: {
    title: '任务视图',
    noTasks: '当前时间段内没有任务',
    noTasksHint3: '查看3天内任务',
    noTasksHint7: '查看一周内任务',
    noTasksHint30: '查看一个月内任务',
    noTasksHintAll: '查看所有任务',
    todayDue: '今日到期',
    upcoming: '即将到期',
    overdue: '已逾期',
    completed: '已完成',
    tasks: '任务',
    overdueTasks: '逾期',
    completion: '完成',
    dueDays: (n: number) => n === 1 ? '今日到期' : `${n}天内到期`,
  },
  en: {
    title: '任务视图',
    noTasks: '当前无任务',
    noTasksHint3: 'View tasks in 3 days',
    noTasksHint7: 'View tasks in a week',
    noTasksHint30: 'View tasks in a month',
    noTasksHintAll: 'View all tasks',
    todayDue: '今日到期',
    upcoming: '即将到期',
    overdue: '已逾期',
    completed: '已完成',
    tasks: '任务',
    overdueTasks: '逾期',
    completion: 'done',
    dueDays: (n: number) => n === 1 ? 'Due Today' : `Due ${n} Days`,
  },
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string; groupby?: string; favorite?: string; overdue?: string; completed?: string }>
}) {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('lang')?.value as 'zh' | 'en') || 'en'
  const t = labels[lang]

  const { window: win = '1', groupby: gb = 'time', favorite: fav = 'false', overdue: od = 'false', completed: comp = 'false', highlight: hl = '' } = await searchParams as { window?: string; groupby?: string; favorite?: string; overdue?: string; completed?: string; highlight?: string }
  const windowDays = win === 'all' ? -1 : Number(win)
  const groupBy = (['time', 'project'].includes(gb) ? gb : 'time') as GroupBy
  const showFavorites = fav === 'true'
  const showOverdueOnly = od === 'true'
  const showCompletedOnly = comp === 'true'
  const showAll = win === 'all'

  const now = new Date()
  const rangeStart = startOfDay(now)
  // rangeEnd depends on window: 1=endOfToday, 3=endOfToday+2days, etc.
  const rangeEnd = windowDays === -1
    ? new Date('2030-12-31') // 'all' mode - far future
    : endOfDay(new Date(rangeStart.getTime() + (windowDays - 1) * 86400000))

  let tasks = await prisma.task.findMany({
    where: {
      ...(showOverdueOnly ? { plannedEndDate: { lt: rangeStart }, status: { not: 'DONE' } } : {}),
      ...(showFavorites ? { favorite: true } : {}),
    },
    include: { project: { select: { id: true, name: true } } },
    orderBy: groupBy === 'time' ? { plannedEndDate: 'asc' } : [{ favorite: 'desc' }, { plannedEndDate: 'asc' }],
  })

  if (groupBy === 'project') {
    tasks = await prisma.task.findMany({
      where: {
        ...(showOverdueOnly ? { plannedEndDate: { lt: rangeStart }, status: { not: 'DONE' } } : {}),
        ...(showFavorites ? { favorite: true } : {}),
      },
      include: { project: { select: { id: true, name: true } } },
      orderBy: [{ favorite: 'desc' }, { plannedEndDate: 'asc' }],
    })
  }

  // 'all' mode: no grouping, no time filtering, just show all tasks
  // Already fetched above, no additional query needed

  const serialized = tasks.map(t => ({
    ...t,
    startDate: t.plannedStartDate.toISOString(),
    endDate: t.plannedEndDate.toISOString(),
    actualFinishDate: t.actualFinishDate?.toISOString() ?? null,
  }))

  const isTaskComplete = (t: typeof serialized[0]) => t.status === 'DONE' || t.progress === 100

  // Calculate total counts for filter buttons (always show total counts)
  const totalOverdueCount = serialized.filter(t => {
    const end = new Date(t.endDate)
    return end < startOfDay(now) && !isTaskComplete(t)
  }).length
  // Completed tasks: progress=100 AND actualFinishDate in range
  const totalCompletedCount = serialized.filter(t => {
    if (t.progress !== 100 || !t.actualFinishDate) return false
    const actualEnd = new Date(t.actualFinishDate)
    return actualEnd >= rangeStart && actualEnd <= rangeEnd
  }).length

  // Filter tasks within the selected time window
  // Overdue tasks are always shown separately (before rangeStart)
  // Completed tasks (progress=100 or status=DONE) are filtered by actualFinishDate within the window
  const tasksInWindow = serialized.filter(t => {
    const end = new Date(t.endDate)
    if (showCompletedOnly) {
      // For completed view: filter by actualFinishDate within window
      if (t.status !== 'DONE' && t.progress !== 100) return false
      const actualEnd = t.actualFinishDate ? new Date(t.actualFinishDate) : null
      if (!actualEnd) return end >= rangeStart && end <= rangeEnd
      return actualEnd >= rangeStart && actualEnd <= rangeEnd
    }
    // For non-completed view: exclude completed tasks, filter by plannedEndDate within window
    if (t.status === 'DONE' || t.progress === 100) return false
    return end >= rangeStart && end <= rangeEnd
  })

  // Completed tasks within window (filtered by actualFinishDate)
  const completedInWindow = tasksInWindow.filter(t => {
    if (t.progress === 100 && t.actualFinishDate) {
      const actualEnd = new Date(t.actualFinishDate)
      return actualEnd >= rangeStart && actualEnd <= rangeEnd
    }
    return false
  })

  // Due today: exactly today
  const windowLabel = windowDays === 1 ? t.todayDue : (t.dueDays as (n: number) => string)(windowDays)

  // Overdue: before today (shown separately when showOverdueOnly)
  const overdueTasks = showCompletedOnly ? [] : serialized.filter(t => {
    const end = new Date(t.endDate)
    return end < startOfDay(now) && t.progress < 100
  })

  if (groupBy === 'time') {

    return (
      <div className="p-4 md:p-6 max-w-6xl xl:max-w-7xl 2xl:max-w-8xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h1>
          <TaskViewToggle currentGroupBy={groupBy} currentWindow={win as Window} currentFavorite={fav} currentOverdue={od} currentCompleted={comp} overdueCount={totalOverdueCount} completedCount={totalCompletedCount} />
        </div>

        {tasksInWindow.length === 0 && !showOverdueOnly ? (
          <div className="flex justify-center mt-48">
            <div className="relative w-full max-w-2xl">
              {/* Floating decorative circles */}
              <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-gray-300/30 dark:bg-gray-600/30 animate-bounce" style={{ animationDuration: '3s' }} />
              <div className="absolute -top-2 -right-8 w-16 h-16 rounded-full bg-gray-400/30 dark:bg-gray-500/30 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
              <div className="absolute -bottom-6 -left-8 w-20 h-20 rounded-full bg-gray-500/20 dark:bg-gray-600/20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />
              <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-full bg-gray-600/30 dark:bg-gray-400/30 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1.5s' }} />

              {/* Main card */}
              <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-3xl shadow-xl px-16 py-20 flex flex-col items-center justify-center space-y-10">
                {/* Large stylized checkmark */}
                <div className="relative">
                  <div className="w-36 h-36 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-500 flex items-center justify-center shadow-2xl shadow-gray-300/60 dark:shadow-gray-700/60">
                    <svg className="w-20 h-20 text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {/* Sparkle effects */}
                  <div className="absolute -top-2 left-1/2 w-3 h-3 bg-gray-400 dark:bg-gray-300 rounded-full animate-ping" />
                  <div className="absolute top-1/2 -right-4 w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                  <div className="absolute -bottom-1 left-1/3 w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                </div>

                {/* Text */}
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-wide">
                    {lang === 'zh'
                      ? (win === '1' ? '今日无任务' : win === '3' ? '3天内无任务' : win === '7' ? '一周内无任务' : win === '30' ? '一月内无任务' : '暂无任务')
                      : (win === '1' ? 'No tasks today' : win === '3' ? 'No tasks in 3 days' : win === '7' ? 'No tasks in a week' : win === '30' ? 'No tasks in a month' : 'No tasks')
                    }
                  </h3>
                  <p className="text-gray-400 dark:text-gray-400 text-base">{lang === 'zh' ? '太棒了！这个时间段的任务全部完成' : 'Amazing! All tasks in this period are done'}</p>
                </div>

                {/* Confetti-like dots */}
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400 dark:bg-gray-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-500 dark:bg-gray-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-600 dark:bg-gray-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-700 dark:bg-gray-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-800 dark:bg-gray-100" />
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {win === '1' && (
                    <a href="?window=3" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-blue-300/50 dark:shadow-blue-700/50 transition-all hover:shadow-xl hover:-translate-y-1">
                      <Calendar className="w-5 h-5" />
                      {t.noTasksHint3}
                    </a>
                  )}
                  {win === '3' && (
                    <a href="?window=7" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-blue-300/50 dark:shadow-blue-700/50 transition-all hover:shadow-xl hover:-translate-y-1">
                      <Calendar className="w-5 h-5" />
                      {t.noTasksHint7}
                    </a>
                  )}
                  {win === '7' && (
                    <a href="?window=30" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-blue-300/50 dark:shadow-blue-700/50 transition-all hover:shadow-xl hover:-translate-y-1">
                      <Calendar className="w-5 h-5" />
                      {t.noTasksHint30}
                    </a>
                  )}
                  {(win === '30' || win === '365') && (
                    <a href="?window=all" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-blue-300/50 dark:shadow-blue-700/50 transition-all hover:shadow-xl hover:-translate-y-1">
                      <Layers className="w-5 h-5" />
                      {t.noTasksHintAll}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Due category - expanded by default, shows tasks in current window */}
            {!showCompletedOnly && tasksInWindow.length > 0 && !showOverdueOnly && (
              <div>
                <details className="group" open>
                  <summary className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2 cursor-pointer flex items-center gap-2 hover:text-orange-700 dark:hover:text-orange-300 list-none">
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                    {windowLabel}{lang === 'zh' ? `（${tasksInWindow.length}）` : ` (${tasksInWindow.length})`}
                  </summary>
                  <div className="space-y-3 p-1">
                    {tasksInWindow.map((task, idx) => <TaskCard key={task.id} task={task} compact index={idx} highlighted={task.id === hl} />)}
                  </div>
                </details>
              </div>
            )}

            {/* Overdue */}
            {!showCompletedOnly && showOverdueOnly && overdueTasks.length > 0 && (
              <div>
                <details className="group" open>
                  <summary className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 cursor-pointer flex items-center gap-2 hover:text-red-700 dark:hover:text-red-300 list-none">
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                    {t.overdue}{lang === 'zh' ? `（${overdueTasks.length}）` : ` (${overdueTasks.length})`}
                  </summary>
                  <div className="space-y-3 p-1">
                    {overdueTasks.map((task, idx) => <TaskCard key={task.id} task={task} compact index={idx} highlighted={task.id === hl} />)}
                  </div>
                </details>
              </div>
            )}

            {/* Completed */}
            {showCompletedOnly && completedInWindow.length > 0 && (
              <div>
                <details className="group" open>
                  <summary className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 cursor-pointer flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300 list-none">
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                    {t.completed}{lang === 'zh' ? `（${completedInWindow.length}）` : ` (${completedInWindow.length})`}
                  </summary>
                  <div className="space-y-3 p-1">
                    {completedInWindow.map((task, idx) => <TaskCard key={task.id} task={task} compact index={idx} highlighted={task.id === hl} />)}
                  </div>
                </details>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // Group tasks by project for project view
  const grouped = tasksInWindow.reduce<Record<string, typeof serialized>>((acc, task) => {
    const pid = task.project?.id || 'unassigned'
    if (!acc[pid]) acc[pid] = []
    acc[pid].push(task)
    return acc
  }, {})

  const projectColors = [
    { border: 'border-l-blue-400', bg: 'bg-blue-50 dark:bg-blue-950', bgValue: '#eff6ff', shadowColor: '#3b82f6' },
    { border: 'border-l-purple-400', bg: 'bg-purple-50 dark:bg-purple-950', bgValue: '#faf5ff', shadowColor: '#a855f7' },
    { border: 'border-l-green-400', bg: 'bg-green-50 dark:bg-green-950', bgValue: '#f0fdf4', shadowColor: '#22c55e' },
    { border: 'border-l-orange-400', bg: 'bg-orange-50 dark:bg-orange-950', bgValue: '#fff7ed', shadowColor: '#f97316' },
    { border: 'border-l-pink-400', bg: 'bg-pink-50 dark:bg-pink-950', bgValue: '#fdf2f8', shadowColor: '#ec4899' },
    { border: 'border-l-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950', bgValue: '#ecfeff', shadowColor: '#06b6d4' },
  ]

  return (
    <div className="p-4 md:p-6 max-w-6xl xl:max-w-7xl 2xl:max-w-8xl mx-auto space-y-6">
      <ProjectGroupClient
        grouped={grouped}
        projectColors={projectColors}
        labels={{ completion: t.completion, overdueTasks: t.overdueTasks }}
        lang={lang}
        currentGroupBy={groupBy}
        currentWindow={win as Window}
        currentFavorite={fav}
        currentOverdue={od}
      />
    </div>
  )
}
