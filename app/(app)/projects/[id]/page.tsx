import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import TaskCard from '@/components/TaskCard'
import CreateTaskDialog from '@/components/CreateTaskDialog'
import TaskListSection from '@/components/TaskListSection'
import EditProjectDialog from '@/components/EditProjectDialog'
import DeleteProjectButton from '@/components/DeleteProjectButton'
import ImportExportButtons from '@/components/ImportExportButtons'
import CopyProjectButton from '@/components/CopyProjectButton'
import { ArrowLeft, Plus, User, ExternalLink, Image as ImageIcon, Edit2 } from 'lucide-react'
import { isTaskOverdue } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'

const labels = {
  zh: {
    backToList: '项目列表',
    projectDetail: '项目明细',
    overdue: '个逾期',
    allComplete: '全部完成 ✓',
    start: '开始',
    completion: '完成',
    duration: '工期',
    days: '天',
    addTask: '添加任务',
    noTasks: '还没有任务，点击「添加任务」开始',
    taskList: '任务列表',
    totalTasks: '共 {total} 条任务',
    completed: '条已完成',
    overdueTasks: '条逾期',
    overallProgress: '整体进度',
    plannedCompletion: '计划完成',
    currentProgress: '当前进度',
    finish: '完成',
  },
  en: {
    backToList: 'Projects',
    projectDetail: 'Project Detail',
    overdue: ' overdue',
    allComplete: 'All Complete ✓',
    start: 'Start',
    completion: 'Finish',
    duration: 'Duration',
    days: ' days',
    addTask: 'Add Task',
    noTasks: 'No tasks yet. Click "Add Task" to start.',
    taskList: 'Task List',
    totalTasks: '{total} tasks total',
    completed: ' completed',
    overdueTasks: ' overdue',
    overallProgress: 'Overall Progress',
    plannedCompletion: 'Planned',
    currentProgress: 'Progress',
    finish: 'Finish',
  },
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const lang = (cookieStore.get('lang')?.value as 'zh' | 'en') || 'en'
  const t = labels[lang]

  const project = await prisma.project.findUnique({
    where: { id },
    include: { tasks: { orderBy: { plannedEndDate: 'asc' } } },
  })
  if (!project) notFound()

  const done = project.tasks.filter(t => t.status === 'DONE').length
  const total = project.tasks.length
  const overdueCnt = project.tasks.filter(t => t.status !== 'DONE' && isTaskOverdue(new Date(t.plannedEndDate))).length
  // 项目总进度：直接使用数据库存储值（该值在任务更新时自动计算并保存）
  const pct = project.progress

  // Header style based on project status
  const headerStyle = overdueCnt > 0
    ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:bg-gradient-to-br dark:from-red-950/40 dark:to-red-900/20 dark:border-red-800/50'
    : pct === 100
    ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:bg-gradient-to-br dark:from-green-950/40 dark:to-green-900/20 dark:border-green-800/50'
    : pct === 0
    ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:bg-gradient-to-br dark:from-green-950/40 dark:to-green-900/20 dark:border-green-800/50'
    : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:bg-gradient-to-br dark:from-blue-950/40 dark:to-blue-900/20 dark:border-blue-800/50'

  const serializedTasks = project.tasks.map(t => ({
    id: t.id,
    name: t.name,
    startDate: t.plannedStartDate.toISOString(),
    endDate: t.plannedEndDate.toISOString(),
    actualFinishDate: t.actualFinishDate?.toISOString() ?? null,
    duration: t.duration,
    includeWeekend: t.includeWeekend,
    keyPoints: t.keyPoints,
    status: t.status,
    progress: t.progress,
    favorite: t.favorite,
    project: { id: project.id, name: project.name },
  }))

  return (
    <div className="p-4 md:p-6 max-w-6xl xl:max-w-7xl 2xl:max-w-8xl mx-auto space-y-5">
      {/* 顶部导航 */}
      <div className="flex items-center gap-2">
        <Link href="/projects" className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <ArrowLeft className="h-4 w-4" />{t.backToList}
        </Link>
        <span className="text-gray-400 dark:text-gray-600">/</span>
        <span className="text-sm text-gray-400 dark:text-gray-500">{t.projectDetail}</span>
      </div>

      {/* 项目头 */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${headerStyle}`}>
        {/* 顶部彩色条 */}
        <div className="h-1.5" style={{
          background: overdueCnt > 0
            ? 'linear-gradient(90deg, #ef4444, #f87171)'
            : pct === 100
            ? 'linear-gradient(90deg, #22c55e, #4ade80)'
            : pct === 0
            ? 'linear-gradient(90deg, #16a34a, #22c55e)'
            : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
        }} />

        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.name}</h1>
                {project.fullName && (
                  <span className="text-lg text-gray-400 dark:text-gray-500">- {project.fullName}</span>
                )}
                {overdueCnt > 0 && <Badge variant="destructive">{overdueCnt} {t.overdue}</Badge>}
                {pct === 100 && total > 0 && <Badge className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">{t.allComplete}</Badge>}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                {project.owner && (
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <User className="h-4 w-4" />{project.owner}
                  </span>
                )}
                <span>{t.start}：{format(new Date(project.plannedStartDate), 'yyyy/MM/dd')}</span>
                {project.completionTime && (
                  <span>{t.finish}：{format(new Date(project.completionTime), 'yyyy/MM/dd')}</span>
                )}
                <span>{t.duration}：{project.duration} {t.days}</span>
                {project.link && project.link !== 'undefined' && project.link !== 'null' && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">
                    <ExternalLink className="h-4 w-4" />{project.link}
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <CopyProjectButton project={{
                id: project.id,
                name: project.name,
                shortName: project.shortName ?? null,
                fullName: project.fullName ?? null,
                plannedStartDate: project.plannedStartDate.toISOString(),
                duration: project.duration,
                description: project.description,
                owner: project.owner,
                link: project.link ?? null,
                image: project.image ?? null,
                completionTime: project.completionTime?.toISOString() ?? null,
              }} />
              <EditProjectDialog project={{
                id: project.id,
                name: project.name,
                shortName: project.shortName ?? null,
                fullName: project.fullName ?? null,
                plannedStartDate: project.plannedStartDate.toISOString(),
                duration: project.duration,
                description: project.description,
                owner: project.owner,
                link: project.link ?? null,
                image: project.image ?? null,
                completionTime: project.completionTime?.toISOString() ?? null,
              }} />
              <DeleteProjectButton id={project.id} name={project.name} />
            </div>
          </div>

          {/* 项目图片 */}
          {project.image && project.image !== 'undefined' && project.image !== 'null' && (
            <div className="mb-3">
              <img src={project.image} alt={project.name} className="h-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
            </div>
          )}

          {/* 进度条 */}
          {total > 0 && (
            <div className="flex items-center gap-2 text-xs whitespace-nowrap">
              <span className="text-gray-500 dark:text-gray-400 shrink-0">{t.overallProgress}</span>
              <span className="shrink-0 font-bold text-gray-700 dark:text-gray-200">{pct.toFixed(2)}%</span>
              <div className="h-2.5 flex-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: overdueCnt > 0
                      ? 'linear-gradient(90deg, #dc2626, #ef4444)'
                      : pct === 100
                      ? '#16a34a'
                      : 'linear-gradient(90deg, #1d4ed8, #2563eb)',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 任务列表 */}
      <TaskListSection tasks={serializedTasks} />
    </div>
  )
}
