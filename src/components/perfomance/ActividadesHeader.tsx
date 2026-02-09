'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Plus } from 'lucide-react'

// Importamos los submódulos (asegúrate de que estén en la misma carpeta)
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
  // Cambiamos isAdmin por canCreate para ser fieles a los permisos por slug
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
    <div className="flex-none space-y-4 pb-2">
      {/* 1. Encabezado Superior (Título y Botones) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start justify-between w-full sm:w-auto">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={20} className="text-orange-500" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                Gestión de Tareas
              </h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
              Seguimiento y rendimiento del equipo
            </p>
          </div>

          {/* Botón Toggle (Móvil) */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="sm:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Botón Nueva Tarea (Basado en permiso actividades.create) */}
        {canCreate && ( 
          <button
            onClick={() => router.push('/dashboard/rendimiento/actividades/nueva')}
            className="
              group relative flex items-center justify-center gap-2 
              overflow-hidden rounded-xl 
              bg-gradient-to-r from-orange-600 to-orange-500 
              px-5 py-2
              text-sm font-bold text-white 
              shadow-lg shadow-orange-500/25 
              transition-all 
              hover:shadow-xl hover:shadow-orange-500/30 
              active:scale-[0.98]
              w-full sm:w-auto
            "
          >
            <Plus 
              size={18} 
              className="transition-transform group-hover:rotate-90" 
            />
            <span>Nueva tarea</span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>
        )}
      </div>

      {/* 2. Área Desplegable (Estadísticas y Filtros) */}
      <div className={`${isExpanded ? 'block' : 'hidden'} sm:block space-y-4`}>
        
        {/* Componente de Estadísticas */}
        <EstadisticasRendimiento stats={stats} />

        {/* Componente de Filtros */}
        <FiltroActividades filtroActual={filtro} setFiltro={setFiltro} />

      </div>
    </div>
  )
}