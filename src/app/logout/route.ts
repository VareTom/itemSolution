import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE_NAME } from '@/lib/i18n/locales'
import { clearSession, getSession } from '@/lib/session/session'
import { logoutUpstream } from '@/lib/upstream/upstream-auth'

/**
 * Clears the local session. Used both for an explicit logout and when the upstream session expired.
 */
export const GET = async () => {
  const session = await getSession()
  if (session) await logoutUpstream(session.upstreamCookie).catch(() => undefined)
  await clearSession()

  const locale = (await cookies()).get(LOCALE_COOKIE_NAME)?.value
  redirect(`/${isLocale(locale) ? locale : DEFAULT_LOCALE}/login`)
}
