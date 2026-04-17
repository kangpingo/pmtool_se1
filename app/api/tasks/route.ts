import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addDays, startOfDay, endOfDay } from 'date-fns'

// GET /api/tasks?window=1|3|7  返回时间窗口内所有项目的任务
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const window = Number(searchParams.get('window') || '7')

  const now = new Date()
  const rangeEnd = endOfDay(addDays(now, window - 1))
  const rangeStart = startOfDay(now)

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { plannedEndDate: { gte: rangeStart, lte: rangeEnd } },
        { plannedStartDate: { gte: rangeStart, lte: rangeEnd } },
        { AND: [{ plannedStartDate: { lte: rangeStart } }, { plannedEndDate: { gte: rangeEnd } }] },
      ],
    },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { plannedEndDate: 'asc' },
  })
  return NextResponse.json(tasks)
}
