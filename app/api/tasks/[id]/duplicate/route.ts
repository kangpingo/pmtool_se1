import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name } = await request.json()

    // Get the original task
    const original = await prisma.task.findUnique({
      where: { id },
    })

    if (!original) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Create a duplicate of the task
    const duplicated = await prisma.task.create({
      data: {
        name: name || `${original.name} (Copy)`,
        plannedStartDate: original.plannedStartDate,
        plannedEndDate: original.plannedEndDate,
        duration: original.duration,
        includeWeekend: original.includeWeekend,
        keyPoints: original.keyPoints,
        status: 'TODO',
        progress: 0,
        favorite: false,
        projectId: original.projectId,
      },
    })

    // Log the operation
    await prisma.systemLog.create({
      data: {
        level: 'INFO',
        module: '任务',
        action: '复制',
        message: `复制任务: ${original.name}`,
        details: `新任务: ${duplicated.name}`,
        userId: original.projectId,
        userName: 'admin',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      },
    })

    return NextResponse.json(duplicated, { status: 201 })
  } catch (error) {
    console.error('Failed to duplicate task:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
