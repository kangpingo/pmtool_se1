import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Get current user info
export async function GET() {
  try {
    // For now, we use a hardcoded admin user
    const user = await prisma.user.findUnique({
      where: { username: 'admin' }
    })
    if (!user) {
      return NextResponse.json({ name: 'Calen', email: null })
    }
    return NextResponse.json({ name: user.name, email: user.email })
  } catch (error) {
    console.error('Failed to get user:', error)
    return NextResponse.json({ name: 'Calen', email: null })
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
