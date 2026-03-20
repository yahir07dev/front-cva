'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import EstadisticasRendimiento from './EstadisticasRendimiento'
import FiltroActividades from './FiltroActividades'

interface ActividadesHeaderProps {
  stats: {
    total: number
    pendientes: number
    completadas: number
    promedio: string | number
    [key: string]: any 
  }
  filtro: string
  setFiltro: (filtro: string) => void
  canCreate: boolean 
  canManage: boolean
}

export default function ActividadesHeader({
  stats,
  filtro,
  setFiltro,
  canCreate,
  canManage,
}: ActividadesHeaderProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsExpanded(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={`
      w-full transition-all duration-300 ease-in-out
      bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl 
      border border-orange-200/30 dark:border-orange-900/30 
      rounded-3xl shadow-sm animate-in fade-in slide-in-from-top-4
      ${isExpanded ? 'space-y-5 p-6' : 'space-y-2 p-4'}  {/* ← menos espacio y padding cuando colapsado */}
    `}>
      
      {/* Botón Nueva + Chevron - centrado y siempre visible */}
      <div className="flex flex-col items-center gap-3">
        {canCreate && (
          <button
            onClick={() => router.push('/dashboard/rendimiento/actividades/nueva')}
            className="
              group flex items-center justify-center gap-2.5
              px-6 py-3 rounded-xl w-full max-w-xs
              bg-orange-600 hover:bg-orange-700 text-white
              text-sm font-semibold
              hover:scale-[1.03] active:scale-95
              transition-all duration-300 shadow-lg shadow-orange-600/20
            "
          >
            <Plus size={18} strokeWidth={2.5} className="transition-transform group-hover:rotate-90" />
            <span className="hidden sm:inline">Nueva Actividad</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        )}

        {/* Chevron solo en móvil */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="sm:hidden p-2 rounded-xl bg-neutral-100/80 dark:bg-neutral-800/60 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300 transition-colors"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Estadísticas - collapse más agresivo cuando no expandido */}
      <div className={`
        overflow-hidden transition-all duration-400 ease-in-out
        ${isExpanded ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}  {/* ← mt-0 cuando colapsado */}
      `}>
        <div className="
          -mx-4 px-4 sm:mx-0 sm:px-0
          overflow-x-auto scrollbar-hide snap-x snap-mandatory
        ">
          <div className="
            min-w-max sm:min-w-0 pb-2
            scrollbar-hide
            [-ms-overflow-style:none]
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          ">
            <EstadisticasRendimiento stats={stats} />
          </div>
        </div>
      </div>

      {/* Filtros - pegado arriba cuando colapsado */}
      <div className={`
        transition-all duration-300
        ${isExpanded ? 'pt-2' : 'pt-1'}  {/* ← menos padding arriba cuando colapsado */}
      `}>
        <FiltroActividades 
          filtroActual={filtro} 
          setFiltro={setFiltro} 
          canManage={canManage} 
        />
      </div>
    </div>
  )
}