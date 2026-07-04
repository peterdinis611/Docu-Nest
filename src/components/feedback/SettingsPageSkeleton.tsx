import { Skeleton } from "@/components/ui/skeleton"
import { PageHeaderSkeleton } from "@/components/feedback/PageHeaderSkeleton"

export function SettingsPageSkeleton() {
  return (
    <>
      <PageHeaderSkeleton showAction={false} />

      <div
        className="mx-auto max-w-5xl px-6 py-8 lg:px-8"
        aria-busy
        aria-label="Loading settings"
      >
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-lg" />
            ))}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    </>
  )
}
