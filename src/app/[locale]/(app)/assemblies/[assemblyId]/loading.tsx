import { Skeleton } from '@/components/ui/skeleton'

const AssemblyLoading = () => (
  <div className="flex flex-col gap-6">
    <Skeleton className="h-7 w-40" />
    <div className="flex flex-col gap-2">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-8 w-2/3" />
    </div>
    <Skeleton className="h-24 w-full rounded-xl" />
    <Skeleton className="h-40 w-full rounded-xl" />
    <Skeleton className="h-40 w-full rounded-xl" />
  </div>
)

export default AssemblyLoading
