'use client'

import { Users, Check } from 'lucide-react'
import Image from 'next/image'

interface SelectorEmpleadosProps {
  empleados: any[]
  asignados: string[]
  onToggle: (id: string) => void
}

export default function SelectorEmpleados({ empleados, asignados, onToggle }: SelectorEmpleadosProps) {
  
  const getInitials = (nombre: string, apellidos: string) => 
    `${nombre?.[0] || ''}${apellidos?.[0] || ''}`.toUpperCase()

  return (
    <div className="
      flex flex-col
      overflow-hidden rounded-[32px] 
      bg-white/40 dark:bg-transparent
      backdrop-blur-md 
      border border-neutral-200/50 dark:border-0
      transition-all duration-500
      h-[480px] /* Altura fija para el contenedor principal */
    ">
      {/* Header Fijo */}
      <div className="px-6 py-5 shrink-0 border-b border-neutral-200/20 dark:border-0 bg-transparent">
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
            <div className="flex h-6 items-center justify-center rounded-full bg-neutral-900 dark:bg-white px-3 text-[10px] font-bold text-white dark:text-black">
              {asignados.length} seleccionados
            </div>
          )}
        </div>
      </div>

      {/* 🚀 ZONA DE SCROLL CORREGIDA */}
      <div className="
        p-4 sm:p-6 
        flex-1 /* Ocupa el espacio restante */
        overflow-y-auto 
        scrollbar-thin 
        scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-800
        hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-700
      ">
        {empleados.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {empleados.map((emp) => {
              const isSelected = asignados.includes(emp.id.toString())
              const rolNombre = Array.isArray(emp.roles) ? emp.roles[0]?.nombre : emp.roles?.nombre
              const fotoUrl = emp.foto_perfil_url && emp.foto_perfil_url.trim() !== '' ? emp.foto_perfil_url : null;

              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => onToggle(emp.id.toString())}
                  className={`
                    group relative flex items-center gap-3 rounded-[24px] p-3 text-left transition-all duration-500
                    active:scale-[0.97]
                    ${isSelected 
                      ? 'bg-neutral-900 dark:bg-white border-transparent shadow-lg' 
                      : 'bg-white/50 dark:bg-transparent border border-neutral-200/30 dark:border-0 hover:bg-white/80 dark:hover:bg-white/[0.03]'
                    }
                  `}
                >
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
                        className={`object-cover transition-transform duration-500 group-hover:scale-110 ${isSelected ? 'opacity-80' : 'opacity-100'}`}
                        referrerPolicy="no-referrer" sizes="40px"
                      />
                    ) : (
                      <span>{getInitials(emp.nombre, emp.apellidos)}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-bold tracking-tight ${isSelected ? 'text-white dark:text-black' : 'text-neutral-800 dark:text-neutral-200'}`}>
                      {emp.nombre}
                    </p>
                    <p className={`truncate text-[11px] font-medium ${isSelected ? 'text-white/60 dark:text-black/50' : 'text-neutral-500 dark:text-neutral-500'}`}>
                      {rolNombre || 'Sin rol'}
                    </p>
                  </div>

                  <div className={`
                    flex h-6 w-6 items-center justify-center rounded-full transition-all duration-500
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
          <div className="flex flex-col items-center justify-center py-16 animate-pulse">
            <Users size={32} className="text-neutral-300 dark:text-neutral-800 mb-2" />
            <p className="text-xs font-medium text-neutral-400 dark:text-neutral-600 uppercase tracking-tighter">Cargando equipo...</p>
          </div>
        )}
      </div>
    </div>
  )
}