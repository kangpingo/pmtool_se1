import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name } = await request.json()

    // Get the original project with all tasks
    const original = await prisma.project.findUnique({
      where: { id },
      include: { tasks: true },
    })

    if (!original) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create a copy of the project
    const copied = await prisma.project.create({
      data: {
        name: name || `${original.name} (Copy)`,
        shortName: original.shortName,
        fullName: original.fullName,
        plannedStartDate: original.plannedStartDate,
        duration: original.duration,
        description: original.description,
        owner: original.owner,
        link: original.link,
        image: original.image,
        completionTime: original.completionTime,
        progress: 0,
        // Copy tasks
        tasks: {
          create: original.tasks.map(task => ({
            name: task.name,
            plannedStartDate: task.plannedStartDate,
            plannedEndDate: task.plannedEndDate,
            duration: task.duration,
            includeWeekend: task.includeWeekend,
            keyPoints: task.keyPoints,
            status: 'TODO',
            progress: 0,
            favorite: false,
          })),
        },
      },
    })

    return NextResponse.json(copied, { status: 201 })
  } catch (error) {
    console.error('Failed to copy project:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
