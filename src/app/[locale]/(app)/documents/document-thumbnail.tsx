'use client'

import Image from 'next/image'
import { FileTextIcon } from 'lucide-react'
import { useState } from 'react'

const THUMBNAIL_WIDTH = 36
const THUMBNAIL_HEIGHT = 48

export const DocumentThumbnail = ({ documentId }: { documentId: string }) => {
  const [hasFailed, setHasFailed] = useState(false)

  if (hasFailed) {
    return (
      <span className="flex h-12 w-9 shrink-0 items-center justify-center rounded border bg-muted">
        <FileTextIcon className="size-4 text-muted-foreground" />
      </span>
    )
  }

  return (
    <Image
      src={`/api/documents/${documentId}/preview`}
      alt=""
      width={THUMBNAIL_WIDTH}
      height={THUMBNAIL_HEIGHT}
      unoptimized
      loading="lazy"
      onError={() => setHasFailed(true)}
      className="h-12 w-9 shrink-0 rounded border bg-muted object-cover object-top"
    />
  )
}
