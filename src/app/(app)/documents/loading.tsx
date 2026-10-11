import { Skeleton } from '@/components/ui/skeleton'

const DocumentsLoading = () => (
  <div className="flex flex-col gap-4">
    <div className="mb-2 flex flex-col gap-2">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-72" />
    </div>
    <Skeleton className="h-8 w-full" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-8 w-56" />
    </div>
    <Skeleton className="h-[480px] w-full rounded-xl" />
  </div>
)

export default DocumentsLoading
