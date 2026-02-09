'use client'

import { ListTodo, Clock, TrendingUp, CheckCircle2, Sparkles, Filter } from 'lucide-react'

interface FiltroActividadesProps {
  filtroActual: string
  setFiltro: (filtro: string) => void
}

export default function FiltroActividades({ filtroActual, setFiltro }: FiltroActividadesProps) {
  
  const filters = [
    { id: 'todas', label: 'Todas', icon: ListTodo },
    { id: 'pendiente', label: 'Pendientes', icon: Clock },
    { id: 'en_progreso', label: 'En progreso', icon: TrendingUp },
    { id: 'completada', label: 'Completadas', icon: CheckCircle2 },
    { id: 'explicacion', label: 'Ayuda', icon: Sparkles },
  ]

  return (
    <div className="overflow-hidden rounded-2xl bg-white/90 shadow-sm backdrop-blur-xl dark:bg-gray-900/90 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <Filter size={14} className="text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Filtros</h2>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-3">
        {filters.map((f) => {
          const isActive = filtroActual === f.id
          const Icon = f.icon
          return (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`
                group inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all active:scale-95
                ${isActive 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800'
                }
              `}
            >
              <Icon size={14} className={isActive ? 'text-white' : ''} />
              <span>{f.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}