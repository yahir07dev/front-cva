'use client'

import { LucideIcon } from 'lucide-react'

interface StatItem {
  icon: LucideIcon
  label: string
  value: string | number
  accentColor: 'orange' | 'blue' | 'green' | 'purple' | 'red' | 'default' // <-- AGREGADO 'red'
}

interface StatsCarouselProps {
  stats: StatItem[]
}

export default function StatsCarousel({ stats }: StatsCarouselProps) {
  
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'orange': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/10'
      case 'blue': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10'
      case 'green': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10'
      case 'purple': return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10'
      case 'red': return 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10' // <-- NUEVO ESTILO ROJO ALERTA
      default: return 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-500/10'
    }
  }

  return (
    <div className="w-full">
      {/* Contenedor: Flex con scroll en móvil, Grid en PC */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x px-1 py-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:p-0">
        
        {stats.map((stat, index) => {
          const colors = getColorClasses(stat.accentColor)
          
          return (
            <div 
              key={index}
              className={`
                /* MÓVIL */
                min-w-[160px] snap-center flex flex-col items-start justify-center p-4 gap-2
                rounded-2xl border transition-all duration-300 shadow-sm
                ${stat.accentColor === 'red' ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-900/10' : 'border-neutral-100 dark:border-0 bg-white dark:bg-white/[0.02]'}
                
                /* PC */
                md:min-w-0 md:w-full md:p-6 md:gap-4 md:hover:shadow-md md:hover:-translate-y-1
              `}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`
                  p-2 rounded-xl shrink-0 transition-all
                  md:p-3
                  ${colors}
                `}>
                  <stat.icon strokeWidth={2.5} className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                
                {/* VALOR */}
                <span className={`
                  text-2xl font-black transition-all whitespace-nowrap
                  md:text-4xl
                  ${colors.split(' ')[0]} 
                `}>
                  {stat.value}
                </span>
              </div>
              
              {/* ETIQUETA */}
              <p className={`
                text-[10px] font-bold uppercase tracking-wider
                md:text-sm
                ${stat.accentColor === 'red' ? 'text-rose-500' : 'text-neutral-400 md:text-neutral-500'}
              `}>
                {stat.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}