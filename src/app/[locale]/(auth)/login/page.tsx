import { Suspense } from 'react'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getI18n } from '@/lib/i18n/get-i18n'
import { upstreamUrl } from '@/lib/upstream/upstream-client'
import { LoginForm } from './login-form'

const LoginPage = async () => {
  const { locale, t } = await getI18n()

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">{t.login.title}</CardTitle>
          <CardDescription>{t.login.description}</CardDescription>
          <CardAction>
            <Suspense>
              <LocaleSwitcher currentLocale={locale} label={t.navigation.language} />
            </Suspense>
          </CardAction>
        </CardHeader>
        <CardContent>
          <LoginForm locale={locale} labels={t.login} />
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 text-sm text-muted-foreground">
          <a className="underline-offset-4 hover:underline" href={upstreamUrl('/users/lost_password')}>
            {t.login.lostPassword}
          </a>
          <p>{t.login.privacy}</p>
        </CardFooter>
      </Card>
    </main>
  )
}

export default LoginPage
