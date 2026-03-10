'use client'

import Image from 'next/image'
import { Calendar, Banknote, PauseCircle, PlayCircle } from 'lucide-react'

interface PrestamoCardProps {
  prestamo: any
  canManage: boolean
  onOpenAbono: (p: any) => void
  onTogglePausa: (id: number, estadoActual: boolean) => void
}

export default function PrestamoCard({ prestamo, canManage, onOpenAbono, onTogglePausa }: PrestamoCardProps) {
  const emp = prestamo.empleados
  const isCompleted = prestamo.estado === 'completado'
  const isPaused = prestamo.omitir_siguiente_nomina === true

  const total = Number(prestamo.monto_total)
  const pagado = total - Number(prestamo.saldo_restante)
  const porcentaje = total > 0 ? Math.round((pagado / total) * 100) : 0

  const formatMoney = (num: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num)

  return (
    <div className={`
      relative p-5 md:p-6 rounded-3xl transition-all duration-300
      bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm
      ${isCompleted ? 'opacity-75' : ''}
      ${isPaused ? 'bg-amber-50/40 dark:bg-amber-950/40' : ''}
    `}>
      
      {/* Header */}
      <div className="flex items-start gap-3 mb-5 md:mb-6">
        <div className="relative h-12 w-12 rounded-2xl overflow-hidden shrink-0">
          {emp?.foto_perfil_url ? (
            <Image 
              src={emp.foto_perfil_url} 
              alt="Avatar" 
              fill 
              className="object-cover" 
              sizes="48px"
            />
          ) : (
            <div className="
              h-full w-full bg-gradient-to-br from-emerald-100 to-emerald-50 
              dark:from-emerald-950 dark:to-neutral-900 
              flex items-center justify-center text-emerald-600 dark:text-emerald-400 
              font-semibold text-base
            ">
              {emp?.nombre?.charAt(0)}{emp?.apellidos?.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white leading-tight truncate pr-2">
                {emp?.nombre} {emp?.apellidos}
              </h3>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-0.5 uppercase tracking-wide truncate">
                {emp?.areas?.nombre || 'General'}
              </p>
            </div>
            <div className={`
              px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wide shrink-0
              ${isCompleted 
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'}
            `}>
              {prestamo.estado}
            </div>
          </div>
        </div>
      </div>

      {/* Valores financieros */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 mb-5 md:mb-6">
        <div>
          <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1">
            Monto Total
          </p>
          <p className="text-xl font-black text-neutral-900 dark:text-white tabular-nums truncate">
            {formatMoney(total)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1">
            Saldo Restante
          </p>
          <p className={`
            text-xl font-black tabular-nums truncate
            ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 
              isPaused ? 'text-amber-700 dark:text-amber-400' : 
              'text-rose-600 dark:text-rose-400'}
          `}>
            {formatMoney(Number(prestamo.saldo_restante))}
          </p>
        </div>
      </div>

      {/* Progreso */}
      <div className="mb-5 md:mb-6">
        <div className="flex justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
          <span>Progreso</span>
          <span>{porcentaje}%</span>
        </div>
        <div className="h-2.5 w-full bg-neutral-100/70 dark:bg-neutral-800/40 rounded-full overflow-hidden">
          <div 
            className={`
              h-full rounded-full transition-all duration-1000
              ${isCompleted ? 'bg-emerald-500' : 
                isPaused ? 'bg-amber-500' : 
                'bg-rose-500'}
            `}
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>

      {/* Info pagos y fecha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-neutral-600 dark:text-neutral-300 mb-5 md:mb-6">
        <div className="flex items-center gap-2">
          <Banknote size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">
            {prestamo.numero_pagos} pagos
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">
            {new Date(prestamo.fecha_otorgamiento).toLocaleDateString('es-MX', { 
              day: 'numeric', 
              month: 'short' 
            })}
          </span>
        </div>
      </div>

      {/* Acciones - Sin borde superior */}
      {canManage && !isCompleted && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onTogglePausa(prestamo.id, isPaused)}
            className={`
              p-3 rounded-2xl transition-all duration-200 flex items-center justify-center shrink-0
              ${isPaused 
                ? 'bg-amber-600/10 hover:bg-amber-600/20 text-amber-700 dark:text-amber-400' 
                : 'bg-neutral-100/80 dark:bg-neutral-800/50 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300'}
            `}
            title={isPaused ? "Reanudar cobro" : "Pausar cobro esta semana"}
          >
            {isPaused ? <PlayCircle size={20} /> : <PauseCircle size={20} />}
          </button>

          <button
            onClick={() => onOpenAbono(prestamo)}
            className="
              flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 
              text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg
              hover:shadow-emerald-600/20 active:scale-[0.98]
            "
          >
            Registrar Abono
          </button>
        </div>
      )}
    </div>
  )
}