export default function LoadingActividades() {
  return (
    // Contenedor principal que coincide exactamente con page.tsx
    <div className="h-full flex flex-col min-h-0 w-full px-4 sm:px-6 lg:px-8">
      
      {/* 1. SECCIÓN SUPERIOR (Header y Filtros) */}
      <div className="flex-none mb-2 z-20 relative pt-1">
        
        {/* Skeleton del DateHeader */}
        <div className="flex items-center gap-2 mb-2 px-2">
          <div className="h-8 w-40 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse"></div>
        </div>

        {/* Skeleton del ActividadesHeader */}
        <div className="w-full bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50 rounded-3xl p-6 mt-1 backdrop-blur-sm">
          
          {/* Botón Nueva Actividad */}
          <div className="flex flex-col items-center gap-3">
            <div className="h-11 w-full max-w-xs bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse"></div>
          </div>

          {/* Carrusel de Estadísticas */}
          <div className="flex gap-4 mt-6 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[140px] flex-1 h-20 bg-neutral-200/70 dark:bg-neutral-800/70 rounded-2xl animate-pulse"></div>
            ))}
          </div>

          {/* Botones de Filtro */}
          <div className="flex gap-2 mt-5 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 w-24 bg-neutral-200/70 dark:bg-neutral-800/70 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN INFERIOR (Grid de Tarjetas) */}
      <div className="flex-1 overflow-hidden pt-1 pr-2">
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {/* Renderizamos 6 tarjetas fantasma para llenar la pantalla */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="flex flex-col justify-between w-full p-5 rounded-[32px] min-h-[340px] bg-white/40 dark:bg-white/[0.02] border border-neutral-200/50 dark:border-white/5"
            >
              {/* Card Header (Pills) */}
              <div className="flex justify-between mb-4">
                <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse"></div>
                <div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse"></div>
              </div>

              {/* Card Body (Text & Image) */}
              <div className="flex-1 space-y-3 mb-4">
                {/* Título */}
                <div className="h-6 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse"></div>
                {/* Descripción */}
                <div className="space-y-2">
                  <div className="h-3 w-full bg-neutral-200/70 dark:bg-neutral-800/70 rounded-md animate-pulse"></div>
                  <div className="h-3 w-5/6 bg-neutral-200/70 dark:bg-neutral-800/70 rounded-md animate-pulse"></div>
                </div>
                
                {/* Caja de Imagen */}
                <div className="h-24 w-full sm:w-44 bg-neutral-200/70 dark:bg-neutral-800/70 rounded-2xl mt-4 animate-pulse"></div>
                
                {/* Footer del body (Avatares y Fecha) */}
                <div className="flex items-center justify-between pt-3 mt-4">
                  <div className="flex -space-x-2">
                    {[1, 2].map(a => (
                      <div key={a} className="h-7 w-7 rounded-full bg-neutral-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900 animate-pulse"></div>
                    ))}
                  </div>
                  <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse"></div>
                </div>
              </div>

              {/* Card Footer (Botones de acción) */}
              <div className="grid grid-cols-4 gap-2 pt-4 border-t border-neutral-100 dark:border-white/5">
                {[1, 2, 3, 4].map(btn => (
                  <div key={btn} className="h-11 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}