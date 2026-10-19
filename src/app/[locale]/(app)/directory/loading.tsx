import { Skeleton } from '@/components/ui/skeleton'

const PLACEHOLDER_ROWS = 10

const DirectoryLoading = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-72" />
    </div>
    <Skeleton className="h-9 w-full" />
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: PLACEHOLDER_ROWS }, (_, index) => (
        <Skeleton key={index} className="h-10" />
      ))}
    </div>
  </div>
)

export default DirectoryLoading
