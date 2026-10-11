'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { DEFAULT_LOCALE, LOCALES } from '@/lib/i18n/locales'
import { saveSession } from '@/lib/session/session'
import { loginUpstream } from '@/lib/upstream/upstream-auth'
import { UpstreamInvalidCredentialsError } from '@/lib/upstream/upstream-errors'

const localeSchema = z.enum(LOCALES).catch(DEFAULT_LOCALE)

const credentialsSchema = z.object({
  login: z.string().trim().min(1),
  password: z.string().min(1),
})

export type LoginState = {
  error: string | null
}

export const loginAction = async (_previousState: LoginState, formData: FormData): Promise<LoginState> => {
  const locale = localeSchema.parse(formData.get('locale'))
  const errors = getDictionary(locale).login.errors
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const isLoginMissing = parsed.error.issues.some(({ path }) => path[0] === 'login')
    return { error: isLoginMissing ? errors.loginRequired : errors.passwordRequired }
  }

  try {
    const upstreamCookie = await loginUpstream(parsed.data)
    await saveSession({ upstreamCookie })
  } catch (error) {
    if (error instanceof UpstreamInvalidCredentialsError) return { error: errors.invalidCredentials }
    return { error: errors.unavailable }
  }

  redirect(`/${locale}/finances`)
}
