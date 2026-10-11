import { Suspense } from 'react'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { getI18n } from '@/lib/i18n/get-i18n'
import { AppSidebar } from './app-sidebar'
import { ResidenceName } from './residence-name'

const residenceName = (
  <Suspense fallback={<Skeleton className="h-5 w-40" />}>
    <ResidenceName />
  </Suspense>
)

const AppLayout = async ({ children }: LayoutProps<'/[locale]'>) => {
  const { locale, t } = await getI18n()

  return (
    <SidebarProvider>
      <AppSidebar
        locale={locale}
        labels={t.navigation}
        residenceName={residenceName}
        localeSwitcher={
          <Suspense>
            <LocaleSwitcher currentLocale={locale} label={t.navigation.language} />
          </Suspense>
        }
      />
      <SidebarInset>
        <header className="flex min-h-14 shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="line-clamp-2 py-2 text-sm leading-snug font-medium">{residenceName}</span>
        </header>
        <div className="mx-auto w-full max-w-5xl p-4 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AppLayout
