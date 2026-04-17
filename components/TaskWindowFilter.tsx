'use client'
import { useRouter } from 'next/navigation'

const options = [
  { value: '1', label: '今天' },
  { value: '3', label: '近3天' },
  { value: '7', label: '近1周' },
]

export default function TaskWindowFilter({ current }: { current: string }) {
  const router = useRouter()
  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => router.push(`/tasks?window=${opt.value}`)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            current === opt.value
              ? 'bg-white shadow text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
