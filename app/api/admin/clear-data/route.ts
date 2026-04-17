import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    await prisma.reply.deleteMany()
    await prisma.task.deleteMany()
    await prisma.project.deleteMany()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Clear data error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
