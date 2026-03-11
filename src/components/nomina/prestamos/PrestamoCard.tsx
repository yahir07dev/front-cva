'use client'

import Image from 'next/image'
import { Calendar, PauseCircle, PlayCircle, ChevronRight, TrendingUp, Wallet, Clock } from 'lucide-react'
import { useState } from 'react'

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
  const [abonoHover, setAbonoHover] = useState(false)
  const [pauseHover, setPauseHover] = useState(false)

  const total = Number(prestamo.monto_total)
  const pagado = total - Number(prestamo.saldo_restante)
  const porcentaje = total > 0 ? Math.round((pagado / total) * 100) : 0

  const formatMoney = (num: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num)

  // Color tokens según estado — verde sobrio como color principal
  const stateColor = isCompleted
    ? { accent: '#22c55e', badge: '#dcfce7', badgeText: '#14532d', bar: '#22c55e' }
    : isPaused
    ? { accent: '#f59e0b', badge: '#fef3c7', badgeText: '#78350f', bar: '#f59e0b' }
    : { accent: '#16a34a', badge: '#dcfce7', badgeText: '#14532d', bar: '#16a34a' }

  return (
    <div
      className={`
        group relative w-full
        bg-white dark:bg-neutral-900/60
        border border-neutral-100 dark:border-white/[0.06]
        rounded-[28px] overflow-hidden
        shadow-[0_2px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_24px_rgba(0,0,0,0.3)]
        transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)]
        hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]
        hover:-translate-y-1
        ${isCompleted ? 'opacity-75 hover:opacity-100' : ''}
      `}
    >
      {/* ─── TOP ACCENT LINE ────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: stateColor.accent, opacity: 0.7 }}
      />

      {/* ─── MAIN CONTENT ───────────────────────────────────── */}
      <div className="relative z-10 p-5 md:p-6 flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-6">

        {/* 1 ─ AVATAR + NOMBRE ──────────────────────────────── */}
        <div className="flex items-center gap-4 lg:w-[220px] shrink-0">
          <div className="relative shrink-0">
            <div
              className={`
                relative h-[52px] w-[52px] rounded-full overflow-hidden
                ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#0f0f12]
                transition-all duration-500 group-hover:scale-[1.06]
              `}
              style={{ ringColor: stateColor.accent } as any}
            >
              {emp?.foto_perfil_url ? (
                <Image src={emp.foto_perfil_url} alt="Avatar" fill className="object-cover" sizes="52px" />
              ) : (
                <div
                  className="h-full w-full flex items-center justify-center text-white font-black text-base uppercase"
                  style={{ background: stateColor.accent }}
                >
                  {emp?.nombre?.charAt(0)}{emp?.apellidos?.charAt(0)}
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="font-extrabold text-[15px] text-neutral-900 dark:text-white leading-tight truncate tracking-[-0.01em]">
              {emp?.nombre} {emp?.apellidos}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
                style={{ background: stateColor.accent }}
              />
              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.08em] truncate">
                {emp?.areas?.nombre || 'General'}
              </p>
            </div>
          </div>
        </div>

        {/* 2 ─ STATS + PROGRESS ─────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Montos */}
          <div className="flex items-start gap-6">
            {/* Monto Total */}
            <div className="group/stat">
              <div className="flex items-center gap-1 mb-1">
                <Wallet size={11} className="text-neutral-400" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.08em]">Total</span>
              </div>
              <p className="text-xl font-black text-neutral-900 dark:text-white tabular-nums tracking-tight leading-none">
                {formatMoney(total)}
              </p>
            </div>

            <div className="w-px h-10 bg-neutral-100 dark:bg-white/[0.06] self-center" />

            {/* Saldo Restante */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp size={11} className="text-neutral-400" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.08em]">Restante</span>
              </div>
              <p
                className="text-xl font-black tabular-nums tracking-tight leading-none"
                style={{ color: stateColor.accent }}
              >
                {formatMoney(Number(prestamo.saldo_restante))}
              </p>
            </div>

            <div className="w-px h-10 bg-neutral-100 dark:bg-white/[0.06] self-center" />

            {/* Pagado */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Clock size={11} className="text-neutral-400" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.08em]">Pagado</span>
              </div>
              <p className="text-xl font-black text-neutral-700 dark:text-neutral-300 tabular-nums tracking-tight leading-none">
                {formatMoney(pagado)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.08em]">Progreso del préstamo</span>
              <span
                className="text-xs font-black tabular-nums"
                style={{ color: stateColor.accent }}
              >
                {porcentaje}%
              </span>
            </div>

            {/* Track */}
            <div className="relative h-2 w-full rounded-full bg-neutral-100 dark:bg-white/[0.05] overflow-visible">
              {/* Fill */}
              <div
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(.16,1,.3,1)]"
                style={{
                  width: `${porcentaje}%`,
                  background: typeof stateColor.bar === 'string' && stateColor.bar.startsWith('linear') ? stateColor.bar : stateColor.bar,
                  boxShadow: `0 0 10px ${stateColor.accent}66`,
                }}
              >
                {/* Shimmer */}
                {!isCompleted && !isPaused && (
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite_linear] translate-x-[-100%]" />
                  </div>
                )}
              </div>

              {/* Thumb dot */}
              {porcentaje > 0 && porcentaje < 100 && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-[#0f0f12] shadow-md transition-all duration-1000 ease-[cubic-bezier(.16,1,.3,1)]"
                  style={{
                    left: `calc(${porcentaje}% - 7px)`,
                    background: stateColor.accent,
                    boxShadow: `0 0 8px ${stateColor.accent}aa`,
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* 3 ─ ACCIONES ─────────────────────────────────────── */}
        <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-end gap-3 lg:w-[180px] shrink-0">

          {/* Badge + Fecha */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 px-2 py-1 rounded-lg bg-neutral-50 dark:bg-white/[0.04]">
              <Calendar size={11} />
              <span>{new Date(prestamo.fecha_otorgamiento).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
            </div>
            <div
              className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.06em]"
              style={{ background: stateColor.badge, color: stateColor.badgeText }}
            >
              {prestamo.estado}
            </div>
          </div>

          {/* Botones */}
          {canManage && !isCompleted && (
            <div className="flex gap-2 w-full lg:w-full">

              {/* Pausa / Play */}
              <button
                onMouseEnter={() => setPauseHover(true)}
                onMouseLeave={() => setPauseHover(false)}
                onClick={() => onTogglePausa(prestamo.id, isPaused)}
                title={isPaused ? 'Reanudar cobro' : 'Pausar cobro esta nómina'}
                className="relative p-3 rounded-2xl border transition-all duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] active:scale-90"
                style={{
                  borderColor: pauseHover ? stateColor.accent + '66' : 'rgba(0,0,0,0.06)',
                  background: isPaused
                    ? `${stateColor.accent}15`
                    : pauseHover
                    ? `${stateColor.accent}0e`
                    : 'rgba(0,0,0,0.03)',
                }}
              >
                {isPaused
                  ? <PlayCircle size={18} style={{ color: stateColor.accent }} className="relative z-10 transition-transform duration-300" />
                  : <PauseCircle size={18} className="relative z-10 transition-all duration-300" style={{ color: pauseHover ? stateColor.accent : 'rgba(0,0,0,0.35)' }} />
                }
              </button>

              {/* Abonar */}
              <button
                onMouseEnter={() => setAbonoHover(true)}
                onMouseLeave={() => setAbonoHover(false)}
                onClick={() => onOpenAbono(prestamo)}
                className="relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-[0.08em] transition-all duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] active:scale-95"
                style={{
                  background: abonoHover ? stateColor.accent : `${stateColor.accent}15`,
                  color: abonoHover ? '#fff' : stateColor.accent,
                  boxShadow: abonoHover ? `0 6px 18px ${stateColor.accent}35` : 'none',
                  transform: abonoHover ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <span>Abonar</span>
                <ChevronRight
                  size={15}
                  className="transition-transform duration-300"
                  style={{ transform: abonoHover ? 'translateX(3px)' : 'translateX(0)' }}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Shimmer keyframe (inline style hack para Next.js sin config adicional) */}
      <style jsx>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  )
}