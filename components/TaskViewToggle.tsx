'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Calendar, ChevronDown, AlertTriangle, Check, Plus, ChevronsDown, ChevronsUp } from 'lucide-react'
import { useApp } from './AppProvider'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import CreateTaskDialog from './CreateTaskDialog'

const windows = {
  zh: [
    { value: 'all', label: '全部' },
    { value: '1', label: '今天' },
    { value: '3', label: '3天内' },
    { value: '7', label: '1周内' },
    { value: '30', label: '1月内' },
    { value: '365', label: '1年内' },
  ],
  en: [
    { value: 'all', label: 'All' },
    { value: '1', label: 'Today' },
    { value: '3', label: '3 Days' },
    { value: '7', label: '1 Week' },
    { value: '30', label: '1 Month' },
    { value: '365', label: '1 Year' },
  ],
}

const groupByLabels = {
  zh: { time: '按时间', project: '按项目' },
  en: { time: 'By Time', project: 'By Project' },
}

const overdueLabel = {
  zh: '逾期',
  en: 'Overdue',
}

const completedLabel = {
  zh: '已完成',
  en: 'Done',
}

interface Props {
  currentGroupBy: string
  currentWindow: string
  currentFavorite?: string
  currentOverdue?: string
  currentCompleted?: string
  overdueCount?: number
  completedCount?: number
  onExpandAll?: () => void
  onCollapseAll?: () => void
  showExpandCollapse?: boolean
  onAddTask?: () => void
}

export default function TaskViewToggle({ currentGroupBy, currentWindow, currentFavorite, currentOverdue, currentCompleted, overdueCount = 0, completedCount = 0, onExpandAll, onCollapseAll, showExpandCollapse, onAddTask }: Props) {
  const router = useRouter()
  const { lang } = useApp()
  const showFavorites = currentFavorite === 'true'
  const showOverdue = currentOverdue === 'true'
  const showCompleted = currentCompleted === 'true'
  const winOpts = windows[lang]
  const gbLabels = groupByLabels[lang]
  const odLabel = overdueLabel[lang]
  const coLabel = completedLabel[lang]
  const [windowDropdownOpen, setWindowDropdownOpen] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)

  function handleAddTask() {
    if (onAddTask) {
      onAddTask()
    } else {
      setShowCreateTask(true)
    }
  }

  const currentWindowLabel = winOpts.find(w => w.value === currentWindow)?.label || winOpts[0].label

  function navigate(gb: string, win: string, fav?: string, od?: string, completed?: string) {
    const params = new URLSearchParams()
    params.set('groupby', gb)
    params.set('window', win)
    if (fav) params.set('favorite', fav)
    if (od) params.set('overdue', od)
    if (completed) params.set('completed', completed)
    router.push(`/tasks?${params.toString()}`)
  }

  function selectWindow(value: string) {
    setWindowDropdownOpen(false)
    navigate(currentGroupBy, value, showFavorites ? 'true' : undefined, showOverdue ? 'true' : undefined, showCompleted ? 'true' : undefined)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      {/* 已完成筛选按钮 */}
      <button
        onClick={() => navigate(currentGroupBy, currentWindow, showFavorites ? 'true' : undefined, showOverdue ? 'true' : undefined, showCompleted ? undefined : 'true')}
        className={cn(
          'px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all flex items-center gap-1',
          showCompleted
            ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
            : 'text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        )}
      >
        <Check className="h-3 w-3" />
        {coLabel}<span className="ml-1">({completedCount})</span>
      </button>

      {/* 逾期筛选按钮 */}
      <button
        onClick={() => navigate(currentGroupBy, currentWindow, showFavorites ? 'true' : undefined, showOverdue ? undefined : 'true', showCompleted ? 'true' : undefined)}
        className={cn(
          'px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all flex items-center gap-1',
          showOverdue
            ? 'bg-red-700 text-white border-red-700'
            : 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-400 dark:border-red-600 bg-white dark:bg-gray-800'
        )}
      >
        <AlertTriangle className="h-3 w-3" />
        {odLabel}{overdueCount > 0 && <span className="ml-1">({overdueCount})</span>}
      </button>

      {/* 时间窗口下拉 */}
      <div className="relative">
        <button
          onClick={() => setWindowDropdownOpen(!windowDropdownOpen)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all flex items-center gap-1.5',
            windowDropdownOpen
              ? 'bg-blue-700 text-white border-blue-700'
              : 'bg-blue-600 text-white hover:bg-blue-700 border-blue-700'
          )}
        >
          <Calendar className="h-3.5 w-3.5" />
          {currentWindowLabel}
          <ChevronDown className={cn('h-3 w-3 transition-transform', windowDropdownOpen && 'rotate-180')} />
        </button>
        {windowDropdownOpen && (
          <>
            <div className="fixed inset-0 z-[70]" onClick={() => setWindowDropdownOpen(false)} />
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[80] min-w-[120px] py-1">
              {winOpts.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => selectWindow(opt.value)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700',
                    currentWindow === opt.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-200'
                  )}
                >
                  {opt.label}
                  {currentWindow === opt.value && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 收藏筛选按钮 */}
      <button
        onClick={() => navigate(currentGroupBy, currentWindow, showFavorites ? undefined : 'true', showOverdue ? 'true' : undefined, showCompleted ? 'true' : undefined)}
        className={cn(
          'px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all flex items-center gap-1',
          showFavorites
            ? 'bg-yellow-500 text-white border-yellow-500'
            : 'text-yellow-500 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600 bg-white dark:bg-gray-800'
        )}
      >
        <Star className={cn('h-3 w-3', showFavorites ? 'fill-white' : '')} />
      </button>

      {/* 分组切换 */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <button
          onClick={() => navigate('time', currentWindow, showFavorites ? 'true' : undefined, showOverdue ? 'true' : undefined, showCompleted ? 'true' : undefined)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentGroupBy === 'time'
              ? 'bg-blue-500 text-white shadow'
              : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          {gbLabels.time}
        </button>
        <button
          onClick={() => navigate('project', currentWindow, showFavorites ? 'true' : undefined, showOverdue ? 'true' : undefined, showCompleted ? 'true' : undefined)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentGroupBy === 'project'
              ? 'bg-purple-500 text-white shadow'
              : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          {gbLabels.project}
        </button>
      </div>

      {/* 展开/折叠按钮 - 仅 By Project 模式显示 */}
      {showExpandCollapse && (
        <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
          <button
            onClick={onExpandAll}
            className="px-2.5 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors flex items-center gap-1"
          >
            <ChevronsDown className="h-3.5 w-3.5" />
            {lang === 'zh' ? '展开全部' : 'Expand All'}
          </button>
          <button
            onClick={onCollapseAll}
            className="px-2.5 py-1.5 text-xs font-medium text-white bg-gray-500 hover:bg-gray-600 transition-colors flex items-center gap-1 border-l border-gray-200 dark:border-gray-600"
          >
            <ChevronsUp className="h-3.5 w-3.5" />
            {lang === 'zh' ? '折叠全部' : 'Collapse All'}
          </button>
        </div>
      )}

      {/* 添加任务按钮 */}
      <Button
        onClick={handleAddTask}
        size="sm"
        className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white shadow gap-1.5 rounded-lg"
      >
        <Plus className="h-4 w-4" />
        <span className="text-xs font-bold">{lang === 'zh' ? '添加任务' : 'Add Task'}</span>
      </Button>

      {showCreateTask && <CreateTaskDialog open={showCreateTask} onClose={() => setShowCreateTask(false)} username="Calen" />}
    </div>
  )
}
