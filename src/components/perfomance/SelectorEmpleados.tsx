'use client'

import { Users, Check } from 'lucide-react'

interface SelectorEmpleadosProps {
  // Usamos any[] para mantener compatibilidad con la respuesta del servicio
  empleados: any[]
  asignados: string[]
  onToggle: (id: string) => void
}

export default function SelectorEmpleados({ empleados, asignados, onToggle }: SelectorEmpleadosProps) {
  
  const getInitials = (nombre: string, apellidos: string) => 
    `${nombre?.[0] || ''}${apellidos?.[0] || ''}`.toUpperCase()

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-900 sm:rounded-3xl">
      <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Users size={16} className="text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">Asignar a</h2>
          </div>
          {asignados.length > 0 && (
            <div className="flex h-6 items-center justify-center rounded-full bg-orange-500 px-2.5 text-xs font-bold text-white">
              {asignados.length}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {empleados.length > 0 ? (
          <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
            {empleados.map((emp) => {
              const isSelected = asignados.includes(emp.id.toString())
              
              // Ajustamos la obtención del nombre del rol según la estructura de la DB 
              const rolNombre = Array.isArray(emp.roles) 
                ? emp.roles[0]?.nombre 
                : emp.roles?.nombre

              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => onToggle(emp.id.toString())}
                  className={`
                    group relative flex items-center gap-3 rounded-xl p-3 text-left transition-all active:scale-[0.98]
                    ${isSelected 
                      ? 'bg-orange-500 shadow-lg shadow-orange-500/25' 
                      : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <div className={`
                    flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all
                    ${isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-white text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-300'
                    }
                  `}>
                    {getInitials(emp.nombre, emp.apellidos)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {emp.nombre} {emp.apellidos}
                    </p>
                    <p className={`truncate text-xs ${isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                      {rolNombre || 'Sin rol'}
                    </p>
                  </div>

                  <div className={`
                    flex h-5 w-5 items-center justify-center rounded-full transition-all
                    ${isSelected ? 'bg-white/20' : 'bg-transparent'}
                  `}>
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Users size={20} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cargando equipo...</p>
          </div>
        )}
      </div>
    </div>
  )
}