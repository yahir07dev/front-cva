'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Sparkles, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import EstadisticasRendimiento from './EstadisticasRendimiento'
import FiltroActividades from './FiltroActividades'

interface ActividadesHeaderProps {
  stats: {
    total: number
    pendientes: number
    completadas: number
    promedio: string | number
    // Agrega aquí otras propiedades de stats si las usas (ej: diasRegistrados, etc)
    [key: string]: any 
  }
  filtro: string
  setFiltro: (filtro: string) => void
  canCreate: boolean 
  canManage: boolean // <--- 1. NUEVA PROP AÑADIDA
}

export default function ActividadesHeader({
  stats,
  filtro,
  setFiltro,
  canCreate,
  canManage, // <--- 2. RECIBIMOS LA PROP
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
    <div className="w-full space-y-6 bg-transparent animate-in fade-in slide-in-from-top-4 duration-700">
      
      {/* 1. Encabezado superior */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3">
          <div className="flex p-2.5 rounded-2xl bg-orange-500/10 dark:bg-orange-600/15">
            <Sparkles size={22} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Gestión de actividades
            </h1>
            <p className="hidden sm:block text-xs font-medium text-neutral-500 dark:text-neutral-500 mt-0.5">
              Monitoreo y control de objetivos del equipo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="sm:hidden p-1 text-neutral-400 hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-400 transition-colors active:scale-75"
          >
            {isExpanded ? <ChevronUp size={24} strokeWidth={2} /> : <ChevronDown size={24} strokeWidth={2} />}
          </button>

          {canCreate && (
            <button
              onClick={() => router.push('/dashboard/rendimiento/actividades/nueva')}
              className="
                group flex items-center gap-2
                px-5 py-2.5 rounded-xl
                bg-neutral-900 dark:bg-white
                text-white dark:text-black
                text-sm font-semibold
                hover:scale-[1.03] active:scale-95
                transition-all duration-300 shadow-xl shadow-black/10 dark:shadow-white/5
              "
            >
              <Plus size={18} strokeWidth={2.5} className="transition-transform group-hover:rotate-90" />
              <span className="hidden sm:inline">Nueva</span> {/* Opcional: ocultar texto en móvil si falta espacio */}
            </button>
          )}
        </div>
      </div>

      {/* 2. Estadísticas con Carrusel */}
      <div className={`
        overflow-hidden transition-all duration-500 ease-in-out
        ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="
          -mx-4 px-4 sm:mx-0 sm:px-0
          overflow-x-auto scrollbar-hide
          snap-x snap-mandatory
        ">
          <div className="min-w-max sm:min-w-0 pb-2">
            <EstadisticasRendimiento stats={stats} />
          </div>
        </div>
      </div>

      {/* 3. Filtros */}
      <div className="py-1 px-1">
        {/* 3. PASAMOS LA PROP AL FILTRO */}
        <FiltroActividades 
          filtroActual={filtro} 
          setFiltro={setFiltro} 
          canManage={canManage} 
        />
      </div>
    </div>
  )
}