import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
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

export const metadata: Metadata = {
  title: 'Ma copropriété',
  description: 'Finances et documents de votre copropriété, en clair.',
}

const RootLayout = ({ children }: LayoutProps<'/'>) => (
  <html lang="fr" className={cn(geistSans.variable, geistMono.variable, 'h-full antialiased')}>
    <body className="flex min-h-full flex-col">
      <NuqsAdapter>
        <TooltipProvider>{children}</TooltipProvider>
      </NuqsAdapter>
      <Toaster />
    </body>
  </html>
)

export default RootLayout
