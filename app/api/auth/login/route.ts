import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { username, password, lang, theme } = await req.json()
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'

  // Hardcoded credentials
  if (username === 'admin' && password === 'admin@123') {
    // Get or create user
    let user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      user = await prisma.user.create({
        data: { username, name: 'Calen' }
      })
    }

    // Record successful login
    await prisma.loginLog.create({
      data: {
        username,
        status: 'SUCCESS',
        ip,
        userAgent,
        message: `User ${username} logged in successfully`,
      },
    })

    const response = NextResponse.json({ success: true, user: { name: user.name || 'Calen', email: user.email, avatar: '/avatar.svg' } })

    response.cookies.set('auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    response.cookies.set('username', username, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    if (lang) {
      response.cookies.set('lang', lang, { maxAge: 60 * 60 * 24 * 365 })
    }
    if (theme) {
      response.cookies.set('theme', theme, { maxAge: 60 * 60 * 24 * 365 })
    }

    return response
  }

  // Record failed login
  await prisma.loginLog.create({
    data: {
      username: username || 'unknown',
      status: 'FAILED',
      ip,
      userAgent,
      message: `Failed login attempt for user ${username}`,
    },
  })

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}
