import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET: Get current user info
export async function GET() {
  try {
    const cookieStore = await cookies()
    const username = cookieStore.get('username')?.value

    if (!username) {
      return NextResponse.json({ name: null, email: null })
    }

    const user = await prisma.user.findUnique({
      where: { username }
    })
    if (!user) {
      return NextResponse.json({ name: username, email: null })
    }
    return NextResponse.json({ name: user.name, email: user.email })
  } catch (error) {
    console.error('Failed to get user:', error)
    return NextResponse.json({ name: null, email: null })
  }
}

// PUT: Update user info
export async function PUT(request: Request) {
  try {
    const { username, name, email } = await request.json()
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }
    const user = await prisma.user.update({
      where: { username },
      data: { name, email }
    })
    return NextResponse.json({ name: user.name, email: user.email })
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
