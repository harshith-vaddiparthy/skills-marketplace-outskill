import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* header */}
      <div className="max-w-2xl">
        <Skeleton className="h-9 w-64 sm:h-10 sm:w-80" />
        <Skeleton className="mt-4 h-4 w-full max-w-md" />
        <Skeleton className="mt-2 h-4 w-3/4 max-w-sm" />
      </div>

      {/* card grid */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
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
