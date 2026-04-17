import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addDays } from 'date-fns'

export async function GET() {
  const projects = await prisma.project.findMany({
    include: { tasks: { orderBy: { plannedEndDate: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, shortName, fullName, startDate, duration, description, owner, link, image, completionTime } = body

  if (!name || !startDate || !duration) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
  }

  const computedCompletionTime = completionTime
    ? new Date(completionTime)
    : addDays(new Date(startDate), Number(duration) - 1)

  const project = await prisma.project.create({
    data: {
      name,
      shortName: shortName || null,
      fullName: fullName || null,
      plannedStartDate: new Date(startDate),
      duration: Number(duration),
      description: description || null,
      owner: owner || null,
      link: link || null,
      image: image || null,
      completionTime: computedCompletionTime,
    },
  })

  return NextResponse.json(project, { status: 201 })
}
