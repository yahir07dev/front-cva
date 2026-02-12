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
    <div className="
      rounded-2xl 
      bg-white/50 dark:bg-neutral-900/25 
      backdrop-blur-lg 
      shadow-[0_4px_20px_-6px_rgba(0,0,0,0.08)] 
      dark:shadow-[0_6px_24px_-8px_rgba(0,0,0,0.45)]
      animate-in fade-in slide-in-from-top-3 duration-500
      overflow-hidden
    ">
      {/* Header sin borde */}
      <div className="
        px-4 py-3 
        flex items-center gap-2.5
      ">
        <div className="
          flex h-7 w-7 items-center justify-center 
          rounded-lg bg-orange-500/10 dark:bg-orange-600/20
        ">
          <Filter size={14} className="text-orange-600 dark:text-orange-400" />
        </div>
        <h2 className="
          text-sm font-semibold 
          text-neutral-900 dark:text-neutral-100
        ">
          Filtros
        </h2>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-2.5 px-4 pb-4 pt-1">
        {filters.map((f) => {
          const isActive = filtroActual === f.id
          const Icon = f.icon

          return (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`
                group inline-flex items-center gap-1.5 
                px-3.5 py-1.5 text-xs font-medium 
                rounded-full 
                transition-all duration-300 
                active:scale-95
                ${isActive 
                  ? 'bg-orange-600 text-white shadow-[0_4px_16px_-4px_rgba(249,115,22,0.45)] dark:shadow-[0_6px_20px_-6px_rgba(249,115,22,0.4)]' 
                  : 'bg-neutral-100/70 text-neutral-700 hover:bg-neutral-200/80 dark:bg-neutral-800/50 dark:text-neutral-300 dark:hover:bg-neutral-700/70'
                }
                hover:shadow-md hover:-translate-y-0.5
              `}
            >
              <Icon 
                size={14} 
                className={`
                  transition-colors
                  ${isActive 
                    ? 'text-white' 
                    : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200'}
                `}
              />
              <span>{f.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}