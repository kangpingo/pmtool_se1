import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: 获取所有留言（包含回复，按时间倒序）
export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' }
    })
    // Manually fetch replies for each message
    const messagesWithReplies = await Promise.all(
      messages.map(async (msg) => {
        const replies = await prisma.reply.findMany({
          where: { messageId: msg.id },
          orderBy: { createdAt: 'asc' }
        })
        return { ...msg, replies }
      })
    )
    return NextResponse.json(messagesWithReplies)
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST: 创建新留言
export async function POST(request: Request) {
  try {
    const { content, author } = await request.json()
    if (!content || !author) {
      return NextResponse.json({ error: 'Content and author are required' }, { status: 400 })
    }
    const message = await prisma.message.create({
      data: { content, author, likes: 0, likedBy: [] }
    })
    return NextResponse.json({ ...message, replies: [] }, { status: 201 })
  } catch (error) {
    console.error('Failed to create message:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
