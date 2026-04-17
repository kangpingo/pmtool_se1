import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'system' // system | login
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    if (type === 'login') {
      const logs = await prisma.loginLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      })
      const total = await prisma.loginLog.count()
      return NextResponse.json({ logs, total, page, limit })
    } else {
      const logs = await prisma.systemLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      })
      const total = await prisma.systemLog.count()
      return NextResponse.json({ logs, total, page, limit })
    }
  } catch (error) {
    console.error('Failed to fetch logs:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { level, module, action, message, details, userId, userName, ip } = body

  try {
    const log = await prisma.systemLog.create({
      data: {
        level: level || 'INFO',
        module: module || 'SYSTEM',
        action: action || 'UNKNOWN',
        message,
        details: details ? JSON.stringify(details) : null,
        userId,
        userName,
        ip,
      },
    })
    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('Failed to create log:', error)
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 })
  }
}
