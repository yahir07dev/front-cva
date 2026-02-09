import { ListTodo, Clock, CheckCircle2, Star } from 'lucide-react'

import StatCard from '../shared/StatCard' 

interface EstadisticasProps {
  stats: {
    total: number
    pendientes: number
    completadas: number
    promedio: string | number
  }
}

export default function EstadisticasRendimiento({ stats }: EstadisticasProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <StatCard 
        icon={ListTodo} 
        label="Total" 
        value={stats.total}
        gradient="from-blue-500 to-blue-600"
        bgGradient="from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10"
      />
      <StatCard 
        icon={Clock} 
        label="Pendientes" 
        value={stats.pendientes}
        gradient="from-amber-500 to-amber-600"
        bgGradient="from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10"
      />
      <StatCard 
        icon={CheckCircle2} 
        label="Completadas" 
        value={stats.completadas}
        gradient="from-emerald-500 to-emerald-600"
        bgGradient="from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10"
      />
      <StatCard 
        icon={Star} 
        label="Rating" 
        value={`${stats.promedio}★`}
        gradient="from-orange-500 to-orange-600"
        bgGradient="from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10"
      />
    </div>
  )
}