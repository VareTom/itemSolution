import { Skeleton } from '@/components/ui/skeleton'

const HomeLoading = () => (
  <div className="flex flex-col gap-6">
    <Skeleton className="h-52 w-full rounded-xl" />
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="grid content-start gap-4 sm:grid-cols-2 lg:order-last lg:grid-cols-1">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  </div>
)

export default HomeLoading
