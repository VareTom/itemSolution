import { fetchUpstream } from '@/lib/upstream/upstream-client'

const DOCUMENT_ID_PATTERN = /^\d+$/
const FILENAME_PATTERN = /filename="?([^";]+)"?/
const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
}

const resolveFile = (contentDisposition: string | null, documentId: string) => {
  const filename = contentDisposition?.match(FILENAME_PATTERN)?.[1] ?? `document-${documentId}`
  const extension = filename.split('.').pop()?.toLowerCase() ?? ''
  return { filename, contentType: MIME_TYPES[extension] ?? 'application/octet-stream' }
}

/**
 * Streams an upstream document. Upstream always answers with "application/force-download",
 * so the real content type is restored from the file name to allow inline previews.
 */
export const GET = async (request: Request, { params }: RouteContext<'/api/documents/[id]'>) => {
  const { id } = await params
  if (!DOCUMENT_ID_PATTERN.test(id)) return new Response('Not found', { status: 404 })

  const upstream = await fetchUpstream(`/docs/get/${id}`)
  const { filename, contentType } = resolveFile(upstream.headers.get('content-disposition'), id)
  const disposition = new URL(request.url).searchParams.has('download') ? 'attachment' : 'inline'

  return new Response(upstream.body, {
    headers: {
      'content-type': contentType,
      'content-disposition': `${disposition}; filename="${filename}"`,
      'cache-control': 'private, no-store',
      'x-content-type-options': 'nosniff',
    },
  })
}
