export function Skeleton({ className = '' }) {
  return (
    <div className={`bg-card/50 rounded-lg animate-pulse ${className}`} />
  )
}

export function TrackRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-3 py-2.5">
      <Skeleton className="w-8 h-4" />
      <Skeleton className="w-12 h-12" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-10" />
    </div>
  )
}

export function TrackListSkeleton({ count = 6 }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <TrackRowSkeleton key={i} />
      ))}
    </div>
  )
}

export function PlaylistCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square rounded-2xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}
