'use client'

export default function SkeletonLoader({ type = 'grid' }: { type?: 'grid' | 'list' }) {
  if (type === 'list') {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-muted/40 rounded-2xl w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-48 bg-muted/40 rounded-3xl w-full" />
      ))}
    </div>
  )
}