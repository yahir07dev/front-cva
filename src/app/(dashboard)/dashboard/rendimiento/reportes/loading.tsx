export default function LoadingReportes() {
  return (
    <div className="h-[100dvh] md:h-full flex flex-col p-0 pb-20 md:p-6 lg:p-8 overflow-hidden">
      <div className="flex-1 min-h-0 bg-white dark:bg-neutral-900 md:rounded-3xl overflow-hidden md:border border-neutral-200 dark:border-0 shadow-sm flex flex-col">
        
        {/* Header Skeleton */}
        <div className="flex-none px-4 py-4 sm:px-8 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
              <div className="hidden md:block h-4 w-96 bg-neutral-200/70 dark:bg-neutral-800/70 rounded-md animate-pulse" />
            </div>
            <div className="h-10 w-48 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          </div>
        </div>

        {/* Body Skeleton */}
        <div className="flex-1 p-4 sm:p-8 space-y-6 md:space-y-8">
          
          {/* Stats Carousel */}
          <div className="flex gap-4 overflow-hidden">
             {[1, 2, 3].map(i => (
               <div key={i} className="min-w-[240px] h-[104px] rounded-2xl bg-neutral-200/50 dark:bg-neutral-800/50 animate-pulse" />
             ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
             {/* Chart Skeleton */}
             <div className="xl:col-span-2 h-[350px] md:h-[450px] rounded-3xl bg-neutral-200/30 dark:bg-neutral-800/30 animate-pulse" />
             
             {/* Ranking List Skeleton */}
             <div className="h-[450px] rounded-3xl bg-neutral-200/30 dark:bg-neutral-800/30 animate-pulse p-5">
                <div className="h-6 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded-lg mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded" />
                        <div className="h-3 w-1/4 bg-neutral-200 dark:bg-neutral-700 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}