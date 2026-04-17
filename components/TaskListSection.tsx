'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import TaskCard from './TaskCard'
import { sortByProgress, sortByStartDate, sortByEndDate } from './TaskSortSelect'
import { isTaskOverdue } from '@/lib/date-utils'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CreateTaskDialog from './CreateTaskDialog'
import ImportExportButtons from './ImportExportButtons'
import { useApp } from './AppProvider'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface Task {
  id: string
  name: string
  startDate: string
  endDate: string
  status: string
  progress: number
  favorite: boolean
  keyPoints: string | null
  duration: number
  includeWeekend: boolean
  project?: { id: string; name: string }
}

const labels = {
  zh: {
    taskList: '任务列表',
    total: '共 {total} 条任务',
    completed: '已完成',
    overdue: '逾期',
    addTask: '添加任务',
    batchDelete: '批量删除',
    confirmDelete: '确认删除',
    confirmMessage: '确定删除选中的任务？',
    deleteWarning: '删除后不可撤销。',
    cancel: '取消',
    deleteBtn: '确认删除',
    deleteSuccess: '已删除 {count} 个任务',
    deleteFailed: '删除失败',
    selectAll: '全选',
    deselectAll: '取消全选',
  },
  en: {
    taskList: 'Task List',
    total: '{total} tasks',
    completed: 'Completed',
    overdue: 'Overdue',
    addTask: 'Add Task',
    batchDelete: '批量删除',
    confirmDelete: '确认删除',
    confirmMessage: '确定删除选中的任务？',
    deleteWarning: '删除后不可撤销。',
    cancel: '取消',
    deleteBtn: '确认删除',
    deleteSuccess: '已删除 {count} 个任务',
    deleteFailed: '删除失败',
    selectAll: '全选',
    deselectAll: '取消全选',
  },
}

const sortOptions = {
  zh: [
    { value: 'status' as const, label: '按完成状态', icon: ArrowUpDown },
    { value: 'startDate' as const, label: '按开始时间', icon: ArrowUp },
    { value: 'endDate' as const, label: '按完成时间', icon: ArrowDown },
  ],
  en: [
    { value: 'status' as const, label: 'By Status', icon: ArrowUpDown },
    { value: 'startDate' as const, label: 'By Start Date', icon: ArrowUp },
    { value: 'endDate' as const, label: 'By End Date', icon: ArrowDown },
  ],
}

export default function TaskListSection({ tasks }: { tasks: Task[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sortOrder, setSortOrder] = useState<'status' | 'startDate' | 'endDate'>('status')
  const [open, setOpen] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { lang } = useApp()
  const t = labels[lang]
  const options = sortOptions[lang]

  // Get highlighted task ID from URL
  const highlightedId = searchParams.get('highlight')

  const sortedTasks = sortOrder === 'status'
    ? sortByProgress(tasks)
    : sortOrder === 'startDate'
    ? sortByStartDate(tasks)
    : sortByEndDate(tasks)

  const done = tasks.filter(t => t.status === 'DONE').length
  const total = tasks.length
  const overdueCnt = tasks.filter(t => t.status !== 'DONE' && isTaskOverdue(new Date(t.endDate))).length

  // Get projectId from first task
  const projectId = tasks[0]?.project?.id || ''
  const projectName = tasks[0]?.project?.name || ''

  function toggleSelect(taskId: string) {
    const newSet = new Set(selectedTasks)
    if (newSet.has(taskId)) {
      newSet.delete(taskId)
    } else {
      newSet.add(taskId)
    }
    setSelectedTasks(newSet)
  }

  function toggleSelectAll() {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set())
    } else {
      setSelectedTasks(new Set(tasks.map(t => t.id)))
    }
  }

  async function handleBatchDelete() {
    if (selectedTasks.size === 0) return
    try {
      await Promise.all(
        Array.from(selectedTasks).map(id =>
          fetch(`/api/tasks/${id}`, { method: 'DELETE' })
        )
      )
      toast.success(t.deleteSuccess.replace('{count}', String(selectedTasks.size)))
      setSelectedTasks(new Set())
      setDeleteOpen(false)
      router.refresh()
    } catch {
      toast.error(t.deleteFailed)
    }
  }

  return (
    <div className="space-y-2">
      {total === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Plus className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">{lang === 'zh' ? '还没有任务' : 'No tasks yet'}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">{lang === 'zh' ? '点击下方按钮添加第一个任务' : 'Click the button below to add your first task'}</p>
            <CreateTaskDialog
              projectId={projectId}
              projectName={projectName}
              trigger={
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/50 mt-2 text-white">
                  <Plus className="h-4 w-4 mr-1" />
                  {t.addTask}
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <>
          {/* 任务统计 */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{t.taskList}</span>
              <span className="text-gray-600 dark:text-gray-400">{lang === 'zh' ? `共 ${total} 条任务` : t.total.replace('{total}', String(total))}</span>
              {done > 0 && <span className="text-green-600 dark:text-green-400">{done} {t.completed}</span>}
              {overdueCnt > 0 && <span className="text-red-500 dark:text-red-400">{overdueCnt} {t.overdue}</span>}
              {selectedTasks.size > 0 && (
                <span className="text-blue-600 dark:text-blue-400">{selectedTasks.size} 已选</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* 排序选择 */}
              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-1 px-2 py-1 h-7 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                >
                  <ArrowUpDown className="h-3 w-3" />
                  <span>{options.find(o => o.value === sortOrder)?.label}</span>
                </button>

                {open && (
                  <>
                    <div className="fixed inset-0 z-[70]" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-[80] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px]">
                      {options.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortOrder(opt.value)
                            setOpen(false)
                          }}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 text-[10px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            sortOrder === opt.value ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <opt.icon className="h-3 w-3" />
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 导入导出 */}
              <div className="flex items-center gap-1">
                <ImportExportButtons projectId={projectId} projectName={projectName} />
                <CreateTaskDialog
                  projectId={projectId}
                  projectName={projectName}
                  trigger={
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-7 px-2 py-1">
                      <Plus className="h-3 w-3" />
                    </Button>
                  }
                />
                {/* 批量删除按钮 */}
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-red-500 hover:bg-red-600 h-7 px-2 py-1">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                    <DialogContent className="max-w-sm dark:bg-gray-800">
                      <DialogHeader>
                        <div className="flex items-center gap-3 px-1 pb-3 border-b border-gray-100 dark:border-gray-700">
                          <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md shadow-red-200 dark:shadow-red-900/50">
                            <AlertTriangle className="h-5 w-5 text-white" />
                          </div>
                          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {t.confirmDelete}
                          </DialogTitle>
                        </div>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                          <p className="text-sm text-red-800 dark:text-red-200">
                            {t.confirmMessage}
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-2">{t.deleteWarning}</p>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setDeleteOpen(false)} className="border-gray-200 dark:border-gray-700">{t.cancel}</Button>
                          <Button variant="destructive" onClick={handleBatchDelete} className="bg-red-500 hover:bg-red-600">{t.deleteBtn}</Button>
                        </div>
                      </div>
                    </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          {sortedTasks.map((task, idx) => {
            const isOverdue = task.status !== 'DONE' && isTaskOverdue(new Date(task.endDate))
            const isComplete = task.progress === 100
            const circleStyle = isOverdue
              ? 'bg-red-500 text-white'
              : isComplete
              ? 'bg-gray-900 dark:bg-gray-600 text-white'
              : 'bg-blue-500 text-white'
            const isSelected = selectedTasks.has(task.id)
            return (
              <div key={task.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full ${circleStyle} flex items-center justify-center shrink-0 text-xs font-medium`}>{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <TaskCard
                    task={task}
                    showKeyPoints={false}
                    showExpand={false}
                    showProject={false}
                    showDelete={false}
                    selected={isSelected}
                    onToggleSelect={toggleSelect}
                    highlighted={task.id === highlightedId}
                  />
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
