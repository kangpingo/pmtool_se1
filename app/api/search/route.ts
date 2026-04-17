import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''

  if (q.length < 1) {
    return NextResponse.json([])
  }

  const { prisma } = await import('@/lib/prisma')
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { fullName: { contains: q } },
      ],
    },
    select: { id: true, name: true, fullName: true },
    take: 10,
  })

  return NextResponse.json(projects)
}
