'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import { toast } from 'sonner'
import { isTaskOverdue, isTaskDueSoon, isTaskDueToday, isTaskDueTomorrow } from '@/lib/date-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  AlertTriangle, Clock, CheckCircle2, Circle, Trash2,
  ChevronDown, ChevronUp, Star, CheckSquare, RotateCcw, Pencil, Calendar, FileText, Folder, AlertCircle, Copy, Gauge, Check
} from 'lucide-react'
import { useApp } from './AppProvider'

const statusConfig = {
  zh: {
    TODO:        { label: '待开始', icon: <Clock className="h-3.5 w-3.5" />,         color: 'text-yellow-600' },
    IN_PROGRESS: { label: '进行中', icon: <Clock className="h-3.5 w-3.5" />,          color: 'text-yellow-600' },
    DONE:        { label: '已完成', icon: <CheckCircle2 className="h-3.5 w-3.5" />,  color: 'text-green-600' },
    OVERDUE:     { label: '已逾期', icon: <AlertTriangle className="h-3.5 w-3.5" />, color: 'text-red-500' },
  },
  en: {
    TODO:        { label: 'To Do', icon: <Clock className="h-3.5 w-3.5" />,         color: 'text-yellow-600' },
    IN_PROGRESS: { label: 'In Progress', icon: <Clock className="h-3.5 w-3.5" />,          color: 'text-yellow-600' },
    DONE:        { label: 'Done', icon: <CheckCircle2 className="h-3.5 w-3.5" />,  color: 'text-green-600' },
    OVERDUE:     { label: 'Overdue', icon: <AlertTriangle className="h-3.5 w-3.5" />, color: 'text-red-500' },
  },
}

const compactLabels = {
  zh: {
    overdue: '已逾期',
    dueToday: '今天到期',
    dueTomorrow: '明天到期',
    completeTitle: '一键完成',
    reopenTitle: '重开',
    expandTitle: '展开',
    collapseTitle: '收起',
    duplicateTitle: '复制副本',
    favoriteTitle: '收藏',
    unfavoriteTitle: '取消收藏',
  },
  en: {
    overdue: 'Overdue',
    dueToday: 'Due Today',
    dueTomorrow: 'Due Tomorrow',
    completeTitle: 'Complete',
    reopenTitle: 'Reopen',
    expandTitle: 'Expand',
    collapseTitle: 'Collapse',
    duplicateTitle: 'Duplicate',
    favoriteTitle: 'Favorite',
    unfavoriteTitle: 'Unfavorite',
  },
}

const cardLabels = {
  zh: {
    overdue: '逾期',
    dueToday: '今天到期',
    dueTomorrow: '明天到期',
    completeTitle: '一键完成',
    reopenTitle: '重开',
    keyPoints: '重点关注',
    save: '保存',
    saving: '保存中...',
    cancel: '取消',
    nameLabel: '任务名称',
    startDateLabel: '计划开始日期',
    endDateLabel: '计划完成日期',
    durationLabel: '工期（天）',
    keyPointsLabel: '重点关注',
    ownerLabel: '责任人',
    ownerPlaceholder: '输入责任人',
    editTitle: '编辑任务',
    editTooltip: '编辑',
    deleteTooltip: '删除',
    viewTooltip: '查看',
    duplicateTitle: '复制副本',
    duplicateTooltip: '复制',
    favoriteTitle: '收藏',
    unfavoriteTitle: '取消收藏',
  },
  en: {
    overdue: 'Overdue',
    dueToday: 'Due Today',
    dueTomorrow: 'Due Tomorrow',
    completeTitle: 'Complete',
    reopenTitle: 'Reopen',
    keyPoints: 'Key Points',
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    nameLabel: 'Task Name',
    startDateLabel: 'Planned Start',
    endDateLabel: 'Planned End',
    durationLabel: 'Duration\u00A0(days)',
    keyPointsLabel: 'Key Points',
    ownerLabel: 'Owner',
    ownerPlaceholder: 'Enter owner',
    editTitle: 'Edit Task',
    editTooltip: 'Edit',
    deleteTooltip: 'Delete',
    viewTooltip: 'View',
    duplicateTitle: 'Duplicate',
    duplicateTooltip: 'Duplicate',
    favoriteTitle: 'Favorite',
    unfavoriteTitle: 'Unfavorite',
  },
}

const actionLabels = {
  zh: {
    toggleFailed: '操作失败',
    completeSuccess: '任务已完成 ✓',
    reopenSuccess: '任务已重开',
    updateSuccess: '状态已更新',
    progressSuccess: '进度已更新',
    progressFailed: '更新进度失败',
    deleteConfirm: '删除任务',
    deleteSuccess: '已删除',
    deleteFailed: '删除失败',
    saveFailed: '保存失败',
  },
  en: {
    toggleFailed: 'Operation failed',
    completeSuccess: 'Task completed ✓',
    reopenSuccess: 'Task reopened',
    updateSuccess: 'Status updated',
    progressSuccess: 'Progress updated',
    progressFailed: 'Failed to update progress',
    deleteConfirm: 'Delete task',
    deleteSuccess: 'Deleted',
    deleteFailed: 'Delete failed',
    saveFailed: 'Save failed',
  },
}

interface Task {
  id: string
  name: string
  startDate: string
  endDate: string
  actualFinishDate?: string | null
  duration: number
  includeWeekend: boolean
  keyPoints: string | null
  status: string
  progress: number
  favorite: boolean
  project?: { id: string; name: string }
  projectId?: string
}

interface ProjectOption {
  id: string
  name: string
}

export default function TaskCard({ task, compact = false, showKeyPoints = true, showExpand = true, showProject = true, showDelete = true, selected = false, onToggleSelect, highlighted = false, index, bgColor }: { task: Task; compact?: boolean; showKeyPoints?: boolean; showExpand?: boolean; showProject?: boolean; showDelete?: boolean; selected?: boolean; onToggleSelect?: (id: string) => void; highlighted?: boolean; index?: number; bgColor?: string }) {
  const { lang } = useApp()
  const t = cardLabels[lang]
  const actionT = actionLabels[lang]
  const statusT = statusConfig[lang]
  const compactT = compactLabels[lang]
  const [expanded, setExpanded] = useState(false)
  const [favorited, setFavorited] = useState(task.favorite)
  const [currentProgress, setCurrentProgress] = useState(task.progress)
  const [precision, setPrecision] = useState(2)
  const [showProgressDropdown, setShowProgressDropdown] = useState(false)
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)

  // Read precision setting from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('progressPrecision')
    if (saved) setPrecision(Number(saved))
  }, [])

  // Scroll to highlighted task
  useEffect(() => {
    if (highlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlighted])

  const overdue = isTaskOverdue(new Date(task.endDate)) && task.status !== 'DONE'
  const dueToday = isTaskDueToday(new Date(task.endDate)) && task.status !== 'DONE' && !overdue
  const dueTomorrow = isTaskDueTomorrow(new Date(task.endDate)) && task.status !== 'DONE' && !overdue && !dueToday
  const displayStatus = (overdue ? 'OVERDUE' : task.status) as 'TODO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE'
  const borderColor = overdue ? 'border-l-red-400' : dueToday ? 'border-l-orange-400' : dueTomorrow ? 'border-l-yellow-400' : 'border-l-transparent'
  const dateLocale = lang === 'zh' ? zhCN : enUS

  // Icon logic: yellow clock for due today/tomorrow (not overdue, not done), otherwise circle
  const showYellowClock = !overdue && task.status !== 'DONE' && (dueToday || dueTomorrow)
  const config = statusT[displayStatus] ?? statusT.TODO
  const iconToShow = showYellowClock
    ? { icon: <Clock className="h-3.5 w-3.5" />, color: 'text-yellow-600' }
    : displayStatus === 'DONE'
    ? { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-green-600' }
    : displayStatus === 'OVERDUE'
    ? { icon: <AlertTriangle className="h-3.5 w-3.5" />, color: 'text-red-500' }
    : { icon: <Circle className="h-3.5 w-3.5" />, color: 'text-gray-400' }

  // Index badge and progress bar color: overdue=red, 100%=dark (black), otherwise=blue
  const isFullyComplete = task.progress === 100
  const indexColor = overdue
    ? 'bg-red-500 text-white'
    : isFullyComplete
    ? 'bg-gray-900 text-white'
    : 'bg-blue-500 text-white'
  const progressColor = overdue
    ? '#dc2626'
    : isFullyComplete
    ? '#111827'
    : '#2563eb'

  // Format progress based on precision
  const formatProgress = (p: number) => {
    if (precision === 0) return `${Math.round(p)}%`
    if (precision === 1) return `${p.toFixed(1)}%`
    return `${p.toFixed(2)}%`
  }

  async function toggleFavorite() {
    const newVal = !favorited
    setFavorited(newVal)
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: newVal }),
      })
    } catch {
      setFavorited(!newVal)
      toast.error(actionT.toggleFailed)
    }
  }

  async function completeTask() {
    setCurrentProgress(100)
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DONE', progress: 100 }),
      })
      toast.success(actionT.completeSuccess)
      router.refresh()
    } catch {
      setCurrentProgress(task.progress)
      toast.error(actionT.toggleFailed)
    }
  }

  async function reopenTask() {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      })
      toast.success(actionT.reopenSuccess)
    } catch { toast.error(actionT.toggleFailed) }
  }

  async function updateStatus(newStatus: string) {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      toast.success(actionT.updateSuccess)
    } catch { toast.error(actionT.toggleFailed) }
  }

  async function updateProgress(newProgress: number) {
    setCurrentProgress(newProgress)
    try {
      const body: Record<string, unknown> = { progress: newProgress }
      if (newProgress === 100) {
        body.status = 'DONE'
        body.actualFinishDate = new Date().toISOString()
      }
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      toast.success(actionT.progressSuccess)
      router.refresh()
    } catch {
      setCurrentProgress(task.progress)
      toast.error(actionT.progressFailed)
    }
  }

  async function deleteTask() {
    if (!confirm(`${actionT.deleteConfirm}「${task.name}」?`)) return
    try {
      await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
      toast.success(actionT.deleteSuccess)
      router.refresh()
    } catch { toast.error(actionT.deleteFailed) }
  }

  async function duplicateTask() {
    try {
      const suffix = lang === 'zh' ? '的副本' : ' (Copy)'
      const res = await fetch(`/api/tasks/${task.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${task.name}${suffix}` }),
      })
      if (res.ok) {
        const newTask = await res.json()
        toast.success(lang === 'zh' ? '已复制任务' : 'Task duplicated')
        // Navigate with highlight param to flash the new task
        const currentPath = window.location.pathname
        router.push(`${currentPath}?highlight=${newTask.id}`)
      } else {
        toast.error(lang === 'zh' ? '复制失败' : 'Failed to duplicate')
      }
    } catch {
      toast.error(lang === 'zh' ? '复制失败' : 'Failed to duplicate')
    }
  }

  if (compact) {
    return (
      <div
        ref={cardRef}
        className={`group bg-white dark:bg-gray-800 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/30 ${overdue ? 'border-red-300 dark:border-red-700' : dueToday ? 'border-orange-300 dark:border-orange-700' : dueTomorrow ? 'border-yellow-300 dark:border-yellow-700' : 'border-gray-200 dark:border-gray-700'} ${highlighted ? 'animate-highlight' : ''}`}
        style={{ background: bgColor || undefined }}
      >
        <div className="flex items-center gap-2 px-3 py-2">
          {index !== undefined && (
            <div className={`w-5 h-5 rounded-full ${indexColor} flex items-center justify-center shrink-0 text-[10px] font-medium`}>{index + 1}</div>
          )}
          <InlineEditTaskName task={task} />
          {favorited && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />}
          <span className={`shrink-0 ${iconToShow.color}`}>{iconToShow.icon}</span>
          <span className={`hidden md:inline text-xs shrink-0 ${overdue ? 'text-red-600 dark:text-red-400 font-medium' : dueToday ? 'text-orange-500 dark:text-orange-400 font-medium' : dueTomorrow ? 'text-yellow-500 dark:text-yellow-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
            {overdue ? compactT.overdue : dueToday ? compactT.dueToday : dueTomorrow ? compactT.dueTomorrow : format(new Date(task.endDate), 'yyyy/MM/dd EEEE', { locale: dateLocale })}
          </span>
          {showProject && task.project && <Link href={`/projects/${task.project.id}`} className="text-xs text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 shrink-0 flex nowrap items-center gap-0.5"><span className="whitespace-nowrap flex items-center gap-0.5"><Folder className="h-3 w-3" />{task.project.name}</span></Link>}
          {/* Action buttons pushed to right with ml-auto */}
          <div className="flex items-center gap-1 shrink-0 ml-auto mt-1">
            {(task.status !== 'DONE' || currentProgress === 100) && (
              <div className="h-3 w-[160px] bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden shrink-0">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${currentProgress}%`,
                    background: progressColor,
                  }}
                />
              </div>
            )}
            {(task.status !== 'DONE' || currentProgress === 100) && (
              <div className="relative">
                <button
                  onClick={() => setShowProgressDropdown(!showProgressDropdown)}
                  className="h-6 w-[72px] text-xs font-bold bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center gap-1 text-gray-700 dark:text-gray-200"
                >
                  <span>{Math.round(currentProgress / 10) * 10}%</span>
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>
                {showProgressDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProgressDropdown(false)} />
                    <div className="absolute left-0 top-full mt-1 z-[80] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[115px]">
                      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(p => (
                        <button
                          key={p}
                          onClick={() => { updateProgress(p); setShowProgressDropdown(false) }}
                          className={`w-full px-3 py-2 text-xs text-left hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-between ${
                            Math.round(currentProgress) === p ? 'bg-blue-100 text-gray-700 dark:text-gray-200 font-bold' : 'text-gray-700 dark:text-gray-200'
                          }`}
                        >
                          <span>{p}%</span>
                          {Math.round(currentProgress) === p && <Check className="h-3 w-3 text-gray-700 dark:text-gray-200" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            <Button size="icon" className="h-7 w-7 bg-gray-200 dark:bg-gray-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded-lg" onClick={toggleFavorite}>
              <span title={favorited ? compactT.unfavoriteTitle : compactT.favoriteTitle}>
                {favorited ? <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> : <Star className="h-3.5 w-3.5 text-yellow-500" />}
              </span>
            </Button>
            {task.status === 'DONE' && currentProgress !== 100 ? (
              <Button size="sm" variant="ghost" className="h-7 px-1.5 text-xs text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30" onClick={reopenTask}>
                <span title={compactT.reopenTitle}>
                  <RotateCcw className="h-3.5 w-3.5" />
                </span>
              </Button>
            ) : null}
            <Button size="icon" className="h-7 w-7 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg" onClick={duplicateTask}>
              <span title={compactT.duplicateTitle}>
                <Copy className="h-3.5 w-3.5" />
              </span>
            </Button>
            <InlineEditTask task={task} onDone={() => {}} compact />
            {showDelete && (
              <Button size="icon" className="h-7 w-7 bg-gray-200 dark:bg-gray-700 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg" onClick={deleteTask}>
                <span title={t.deleteTooltip}>
                  <Trash2 className="h-3.5 w-3.5" />
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={cardRef} className={`group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 hover:shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/30 ${overdue ? 'border-red-200 dark:border-red-900' : dueToday ? 'border-orange-200 dark:border-orange-900' : dueTomorrow ? 'border-yellow-200 dark:border-yellow-900' : ''} ${highlighted ? 'ring-4 ring-yellow-400 ring-opacity-50 animate-highlight' : ''}`}>
      <div className="flex items-start gap-3 p-3">
        <div className={`w-1 self-stretch rounded-full shrink-0 mt-0.5 ${overdue ? 'bg-red-400' : dueToday ? 'bg-orange-400' : dueTomorrow ? 'bg-yellow-400' : 'bg-gray-200 dark:bg-gray-600'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`shrink-0 ${iconToShow.color}`}>{iconToShow.icon}</span>
            <InlineEditTaskName task={task} />
            {favorited && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />}
            {showProject && task.project && <Link href={`/projects/${task.project.id}`} className="text-xs text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 px-1.5 py-0.5 rounded shrink-0 flex nowrap items-center gap-0.5"><span className="whitespace-nowrap flex items-center gap-0.5"><Folder className="h-3 w-3" />{task.project.name}</span></Link>}
            {overdue && <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded shrink-0">{t.overdue}</span>}
            {dueToday && <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded shrink-0">{t.dueToday}</span>}
            {dueTomorrow && <span className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded shrink-0">{t.dueTomorrow}</span>}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500 font-normal">
            <span>{task.actualFinishDate ? `Actual: ${format(new Date(task.actualFinishDate), 'yyyy/MM/dd')}` : `Finish: ${format(new Date(task.endDate), 'yyyy/MM/dd')}`}</span>
            <span>|</span>
            <span>Dur: {task.duration}Days</span>
            <span>|</span>
            <div className="w-28 shrink-0">
              <span className="text-gray-700 dark:text-gray-200">Progress: {formatProgress(currentProgress)}</span>
            </div>
            {(task.status !== 'DONE' || currentProgress === 100) && (
              <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${currentProgress}%`,
                    background: progressColor,
                  }}
                />
              </div>
            )}
          </div>
          {showKeyPoints && task.keyPoints && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">{task.keyPoints}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0 mt-1.5">
          {(task.status !== 'DONE' || currentProgress === 100) && (
            <div className="relative">
              <button
                onClick={() => setShowProgressDropdown(!showProgressDropdown)}
                className="h-8 w-[72px] text-sm font-bold bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center gap-1 text-gray-700 dark:text-gray-200"
              >
                <span>{Math.round(currentProgress / 10) * 10}%</span>
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>
              {showProgressDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProgressDropdown(false)} />
                  <div className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[115px]">
                    {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(p => (
                      <button
                        key={p}
                        onClick={() => { updateProgress(p); setShowProgressDropdown(false) }}
                        className={`w-full px-3 py-2 text-xs text-left hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-between ${
                          Math.round(currentProgress) === p ? 'bg-blue-100 text-gray-700 dark:text-gray-200 font-bold' : 'text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        <span>{p}%</span>
                        {Math.round(currentProgress) === p && <Check className="h-3 w-3 text-gray-700 dark:text-gray-200" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          <Button size="icon" className="h-8 w-8 bg-gray-200 dark:bg-gray-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded-lg" onClick={toggleFavorite}>
            <span title={favorited ? t.unfavoriteTitle : t.favoriteTitle}>
              {favorited ? <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> : <Star className="h-4 w-4 text-yellow-500" />}
            </span>
          </Button>
          <Button size="icon" className="h-8 w-8 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg" onClick={duplicateTask}>
            <span title={t.duplicateTitle}>
              <Copy className="h-4 w-4" />
            </span>
          </Button>
          <InlineEditTask task={task} onDone={() => {}} />
          <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect?.(task.id)}
              className="w-4 h-4 rounded border-gray-300 text-gray-700 dark:text-gray-200 focus:ring-blue-500 cursor-pointer"
            />
          </div>
          {task.status === 'DONE' && currentProgress !== 100 ? (
            <Button size="sm" variant="ghost" className="h-8 px-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30" onClick={reopenTask}>
              <span title={t.reopenTitle}>
                <RotateCcw className="h-4 w-4" />
              </span>
            </Button>
          ) : null}
          {showDelete && (
            <Button size="icon" className="h-8 w-8 bg-gray-200 dark:bg-gray-700 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg" onClick={deleteTask}>
              <span title={t.deleteTooltip}>
                <Trash2 className="h-4 w-4" />
              </span>
            </Button>
          )}
          {showExpand && (
            <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg text-gray-300 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
              <span title={expanded ? compactT.collapseTitle : compactT.expandTitle}>
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </span>
            </button>
          )}
        </div>
      </div>

      {expanded && showKeyPoints && (
        <div className="px-4 pb-4 pt-0 space-y-3 border-t border-gray-100 dark:border-gray-700">
          {task.keyPoints && (
            <div>
              <p className="text-xs text-gray-400 mb-1">{t.keyPoints}</p>
              <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{task.keyPoints}</p>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <Select value={displayStatus === 'OVERDUE' ? task.status : displayStatus} onValueChange={updateStatus}>
              <SelectTrigger className="h-8 text-xs w-36 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">{statusT.TODO.label}</SelectItem>
                <SelectItem value="IN_PROGRESS">{statusT.IN_PROGRESS.label}</SelectItem>
                <SelectItem value="DONE">{statusT.DONE.label}</SelectItem>
              </SelectContent>
            </Select>
            <InlineEditTask task={task} onDone={() => setExpanded(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

interface FieldErrors {
  name?: string
  startDate?: string
  endDate?: string
  duration?: string
}

function InlineEditTask({ task, onDone, compact = false }: { task: Task; onDone: () => void; compact?: boolean }) {
  const { lang } = useApp()
  const t = cardLabels[lang]
  const actionT = actionLabels[lang]
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [form, setForm] = useState({
    name: task.name,
    startDate: format(new Date(task.startDate), 'yyyy-MM-dd'),
    endDate: format(new Date(task.endDate), 'yyyy-MM-dd'),
    duration: String(task.duration),
    includeWeekend: task.includeWeekend,
    keyPoints: task.keyPoints ?? '',
    status: task.status,
    projectId: task.projectId || task.project?.id || '',
    progress: task.progress,
  })

  useEffect(() => {
    if (open) {
      fetch('/api/projects')
        .then(res => res.json())
        .then(data => setProjects(data.map((p: any) => ({ id: p.id, name: p.name }))))
        .catch(console.error)
    }
  }, [open])

  function openDialog() {
    setForm({
      name: task.name,
      startDate: format(new Date(task.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(task.endDate), 'yyyy-MM-dd'),
      duration: String(task.duration),
      includeWeekend: task.includeWeekend,
      keyPoints: task.keyPoints ?? '',
      status: task.status,
      projectId: task.projectId || task.project?.id || '',
      progress: task.progress,
    })
    setErrors({})
    setOpen(true)
  }

  function validate(): boolean {
    const newErrors: FieldErrors = {}
    if (!form.name.trim()) newErrors.name = lang === 'zh' ? '请填写任务名称' : 'Task name is required'
    if (!form.startDate) newErrors.startDate = lang === 'zh' ? '请选择开始日期' : 'Start date is required'
    if (!form.endDate) newErrors.endDate = lang === 'zh' ? '请选择完成日期' : 'End date is required'
    if (!form.duration || Number(form.duration) <= 0) newErrors.duration = lang === 'zh' ? '请填写工期' : 'Duration is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!validate()) {
      toast.error(lang === 'zh' ? '请完善必填信息' : 'Please fill in required fields')
      return
    }
    setLoading(true)
    fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        duration: Number(form.duration),
        includeWeekend: form.includeWeekend,
        keyPoints: form.keyPoints || null,
        status: form.status,
        projectId: form.projectId,
        progress: form.progress,
      }),
    })
      .then(() => {
        setOpen(false)
        onDone()
        router.refresh()
      })
      .catch(() => {
        toast.error(actionT.saveFailed)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className={`${compact ? 'h-7 w-7' : 'h-8 w-8'} bg-gray-200 dark:bg-gray-700 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg`} onClick={openDialog} title={t.editTooltip}>
          <Pencil className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md dark:bg-gray-800">
        <DialogHeader>
          <div className="flex items-center gap-3 px-1 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md shadow-blue-200 dark:shadow-blue-900/50">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {t.editTitle}
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5">{lang === 'zh' ? '带 * 为必填项' : '* Required fields'}</p>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              {t.nameLabel}
              <span className="text-red-500 text-xs">*</span>
            </label>
            <Input
              value={form.name}
              onChange={e => { setForm(f => ({ ...f, name: e.target.value })); if (errors.name) setErrors(er => ({ ...er, name: undefined })) }}
              className={`${errors.name ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'} focus:ring-2 transition-all`}
              placeholder={lang === 'zh' ? '输入任务名称' : 'Enter task name'}
            />
            {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <Folder className="h-3.5 w-3.5 text-purple-500" />
              {lang === 'zh' ? '所属项目' : 'Project'}
            </label>
            <Select value={form.projectId} onValueChange={v => setForm(f => ({ ...f, projectId: v }))}>
              <SelectTrigger className="border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-blue-400 focus:ring-blue-100">
                <SelectValue placeholder={lang === 'zh' ? '选择项目' : 'Select project'} />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                {t.startDateLabel}
                <span className="text-red-500 text-xs">*</span>
              </label>
              <Input type="date" value={form.startDate}
                onChange={e => { setForm(f => ({ ...f, startDate: e.target.value })); if (errors.startDate) setErrors(er => ({ ...er, startDate: undefined })) }}
                className={`${errors.startDate ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'} focus:ring-2 transition-all`}
              />
              {errors.startDate && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.startDate}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-green-500" />
                {t.endDateLabel}
                <span className="text-red-500 text-xs">*</span>
              </label>
              <Input type="date" value={form.endDate}
                onChange={e => { setForm(f => ({ ...f, endDate: e.target.value })); if (errors.endDate) setErrors(er => ({ ...er, endDate: undefined })) }}
                className={`${errors.endDate ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'} focus:ring-2 transition-all`}
              />
              {errors.endDate && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.endDate}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                {t.durationLabel}
                <span className="text-red-500 text-xs">*</span>
              </label>
              <Input type="number" min="1" value={form.duration}
                onChange={e => { setForm(f => ({ ...f, duration: e.target.value })); if (errors.duration) setErrors(er => ({ ...er, duration: undefined })) }}
                className={`${errors.duration ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'} focus:ring-2 transition-all`}
              />
              {errors.duration && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.duration}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                {lang === 'zh' ? '当前进度' : 'Progress'}
              </label>
              <Select value={String(form.progress)} onValueChange={v => setForm(f => ({ ...f, progress: Number(v) }))}>
                <SelectTrigger className="border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-blue-400 focus:ring-blue-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(p => (
                    <SelectItem key={p} value={String(p)}>{p}%</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-orange-400" />
              {t.keyPointsLabel}
            </label>
            <Textarea value={form.keyPoints}
              onChange={e => setForm(f => ({ ...f, keyPoints: e.target.value }))}
              className="border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              rows={3}
              placeholder={lang === 'zh' ? '输入重点关注...' : 'Enter key points...'}
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200">{t.cancel}</Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-200 dark:shadow-blue-900/50 font-medium">{loading ? t.saving : t.save}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function InlineEditTaskName({ task }: { task: Task }) {
  const { lang } = useApp()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(task.name)
  const [loading, setLoading] = useState(false)

  function startEdit(e: React.MouseEvent) {
    e.stopPropagation()
    setName(task.name)
    setEditing(true)
    setTimeout(() => {
      const input = document.getElementById(`task-name-${task.id}`) as HTMLInputElement
      input?.focus()
      input?.select()
    }, 0)
  }

  function stopEdit() {
    setEditing(false)
  }

  async function saveEdit() {
    if (!name.trim() || name.trim() === task.name) {
      stopEdit()
      return
    }
    setLoading(true)
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      stopEdit()
    } catch {
      toast.error(lang === 'zh' ? '保存失败' : 'Save failed')
      setName(task.name)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      stopEdit()
    }
  }

  return (
    <>
      <span
        id={`task-name-display-${task.id}`}
        onClick={startEdit}
        className={`font-semibold text-sm truncate cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-gray-700 dark:hover:text-gray-200 dark:text-gray-200 px-1 py-0.5 rounded transition-colors ${editing ? 'hidden' : ''}`}
      >
        {name}
      </span>
      {editing && (
        <input
          id={`task-name-${task.id}`}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={handleKeyDown}
          onClick={e => e.stopPropagation()}
          disabled={loading}
          className="flex-1 min-w-0 h-6 px-1.5 py-0.5 text-sm font-semibold border border-blue-400 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
          style={{ maxWidth: '200px' }}
        />
      )}
    </>
  )
}
