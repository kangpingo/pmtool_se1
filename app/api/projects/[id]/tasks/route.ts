import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calcEndDate } from '@/lib/date-utils'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') || 'json'

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) {
    return NextResponse.json({ error: '项目不存在' }, { status: 404 })
  }

  const tasks = await prisma.task.findMany({
    where: { projectId: id },
    orderBy: { plannedEndDate: 'asc' },
  })

  if (format === 'csv') {
    const header = '任务名称,计划开始日期,计划完成日期,工期(天),包含周末,重点关注'
    const rows = tasks.map(t => {
      const start = new Date(t.plannedStartDate).toISOString().split('T')[0]
      const end = new Date(t.plannedEndDate).toISOString().split('T')[0]
      const kp = (t.keyPoints || '').replace(/"/g, '""')
      return `"${t.name}",${start},${end},${t.duration},${t.includeWeekend ? '是' : '否'},"${kp}"`
    })
    const csv = [header, ...rows].join('\n')
    const filename = encodeURIComponent(`${project.name}-tasks.csv`)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment;filename="${filename}"`,
      },
    })
  }

  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) {
    return NextResponse.json({ error: '项目不存在' }, { status: 404 })
  }

  // 批量导入模式
  if (Array.isArray(body.tasks)) {
    const { tasks } = body
    if (tasks.length === 0) {
      return NextResponse.json({ error: '没有任务数据' }, { status: 400 })
    }
    const created = await prisma.task.createMany({
      data: tasks.map((t: { name: string; startDate: string; endDate: string; duration?: number; includeWeekend?: boolean; keyPoints?: string; status?: string; progress?: number }) => ({
        name: t.name,
        plannedStartDate: new Date(t.startDate),
        plannedEndDate: new Date(t.endDate),
        duration: t.duration ?? 3,
        includeWeekend: t.includeWeekend ?? false,
        keyPoints: t.keyPoints ?? null,
        status: t.status ?? 'TODO',
        progress: Math.round((t.progress ?? 0) / 10) * 10,
        projectId: id,
      })),
    })
    // 重新计算项目进度
    const allTasks = await prisma.task.findMany({ where: { projectId: id }, select: { progress: true } })
    if (allTasks.length > 0) {
      const avgProgress = Math.round(allTasks.reduce((sum, t) => sum + t.progress, 0) / allTasks.length / 10) * 10
      await prisma.project.update({ where: { id }, data: { progress: avgProgress } })
    }
    return NextResponse.json({ success: true, count: created.count })
  }

  // 单个任务创建
  const { name, startDate, duration = 3, includeWeekend = false, keyPoints } = body

  if (!name || !startDate) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
  }

  const start = new Date(startDate)
  const plannedEndDate = calcEndDate(start, Number(duration), Boolean(includeWeekend))

  const task = await prisma.task.create({
    data: {
      name,
      plannedStartDate: start,
      plannedEndDate,
      duration: Number(duration),
      includeWeekend: Boolean(includeWeekend),
      keyPoints,
      projectId: id,
      progress: 50, // 初始化进度为50%
    },
  })

  // 重新计算项目进度
  const allTasks = await prisma.task.findMany({ where: { projectId: id }, select: { progress: true } })
  if (allTasks.length > 0) {
    const avgProgress = Math.round(allTasks.reduce((sum, t) => sum + t.progress, 0) / allTasks.length / 10) * 10
    await prisma.project.update({ where: { id }, data: { progress: avgProgress } })
  }

  return NextResponse.json(task, { status: 201 })
}
