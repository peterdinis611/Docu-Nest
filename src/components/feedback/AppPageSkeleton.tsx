import { Skeleton } from "@/components/ui/skeleton"
import { PageHeaderSkeleton } from "@/components/feedback/PageHeaderSkeleton"

export function AppPageSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />

      <div
        className="mx-auto max-w-6xl space-y-8 px-6 py-8 lg:px-8"
        aria-busy
        aria-label="Loading page"
      >
        <Skeleton className="h-28 w-full rounded-xl" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl" />
            ))}
          </div>
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    </>
  )
}
