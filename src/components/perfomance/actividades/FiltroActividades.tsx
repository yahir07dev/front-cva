'use client'

import { motion } from 'framer-motion'
import { ListTodo, Clock, TrendingUp, CheckCircle2, Sparkles, FileSearch, XCircle } from 'lucide-react'

interface FiltroActividadesProps {
  filtroActual: string
  setFiltro: (filtro: string) => void
  canManage?: boolean // Nueva prop para controlar visibilidad de filtros administrativos
}

export default function FiltroActividades({ filtroActual, setFiltro, canManage = false }: FiltroActividadesProps) {
  
  // Definición base de filtros disponibles para todos
  const baseFilters = [
    { id: 'todas', label: 'Todas', icon: ListTodo },
    { id: 'pendiente', label: 'Pendientes', icon: Clock },
    { id: 'en_progreso', label: 'Progreso', icon: TrendingUp },
    { id: 'explicacion_requerida', label: 'Ayuda', icon: Sparkles }, // Corregido ID según tu enum
    { id: 'completada', label: 'Hechas', icon: CheckCircle2 },
    { id: 'no_realizada', label: 'Fallidas', icon: XCircle }, // Disponible para todos
  ]

  // Filtros exclusivos para gestores (Admin/Supervisor)
  const adminFilters = [
    { id: 'revision', label: 'Revisión', icon: FileSearch },
  ]

  // Combinamos los filtros según permisos
  // Nota: Insertamos 'revision' antes de 'completada' o donde tenga sentido lógico
  const filters = canManage 
    ? [
        ...baseFilters.slice(0, 3), // Hasta Progreso
        ...adminFilters,            // Insertamos Revisión
        ...baseFilters.slice(3)     // Resto (Ayuda, Hechas, Fallidas)
      ]
    : baseFilters

  return (
    <div className="w-full">
      <div className="
        flex items-center gap-1 
        overflow-x-auto scrollbar-hide 
        -mx-4 px-4 sm:mx-0 sm:px-0
        py-2
      ">
        {filters.map((f) => {
          const isActive = filtroActual === f.id
          const Icon = f.icon

          return (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`
                relative flex-shrink-0 flex items-center gap-2 
                px-4 py-2 rounded-2xl
                text-xs font-black transition-colors duration-300
                select-none outline-none
                ${isActive 
                  ? 'text-white dark:text-black' 
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-400'
                }
              `}
            >
              {/* Contenido del botón */}
              <span className="relative z-10 flex items-center gap-2">
                <Icon 
                  size={16} 
                  strokeWidth={isActive ? 3 : 2}
                  className="transition-transform duration-300"
                />
                <span className="whitespace-nowrap">{f.label}</span>
              </span>

              {/* Fondo animado */}
              {isActive && (
                <motion.div
                  layoutId="activeFilterBg"
                  className="absolute inset-0 bg-neutral-900 dark:bg-white rounded-2xl shadow-lg shadow-black/10 dark:shadow-white/5"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                    mass: 1
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}