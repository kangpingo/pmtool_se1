import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import GanttChart from '@/components/GanttChart'

export const dynamic = 'force-dynamic'

const labels = {
  zh: {
    title: '甘特图',
    selectProject: '选择项目',
    allProjects: '全部项目',
    noTasks: '该项目中没有任务',
    taskCount: '共 {count} 个任务',
  },
  en: {
    title: 'Gantt Chart',
    selectProject: 'Select Project',
    allProjects: 'All Projects',
    noTasks: 'No tasks in this project',
    taskCount: '{count} tasks',
  },
}

export default async function GanttPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}) {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('lang')?.value as 'zh' | 'en') || 'en'
  const t = labels[lang]

  const { project: projectId } = await searchParams

  // Fetch all projects with their completionTime and tasks for the selector
  const allProjects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      completionTime: true,
      tasks: {
        select: { plannedEndDate: true, status: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  })

  // Find the project closest to completion (earliest completionTime with incomplete tasks)
  const projectsClosestToCompletion = allProjects
    .map(p => ({
      id: p.id,
      name: p.name,
      completionTime: p.completionTime,
      hasIncompleteTasks: p.tasks.some(t => t.status !== 'DONE'),
      earliestEndDate: p.tasks.length > 0
        ? Math.min(...p.tasks.map(t => new Date(t.plannedEndDate).getTime()))
        : Infinity
    }))
    .filter(p => p.completionTime || p.hasIncompleteTasks)
    .sort((a, b) => {
      // If both have completionTime, sort by that
      if (a.completionTime && b.completionTime) {
        return new Date(a.completionTime).getTime() - new Date(b.completionTime).getTime()
      }
      // Projects with completionTime come first
      if (a.completionTime) return -1
      if (b.completionTime) return 1
      // Then sort by earliest task end date
      return a.earliestEndDate - b.earliestEndDate
    })

  // Default to the project closest to completion if no project is selected
  const defaultProjectId = projectId || projectsClosestToCompletion[0]?.id

  // Fetch all projects for the selector (only id and name)
  const projects = allProjects.map(p => ({ id: p.id, name: p.name }))

  // Fetch tasks, filtered by project if selected (use default if none selected)
  const tasks = await prisma.task.findMany({
    where: defaultProjectId ? { projectId: defaultProjectId } : undefined,
    include: { project: { select: { id: true, name: true } } },
    orderBy: { plannedStartDate: 'asc' },
  })

  const serialized = tasks.map(task => ({
    ...task,
    startDate: task.plannedStartDate.toISOString(),
    endDate: task.plannedEndDate.toISOString(),
  }))

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <GanttChart
        tasks={serialized}
        projects={projects}
        selectedProjectId={defaultProjectId}
        title={t.title}
        selectLabel={t.selectProject}
        allLabel={t.allProjects}
        noTasksLabel={t.noTasks}
        countLabel={t.taskCount}
      />
    </div>
  )
}
