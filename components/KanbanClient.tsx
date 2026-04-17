'use client'
import { useState } from 'react'
import KanbanBoard from './KanbanBoard'

interface ColumnConfig {
  key: string
  label: string
  headerColor: string
  colColor: string
}

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

export default function KanbanClient({ tasks, columnsConfig, title, stats }: {
  tasks: Task[]; columnsConfig: ColumnConfig[]; title: string; stats: string
}) {
  const [visibleStatuses, setVisibleStatuses] = useState<string[]>(['TODO', 'IN_PROGRESS', 'OVERDUE'])

  function toggleStatus(status: string) {
    setVisibleStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          <span className="text-sm text-gray-400 dark:text-gray-500">{stats}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {columnsConfig.map(col => {
            const isActive = visibleStatuses.includes(col.key)
            return (
              <button
                key={col.key}
                onClick={() => toggleStatus(col.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  isActive
                    ? col.key === 'TODO'
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
                      : col.key === 'IN_PROGRESS'
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600'
                      : col.key === 'OVERDUE'
                      ? 'bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-400 dark:border-red-600'
                      : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600'
                    : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {col.label}
              </button>
            )
          })}
        </div>
      </div>
      <KanbanBoard tasks={tasks} visibleStatuses={visibleStatuses} />
    </>
  )
}
