'use client'

import { Search, UserX } from 'lucide-react'
import Image from 'next/image'

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
    <div className="flex flex-col h-full w-full bg-white dark:bg-neutral-950 md:w-80 lg:w-96 shrink-0 transition-all duration-300 md:border-r border-neutral-100 dark:border-neutral-800/50">
      
      {/* Header Buscador (Compacto y Sticky) */}
      <div className="flex-none px-4 py-4 md:p-5 sticky top-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl z-10 border-b border-neutral-50 dark:border-white/5">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight">Feedback</h2>
        
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

      {/* Lista de Empleados */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-hide">
        {loading ? (
          [1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-xl animate-pulse">
              <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-neutral-100 dark:bg-neutral-800 rounded" />
                <div className="h-2 w-16 bg-neutral-100 dark:bg-neutral-800 rounded" />
              </div>
            </div>
          ))
        ) : empleadosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <UserX size={24} className="mb-2 opacity-50" />
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
                  w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 text-left group
                  ${isSelected 
                    ? 'bg-neutral-900 dark:bg-white shadow-md transform scale-[1.02]' 
                    : 'hover:bg-neutral-50 dark:hover:bg-white/5 active:scale-[0.98]'
                  }
                `}
              >
                {/* Avatar */}
                <div className="relative h-10 w-10 flex-shrink-0">
                  <div className={`
                    absolute inset-0 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold transition-all
                    ${isSelected 
                      ? 'bg-neutral-800 text-white ring-2 ring-neutral-700 dark:bg-neutral-200 dark:text-black dark:ring-white' 
                      : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                    }
                  `}>
                    {fotoUrl ? (
                      <Image 
                        src={fotoUrl} 
                        alt={emp.nombre} 
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <span>{emp.nombre?.[0]}{emp.apellidos?.[0]}</span>
                    )}
                  </div>
                  
                  {/* Indicador de Selección (Punto) */}
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500 border-2 border-white dark:border-black"></span>
                    </span>
                  )}
                </div>

                {/* Texto */}
                <div className="flex-1 min-w-0">
                  <span className={`
                    block text-sm font-bold truncate transition-colors
                    ${isSelected ? 'text-white dark:text-black' : 'text-neutral-900 dark:text-neutral-200'}
                  `}>
                    {emp.nombre} {emp.apellidos}
                  </span>
                  <p className={`
                    text-[11px] truncate mt-0.5 font-medium transition-colors
                    ${isSelected ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-500 dark:text-neutral-500'}
                  `}>
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