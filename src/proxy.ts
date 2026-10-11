import { NextResponse, type NextRequest } from 'next/server'
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE_NAME, type Locale } from '@/lib/i18n/locales'
import { SESSION_COOKIE_NAME } from '@/lib/session/session-cookie'

const PUBLIC_PAGES = new Set(['login'])
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

const preferredLocale = (request: NextRequest): Locale => {
  const fromCookie = request.cookies.get(LOCALE_COOKIE_NAME)?.value
  if (isLocale(fromCookie)) return fromCookie
  const acceptLanguage = request.headers.get('accept-language') ?? ''
  return acceptLanguage.trim().toLowerCase().startsWith('nl') ? 'nl' : DEFAULT_LOCALE
}

const rememberLocale = (response: NextResponse, locale: Locale) => {
  response.cookies.set(LOCALE_COOKIE_NAME, locale, { path: '/', maxAge: ONE_YEAR_SECONDS, sameSite: 'lax' })
  return response
}

export const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl
  const isAuthenticated = request.cookies.has(SESSION_COOKIE_NAME)

  if (pathname.startsWith('/api/')) {
    if (isAuthenticated) return NextResponse.next()
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [, firstSegment, page] = pathname.split('/')
  if (!isLocale(firstSegment)) {
    const url = request.nextUrl.clone()
    url.pathname = `/${preferredLocale(request)}${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(url)
  }

  if (!isAuthenticated && !PUBLIC_PAGES.has(page ?? '')) {
    return rememberLocale(NextResponse.redirect(new URL(`/${firstSegment}/login`, request.url)), firstSegment)
  }

  return rememberLocale(NextResponse.next(), firstSegment)
}

export const config = {
  matcher: ['/((?!_next|logout|favicon.ico|.*\\..*).*)'],
}
