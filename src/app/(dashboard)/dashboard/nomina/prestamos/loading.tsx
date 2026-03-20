export default function LoadingPrestamos() {
  return (
    <div className="h-full p-4 sm:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 overflow-hidden flex flex-col">
      {/* Header Skeleton */}
      <div className="flex-none mb-6">
         <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse mb-3" />
         <div className="h-4 w-72 bg-neutral-200/70 dark:bg-neutral-800/70 rounded-md animate-pulse mb-8" />
         
         <div className="flex gap-4">
            <div className="h-24 w-40 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-2xl animate-pulse" />
            <div className="h-24 w-40 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-2xl animate-pulse" />
            <div className="h-24 w-40 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-2xl animate-pulse hidden sm:block" />
         </div>
      </div>

      {/* Tabs y Buscador Skeleton */}
      <div className="flex-none flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="h-12 w-full md:w-64 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
        <div className="h-12 w-full md:w-80 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
      </div>

      {/* Tarjetas Skeleton */}
      <div className="flex-1 space-y-5">
        {[1, 2, 3].map(i => (
           <div key={i} className="h-32 w-full rounded-[28px] bg-neutral-200/50 dark:bg-neutral-900/50 animate-pulse border border-neutral-200/50 dark:border-neutral-800" />
        ))}
      </div>
    </div>
  )
}