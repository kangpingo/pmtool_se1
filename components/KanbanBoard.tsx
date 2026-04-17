'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { isTaskOverdue, isTaskDueToday, isTaskDueTomorrow } from '@/lib/date-utils'
import { Columns, CheckSquare, RotateCcw, Folder } from 'lucide-react'
import { differenceInCalendarDays } from 'date-fns'
import { useApp } from './AppProvider'

interface Task {
  id: string
  name: string
  startDate: string
  endDate: string
  status: string
  keyPoints: string | null
  favorite: boolean
  progress: number
  project: { id: string; name: string }
}

interface ColumnConfig {
  key: string
  label: string
  headerColor: string
  headerColorDark: string
  colColor: string
  colColorDark: string
  shadowColor: string
}

const allColumns = {
  zh: [
    { key: 'TODO',        label: '待开始', headerColor: 'bg-gray-100', headerColorDark: 'dark:bg-gray-700', colColor: 'bg-gray-50', colColorDark: 'dark:bg-gray-800/50', shadowColor: '#6b7280' },
    { key: 'IN_PROGRESS', label: '进行中', headerColor: 'bg-blue-100', headerColorDark: 'dark:bg-blue-900/50', colColor: 'bg-blue-50/50', colColorDark: 'dark:bg-blue-900/20', shadowColor: '#3b82f6' },
    { key: 'OVERDUE',     label: '已逾期', headerColor: 'bg-red-100', headerColorDark: 'dark:bg-red-900/50', colColor: 'bg-red-50/50', colColorDark: 'dark:bg-red-900/20', shadowColor: '#ef4444' },
    { key: 'DONE',        label: '已完成', headerColor: 'bg-green-100', headerColorDark: 'dark:bg-green-900/50', colColor: 'bg-green-50/50', colColorDark: 'dark:bg-green-900/20', shadowColor: '#22c55e' },
  ],
  en: [
    { key: 'TODO',        label: 'To Do', headerColor: 'bg-gray-100', headerColorDark: 'dark:bg-gray-700', colColor: 'bg-gray-50', colColorDark: 'dark:bg-gray-800/50', shadowColor: '#6b7280' },
    { key: 'IN_PROGRESS', label: 'In Progress', headerColor: 'bg-blue-100', headerColorDark: 'dark:bg-blue-900/50', colColor: 'bg-blue-50/50', colColorDark: 'dark:bg-blue-900/20', shadowColor: '#3b82f6' },
    { key: 'OVERDUE',     label: 'Overdue', headerColor: 'bg-red-100', headerColorDark: 'dark:bg-red-900/50', colColor: 'bg-red-50/50', colColorDark: 'dark:bg-red-900/20', shadowColor: '#ef4444' },
    { key: 'DONE',        label: 'Done', headerColor: 'bg-green-100', headerColorDark: 'dark:bg-green-900/50', colColor: 'bg-green-50/50', colColorDark: 'dark:bg-green-900/20', shadowColor: '#22c55e' },
  ],
}

const labels = {
  zh: {
    noTasks: '暂无任务数据',
    dragHint: '拖动或点击按钮移动任务',
    dueText: '截止',
    start: '开始 →',
    complete: '完成',
    reopen: '重开',
    updateFailed: '更新失败',
  },
  en: {
    noTasks: 'No tasks yet',
    dragHint: 'Drag or click buttons to move tasks',
    dueText: 'Due',
    start: 'Start →',
    complete: 'Done',
    reopen: 'Reopen',
    updateFailed: 'Update failed',
  },
}

export default function KanbanBoard({ tasks, visibleStatuses }: { tasks: Task[]; visibleStatuses: string[] }) {
  const router = useRouter()
  const { lang } = useApp()
  const t = labels[lang]
  const columnsConfig = allColumns[lang]

  function effectiveStatus(task: Task) {
    if (task.status === 'DONE') return 'DONE'
    if (isTaskOverdue(new Date(task.endDate))) return 'OVERDUE'
    return task.status
  }

  async function moveTask(taskId: string, newStatus: string) {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      router.refresh()
    } catch {
      toast.error(t.updateFailed)
    }
  }

  const columns = columnsConfig.filter(col => visibleStatuses.includes(col.key))

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
        <div className="text-center">
          <Columns className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p>{t.noTasks}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 flex-1 min-h-0">
      {columns.map(col => {
        const colTasks = tasks.filter(t => effectiveStatus(t) === col.key)
        return (
          <div key={col.key} className="flex-shrink-0 w-56 sm:w-64 md:w-72 lg:w-80 flex flex-col rounded-xl overflow-hidden" style={{ boxShadow: `0 4px 24px ${col.shadowColor}20` }}>
            {/* Column header */}
            <div className={`rounded-t-xl px-4 py-3 ${col.headerColor} ${col.headerColorDark}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">{col.label}</h3>
                <span className="text-xs bg-white dark:bg-gray-600 rounded-full px-2.5 py-0.5 font-bold text-gray-500 dark:text-gray-300 shadow-sm">{colTasks.length}</span>
              </div>
            </div>
            {/* Column content */}
            <div className={`flex-1 rounded-b-xl ${col.colColor} ${col.colColorDark} p-3 space-y-2.5 overflow-y-auto`}
              style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {colTasks.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">{t.dragHint}</p>
              )}
              {colTasks.map(task => {
                const overdue = col.key === 'OVERDUE'
                const dueToday = isTaskDueToday(new Date(task.endDate)) && task.status !== 'DONE'
                const dueTomorrow = isTaskDueTomorrow(new Date(task.endDate)) && task.status !== 'DONE'
                const overdueDays = overdue ? Math.abs(differenceInCalendarDays(new Date(task.endDate), new Date())) : 0
                return (
                  <div key={task.id}
                    className={`rounded-xl p-3.5 shadow-sm border hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group ${
                      overdue ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700' : dueToday ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' : dueTomorrow ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                    }`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className={`text-sm font-medium leading-tight ${task.status === 'DONE' ? 'line-through text-gray-400 dark:text-gray-500' : overdue ? 'text-red-900 dark:text-red-200' : 'text-gray-800 dark:text-gray-100'}`}>{task.name}</p>
                        {overdue && overdueDays > 0 && (
                          <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded shrink-0">
                            {lang === 'zh' ? `逾期${overdueDays}天` : `${overdueDays}d overdue`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {task.progress > 0 && task.status !== 'DONE' && (
                          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{Math.round(task.progress / 10) * 10}%</span>
                        )}
                        {task.favorite && <span className="text-yellow-400 shrink-0">★</span>}
                      </div>
                    </div>
                    <Link href={`/projects/${task.project.id}`} className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 mb-2 flex items-center gap-1"><Folder className="h-3 w-3" />{task.project.name}</Link>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${overdue ? 'text-red-700 dark:text-red-400 font-bold' : dueToday ? 'text-orange-600 dark:text-orange-400 font-medium' : dueTomorrow ? 'text-yellow-600 dark:text-yellow-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                        {lang === 'zh' ? format(new Date(task.endDate), 'M月d日') : format(new Date(task.endDate), 'MMM d')}{t.dueText}
                      </span>
                      <div className="flex gap-1">
                        {col.key === 'TODO' && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800"
                            onClick={() => moveTask(task.id, 'IN_PROGRESS')}>{t.start}</Button>
                        )}
                        {(col.key === 'IN_PROGRESS' || col.key === 'OVERDUE') && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-800"
                            onClick={() => moveTask(task.id, 'DONE')}>
                            <CheckSquare className="h-3.5 w-3.5 mr-1" />{t.complete}
                          </Button>
                        )}
                        {col.key === 'DONE' && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-gray-400 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 hover:text-yellow-600 dark:hover:text-yellow-400 border border-gray-200 dark:border-gray-600"
                            onClick={() => moveTask(task.id, 'IN_PROGRESS')}>
                            <RotateCcw className="h-3.5 w-3.5 mr-1" />{t.reopen}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
