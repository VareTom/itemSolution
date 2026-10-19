import { Skeleton } from '@/components/ui/skeleton'

const ContactLoading = () => (
  <div className="flex flex-col gap-6">
    <Skeleton className="h-7 w-32" />
    <div className="flex items-center gap-4">
      <Skeleton className="size-14 rounded-full" />
      <Skeleton className="h-8 w-56" />
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <Skeleton className="h-56 rounded-xl" />
      <Skeleton className="h-56 rounded-xl" />
    </div>
  </div>
)

export default ContactLoading
