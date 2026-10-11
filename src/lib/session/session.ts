import 'server-only'
import { EncryptJWT, jwtDecrypt } from 'jose'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { env } from '@/lib/env'
import { SESSION_COOKIE_NAME } from './session-cookie'

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 25

const sessionSchema = z.object({
  upstreamCookie: z.string().min(1),
})

export type Session = z.infer<typeof sessionSchema>

const secretKey = Buffer.from(env.SESSION_SECRET, 'base64')

const encryptSession = (session: Session) =>
  new EncryptJWT(session)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .encrypt(secretKey)

const decryptSession = async (token: string) => {
  try {
    const { payload } = await jwtDecrypt(token, secretKey)
    return sessionSchema.parse(payload)
  } catch {
    return null
  }
}

export const getSession = async () => {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value
  if (!token) return null
  return decryptSession(token)
}

export const saveSession = async (session: Session) => {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, await encryptSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export const clearSession = async () => {
  ;(await cookies()).delete(SESSION_COOKIE_NAME)
}
