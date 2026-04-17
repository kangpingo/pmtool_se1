import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')
  const lang = searchParams.get('lang') || 'zh'

  const tempProjectSuffix = lang === 'zh' ? '临时创建的项目' : ' Temp Project'

  try {
    // Get all projects
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true },
    })

    // If username provided, ensure temp project exists
    let tempProject = null
    if (username) {
      const tempProjectName = `${username} ${tempProjectSuffix}`
      tempProject = await prisma.project.findFirst({
        where: { name: tempProjectName },
        select: { id: true, name: true },
      })

      if (!tempProject) {
        // Create temp project
        tempProject = await prisma.project.create({
          data: {
            name: tempProjectName,
            fullName: tempProjectName,
            owner: username,
            description: lang === 'zh' ? '用户临时创建的项目' : 'User temp project',
            progress: 0,
            plannedStartDate: new Date(),
            duration: 30,
          },
          select: { id: true, name: true },
        })
        // Add to projects list
        projects.unshift(tempProject)
      } else {
        // Move temp project to front
        const idx = projects.findIndex(p => p.id === tempProject!.id)
        if (idx > 0) {
          projects.splice(idx, 1)
          projects.unshift(tempProject)
        }
      }
    }

    return NextResponse.json({ projects, tempProject })
  } catch (error) {
    console.error('Error fetching projects with temp:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
