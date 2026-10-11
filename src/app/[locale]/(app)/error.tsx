'use client'

import { useParams } from 'next/navigation'
import { TriangleAlertIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n/locales'

const AppError = ({ reset }: { error: Error; reset: () => void }) => {
  const { locale } = useParams<{ locale: string }>()
  const t = getDictionary(isLocale(locale) ? locale : DEFAULT_LOCALE).error

  return (
    <Alert variant="destructive" className="max-w-xl">
      <TriangleAlertIcon />
      <AlertTitle>{t.title}</AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-3">
        <p>{t.description}</p>
        <Button variant="outline" size="sm" onClick={reset}>
          {t.retry}
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export default AppError
