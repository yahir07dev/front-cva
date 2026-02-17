'use client'

import { ListTodo, Clock, CheckCircle2, Star } from 'lucide-react'

interface EstadisticasProps {
  stats: {
    total: number
    pendientes: number
    completadas: number
    promedio: string | number
  }
}

export default function EstadisticasRendimiento({ stats }: EstadisticasProps) {
  const items = [
    { 
      label: 'Total', 
      value: stats.total, 
      icon: ListTodo, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10' 
    },
    { 
      label: 'Pendientes', 
      value: stats.pendientes, 
      icon: Clock, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10' 
    },
    { 
      label: 'Completadas', 
      value: stats.completadas, 
      icon: CheckCircle2, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10' 
    },
    { 
      label: 'Rating', 
      value: `${stats.promedio}★`, 
      icon: Star, 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/10' 
    },
  ]

  return (
    <div className="flex sm:grid sm:grid-cols-4 gap-4 px-1 animate-in fade-in slide-in-from-top-2 duration-500">
      {items.map((item, index) => (
        <div 
          key={index}
          className="
            flex items-center gap-4 p-4 rounded-[24px]
            min-w-[165px] sm:min-w-0 flex-1
            bg-white dark:bg-white/[0.03] 
            backdrop-blur-md
            /* BORDE: visible solo en tema light, sin borde en dark */
            border border-neutral-200/50 dark:border-0
            /* SOMBRA: más pronunciada en light, sin sombra en dark */
            shadow-md hover:shadow-lg dark:shadow-none
            snap-center transition-all duration-300
          "
        >
          {/* Icono con fondo suave */}
          <div className={`p-2.5 rounded-xl ${item.bg} flex-shrink-0`}>
            <item.icon size={20} className={item.color} />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-[0.15em] font-black text-neutral-400 dark:text-neutral-500 truncate">
              {item.label}
            </span>
            <span className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}