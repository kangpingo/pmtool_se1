import Link from 'next/link'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import CreateProjectDialog from '@/components/CreateProjectDialog'
import DueAlert from '@/components/DueAlert'
import { FolderOpen, ListTodo, AlertTriangle, Clock, ArrowRight, User } from 'lucide-react'
import { isTaskOverdue, isTaskDueToday, isTaskDueTomorrow } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'

const labels = {
  zh: {
    title: '总览',
    myProjects: '我的项目',
    allProjects: '全部项目',
    activeProjects: '进行中项目',
    activeTasks: '进行中任务',
    overdue: '已逾期',
    dueToday: '今天到期',
    dueTomorrow: '明天到期',
    noProjects: '暂无项目，点击「新建项目」开始',
    planFinish: '计划完成',
    tasks: '个任务',
    progress: '进度',
    overdueBadge: '逾期',
    dateFormat: 'yyyy年M月d日 EEEE',
  },
  en: {
    title: 'Overview',
    myProjects: 'My Projects',
    allProjects: 'All Projects',
    activeProjects: 'Active Projects',
    activeTasks: 'Active Tasks',
    overdue: 'Overdue',
    dueToday: 'Due Today',
    dueTomorrow: 'Due Tomorrow',
    noProjects: 'No projects yet. Click "New Project" to get started.',
    planFinish: 'Plan Finish',
    tasks: 'tasks',
    progress: 'Progress',
    overdueBadge: 'Overdue',
    dateFormat: 'MMMM d, yyyy',
  },
}

export default async function HomePage() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('lang')?.value as 'zh' | 'en') || 'en'
  const t = labels[lang]

  const projects = await prisma.project.findMany({
    include: { tasks: { orderBy: { plannedEndDate: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })

  const allTasks = projects.flatMap(p =>
    p.tasks.map(t => ({ ...t, projectName: p.name }))
  )
  const overdueCnt = allTasks.filter(t => t.status !== 'DONE' && isTaskOverdue(new Date(t.plannedEndDate))).length
  const dueTodayCnt = allTasks.filter(t => t.status !== 'DONE' && !isTaskOverdue(new Date(t.plannedEndDate)) && isTaskDueToday(new Date(t.plannedEndDate))).length
  const dueTomorrowCnt = allTasks.filter(t => t.status !== 'DONE' && !isTaskOverdue(new Date(t.plannedEndDate)) && isTaskDueTomorrow(new Date(t.plannedEndDate))).length
  const inProgressCnt = allTasks.filter(t => t.status === 'IN_PROGRESS').length

  return (
    <div className="p-4 md:p-6 max-w-6xl xl:max-w-7xl 2xl:max-w-8xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {format(new Date(), t.dateFormat, lang === 'zh' ? { locale: zhCN } : {})}
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {[
          { label: t.activeProjects, value: projects.length, icon: FolderOpen, iconBg: 'bg-blue-100 dark:bg-blue-900/50', iconColor: 'text-blue-600 dark:text-blue-400', highlight: false, href: '/projects', textDark: false },
          { label: t.activeTasks, value: inProgressCnt, icon: ListTodo, iconBg: 'bg-purple-100 dark:bg-purple-900/50', iconColor: 'text-purple-600 dark:text-purple-400', highlight: false, href: '/tasks', textDark: false },
          { label: t.overdue, value: overdueCnt, icon: AlertTriangle, iconBg: 'bg-red-100 dark:bg-red-900/50', iconColor: 'text-red-600 dark:text-red-400', highlight: overdueCnt > 0, href: '/tasks?overdue=true', textDark: true },
          { label: t.dueToday, value: dueTodayCnt, icon: Clock, iconBg: 'bg-orange-100 dark:bg-orange-900/50', iconColor: 'text-orange-600 dark:text-orange-400', highlight: dueTodayCnt > 0, href: '/tasks?window=3', textDark: true },
          { label: t.dueTomorrow, value: dueTomorrowCnt, icon: Clock, iconBg: 'bg-yellow-100 dark:bg-yellow-900/50', iconColor: 'text-yellow-600 dark:text-yellow-400', highlight: dueTomorrowCnt > 0, href: '/tasks?filter=tomorrow', textDark: true },
        ].map(({ label, value, icon: Icon, iconBg, iconColor, highlight, href }) => (
          <Link key={label} href={href}>
            <Card className={`cursor-pointer hover:shadow-lg transition-all rounded-2xl ${iconBg}`}>
              <CardContent className={`py-4 px-4`}>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-white/50 dark:bg-gray-800/50`}>
                    <Icon className={`h-8 w-8 ${iconColor}`} />
                  </div>
                  <div>
                    <p className={`text-3xl font-bold ${highlight ? (label === t.overdue ? 'text-red-600 dark:text-red-300' : label === t.dueToday ? 'text-orange-600 dark:text-orange-300' : 'text-yellow-600 dark:text-yellow-300') : 'text-gray-900 dark:text-gray-100'}`}>{value}</p>
                    <p className={`text-xs ${highlight ? (label === t.overdue ? 'text-red-500 dark:text-red-400' : label === t.dueToday ? 'text-orange-500 dark:text-orange-400' : 'text-yellow-600 dark:text-yellow-400') : 'text-gray-500 dark:text-gray-400'}`}>{label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 项目列表 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t.myProjects}</h2>
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">
              {t.allProjects} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{t.noProjects}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => {
              const done = project.tasks.filter(t => t.status === 'DONE').length
              const total = project.tasks.length
              const overdueCnt = project.tasks.some(t => t.status !== 'DONE' && isTaskOverdue(new Date(t.plannedEndDate)))
              // 项目总进度：基于所有任务进度的平均值，四舍五入到最近的10%
              const pct = total > 0
                ? Math.round(project.tasks.reduce((sum, t) => sum + t.progress, 0) / total / 10) * 10
                : 0

              // 进度条颜色逻辑：与项目详情页保持一致
              const getProgressColor = () => {
                if (overdueCnt) return '#dc2626'
                if (pct === 100) return '#22c55e'
                if (pct === 0) return '#16a34a'
                return '#2563eb'
              }
              const progressColor = getProgressColor()

              // 顶部色条渐变色
              const getBarGradient = () => {
                if (overdueCnt) return 'linear-gradient(90deg, #ef4444, #f87171)'
                if (pct === 100) return 'linear-gradient(90deg, #22c55e, #4ade80)'
                if (pct === 0) return 'linear-gradient(90deg, #16a34a, #22c55e)'
                return 'linear-gradient(90deg, #3b82f6, #60a5fa)'
              }

              return (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className={`h-full transition-all duration-200 hover:-translate-y-0.5 cursor-pointer overflow-hidden group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`} style={{ boxShadow: `0 4px 24px ${progressColor}20` }}>
                    {/* 顶部色条 */}
                    <div className="h-1.5" style={{ background: getBarGradient() }} />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">{project.name}</h3>
                        {overdueCnt && <Badge variant="destructive" className="text-xs shrink-0 ml-1">{t.overdueBadge}</Badge>}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        {project.owner ? (
                          <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                            <User className="h-3 w-3" />
                            <span>{project.owner}</span>
                          </div>
                        ) : <div />}
                        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                          <span>{t.planFinish}: {project.completionTime ? format(new Date(project.completionTime), 'yyyy/MM/dd') : '-'}</span>
                        </div>
                      </div>

                      {total > 0 && (
                        <div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-gray-700 dark:text-gray-300">{t.progress}</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300 w-8">{pct}%</span>
                            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all group-hover:shadow-sm"
                                style={{ width: `${pct}%`, background: progressColor }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <DueAlert />
    </div>
  )
}
