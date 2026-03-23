export default function LoadingNotas() {
  return (
    <div className="h-[100dvh] md:h-full flex flex-col p-0 pb-20 md:p-6 lg:p-8 overflow-hidden">
      <div className="flex-1 min-h-0 bg-white dark:bg-neutral-900 md:rounded-3xl overflow-hidden md:border border-neutral-200 dark:border-0 shadow-sm relative flex flex-col">
        
        {/* Header Skeleton */}
        <div className="px-4 pt-6 pb-4 sm:px-8 shrink-0">
          <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse mb-4" />
          <div className="h-12 w-full bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
        </div>

        {/* Grid Notas Skeleton */}
        <div className="flex-1 overflow-hidden px-4 sm:px-8 pb-28">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
             {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
               <div key={i} className="aspect-square rounded-3xl bg-neutral-200/50 dark:bg-neutral-800/50 animate-pulse border border-neutral-100 dark:border-neutral-800" />
             ))}
           </div>
        </div>

      </div>
    </div>
  )
}