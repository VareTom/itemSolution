'use client'

import { TriangleAlertIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

const AppError = ({ reset }: { error: Error; reset: () => void }) => (
  <Alert variant="destructive" className="max-w-xl">
    <TriangleAlertIcon />
    <AlertTitle>Impossible de récupérer vos données</AlertTitle>
    <AlertDescription className="flex flex-col items-start gap-3">
      <p>Item Solution ne répond pas ou a changé son affichage. Réessayez dans un instant.</p>
      <Button variant="outline" size="sm" onClick={reset}>
        Réessayer
      </Button>
    </AlertDescription>
  </Alert>
)

export default AppError
