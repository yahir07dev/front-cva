'use client'

import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string // Antes title
  value: string | number
  icon: LucideIcon // Cambiamos de string a LucideIcon para soportar los iconos del header
  trend?: string
  trendUp?: boolean
  gradient?: string // Agregamos para soportar los gradientes personalizados que ya usabas
  bgGradient?: string // Agregamos para soportar el fondo degradado
}

export default function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  trendUp, 
  gradient = 'from-blue-500 to-blue-600',
  bgGradient = 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10'
}: StatsCardProps) {

  return (
    <div className={`rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all bg-gradient-to-br ${bgGradient}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            {label}
          </p>
          <h3 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </h3>
        </div>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
          <Icon size={24} />
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-2">
          <span className={`text-[10px] sm:text-xs font-semibold ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">vs mes pasado</span>
        </div>
      )}
    </div>
  )
}