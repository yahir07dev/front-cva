'use client'

import { useState } from 'react'
import { Users, Check, Search, Building2 } from 'lucide-react'
import Image from 'next/image'

interface SelectorEmpleadosProps {
  empleados: any[]
  asignados: string[]
  onToggle: (id: string) => void
}

export default function SelectorEmpleados({ empleados, asignados, onToggle }: SelectorEmpleadosProps) {
  
  const [searchTerm, setSearchTerm] = useState('')

  const getInitials = (nombre: string, apellidos: string) => 
    `${nombre?.[0] || ''}${apellidos?.[0] || ''}`.toUpperCase()

  /**
   * 🛠️ HELPER UNIVERSAL PARA OBTENER EL ÁREA
   * Supabase a veces devuelve relaciones 1:1 como objetos { nombre: '...' }
   * y a veces como arrays [{ nombre: '...' }] dependiendo de la versión/config.
   * Esta función maneja ambos casos para que nunca falle.
   */
  const getAreaName = (emp: any) => {
    if (!emp.areas) return '';
    // Si es array (ej: [{nombre: 'Sistemas'}])
    if (Array.isArray(emp.areas)) {
      return emp.areas[0]?.nombre || '';
    }
    // Si es objeto (ej: {nombre: 'Sistemas'})
    return emp.areas.nombre || '';
  }

  // 1. Filtrado usando el Helper (para que el buscador encuentre por área)
  const filteredEmpleados = empleados.filter(emp => {
    const nombreCompleto = `${emp.nombre} ${emp.apellidos}`.toLowerCase()
    const area = getAreaName(emp).toLowerCase() // <--- Usamos el helper aquí
    const term = searchTerm.toLowerCase()
    
    return nombreCompleto.includes(term) || area.includes(term)
  })

  return (
    <div className="
      flex flex-col
      overflow-hidden rounded-[32px] 
      bg-white/40 dark:bg-transparent
      backdrop-blur-md 
      border border-neutral-200/50 dark:border-0
      transition-all duration-500
      h-[520px]
    ">
      {/* Header Fijo con Buscador */}
      <div className="px-6 pt-5 pb-3 shrink-0 border-b border-neutral-200/20 dark:border-0 bg-transparent flex flex-col gap-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 dark:bg-orange-600/15">
              <Users size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                Asignar equipo
              </h2>
              <p className="text-xs font-medium text-neutral-500">Selecciona responsables</p>
            </div>
          </div>
          {asignados.length > 0 && (
            <div className="flex h-6 items-center justify-center rounded-full bg-neutral-900 dark:bg-white px-3 text-[10px] font-bold text-white dark:text-black animate-in zoom-in">
              {asignados.length}
            </div>
          )}
        </div>

        {/* Buscador */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-orange-500 transition-colors" size={16} />
          <input 
            type="text"
            placeholder="Buscar por nombre o área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full pl-10 pr-4 py-2.5 
              rounded-xl bg-white/50 dark:bg-neutral-800/50 
              border border-neutral-200/50 dark:border-0
              text-sm font-medium text-neutral-900 dark:text-white
              placeholder:text-neutral-400
              outline-none focus:ring-2 focus:ring-orange-500/20
              transition-all
            "
          />
        </div>
      </div>

      {/* Lista de Empleados */}
      <div className="
        p-4 sm:p-6 
        flex-1 
        overflow-y-auto 
        scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-800
      ">
        {filteredEmpleados.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredEmpleados.map((emp) => {
              const isSelected = asignados.includes(emp.id.toString())
              
              // Datos seguros
              const rolNombre = Array.isArray(emp.roles) ? emp.roles[0]?.nombre : emp.roles?.nombre
              const areaNombre = getAreaName(emp) // <--- Usamos el helper aquí también
              const fotoUrl = emp.foto_perfil_url && emp.foto_perfil_url.trim() !== '' ? emp.foto_perfil_url : null;

              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => onToggle(emp.id.toString())}
                  className={`
                    group relative flex items-center gap-3 rounded-[24px] p-3 text-left transition-all duration-300
                    active:scale-[0.98]
                    ${isSelected 
                      ? 'bg-neutral-900 dark:bg-white border-transparent shadow-lg transform scale-[1.01]' 
                      : 'bg-white/50 dark:bg-white/[0.02] border border-neutral-200/30 dark:border-0 hover:bg-white/80 dark:hover:bg-white/[0.05]'
                    }
                  `}
                >
                  {/* Avatar */}
                  <div className={`
                    relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all overflow-hidden
                    ${isSelected
                      ? 'bg-white/20 text-white dark:bg-black/10 dark:text-black'
                      : 'bg-neutral-100 dark:bg-white/5 text-neutral-500 dark:text-neutral-400'
                    }
                  `}>
                    {fotoUrl ? (
                      <Image 
                        src={fotoUrl} alt={emp.nombre} fill 
                        className={`object-cover transition-transform duration-500 group-hover:scale-110 ${isSelected ? 'opacity-90' : 'opacity-100'}`}
                        sizes="40px"
                      />
                    ) : (
                      <span>{getInitials(emp.nombre, emp.apellidos)}</span>
                    )}
                  </div>

                  {/* Info Text */}
                  <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                    <p className={`truncate text-sm font-bold tracking-tight leading-tight ${isSelected ? 'text-white dark:text-black' : 'text-neutral-800 dark:text-neutral-200'}`}>
                      {emp.nombre} {emp.apellidos}
                    </p>
                    
                    {/* Rol y Área */}
                    <div className={`flex items-center gap-1.5 truncate text-[10px] font-medium ${isSelected ? 'text-white/70 dark:text-black/60' : 'text-neutral-500'}`}>
                      <span className="truncate">{rolNombre || 'Empleado'}</span>
                      {areaNombre && (
                        <>
                          <span className="opacity-50 shrink-0">•</span>
                          <span className="flex items-center gap-1 truncate text-orange-600 dark:text-orange-400/80">
                            <Building2 size={10} className="opacity-70 shrink-0" /> 
                            {areaNombre}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Check Icon */}
                  <div className={`
                    flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300
                    ${isSelected 
                      ? 'bg-white/20 dark:bg-black/10 text-white dark:text-black scale-100 opacity-100' 
                      : 'opacity-0 scale-50'
                    }
                  `}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          /* Estado vacío de búsqueda */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-white/5 flex items-center justify-center mb-3">
              <Search size={20} className="text-neutral-400" />
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">No se encontraron resultados</p>
            <p className="text-xs text-neutral-500">Prueba con otro nombre o área.</p>
          </div>
        )}
      </div>
    </div>
  )
}