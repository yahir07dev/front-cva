import { CalendarDays, History } from 'lucide-react'

export default function LoadingHistorialNomina() {
  return (
    <div className="h-full px-4 sm:px-6 lg:px-8 py-6 w-full mx-auto flex flex-col min-h-0">
      
      <div className="shrink-0 mb-4 sm:mb-5 md:mb-6 space-y-4">
        {/* Cabecera Principal Skeleton */}
        <div className="flex items-center gap-3 sm:gap-4 bg-white/80 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/50 rounded-[24px] sm:rounded-[32px] p-4 sm:p-5 md:p-6 shadow-sm">
          <div className="h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-xl sm:rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0 animate-pulse">
            <History size={18} className="text-neutral-400 dark:text-neutral-600 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </div>
          <div className="space-y-2">
            <div className="h-6 sm:h-8 w-48 sm:w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
            <div className="h-3 sm:h-4 w-32 sm:w-48 bg-neutral-200/70 dark:bg-neutral-800/70 rounded-md animate-pulse" />
          </div>
        </div>

        {/* Barra de Filtros Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 bg-white/50 dark:bg-neutral-900/30 p-2 sm:p-3 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 animate-pulse">
          <div className="flex items-center justify-between gap-2 w-[120px] px-4 py-2.5 rounded-2xl bg-neutral-200 dark:bg-neutral-800 shrink-0 h-10" />
          <div className="hidden sm:block w-px h-8 bg-neutral-200 dark:bg-neutral-800" />
          <div className="flex gap-2 w-full overflow-hidden">
             {[1, 2, 3, 4, 5].map(i => (
               <div key={i} className="h-10 w-20 rounded-2xl bg-neutral-200 dark:bg-neutral-800 shrink-0" />
             ))}
          </div>
        </div>
      </div>

      {/* Lista Skeleton */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-6 space-y-3 sm:space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5 bg-white/60 dark:bg-neutral-900/40 border border-neutral-200/40 dark:border-neutral-800/40 p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl animate-pulse">
            <div className="flex items-center gap-4 sm:gap-8 flex-1">
               <div className="space-y-2">
                  <div className="h-2 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
               </div>
               <div className="h-10 w-px bg-neutral-200 dark:bg-neutral-700 hidden sm:block" />
               <div className="space-y-2 hidden sm:block">
                  <div className="h-2 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
               </div>
               <div className="h-10 w-px bg-neutral-200 dark:bg-neutral-700 hidden sm:block" />
               <div className="space-y-2 hidden sm:block">
                  <div className="h-2 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  <div className="h-5 w-28 bg-neutral-200 dark:bg-neutral-700 rounded" />
               </div>
            </div>
            <div className="h-10 w-full sm:w-36 bg-neutral-200 dark:bg-neutral-700 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}