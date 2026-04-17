import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Get all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        username: true,
        name: true,
        email: true,
      },
      orderBy: {
        username: 'asc',
      },
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error('Failed to get users:', error)
    return NextResponse.json({ error: 'Failed to get users' }, { status: 500 })
  }
}
