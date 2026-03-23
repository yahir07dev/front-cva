export default function LoadingAreas() {
  return (
    <div className="h-full w-full overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-32 flex flex-col h-full space-y-6">
        
        {/* Encabezado Skeleton */}
        <div className="mb-6">
          <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-neutral-200/70 dark:bg-neutral-800/70 rounded-md animate-pulse" />
        </div>

        {/* Stats Skeleton */}
        <div className="px-6 pt-6">
           <div className="flex gap-4 overflow-hidden">
              <div className="h-24 w-48 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-2xl animate-pulse" />
              <div className="h-24 w-48 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-2xl animate-pulse" />
           </div>
        </div>

        {/* Buscador Skeleton */}
        <div className="py-4 px-6 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md">
           <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="h-10 w-full sm:max-w-md bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
              <div className="h-10 w-full sm:w-32 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
           </div>
        </div>

        {/* Grid Principal Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-6 pb-6 flex-1">
           {/* Assignment panel */}
           <div className="lg:col-span-4 order-1 lg:order-2 hidden lg:block">
              <div className="h-full min-h-[400px] w-full bg-neutral-200/50 dark:bg-neutral-900/50 rounded-3xl border border-neutral-200/50 dark:border-neutral-800 animate-pulse" />
           </div>
           
           {/* Cards grid */}
           <div className="lg:col-span-8 order-2 lg:order-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-40 w-full bg-neutral-200/50 dark:bg-neutral-900/50 rounded-3xl border border-neutral-200/50 dark:border-neutral-800 animate-pulse" />
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}