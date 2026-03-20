export default function LoadingComentarios() {
  return (
    <div className="h-[100dvh] md:h-full flex flex-col p-0 pb-30 md:p-6 lg:p-8 overflow-hidden">
      
      {/* HEADER OCULTO EN MÓVIL */}
      <div className="hidden md:block flex-none mb-6">
        <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-96 bg-neutral-200/70 dark:bg-neutral-800/70 rounded-md animate-pulse" />
      </div>

      {/* Contenedor Principal (Simula la división del chat) */}
      <div className="flex-1 flex min-h-0 bg-white dark:bg-neutral-900 md:rounded-2xl overflow-hidden md:border border-neutral-200 dark:border-0 shadow-sm">
        
        {/* Skeleton Lista Empleados (Sidebar) */}
        <div className="hidden md:flex flex-col w-80 lg:w-96 border-r border-neutral-100 dark:border-neutral-800">
          <div className="h-[72px] border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 animate-pulse" />
          <div className="flex-1 p-4 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="h-10 w-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton Chat Area */}
        <div className="flex-1 flex flex-col bg-neutral-50/50 dark:bg-black/20">
          {/* Header */}
          <div className="h-14 border-b border-neutral-100 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 animate-pulse" />
          
          {/* Stats */}
          <div className="h-24 md:h-32 px-4 md:px-6 py-4 md:py-6 flex gap-4">
             <div className="flex-1 rounded-2xl bg-neutral-200/50 dark:bg-neutral-800/50 animate-pulse" />
             <div className="flex-1 rounded-2xl bg-neutral-200/50 dark:bg-neutral-800/50 animate-pulse" />
             <div className="flex-1 rounded-2xl bg-neutral-200/50 dark:bg-neutral-800/50 animate-pulse" />
          </div>

          {/* Mensajes fantasma */}
          <div className="flex-1 p-4 space-y-6">
            <div className="flex gap-4 w-3/4">
               <div className="h-10 w-10 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse shrink-0" />
               <div className="h-24 w-full rounded-2xl bg-neutral-200/70 dark:bg-neutral-800/70 animate-pulse" />
            </div>
            <div className="flex gap-4 w-3/4 ml-auto flex-row-reverse">
               <div className="h-10 w-10 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse shrink-0" />
               <div className="h-16 w-full rounded-2xl bg-neutral-200/70 dark:bg-neutral-800/70 animate-pulse" />
            </div>
          </div>
          
          {/* Input Falso */}
          <div className="h-24 bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 animate-pulse" />
        </div>
      </div>
    </div>
  )
}