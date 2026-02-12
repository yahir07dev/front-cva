'use client'

import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  accentColor?: 'orange' | 'blue' | 'green' | 'purple' | 'default'
  gradient?: string
  bgGradient?: string
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  accentColor = 'default',
  gradient,
  bgGradient,
}: StatsCardProps) {
  const colorMap = {
    orange: {
      bgIcon: 'from-orange-600 to-orange-500',
      // Ajuste de opacidad para modo claro y oscuro
      bgCard: 'from-orange-500/10 via-transparent to-transparent dark:from-orange-950/12 dark:via-neutral-950/8 dark:to-neutral-950/4',
    },
    blue: {
      bgIcon: 'from-blue-600 to-blue-500',
      bgCard: 'from-blue-500/10 via-transparent to-transparent dark:from-blue-950/10 dark:via-neutral-950/6 dark:to-neutral-950/3',
    },
    green: {
      bgIcon: 'from-emerald-600 to-emerald-500',
      bgCard: 'from-emerald-500/10 via-transparent to-transparent dark:from-emerald-950/10 dark:via-neutral-950/6 dark:to-neutral-950/3',
    },
    purple: {
      bgIcon: 'from-purple-600 to-purple-500',
      bgCard: 'from-purple-500/10 via-transparent to-transparent dark:from-purple-950/10 dark:via-neutral-950/6 dark:to-neutral-950/3',
    },
    default: {
      bgIcon: 'from-neutral-700 to-neutral-600',
      bgCard: 'from-neutral-200/50 via-transparent to-transparent dark:from-neutral-900/12 dark:via-neutral-950/8 dark:to-neutral-950/4',
    },
  }

  const colors = colorMap[accentColor] || colorMap.default

  const finalIconGradient = gradient || colors.bgIcon
  const finalBg = bgGradient || `bg-gradient-to-br ${colors.bgCard}`

  return (
    <div
      className={`
        group
        rounded-2xl p-5 sm:p-6
        ${finalBg}
        /* Fondo base para modo claro */
        bg-white dark:bg-transparent
        backdrop-blur-[0.5px]
        transition-all duration-300 ease-out
        /* Sombras adaptativas */
        shadow-sm border border-neutral-100 dark:border-none
        dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.35)]
        hover:shadow-md dark:hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.55)]
        hover:-translate-y-1
        relative
        overflow-hidden
      `}
    >
      {/* Brillo en hover solo para dark */}
      <div
        className={`
          absolute inset-0 pointer-events-none
          opacity-0 dark:group-hover:opacity-[0.25]
          bg-gradient-to-br ${finalIconGradient}
          transition-opacity duration-700
          blur-3xl scale-150 -translate-x-1/4 -translate-y-1/4
        `}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-500/90 mb-1.5">
            {label}
          </p>
          {/* CORRECCIÓN DE COLOR: text-neutral-900 para claro, neutral-50 para oscuro */}
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {value}
          </h3>
        </div>

        <div
          className={`
            w-12 h-12 sm:w-14 sm:h-14
            rounded-xl
            bg-gradient-to-br ${finalIconGradient}
            flex items-center justify-center text-white
            shadow-sm dark:shadow-[0_3px_10px_rgba(0,0,0,0.45)]
            transition-all duration-300
            group-hover:scale-110
          `}
        >
          <Icon size={26} strokeWidth={2.2} />
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-5 flex items-center gap-2.5">
          <span
            className={`
              text-sm font-semibold flex items-center gap-1
              ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}
            `}
          >
            {trendUp ? '↑' : '↓'} {trend}
          </span>
          <span className="text-xs text-neutral-500">
            vs mes pasado
          </span>
        </div>
      )}
    </div>
  )
}