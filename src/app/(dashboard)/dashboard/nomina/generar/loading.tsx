export default function LoadingGenerarNomina() {
  return (
    <div className="h-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full mx-auto flex flex-col h-[calc(100vh-8rem)] pb-4 sm:pb-8 relative">
        
        {/* Header Skeleton */}
        <div className="shrink-0 w-full bg-white/80 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/50 rounded-[24px] sm:rounded-[32px] p-4 sm:p-5 md:p-6 mb-4 md:mb-6">
           <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 w-full">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full lg:w-1/2">
                 <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                    <div className="h-[46px] sm:h-[52px] w-full bg-neutral-200/50 dark:bg-neutral-800/50 rounded-2xl animate-pulse" />
                 </div>
                 <div className="h-[46px] sm:h-[52px] w-[140px] bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse shrink-0" />
              </div>
           </div>
        </div>

        {/* Tabla Skeleton */}
        <div className="flex-1 rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/40 dark:border-neutral-800/50 flex flex-col overflow-hidden">
           <div className="h-12 bg-white/95 dark:bg-neutral-900/95 border-b border-neutral-200/40 dark:border-neutral-800/50 animate-pulse" />
           <div className="flex-1 p-4 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 w-full bg-neutral-200/30 dark:bg-neutral-800/30 rounded-xl animate-pulse" />
              ))}
           </div>
           <div className="h-[88px] bg-neutral-100/80 dark:bg-neutral-950/80 border-t border-neutral-200/40 dark:border-neutral-800/50 animate-pulse" />
        </div>
      </div>
    </div>
  )
}