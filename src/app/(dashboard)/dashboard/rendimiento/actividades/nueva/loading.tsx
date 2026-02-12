'use client'

export default function Loading() {
  return (
    <div className="h-full flex flex-col bg-background p-4 sm:p-8 animate-pulse">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-10 w-10 rounded-full bg-hover-bg" />
        <div className="space-y-2">
          <div className="h-6 w-32 bg-hover-bg rounded-lg" />
          <div className="h-4 w-48 bg-hover-bg/60 rounded-lg" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna Izquierda (Inputs) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card h-[300px] rounded-3xl p-6 border border-border shadow-card">
            <div className="h-8 w-24 bg-hover-bg rounded-lg mb-6" />
            <div className="space-y-4">
              <div className="h-12 w-full bg-hover-bg/40 rounded-xl" />
              <div className="h-32 w-full bg-hover-bg/40 rounded-xl" />
            </div>
          </div>
          {/* Bloque inferior */}
          <div className="h-24 w-full bg-card rounded-3xl border border-border shadow-card" />
        </div>

        {/* Columna Derecha (Config) */}
        <div className="space-y-6">
          <div className="bg-card h-[400px] rounded-3xl p-6 border border-border shadow-card">
             <div className="h-8 w-24 bg-hover-bg rounded-lg mb-6" />
             <div className="space-y-4">
               <div className="h-12 w-full bg-hover-bg/40 rounded-xl" />
               <div className="h-12 w-full bg-hover-bg/40 rounded-xl" />
               <div className="h-12 w-full bg-hover-bg/40 rounded-xl" />
             </div>
          </div>
          {/* Botón de acción inferior */}
        </div>
      </div>
    </div>
  )
}