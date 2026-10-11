import 'server-only'
import { type CookieJar, mergeSetCookies, serializeCookieJar } from './upstream-cookies'
import { isLoginRedirect, upstreamUrl } from './upstream-client'
import { UpstreamInvalidCredentialsError, UpstreamRequestError } from './upstream-errors'

const LOGIN_PATH = '/users/login'
const LOGOUT_PATH = '/users/logout'
const MAX_REDIRECTS = 5

type LoginInput = {
  login: string
  password: string
}

type JarRequestInput = {
  path: string
  jar: CookieJar
  init?: RequestInit
}

const requestWithJar = async ({ path, jar, init = {} }: JarRequestInput) => {
  const response = await fetch(upstreamUrl(path), {
    ...init,
    headers: { ...init.headers, cookie: serializeCookieJar(jar) },
    redirect: 'manual',
    cache: 'no-store',
  })
  return { response, jar: mergeSetCookies(jar, response.headers.getSetCookie()) }
}

/**
 * Upstream login answers with a redirect chain (e.g. /users/load_site) that finishes
 * initialising the session, so every hop must be followed with the updated cookies.
 */
const followRedirects = async (start: Awaited<ReturnType<typeof requestWithJar>>) => {
  let current = start
  for (let hop = 0; hop < MAX_REDIRECTS; hop++) {
    const location = current.response.headers.get('location')
    if (!location) return current
    if (isLoginRedirect(location)) throw new UpstreamInvalidCredentialsError()
    current = await requestWithJar({ path: location, jar: current.jar })
  }
  return current
}

/**
 * Logs into the upstream site and returns the resulting upstream cookie header.
 * Credentials are only forwarded, never stored.
 */
export const loginUpstream = async ({ login, password }: LoginInput) => {
  const loginPage = await requestWithJar({ path: LOGIN_PATH, jar: new Map() })
  if (!loginPage.response.ok) throw new UpstreamRequestError(loginPage.response.status, LOGIN_PATH)

  const submitted = await requestWithJar({
    path: LOGIN_PATH,
    jar: loginPage.jar,
    init: {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        _method: 'POST',
        'data[User][login]': login,
        'data[User][password]': password,
      }),
    },
  })
  if (!submitted.response.headers.has('location')) throw new UpstreamInvalidCredentialsError()

  const landed = await followRedirects(submitted)
  const html = await landed.response.text()
  if (html.includes('id="formUserLogin"')) throw new UpstreamInvalidCredentialsError()

  return serializeCookieJar(landed.jar)
}

export const logoutUpstream = async (upstreamCookie: string) => {
  await fetch(upstreamUrl(LOGOUT_PATH), {
    headers: { cookie: upstreamCookie },
    redirect: 'manual',
    cache: 'no-store',
  })
}
