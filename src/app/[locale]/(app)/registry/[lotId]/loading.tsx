import { Skeleton } from '@/components/ui/skeleton'

const LotLoading = () => (
  <div className="flex flex-col gap-6">
    <Skeleton className="h-7 w-32" />
    <div className="flex flex-col gap-2">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-5 w-24" />
    </div>
    <Skeleton className="h-20 w-full rounded-xl" />
    <Skeleton className="h-32 w-full rounded-xl" />
  </div>
)

export default LotLoading
