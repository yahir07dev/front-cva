'use client'

export default function Loading() {
  return (
    <div className="h-full flex flex-col bg-background px-4 py-6 sm:px-8 space-y-6 animate-pulse">
      
      {/* Header y Buscador */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-3">
           <div className="h-8 w-48 bg-hover-bg rounded-lg" />
           <div className="h-4 w-32 bg-hover-bg/60 rounded-lg" />
        </div>
        <div className="flex gap-2">
            <div className="h-10 w-32 bg-hover-bg rounded-xl" />
            <div className="h-10 w-32 bg-hover-bg rounded-xl" />
        </div>
      </div>

      {/* Tabs */}
      <div className="h-10 w-full max-w-md bg-hover-bg rounded-xl" />

      {/* Lista de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="bg-card p-5 rounded-2xl border border-border h-48 flex flex-col justify-between shadow-card"
          >
            <div className="flex justify-between items-start">
               <div className="h-6 w-3/4 bg-hover-bg rounded-lg" />
               <div className="h-6 w-6 bg-hover-bg rounded-full" />
            </div>
            
            <div className="space-y-2">
                <div className="h-4 w-full bg-hover-bg/40 rounded" />
                <div className="h-4 w-2/3 bg-hover-bg/40 rounded" />
            </div>
            
            <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full bg-hover-bg" />
                    <div className="h-8 w-8 rounded-full bg-hover-bg -ml-4 border-2 border-card" />
                </div>
                <div className="h-8 w-24 bg-hover-bg rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}