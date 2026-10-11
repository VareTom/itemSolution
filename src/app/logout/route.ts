import { redirect } from 'next/navigation'
import { clearSession, getSession } from '@/lib/session/session'
import { logoutUpstream } from '@/lib/upstream/upstream-auth'

/**
 * Clears the local session. Used both for an explicit logout and when the upstream session expired.
 */
export const GET = async () => {
  const session = await getSession()
  if (session) await logoutUpstream(session.upstreamCookie).catch(() => undefined)
  await clearSession()
  redirect('/login')
}
