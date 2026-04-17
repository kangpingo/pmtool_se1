import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: 添加回复
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params
    const { content, author } = await request.json()
    if (!content || !author) {
      return NextResponse.json({ error: 'Content and author are required' }, { status: 400 })
    }
    const reply = await prisma.reply.create({
      data: { content, author, messageId, likes: 0, likedBy: [] }
    })
    return NextResponse.json(reply, { status: 201 })
  } catch (error) {
    console.error('Failed to create reply:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
