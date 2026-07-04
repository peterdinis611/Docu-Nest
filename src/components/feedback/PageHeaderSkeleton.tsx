import { Skeleton } from "@/components/ui/skeleton"

interface PageHeaderSkeletonProps {
  showAction?: boolean
}

export function PageHeaderSkeleton({ showAction = true }: PageHeaderSkeletonProps) {
  return (
    <div className="sticky top-0 z-20 border-b bg-background px-6 py-4 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-7 w-48 max-w-full" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        {showAction && <Skeleton className="h-9 w-36 shrink-0" />}
      </div>
    </div>
  )
}
