import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')

  if (!username || username.length < 3) {
    return NextResponse.json({ available: true })
  }

  const user = await prisma.user.findUnique({ where: { username } })
  return NextResponse.json({ available: !user })
}
