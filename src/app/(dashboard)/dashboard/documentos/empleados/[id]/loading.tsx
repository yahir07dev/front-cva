export default function LoadingExpedienteDetalle() {
  return (
    <div className="w-full h-full flex flex-col min-h-0 space-y-8 pb-4">
      {/* Header Skeleton */}
      <header className="shrink-0 w-full bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50 rounded-[32px] p-6 md:p-10 shadow-sm animate-pulse">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
            <div>
              <div className="h-6 sm:h-8 w-48 sm:w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg mb-2"></div>
              <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-md"></div>
            </div>
          </div>
          <div className="h-16 w-full sm:w-64 bg-neutral-200 dark:bg-neutral-800 rounded-3xl"></div>
        </div>
      </header>

      {/* Grid Documentos Skeleton */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-5 sm:p-6 bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50 rounded-[28px] animate-pulse h-40 flex flex-col justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>
                <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-md"></div>
              </div>
              <div className="h-10 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl"></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}