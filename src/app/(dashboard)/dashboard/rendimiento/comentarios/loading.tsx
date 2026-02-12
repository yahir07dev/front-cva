'use client'

export default function Loading() {
  return (
    <div className="h-[calc(100vh-theme(spacing.32))] flex bg-background rounded-2xl shadow-card border border-border overflow-hidden animate-pulse">
      
      {/* Sidebar (Lista de empleados) - Oculto en móvil */}
      <div className="hidden md:block w-80 lg:w-96 border-r border-border bg-card p-4 space-y-4">
        {/* Buscador */}
        <div className="h-10 bg-hover-bg rounded-xl mb-6" />
        
        {/* Lista de Empleados */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <div className="h-12 w-12 bg-hover-bg rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-hover-bg rounded" />
              <div className="h-3 w-16 bg-hover-bg/60 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Chat Area Principal */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header Chat */}
        <div className="h-20 bg-card border-b border-border/60 flex items-center px-6 gap-4">
           <div className="h-10 w-10 rounded-full bg-hover-bg" />
           <div className="flex flex-col gap-2">
             <div className="h-5 w-32 bg-hover-bg rounded" />
             <div className="h-3 w-24 bg-hover-bg/60 rounded" />
           </div>
        </div>

        {/* Área de Mensajes */}
        <div className="flex-1 p-6 space-y-6 overflow-hidden">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="bg-card h-36 rounded-2xl p-5 border border-border shadow-sm">
               <div className="flex justify-between items-start mb-4">
                 <div className="flex gap-3">
                   <div className="h-10 w-10 rounded-full bg-hover-bg" />
                   <div className="space-y-2">
                     <div className="h-4 w-28 bg-hover-bg rounded" />
                     <div className="h-3 w-40 bg-hover-bg/60 rounded" />
                   </div>
                 </div>
                 <div className="h-6 w-20 bg-hover-bg/40 rounded-lg" />
               </div>
               
               <div className="space-y-2 pl-[52px]">
                 <div className="h-4 w-full bg-hover-bg/30 rounded" />
                 <div className="h-4 w-3/4 bg-hover-bg/30 rounded" />
               </div>
             </div>
           ))}
        </div>

        {/* Input Area (Footer) */}
        <div className="p-4 bg-card border-t border-border/60">
           <div className="h-12 w-full bg-hover-bg/40 rounded-xl" />
        </div>
      </div>
    </div>
  )
}