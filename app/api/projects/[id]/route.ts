import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addDays } from 'date-fns'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: { tasks: { orderBy: { plannedEndDate: 'asc' } } },
  })
  if (!project) return NextResponse.json({ error: '项目不存在' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let body: Record<string, any>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '请求体解析失败', body: await req.clone().text() }, { status: 400 })
  }

  // 获取当前项目以计算新的 completionTime
  const current = await prisma.project.findUnique({ where: { id } })
  if (!current) return NextResponse.json({ error: '项目不存在' }, { status: 404 })

  let completionTime: Date | undefined
  try {
    if (body.completionTime !== undefined) {
      completionTime = new Date(body.completionTime)
    } else if (body.duration !== undefined && body.startDate !== undefined) {
      const start = new Date(body.startDate)
      completionTime = addDays(start, Number(body.duration) - 1)
    } else if (body.duration !== undefined) {
      const start = new Date(current.plannedStartDate)
      completionTime = addDays(start, Number(body.duration) - 1)
    }
  } catch (e: any) {
    return NextResponse.json({ error: '日期解析失败', detail: e.message, body }, { status: 400 })
  }

  try {
    const updated = await prisma.project.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        shortName: body.shortName ?? null,
        fullName: body.fullName ?? null,
        plannedStartDate: body.startDate ? new Date(body.startDate) : undefined,
        duration: body.duration ? Number(body.duration) : undefined,
        description: body.description ?? null,
        owner: body.owner ?? null,
        link: body.link ?? null,
        image: body.image ?? null,
        completionTime: completionTime ?? null,
      },
    })
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: '数据库更新失败', detail: e.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.project.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
