'use client'

import { Search, Briefcase, UserX } from 'lucide-react'

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
      flex flex-col h-full 
      bg-neutral-50 dark:bg-neutral-950 
      text-neutral-900 dark:text-neutral-100 
      w-full md:w-80 lg:w-96 shrink-0 
      transition-all duration-300
      border-r border-neutral-200 dark:border-neutral-800/40
    ">
      
      {/* Header Buscador */}
      <div className="flex-none p-5 pb-3">
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">Feedback</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar empleado..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="
              w-full bg-white dark:bg-neutral-900/70 
              rounded-xl py-3 pl-10 pr-4 text-sm 
              outline-none text-neutral-900 dark:text-neutral-100 
              placeholder:text-neutral-500 
              focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/30 
              transition-all duration-200 border border-neutral-200 dark:border-neutral-800/40
              backdrop-blur-sm
            "
          />
        </div>
      </div>

      {/* Lista con scrollbar adaptativo */}
      <div className="
        flex-1 overflow-y-auto p-3 space-y-1.5 
        scrollbar-thin 
        scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700
        scrollbar-track-transparent
        hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-600
        scrollbar-thumb-rounded-full scrollbar-track-rounded-full
      ">
        
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-neutral-200 dark:bg-neutral-800/70" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800/70 rounded" />
                <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800/70 rounded" />
              </div>
            </div>
          ))
        ) : empleadosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-neutral-500 text-center px-4">
            <UserX size={32} className="mb-3 opacity-60" />
            <p className="text-sm">No se encontraron empleados</p>
          </div>
        ) : (
          empleadosFiltrados.map(emp => {
            const isSelected = selectedId === emp.id
            const rolData = emp.roles || emp.rol
            const rolNombre = Array.isArray(rolData) ? rolData[0]?.nombre : rolData?.nombre
            
            // Verificación de foto
            const fotoUrl = emp.foto_perfil_url && emp.foto_perfil_url.trim() !== '' 
                ? emp.foto_perfil_url 
                : null;

            return (
              <button
                key={emp.id}
                onClick={() => onSelect(emp)}
                className={`
                  w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-200 text-left group
                  ${isSelected 
                    ? 'bg-orange-600/10 dark:bg-orange-600/30 ring-1 ring-orange-500/40 shadow-md shadow-orange-600/10 text-orange-950 dark:text-white' 
                    : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-900/70 text-neutral-700 dark:text-neutral-200 hover:ring-1 hover:ring-neutral-300 dark:hover:ring-neutral-700/50'
                  }
                `}
              >
                {/* Avatar: Foto o Iniciales */}
                <div className={`
                  h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-transform group-hover:scale-105 shrink-0 overflow-hidden
                  ${isSelected 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30' 
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-300 ring-1 ring-neutral-300 dark:ring-neutral-700/40'
                  }
                `}>
                  {fotoUrl ? (
                    <img 
                      src={fotoUrl} 
                      alt={emp.nombre} 
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ) : (
                    <span>{emp.nombre?.[0]}{emp.apellidos?.[0]}</span>
                  )}
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0">
                  <span className={`font-semibold truncate block text-sm ${isSelected ? 'text-orange-900 dark:text-white' : 'text-neutral-800 dark:text-neutral-100'}`}>
                    {emp.nombre} {emp.apellidos}
                  </span>
                  <p className={`text-xs truncate flex items-center gap-1.5 mt-0.5 ${isSelected ? 'text-orange-800/70 dark:text-white/80' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    <Briefcase size={12} /> 
                    {rolNombre || 'Sin rol'}
                  </p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}