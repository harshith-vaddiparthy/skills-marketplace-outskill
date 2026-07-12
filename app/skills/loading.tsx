import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* header */}
      <div className="max-w-2xl">
        <Skeleton className="h-9 w-56 sm:h-10 sm:w-72" />
        <Skeleton className="mt-3 h-4 w-full max-w-lg" />
        <Skeleton className="mt-2 h-4 w-2/3 max-w-sm" />
      </div>

      <div className="mt-10">
        {/* search + sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg sm:w-56" />
        </div>

        {/* category chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[16, 24, 20, 28, 18, 22].map((w, i) => (
            <Skeleton
              key={i}
              className="h-8 rounded-full"
              style={{ width: `${w * 4}px` }}
            />
          ))}
        </div>

        {/* results count */}
        <Skeleton className="mt-6 h-4 w-24" />

        {/* card grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>

      <Skeleton className="mt-4 h-5 w-2/3" />
      <Skeleton className="mt-2.5 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-4/5" />

      <div className="mt-4 flex items-center gap-3 border-t border-border/70 pt-4">
        <Skeleton className="size-7 rounded-full" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-1.5 h-3 w-16" />
        </div>
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  );
}
