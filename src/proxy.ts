import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/session/session-cookie'

export const proxy = (request: NextRequest) => {
  if (request.cookies.has(SESSION_COOKIE_NAME)) return NextResponse.next()
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/', '/finances/:path*', '/documents/:path*', '/api/documents/:path*'],
}
