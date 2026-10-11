'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { saveSession } from '@/lib/session/session'
import { loginUpstream } from '@/lib/upstream/upstream-auth'
import { UpstreamInvalidCredentialsError } from '@/lib/upstream/upstream-errors'

const loginSchema = z.object({
  login: z.string().trim().min(1, 'Identifiant requis'),
  password: z.string().min(1, 'Mot de passe requis'),
})

export type LoginState = {
  error: string | null
}

export const loginAction = async (_previousState: LoginState, formData: FormData): Promise<LoginState> => {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const upstreamCookie = await loginUpstream(parsed.data)
    await saveSession({ upstreamCookie })
  } catch (error) {
    if (error instanceof UpstreamInvalidCredentialsError) return { error: 'Identifiant ou mot de passe incorrect.' }
    return { error: 'Item Solution est injoignable pour le moment. Réessayez plus tard.' }
  }

  redirect('/finances')
}
