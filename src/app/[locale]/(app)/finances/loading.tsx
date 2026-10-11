import { Skeleton } from '@/components/ui/skeleton'

const FinancesLoading = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-72" />
    </div>
    <Skeleton className="h-28 w-full rounded-xl" />
    <div className="grid gap-4 md:grid-cols-2">
      <Skeleton className="h-44 rounded-xl" />
      <Skeleton className="h-44 rounded-xl" />
    </div>
    <Skeleton className="h-40 w-full rounded-xl" />
    <Skeleton className="h-96 w-full rounded-xl" />
  </div>
)

export default FinancesLoading
