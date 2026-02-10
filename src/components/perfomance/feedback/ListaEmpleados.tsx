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

  // Lógica de filtrado local para respuesta inmediata
  const empleadosFiltrados = empleados.filter(emp => {
    const nombreCompleto = `${emp.nombre} ${emp.apellidos}`.toLowerCase()
    return nombreCompleto.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a1d29] border-r border-gray-100 dark:border-gray-800/50 w-full md:w-80 lg:w-96 shrink-0 transition-all duration-300">
      
      {/* Header Buscador */}
      <div className="flex-none p-5 pb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Feedback</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar empleado..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 dark:bg-[#0f1117] rounded-xl py-3 pl-10 pr-4 text-sm outline-none text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500/50 transition-all border border-transparent focus:border-orange-500/30"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
        
        {loading ? (
          // Skeleton loader simple
          [1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
          ))
        ) : empleadosFiltrados.length === 0 ? (
          // Estado Vacío
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-center px-4">
            <UserX size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No se encontraron empleados</p>
          </div>
        ) : (
          // Lista Real
          empleadosFiltrados.map(emp => {
            const isSelected = selectedId === emp.id
            // Manejo robusto del rol (array u objeto)
            const rolData = emp.roles || emp.rol
            const rolNombre = Array.isArray(rolData) ? rolData[0]?.nombre : rolData?.nombre
            
            return (
              <button
                key={emp.id}
                onClick={() => onSelect(emp)}
                className={`
                  w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left group border border-transparent
                  ${isSelected 
                    ? 'bg-orange-500 shadow-lg shadow-orange-500/20 text-white' 
                    : 'hover:bg-gray-50 dark:hover:bg-[#2d3142] border-transparent hover:border-gray-100 dark:hover:border-gray-700/50'
                  }
                `}
              >
                {/* Avatar / Iniciales */}
                <div className={`
                  h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-transform group-hover:scale-105 shrink-0
                  ${isSelected 
                    ? 'bg-white/20 text-white backdrop-blur-sm' 
                    : 'bg-gray-100 text-gray-600 dark:bg-[#0f1117] dark:text-gray-400'
                  }
                `}>
                  {emp.nombre?.[0]}{emp.apellidos?.[0]}
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0">
                  <span className={`font-semibold truncate block text-sm ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {emp.nombre} {emp.apellidos}
                  </span>
                  <p className={`text-xs truncate flex items-center gap-1.5 mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
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