import { Skeleton } from '@/components/ui/skeleton'

const RegistryLoading = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    <Skeleton className="h-9 w-full" />
    <div className="flex flex-wrap gap-2">
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-7 w-36" />
    </div>
    <Skeleton className="h-96 w-full rounded-xl" />
  </div>
)

export default RegistryLoading
