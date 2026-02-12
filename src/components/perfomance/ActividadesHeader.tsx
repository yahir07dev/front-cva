'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Plus } from 'lucide-react'

import EstadisticasRendimiento from './EstadisticasRendimiento'
import FiltroActividades from './FiltroActividades'

interface ActividadesHeaderProps {
  stats: {
    total: number
    pendientes: number
    completadas: number
    promedio: string | number
  }
  filtro: string
  setFiltro: (filtro: string) => void
  canCreate: boolean 
}

export default function ActividadesHeader({
  stats,
  filtro,
  setFiltro,
  canCreate,
}: ActividadesHeaderProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="
      sticky top-0 z-40
      -mt-4 pt-5 pb-5           /* aún más pegado arriba, menos padding */
      bg-neutral-50 dark:bg-neutral-950/95   /* fondo casi sólido en dark, sin transparencia excesiva */
      border-b border-neutral-200/20 dark:border-neutral-800/40   /* borde muy sutil */
      shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_-6px_rgba(0,0,0,0.35)]
      transition-all duration-300 ease-out
      space-y-5
    ">

      {/* Encabezado superior: Título + Botón Nueva Tarea */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 sm:px-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/10 dark:bg-orange-600/15">
            <Sparkles size={20} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Gestión de Tareas
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
              Monitoreo y control de objetivos del equipo
            </p>
          </div>
        </div>

        {/* Toggle en móvil */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="sm:hidden p-2 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/60 transition-colors"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {/* Botón Nueva Tarea */}
        {canCreate && (
          <button
            onClick={() => router.push('/dashboard/rendimiento/actividades/nueva')}
            className="
              group relative flex items-center gap-2
              px-5 py-2.5 rounded-xl
              bg-gradient-to-r from-orange-600 to-orange-500
              text-white font-semibold text-sm
              shadow-lg shadow-orange-600/20 dark:shadow-orange-500/25
              hover:shadow-xl hover:shadow-orange-600/35 hover:scale-[1.02]
              active:scale-[0.98]
              transition-all duration-300
              overflow-hidden
              w-full sm:w-auto
            "
          >
            <Plus size={18} className="transition-transform group-hover:rotate-90 duration-300" />
            <span>Nueva tarea</span>

            <div className="
              absolute inset-0 
              bg-gradient-to-r from-transparent via-white/10 to-transparent 
              -translate-x-full 
              group-hover:translate-x-full 
              transition-transform duration-800
            " />
          </button>
        )}
      </div>

      {/* Área de estadísticas y filtros */}
      <div className={`${isExpanded ? 'block' : 'hidden'} sm:block space-y-5 px-2 sm:px-0`}>
        <EstadisticasRendimiento stats={stats} />
        <FiltroActividades filtroActual={filtro} setFiltro={setFiltro} />
      </div>
    </div>
  )
}