import Link from 'next/link'
import { format } from 'date-fns'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import CreateProjectDialog from '@/components/CreateProjectDialog'
import EditProjectDialog from '@/components/EditProjectDialog'
import DeleteProjectButton from '@/components/DeleteProjectButton'
import CopyProjectButton from '@/components/CopyProjectButton'
import { FolderOpen, User, ExternalLink, Eye } from 'lucide-react'
import { isTaskOverdue } from '@/lib/date-utils'
import ProjectFilterSelect from '@/components/ProjectFilterSelect'

export const dynamic = 'force-dynamic'

const labels = {
  zh: {
    title: '项目列表',
    projectCount: '（{count}个项目）',
    noProjects: '还没有项目',
    noProjectsHint: '点击右上角「新建项目」开始',
    inProgress: '进行中',
    all: '全部',
    start: '开始',
    duration: '工期',
    days: '天',
    completion: '计划完成',
    tasks: '任务',
    link: '链接',
    tasksOverdue: '项任务逾期',
    completed: '% 完成',
    progress: '进度',
    totalProgress: '总体进度',
  },
  en: {
    title: 'Project List',
    projectCount: '({count} projects)',
    noProjects: 'No projects yet',
    noProjectsHint: 'Click "New Project" to get started',
    inProgress: 'In Progress',
    all: 'All',
    start: 'Start',
    duration: 'Duration',
    days: 'days',
    completion: 'Plan Finish',
    tasks: 'tasks',
    link: 'Link',
    tasksOverdue: 'tasks overdue',
    completed: '% done',
    progress: 'Progress',
    totalProgress: 'Progress',
  },
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('lang')?.value as 'zh' | 'en') || 'en'
  const t = labels[lang]

  const { filter: filterParam = 'all' } = await searchParams
  const showAll = filterParam === 'all'
  const showInProgress = filterParam === 'in_progress'

  const projects = await prisma.project.findMany({
    include: { tasks: { select: { status: true, plannedEndDate: true } } },
    orderBy: { completionTime: 'desc' },
  })

  const filteredProjects = showAll
    ? [...projects].sort((a, b) => {
        // 获取项目的最近截止日期
        const aEndDates = a.tasks.map(t => new Date(t.plannedEndDate).getTime())
        const bEndDates = b.tasks.map(t => new Date(t.plannedEndDate).getTime())
        const aNearest = aEndDates.length > 0 ? Math.min(...aEndDates) : Infinity
        const bNearest = bEndDates.length > 0 ? Math.min(...bEndDates) : Infinity
        return aNearest - bNearest
      })
    : showInProgress
    ? projects.filter(p => {
        const done = p.tasks.filter(t => t.status === 'DONE').length
        const total = p.tasks.length
        const hasOverdue = p.tasks.some(t =>
          t.status !== 'DONE' && isTaskOverdue(new Date(t.plannedEndDate))
        )
        return (total > 0 && done > 0 && done < total) || hasOverdue
      })
    : projects.filter(p => {
        // 未开始：进度为0或任务数为0
        const total = p.tasks.length
        return total === 0 || p.progress === 0
      })

  return (
    <div className="p-4 md:p-6 max-w-6xl xl:max-w-7xl 2xl:max-w-8xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h1>
          <span className="text-sm text-gray-400 dark:text-gray-500">（{filteredProjects.length}{lang === 'zh' ? '个项目' : ' projects'})</span>
        </div>
        <div className="flex items-center gap-3">
          <ProjectFilterSelect currentFilter={filterParam} />
          <CreateProjectDialog />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">{t.noProjects}</p>
          <p className="text-sm mt-1">{t.noProjectsHint}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project, idx) => {
            const done = project.tasks.filter(t => t.status === 'DONE').length
            const total = project.tasks.length
            const overdueCnt = project.tasks.filter(t =>
              t.status !== 'DONE' && isTaskOverdue(new Date(t.plannedEndDate))
            ).length
            // 项目总进度：直接使用数据库存储值
            const pct = project.progress
            const bgColors = ['bg-white dark:bg-gray-800', 'bg-slate-50/70 dark:bg-gray-700/50', 'bg-white dark:bg-gray-800']
            const bg = bgColors[idx % bgColors.length]

            const getProgressColor = () => {
              if (overdueCnt > 0) return '#dc2626'
              if (pct === 100) return '#374151'
              if (pct === 0) return '#16a34a'
              return '#2563eb'
            }
            const getRemainingColor = () => {
              if (overdueCnt > 0) return '#fca5a5'
              if (pct === 100) return '#374151'
              if (pct === 0) return '#d1d5db'
              return '#93c5fd'
            }

            return (
              <Card key={project.id} className={`${bg} transition-all duration-200 border-gray-200 dark:border-gray-700 overflow-hidden`} style={{ boxShadow: `0 4px 24px ${getProgressColor()}20` }}>
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div className="w-2 shrink-0" style={{ background: getProgressColor() }} />
                    <div className="flex-1 min-w-0 px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Link href={`/projects/${project.id}`} className="font-bold text-base text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              {project.name}
                            </Link>
                            {project.fullName && (
                              <span className="text-sm text-gray-400 dark:text-gray-500">- {project.fullName}</span>
                            )}
                            {overdueCnt > 0 && <Badge variant="destructive">{overdueCnt} {t.tasksOverdue}</Badge>}
                            {pct === 100 && total > 0 && <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{pct}{t.completed}</Badge>}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
                            {project.owner && (
                              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                <User className="h-3 w-3" />{project.owner}
                              </span>
                            )}
                            <span>{t.start}：{format(new Date(project.plannedStartDate), 'yyyy/M/d')}</span>
                            <span>{t.duration}：{project.duration}{t.days}</span>
                            {project.completionTime && (
                              <span>{t.completion}：{format(new Date(project.completionTime), 'yyyy/M/d')}</span>
                            )}
                            {project.link && project.link !== 'undefined' && project.link !== 'null' && (
                              <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400">
                                <ExternalLink className="h-3 w-3" />{t.link}
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Link href={`/projects/${project.id}`}>
                            <Button size="icon" className="h-9 w-9 bg-gray-200 dark:bg-gray-700 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg" title={lang === 'zh' ? '查看' : 'View'}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
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

                      <div className="mt-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500 shrink-0">{t.totalProgress} {pct}%</span>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex-1">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, background: getProgressColor() }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
