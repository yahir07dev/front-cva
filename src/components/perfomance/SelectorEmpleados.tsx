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
      overflow-hidden rounded-2xl 
      bg-white/80 dark:bg-neutral-900/40 
      border border-neutral-200/50 dark:border-neutral-800/30 
      backdrop-blur-md shadow-xl
      max-h-[500px] flex flex-col
    ">
      {/* Header */}
      <div className="border-b border-neutral-200/50 dark:border-neutral-800/30 px-5 py-4 bg-neutral-50/50 dark:bg-transparent shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="
              flex h-9 w-9 items-center justify-center rounded-xl 
              bg-orange-500/10 dark:bg-orange-500/20 ring-1 ring-orange-500/20
            ">
              <Users size={18} className="text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
              Asignar equipo
            </h2>
          </div>
          {asignados.length > 0 && (
            <div className="
              flex h-6 items-center justify-center rounded-full 
              bg-orange-600 px-2.5 text-xs font-bold text-white 
              shadow-lg shadow-orange-600/20
            ">
              {asignados.length}
            </div>
          )}
        </div>
      </div>

      {/* Lista con scrollbar */}
      <div className="
        p-4 sm:p-5 
        overflow-y-auto 
        scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700
      ">
        {empleados.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {empleados.map((emp) => {
              const isSelected = asignados.includes(emp.id.toString())
              const rolNombre = Array.isArray(emp.roles) ? emp.roles[0]?.nombre : emp.roles?.nombre
              
              // Verificación de foto (BD o Google sync)
              const fotoUrl = emp.foto_perfil_url && emp.foto_perfil_url.trim() !== '' 
                ? emp.foto_perfil_url 
                : null;

              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => onToggle(emp.id.toString())}
                  className={`
                    group relative flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-300 active:scale-95
                    ${isSelected 
                      ? 'bg-orange-500/10 dark:bg-orange-600/20 ring-2 ring-orange-500/50 shadow-sm' 
                      : 'bg-neutral-100/50 dark:bg-neutral-800/40 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/60 ring-1 ring-neutral-200 dark:ring-neutral-700/50'
                    }
                  `}
                >
                  {/* AVATAR: Foto o Iniciales */}
                  <div className={`
                    relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all overflow-hidden
                    ${isSelected
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                    }
                  `}>
                    {fotoUrl ? (
                      <Image 
                        src={fotoUrl} 
                        alt={emp.nombre} 
                        fill 
                        className="object-cover"
                        referrerPolicy="no-referrer" // Clave para que carguen fotos de Google sin errores
                        sizes="40px"
                      />
                    ) : (
                      <span>{getInitials(emp.nombre, emp.apellidos)}</span>
                    )}
                  </div>

                  {/* Info del Empleado */}
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-semibold ${isSelected ? 'text-orange-700 dark:text-white' : 'text-neutral-700 dark:text-neutral-200'}`}>
                      {emp.nombre} {emp.apellidos}
                    </p>
                    <p className={`truncate text-[11px] ${isSelected ? 'text-orange-600/80 dark:text-white/60' : 'text-neutral-500 dark:text-neutral-400'}`}>
                      {rolNombre || 'Sin rol'}
                    </p>
                  </div>

                  {/* Check de Selección */}
                  <div className={`
                    flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300
                    ${isSelected 
                      ? 'bg-orange-600 text-white scale-110 shadow-md' 
                      : 'bg-neutral-300/50 dark:bg-neutral-700/50 text-transparent'
                    }
                  `}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <Users size={28} className="text-neutral-400" />
            </div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Cargando equipo...</p>
          </div>
        )}
      </div>
    </div>
  )
}