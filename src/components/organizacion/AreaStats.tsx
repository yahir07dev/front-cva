'use client'

import { Users, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function AreaStats({ empleados, areas }: any) {
  const totalActivos = empleados.length
  const sinArea = empleados.filter((e: any) => !e.area_id).length

  const stats = [
    {
      label: "Personal Total",
      value: totalActivos,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-500/10",
      border: "border-blue-100 dark:border-blue-500/20"
    },
    {
      label: "Áreas Operativas",
      value: areas.length,
      icon: CheckCircle2,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-500/10",
      border: "border-purple-100 dark:border-purple-500/20"
    },
    {
      label: "Sin Asignación",
      value: sinArea,
      icon: AlertCircle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-100 dark:bg-rose-500/10",
      border: "border-rose-100 dark:border-rose-500/20"
    }
  ]

  return (
    <div className="w-full">
      {/* MÓVIL: flex con overflow-x-auto (Carrusel)
          PC: grid de 3 columnas
      */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x px-1 py-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:p-0">
        {stats.map((stat, idx) => (
          <div 
            key={idx}
            className={`
              /* Base Móvil - Estilo cristal consistente */
              min-w-[160px] snap-center flex flex-col items-start p-4 gap-2
              rounded-2xl bg-white dark:bg-white/[0.02] backdrop-blur-md
              border border-neutral-200/50 dark:border-0
              shadow-sm transition-all duration-300
              ${stat.color}

              /* Ajustes PC */
              md:min-w-0 md:w-full md:p-6 md:gap-4 md:hover:-translate-y-1 md:hover:shadow-xl md:hover:shadow-black/5 dark:md:hover:shadow-white/5
            `}
          >
            <div className="flex items-center gap-3 w-full">
              <div className={`p-2 rounded-xl shrink-0 ${stat.bg} ${stat.color} md:p-3`}>
                <stat.icon size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
              </div>
              <span className={`text-2xl font-black tracking-tight md:text-4xl ${stat.color}`}>
                {stat.value}
              </span>
            </div>
            
            <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider md:text-xs">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}