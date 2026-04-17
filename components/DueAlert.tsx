'use client'
import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { AlertTriangle, Clock, X, ChevronDown } from 'lucide-react'
import { isTaskOverdue, isTaskDueToday, isTaskDueTomorrow } from '@/lib/date-utils'
import { Button } from '@/components/ui/button'
import { useApp } from './AppProvider'

interface Task {
  id: string
  name: string
  endDate: string
  status: string
  project: { name: string }
}

const labels = {
  zh: {
    overdue: '任务已逾期',
    dueToday: '今天到期',
    dueTomorrow: '明天到期',
    due: '截止',
    morePending: '还有 {count} 个任务待处理',
  },
  en: {
    overdue: 'Task Overdue',
    dueToday: 'Due Today',
    dueTomorrow: 'Due Tomorrow',
    due: 'Due',
    morePending: '+{count} more tasks pending',
  },
}

export default function DueAlert() {
  const { lang } = useApp()
  const t = labels[lang]
  const [alerts, setAlerts] = useState<Task[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState(false)

  const fetchDueTasks = useCallback(async () => {
    const res = await fetch('/api/tasks?window=2')
    const tasks: Task[] = await res.json()
    const urgent = tasks.filter(t =>
      t.status !== 'DONE' &&
      (isTaskOverdue(new Date(t.endDate)) || isTaskDueToday(new Date(t.endDate)) || isTaskDueTomorrow(new Date(t.endDate)))
    )
    setAlerts(urgent)
  }, [])

  useEffect(() => {
    fetchDueTasks()
    const timer = setInterval(fetchDueTasks, 5 * 60 * 1000) // 每5分钟检查一次
    return () => clearInterval(timer)
  }, [fetchDueTasks])

  const visible = alerts.filter(a => !dismissed.has(a.id))
  if (visible.length === 0) return null

  const displayed = expanded ? visible : visible.slice(0, 3)
  const remaining = visible.length - 3

  return (
    <div className="fixed bottom-3 right-3 z-50 space-y-1.5 max-w-[260px] w-full">
      {displayed.map(task => {
        const overdue = isTaskOverdue(new Date(task.endDate))
        const dueToday = isTaskDueToday(new Date(task.endDate))
        const dueTomorrow = isTaskDueTomorrow(new Date(task.endDate))
        return (
          <div key={task.id} className={`flex items-start gap-2 p-2.5 rounded-lg shadow-lg border ${
            overdue ? 'bg-red-50 border-red-200' : dueToday ? 'bg-orange-50 border-orange-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            {overdue
              ? <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              : <Clock className={`h-4 w-4 shrink-0 mt-0.5 ${dueToday ? 'text-orange-500' : 'text-yellow-500'}`} />
            }
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold leading-tight ${overdue ? 'text-red-800' : dueToday ? 'text-orange-800' : 'text-yellow-800'}`}>
                {overdue ? t.overdue : dueToday ? t.dueToday : t.dueTomorrow}
              </p>
              <p className={`text-xs truncate leading-tight ${overdue ? 'text-red-700' : dueToday ? 'text-orange-700' : 'text-gray-700'}`}>{task.name}</p>
              <p className="text-[10px] text-gray-500 leading-tight">{task.project.name} · {t.due} {lang === 'zh' ? format(new Date(task.endDate), 'M月d日') : format(new Date(task.endDate), 'MMM d')}</p>
            </div>
            <Button
              variant="ghost" size="icon" className="h-5 w-5 shrink-0"
              onClick={() => setDismissed(d => new Set(Array.from(d).concat(task.id)))}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )
      })}
      {remaining > 0 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center justify-center gap-1.5 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[10px] text-gray-600 transition-colors"
        >
          <ChevronDown className="h-3 w-3" />
          {lang === 'zh' ? t.morePending.replace('{count}', String(remaining)) : t.morePending.replace('{count}', String(remaining))}
        </button>
      )}
    </div>
  )
}
