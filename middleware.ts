import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const auth = req.cookies.get('auth')
  const isLoginPage = req.nextUrl.pathname === '/login'
  const isApiRoute = req.nextUrl.pathname.startsWith('/api')
  const isStaticFile = req.nextUrl.pathname.startsWith('/_next') || req.nextUrl.pathname.startsWith('/logo') || req.nextUrl.pathname.startsWith('/avatar')

  // Allow static files and API routes (except protected ones if any)
  if (isStaticFile || isApiRoute) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!auth || auth.value !== 'true') {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  } else {
    // Redirect to home if already logged in and trying to access login
    if (isLoginPage) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/projects', '/projects/:path*', '/tasks', '/kanban', '/login'],
}
