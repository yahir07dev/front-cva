'use client'

import { Users, AlertCircle, CheckCircle2 } from 'lucide-react'
import StatCard from '@/src/components/shared/StatCard'

export default function AreaStats({ empleados, areas }: any) {
  const totalActivos = empleados.length
  const sinArea = empleados.filter((e: any) => !e.area_id).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* 1. Personal Total - AHORA AZUL (Color principal de Organización) */}
      <StatCard
        label="Personal Total"
        value={totalActivos}
        icon={Users}
        accentColor="blue" 
      />

      {/* 2. Áreas Operativas - AHORA MORADO (Para dar contraste elegante) */}
      <StatCard
        label="Áreas Operativas"
        value={areas.length}
        icon={CheckCircle2}
        accentColor="purple"
      />

      {/* 3. Sin Asignación - ROJO (Se mantiene como alerta) */}
      <StatCard
        label="Sin Asignación"
        value={sinArea}
        icon={AlertCircle}
        // Gradiente personalizado Rojo
        gradient="from-rose-600 to-rose-500"
        bgGradient="bg-gradient-to-br from-rose-500/10 via-transparent to-transparent dark:from-rose-950/12 dark:via-neutral-950/8 dark:to-neutral-950/4"
      />
    </div>
  )
}