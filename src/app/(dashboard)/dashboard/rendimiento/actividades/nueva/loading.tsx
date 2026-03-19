export default function LoadingNuevaActividad() {
  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 font-sans">
      
      {/* 1. HEADER SKELETON */}
      <header className="flex-none sticky top-0 z-20 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-0 px-4 py-4 sm:px-8">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Botón Atrás */}
            <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse shrink-0" />
            <div className="space-y-2">
              {/* Título */}
              <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
              {/* Subtítulo */}
              <div className="hidden sm:block h-3 w-48 bg-neutral-200/70 dark:bg-neutral-800/70 rounded-md animate-pulse" />
            </div>
          </div>
          
          {/* Botón Guardar */}
          <div className="h-10 w-32 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse shrink-0" />
        </div>
      </header>

      {/* 2. BODY SKELETON */}
      <main className="flex-1 overflow-hidden px-4 py-8 sm:px-6 lg:px-10 pb-40">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* COLUMNA IZQUIERDA (Detalles y Empleados) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Box: Detalles */}
              <section className="space-y-6 bg-white/40 dark:bg-white/[0.02] rounded-[32px] p-6 border border-neutral-200/50 dark:border-white/5">
                {/* Título de sección */}
                <div className="flex items-center gap-3 pb-2">
                  <div className="h-5 w-5 rounded-md bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
                </div>
                
                <div className="space-y-6">
                  {/* Input Título */}
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
                    <div className="h-[52px] w-full bg-neutral-200/70 dark:bg-neutral-800/70 rounded-2xl animate-pulse" />
                  </div>

                  {/* Textarea Instrucciones */}
                  <div className="space-y-2">
                    <div className="h-3 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
                    <div className="h-[132px] w-full bg-neutral-200/70 dark:bg-neutral-800/70 rounded-2xl animate-pulse" />
                  </div>

                  {/* Input Upload Foto */}
                  <div className="space-y-2">
                    <div className="h-3 w-40 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
                    <div className="h-[140px] w-full bg-neutral-200/70 dark:bg-neutral-800/70 rounded-2xl animate-pulse border-2 border-dashed border-neutral-200 dark:border-neutral-800" />
                  </div>
                </div>
              </section>

              {/* Box: Selector Empleados */}
              <div className="h-[520px] rounded-3xl bg-white/40 dark:bg-white/[0.02] border border-neutral-200/50 dark:border-white/5 flex flex-col p-6">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
                        <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
                      </div>
                    </div>
                 </div>
                 {/* Buscador */}
                 <div className="h-[42px] w-full bg-neutral-200/70 dark:bg-neutral-800/70 rounded-xl animate-pulse mb-6" />
                 
                 {/* Lista Fantasma */}
                 <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-200/40 dark:bg-neutral-800/40 animate-pulse">
                        <div className="h-10 w-10 rounded-xl bg-neutral-200 dark:bg-neutral-700 shrink-0" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
                          <div className="h-3 w-1/4 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* COLUMNA DERECHA (Configuración) */}
            <aside className="space-y-8">
              <section className="bg-white/40 dark:bg-white/[0.02] rounded-[32px] p-6 border border-neutral-200/50 dark:border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-5 w-5 rounded-md bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
                </div>

                <div className="space-y-8">
                  {/* Prioridad */}
                  <div className="space-y-4">
                    <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-[72px] rounded-2xl bg-neutral-200/70 dark:bg-neutral-800/70 animate-pulse" />
                      ))}
                    </div>
                  </div>

                  {/* Calendario */}
                  <div className="space-y-4">
                    <div className="h-3 w-28 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
                    <div className="h-[72px] w-full rounded-[28px] bg-neutral-200/70 dark:bg-neutral-800/70 animate-pulse" />
                  </div>

                  {/* Alerta Info */}
                  <div className="h-[52px] w-full rounded-2xl bg-neutral-200/50 dark:bg-neutral-800/50 animate-pulse" />
                </div>
              </section>
            </aside>

          </div>
        </div>
      </main>

    </div>
  )
}