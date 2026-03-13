'use client'

import { Search, UserX } from 'lucide-react'

interface ListaEmpleadosProps {
  empleados: any[]
  selectedId: number | null
  onSelect: (emp: any) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  loading?: boolean
}

export default function ListaEmpleados({ 
  empleados, 
  selectedId, 
  onSelect, 
  searchTerm, 
  setSearchTerm,
  loading = false 
}: ListaEmpleadosProps) {

  const empleadosFiltrados = empleados.filter(emp => {
    const nombreCompleto = `${emp.nombre} ${emp.apellidos}`.toLowerCase()
    return nombreCompleto.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="
      flex flex-col h-full w-full bg-white dark:bg-neutral-950 
      md:w-80 lg:w-96 shrink-0 transition-all duration-300 
      md:border-r border-neutral-100 dark:border-neutral-800/50
      rounded-l-3xl md:rounded-none overflow-hidden
    ">
      
      {/* Header fijo con buscador (sticky) */}
      <div className="
        flex-none px-4 py-4 md:p-5 sticky top-0 
        bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl z-10 
        border-b border-neutral-50 dark:border-white/5
      ">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight">
          Feedback
        </h2>
        
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-neutral-400 group-focus-within:text-orange-500 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Buscar empleado..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="
              block w-full pl-10 pr-3 py-2.5 
              text-sm font-medium
              bg-neutral-100 dark:bg-neutral-900 
              border-transparent 
              text-neutral-900 dark:text-white 
              placeholder:text-neutral-500 
              rounded-xl 
              focus:outline-none focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-orange-500/20 focus:shadow-lg
              transition-all duration-200
            "
          />
        </div>
      </div>

      {/* Lista scrollable - ocupa todo el espacio restante */}
      <div className="
        flex-1 overflow-y-auto px-2 py-2 space-y-1 
        scrollbar-thin scrollbar-thumb-orange-300/50 dark:scrollbar-thumb-orange-700/50
        scrollbar-track-transparent hover:scrollbar-thumb-orange-400/70
      ">
        {loading ? (
          // Skeleton loading
          [1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-xl animate-pulse">
              <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-neutral-100 dark:bg-neutral-800 rounded" />
                <div className="h-2 w-16 bg-neutral-100 dark:bg-neutral-800 rounded" />
              </div>
            </div>
          ))
        ) : empleadosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 py-12">
            <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800/50 flex items-center justify-center mb-3">
              <UserX size={20} />
            </div>
            <p className="text-xs font-medium">Sin resultados</p>
          </div>
        ) : (
          empleadosFiltrados.map(emp => {
            const isSelected = selectedId === emp.id
            const rolNombre = Array.isArray(emp.roles) ? emp.roles[0]?.nombre : emp.roles?.nombre
            const fotoUrl = emp.foto_perfil_url && emp.foto_perfil_url.trim() !== '' ? emp.foto_perfil_url : null

            return (
              <button
                key={emp.id}
                onClick={() => onSelect(emp)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left group
                  ${isSelected 
                    ? 'bg-orange-600/10 border border-orange-500/30 shadow-sm transform scale-[1.01]' 
                    : 'hover:bg-orange-50 dark:hover:bg-orange-950/20 active:scale-[0.98]'}
                `}
              >
                {/* Avatar */}
                <div className={`
                  relative h-10 w-10 flex-shrink-0 rounded-xl overflow-hidden transition-all
                  ${isSelected 
                    ? 'ring-2 ring-orange-500/50 scale-105' 
                    : 'ring-1 ring-neutral-200/50 dark:ring-neutral-800/50 group-hover:ring-orange-400/40'}
                `}>
                  {fotoUrl ? (
                    /* 👇 AQUÍ ESTÁ EL CAMBIO: Usamos la etiqueta <img> nativa */
                    <img 
                      src={fotoUrl} 
                      alt={emp.nombre} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 uppercase">
                      {emp.nombre?.[0]}{emp.apellidos?.[0]}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <span className={`
                    block text-sm font-semibold truncate transition-colors
                    ${isSelected ? 'text-orange-700 dark:text-orange-300' : 'text-neutral-900 dark:text-neutral-100'}
                  `}>
                    {emp.nombre} {emp.apellidos}
                  </span>
                  <p className={`
                    text-[11px] truncate mt-0.5 font-medium transition-colors
                    ${isSelected ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-500 dark:text-neutral-500'}
                  `}>
                    {rolNombre || 'Sin rol'}
                  </p>
                </div>

                {/* Indicador selección (punto naranja) */}
                {isSelected && (
                  <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}