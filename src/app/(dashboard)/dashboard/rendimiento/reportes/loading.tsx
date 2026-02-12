'use client'

export default function Loading() {
  return (
    <div className="h-full flex flex-col bg-background px-4 py-6 sm:px-8 space-y-6 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-hover-bg rounded-lg" />
          <div className="h-4 w-40 bg-hover-bg/60 rounded-lg" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-hover-bg rounded-xl" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-card rounded-2xl shadow-card border border-border" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Skeleton (Columna Grande) */}
        <div className="lg:col-span-2 bg-card p-6 rounded-3xl shadow-card border border-border h-[400px]">
          <div className="h-6 w-48 bg-hover-bg rounded-lg mb-8" />
          <div className="h-64 w-full bg-hover-bg/30 rounded-2xl" />
        </div>

        {/* Ranking Skeleton (Columna Pequeña) */}
        <div className="bg-card p-6 rounded-3xl shadow-card border border-border h-[400px] flex flex-col">
          <div className="h-6 w-32 bg-hover-bg rounded-lg mb-8" />
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-hover-bg rounded-xl shrink-0" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-hover-bg rounded" />
                    <div className="h-3 w-20 bg-hover-bg/60 rounded" />
                  </div>
                </div>
                <div className="h-8 w-12 bg-hover-bg/40 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}