export default function LoadingAnaliticaAsistencia() {
  return (
    <div className="h-[100dvh] md:h-full flex flex-col p-0 pb-20 md:p-6 lg:p-8 overflow-hidden">
      <div className="flex-1 min-h-0 bg-neutral-50 dark:bg-neutral-950 md:rounded-3xl overflow-hidden md:border border-neutral-200 dark:border-neutral-800/60 shadow-sm relative flex flex-col">
        
        <div className="p-6 md:p-12 space-y-12 flex-1 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="h-12 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
              <div className="h-4 w-48 bg-neutral-200/70 dark:bg-neutral-800/70 rounded-md animate-pulse" />
            </div>
            <div className="h-10 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
          </div>

          {/* Cards Superiores */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="h-[400px] bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 animate-pulse" />
            <div className="h-[400px] bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 animate-pulse" />
            <div className="h-[400px] bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 animate-pulse" />
          </div>

          {/* Card Inferior */}
          <div className="h-64 bg-white dark:bg-neutral-900 rounded-[3rem] border border-neutral-100 dark:border-neutral-800 animate-pulse" />
        </div>

      </div>
    </div>
  )
}