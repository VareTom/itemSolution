import 'server-only'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { env } from '@/lib/env'
import { getSession } from '@/lib/session/session'
import { UpstreamRequestError } from './upstream-errors'

const LOGIN_PATH = '/users/login'
const MAX_REDIRECTS = 3

/** Clears the local session (see app/logout) when the upstream session is gone. */
const redirectToLogout = (): never => redirect('/logout')

const isRedirect = (status: number) => status >= 300 && status < 400

export const isLoginRedirect = (location: string | null) => location?.includes(LOGIN_PATH) ?? false

export const upstreamUrl = (path: string) => new URL(path, env.UPSTREAM_BASE_URL).toString()

const requireUpstreamCookie = async () => {
  const session = await getSession()
  if (!session) return redirectToLogout()
  return session.upstreamCookie
}

/**
 * Fetches an upstream page with the user's upstream session cookie.
 * Redirects are followed manually so a redirect to the login page is detected as an expired session.
 */
export const fetchUpstream = async (path: string) => {
  const cookie = await requireUpstreamCookie()
  let currentPath = path

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await fetch(upstreamUrl(currentPath), {
      headers: { cookie },
      redirect: 'manual',
      cache: 'no-store',
    })
    const location = response.headers.get('location')

    if (!isRedirect(response.status)) {
      if (!response.ok) throw new UpstreamRequestError(response.status, path)
      return response
    }
    if (isLoginRedirect(location)) return redirectToLogout()
    if (!location) throw new UpstreamRequestError(response.status, path)
    currentPath = location
  }

  throw new Error(`Too many upstream redirects on ${path}`)
}

export const fetchUpstreamHtml = cache(async (path: string) => {
  const response = await fetchUpstream(path)
  const html = await response.text()
  if (html.includes('id="formUserLogin"')) return redirectToLogout()
  return html
})
