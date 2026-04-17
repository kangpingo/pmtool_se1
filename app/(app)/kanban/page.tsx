import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import KanbanClient from '@/components/KanbanClient'

export const dynamic = 'force-dynamic'

const labels = {
  zh: {
    title: '看板视图',
    totalTasks: '（全部 {count} 个任务）',
    incomplete: '{count} 个任务未完成',
  },
  en: {
    title: 'Kanban',
    totalTasks: '({count} tasks total)',
    incomplete: '{count} tasks incomplete',
  },
}

const allColumns = {
  zh: [
    { key: 'TODO',        label: '待开始', headerColor: 'bg-gray-200',  colColor: 'bg-gray-100' },
    { key: 'IN_PROGRESS', label: '进行中', headerColor: 'bg-blue-200',  colColor: 'bg-blue-100' },
    { key: 'OVERDUE',     label: '已逾期', headerColor: 'bg-red-200',   colColor: 'bg-red-100' },
    { key: 'DONE',        label: '已完成', headerColor: 'bg-green-200', colColor: 'bg-green-100' },
  ],
  en: [
    { key: 'TODO',        label: 'To Do', headerColor: 'bg-gray-200',  colColor: 'bg-gray-100' },
    { key: 'IN_PROGRESS', label: 'In Progress', headerColor: 'bg-blue-200',  colColor: 'bg-blue-100' },
    { key: 'OVERDUE',     label: 'Overdue', headerColor: 'bg-red-200',   colColor: 'bg-red-100' },
    { key: 'DONE',        label: 'Done', headerColor: 'bg-green-200', colColor: 'bg-green-100' },
  ],
}

export default async function KanbanPage() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('lang')?.value as 'zh' | 'en') || 'en'
  const t = labels[lang]

  const tasks = await prisma.task.findMany({
    include: { project: { select: { id: true, name: true } } },
    orderBy: { plannedEndDate: 'asc' },
  })

  const serialized = tasks.map(t => ({
    ...t,
    startDate: t.plannedStartDate.toISOString(),
    endDate: t.plannedEndDate.toISOString(),
    progress: t.progress,
  }))

  const incompleteCount = tasks.filter(t => t.status !== 'DONE').length

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <KanbanClient
        tasks={serialized}
        columnsConfig={allColumns[lang]}
        title={t.title}
        stats={lang === 'zh' ? `（全部 ${tasks.length} 个任务，${incompleteCount} 个任务未完成）` : `(${tasks.length} total, ${incompleteCount} incomplete)`}
      />
    </div>
  )
}
