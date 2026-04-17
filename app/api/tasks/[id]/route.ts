import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calcEndDate } from '@/lib/date-utils'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { name, startDate, duration, includeWeekend, keyPoints, status, progress, favorite, projectId, actualFinishDate } = body

  let plannedEndDate: Date | undefined
  if (startDate && duration !== undefined) {
    plannedEndDate = calcEndDate(new Date(startDate), Number(duration), Boolean(includeWeekend))
  }

  // 如果进度设置为100且没有提供actualFinishDate，则自动设置为当前时间
  // 如果提供了actualFinishDate（可以是null），则使用提供的值
  let finalActualFinishDate: Date | null | undefined = undefined
  if (actualFinishDate !== undefined) {
    // 用户明确提供了值（包括null），使用它
    finalActualFinishDate = actualFinishDate ? new Date(actualFinishDate) : null
  } else if (progress === 100) {
    // 用户没有提供actualFinishDate且进度为100，自动设置为当前时间
    finalActualFinishDate = new Date()
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(startDate && { plannedStartDate: new Date(startDate) }),
      ...(duration !== undefined && { duration: Number(duration) }),
      ...(includeWeekend !== undefined && { includeWeekend: Boolean(includeWeekend) }),
      ...(plannedEndDate && { plannedEndDate }),
      ...(keyPoints !== undefined && { keyPoints }),
      ...(status && { status }),
      ...(progress !== undefined && { progress: Math.round(Number(progress) / 10) * 10 }),
      ...(favorite !== undefined && { favorite: Boolean(favorite) }),
      ...(projectId && { projectId }),
      ...(finalActualFinishDate !== undefined && { actualFinishDate: finalActualFinishDate }),
    },
  })

  // 如果更新了进度或状态，重新计算项目总进度
  if (progress !== undefined || status !== undefined) {
    const projectTasks = await prisma.task.findMany({
      where: { projectId: task.projectId },
      select: { progress: true, status: true },
    })
    if (projectTasks.length > 0) {
      // 新策略：项目总进度 = 所有任务进度的平均值
      const totalProgress = projectTasks.reduce((sum, t) => sum + t.progress, 0)
      const avgProgress = Math.round(totalProgress / projectTasks.length / 10) * 10
      await prisma.project.update({
        where: { id: task.projectId },
        data: { progress: avgProgress },
      })
    }
  }

  return NextResponse.json(task)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // 获取任务以知道其所属项目
  const task = await prisma.task.findUnique({ where: { id }, select: { projectId: true } })
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }
  await prisma.task.delete({ where: { id } })

  // 重新计算项目进度
  const remainingTasks = await prisma.task.findMany({
    where: { projectId: task.projectId },
    select: { progress: true },
  })
  if (remainingTasks.length > 0) {
    const avgProgress = Math.round(remainingTasks.reduce((sum, t) => sum + t.progress, 0) / remainingTasks.length / 10) * 10
    await prisma.project.update({
      where: { id: task.projectId },
      data: { progress: avgProgress },
    })
  } else {
    // 没有任务了，进度设为0
    await prisma.project.update({
      where: { id: task.projectId },
      data: { progress: 0 },
    })
  }

  return NextResponse.json({ success: true })
}
