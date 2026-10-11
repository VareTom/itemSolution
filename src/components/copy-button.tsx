'use client'

import { CheckIcon, CopyIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const COPIED_FEEDBACK_MS = 2000

type CopyButtonProps = {
  value: string
  ariaLabel: string
  copiedMessage: string
}

export const CopyButton = ({ value, ariaLabel, copiedMessage }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setIsCopied(true)
    toast.success(copiedMessage)
    setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS)
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={copy} aria-label={ariaLabel}>
      {isCopied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}
