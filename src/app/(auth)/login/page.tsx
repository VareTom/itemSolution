import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { upstreamUrl } from '@/lib/upstream/upstream-client'
import { LoginForm } from './login-form'

const LoginPage = () => (
  <main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Ma copropriété</CardTitle>
        <CardDescription>Connectez-vous avec vos identifiants Item Solution.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 text-sm text-muted-foreground">
        <a className="underline-offset-4 hover:underline" href={upstreamUrl('/users/lost_password')}>
          Mot de passe perdu ?
        </a>
        <p>Vos identifiants sont transmis à Item Solution et ne sont jamais enregistrés.</p>
      </CardFooter>
    </Card>
  </main>
)

export default LoginPage
