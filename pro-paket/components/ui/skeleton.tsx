import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-lg bg-gradient-to-r from-white/[0.06] via-white/[0.11] to-white/[0.06]",
        className,
      )}
    />
  );
}

export function SectionSkeleton() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-28" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 lg:col-span-2" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
