'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from './AppProvider'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const labels = {
  zh: {
    notStarted: '未开始',
    inProgress: '进行中',
    all: '全部项目',
  },
  en: {
    notStarted: 'Not Started',
    inProgress: 'In Progress',
    all: 'All Projects',
  },
}

const options = [
  { value: 'all', labelKey: 'all' as const },
  { value: 'not_started', labelKey: 'notStarted' as const },
  { value: 'in_progress', labelKey: 'inProgress' as const },
]

export default function ProjectFilterSelect({ currentFilter }: { currentFilter: string }) {
  const router = useRouter()
  const { lang } = useApp()
  const t = labels[lang]
  const [open, setOpen] = useState(false)

  function handleChange(value: string) {
    router.push(`/projects?filter=${value}`)
    setOpen(false)
  }

  const currentLabel = options.find(o => o.value === currentFilter)?.labelKey ?? 'all'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-3 pr-3 py-1.5 text-xs font-bold border border-blue-200 dark:border-blue-800 rounded-lg bg-gradient-to-r from-blue-50 dark:from-blue-900/30 to-white dark:to-gray-800 hover:from-blue-100 dark:hover:from-blue-900/50 hover:to-blue-50 dark:hover:to-gray-700 hover:border-blue-300 dark:hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all cursor-pointer h-8 whitespace-nowrap text-blue-600 dark:text-blue-400"
      >
        <span>{t[currentLabel]}</span>
        <ChevronDown className={cn('h-4 w-4 text-blue-400 dark:text-blue-500 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[70]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-[80] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px] overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange(opt.value)}
                className={cn(
                  'w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors',
                  currentFilter === opt.value
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                <span>{t[opt.labelKey]}</span>
                {currentFilter === opt.value && <Check className="h-3 w-3" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
