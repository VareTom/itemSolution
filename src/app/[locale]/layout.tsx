import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { getI18n } from '@/lib/i18n/get-i18n'
import { LOCALES } from '@/lib/i18n/locales'
import { cn } from '@/lib/utils'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }))

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await getI18n()
  return { title: t.metadata.title, description: t.metadata.description }
}

const RootLayout = async ({ children }: LayoutProps<'/[locale]'>) => {
  const { locale } = await getI18n()

  return (
    <html lang={locale} className={cn(geistSans.variable, geistMono.variable, 'h-full antialiased')}>
      <body className="flex min-h-full flex-col">
        <NuqsAdapter>
          <TooltipProvider>{children}</TooltipProvider>
        </NuqsAdapter>
        <Toaster />
      </body>
    </html>
  )
}

export default RootLayout
