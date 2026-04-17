'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpDown, ArrowUp, ArrowDown, Check } from 'lucide-react'
import { isTaskOverdue } from '@/lib/date-utils'

interface Task {
  id: string
  name: string
  startDate: string
  endDate: string
  status: string
  progress: number
  duration: number
  includeWeekend: boolean
  keyPoints: string | null
  favorite: boolean
  actualFinishDate?: string | null
  createdAt?: string
  project?: { id: string; name: string }
  projectId?: string
}

const labels = {
  zh: {
    sortBy: '排序',
    byStartDate: '按开始时间',
    byEndDate: '按完成时间',
    byProgress: '按进度状态',
  },
  en: {
    sortBy: 'Sort',
    byStartDate: 'By Start Date',
    byEndDate: 'By End Date',
    byProgress: 'By Progress',
  },
}

function sortByProgress(tasks: Task[]): Task[] {
  const now = new Date()
  const sorted = [...tasks].sort((a, b) => {
    // 100%完成的放最后，按时间先后排序
    if (a.progress === 100 && b.progress !== 100) return 1
    if (a.progress !== 100 && b.progress === 100) return -1
    if (a.progress === 100 && b.progress === 100) {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    }
    // 都是未完成的
    const aOverdue = isTaskOverdue(new Date(a.endDate))
    const bOverdue = isTaskOverdue(new Date(b.endDate))
    // 逾期未完成的放最前面，逾期最久的置顶
    if (aOverdue && bOverdue) {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    }
    if (aOverdue && !bOverdue) return -1
    if (!aOverdue && bOverdue) return 1
    // 正常未完成的任务在中间，按时间由近到远排序
    return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
  })
  return sorted
}

function sortByStartDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const startDiff = new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    if (startDiff !== 0) return startDiff
    // 开始时间相同，按完成时间由近到远
    const endDiff = new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    if (endDiff !== 0) return endDiff
    // 开始和完成时间都相同，按创建时间
    const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return aCreated - bCreated
  })
}

function sortByEndDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const endDiff = new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    if (endDiff !== 0) return endDiff
    // 完成时间相同，按开始时间由近到远
    const startDiff = new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    if (startDiff !== 0) return startDiff
    // 开始和完成时间都相同，按创建时间
    const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return aCreated - bCreated
  })
}

export default function TaskSortSelect({ tasks }: { tasks: Task[] }) {
  const router = useRouter()
  const [sortOrder, setSortOrder] = useState<'progress' | 'startDate' | 'endDate'>('progress')
  const [open, setOpen] = useState(false)

  const sortedTasks = sortOrder === 'progress'
    ? sortByProgress(tasks)
    : sortOrder === 'startDate'
    ? sortByStartDate(tasks)
    : sortByEndDate(tasks)

  const options = [
    { value: 'progress', label: labels.zh.byProgress, icon: ArrowUpDown },
    { value: 'startDate', label: labels.zh.byStartDate, icon: ArrowUp },
    { value: 'endDate', label: labels.zh.byEndDate, icon: ArrowDown },
  ] as const

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
        <span>{options.find(o => o.value === sortOrder)?.label}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[70]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-[80] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[140px]">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  setSortOrder(opt.value)
                  setOpen(false)
                  router.refresh()
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  sortOrder === opt.value ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <opt.icon className="h-3.5 w-3.5" />
                <span className="flex-1 text-left">{opt.label}</span>
                {sortOrder === opt.value && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export { sortByProgress, sortByStartDate, sortByEndDate }
