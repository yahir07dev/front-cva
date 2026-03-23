export default function LoadingRoles() {
  return (
    <div className="h-[100dvh] md:h-full flex flex-col p-0 pb-20 md:p-6 lg:p-8 overflow-hidden">
      <div className="flex-1 min-h-0 bg-[#fafafa] dark:bg-[#0a0a0a] md:rounded-3xl overflow-hidden md:border border-neutral-200 dark:border-white/[0.06] shadow-sm relative flex flex-col">
        
        {/* Header Skeleton */}
        <header className="px-6 pt-8 pb-6 sm:px-10 shrink-0 border-b border-neutral-100 dark:border-white/[0.06] bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-40 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                <div className="h-3 w-32 bg-neutral-200/50 dark:bg-neutral-800/50 rounded animate-pulse" />
              </div>
            </div>
            <div className="w-24 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
          </div>
          
          <div className="mt-5 max-w-xs h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
        </header>

        {/* Grid Skeleton */}
        <div className="flex-1 p-6 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-36 bg-white dark:bg-[#111111] rounded-2xl border border-neutral-100 dark:border-white/[0.07] animate-pulse" />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}