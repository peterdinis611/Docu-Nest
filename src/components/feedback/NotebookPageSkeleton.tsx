import { Skeleton } from "@/components/ui/skeleton"

export function NotebookPageSkeleton() {
  return (
    <div
      className="flex h-screen flex-col overflow-hidden bg-background"
      aria-busy
      aria-label="Loading notebook"
    >
      <div className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="h-4 w-40" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="w-72 shrink-0 border-r p-4">
          <Skeleton className="mb-4 h-9 w-full rounded-md" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-6">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4">
            <Skeleton className="h-16 w-3/4 rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="mt-auto h-12 w-full rounded-xl" />
          </div>
        </div>

        <div className="w-80 shrink-0 border-l p-4">
          <Skeleton className="mb-4 h-5 w-24" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
