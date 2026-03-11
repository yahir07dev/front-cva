'use client'

import { HandCoins, TrendingDown, Plus } from 'lucide-react'

interface PrestamosHeaderProps {
  stats: {
    prestamosActivos: number
    dineroEnLaCalle: number
    totalHistorico: number
  }
  canManage: boolean
  onOpenModal: () => void
}

export default function PrestamosHeader({ stats, canManage, onOpenModal }: PrestamosHeaderProps) {

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)

  return (
    <div className="
      w-full flex-none sticky top-0 z-20
      bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-xl
      px-6 lg:px-10 py-5 md:py-6
      transition-colors duration-500
    ">
      {/* AQUÍ EL CAMBIO: Eliminamos max-w-7xl y dejamos w-full */}
      <div className="
        w-full 
        flex flex-col lg:flex-row lg:items-center 
        justify-between gap-5 lg:gap-8
      ">

        {/* ESTADÍSTICAS */}
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto animate-in fade-in slide-in-from-top-4 duration-500">

          {/* Dinero Pendiente */}
          <div className="
            group flex items-center gap-4 flex-1 sm:min-w-[280px]
            bg-white/80 dark:bg-neutral-900/60 backdrop-blur-sm
            border border-neutral-200/60 dark:border-neutral-800/50
            rounded-3xl p-4 md:p-5
            shadow-sm hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700
            transition-all duration-300
          ">
            <div className="
              h-12 w-12 md:h-14 md:w-14 shrink-0
              rounded-2xl flex items-center justify-center
              bg-emerald-500/10 text-emerald-600 dark:text-emerald-400
              group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500
            ">
              <TrendingDown size={24} strokeWidth={2.5} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] md:text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Dinero Pendiente
              </p>
              <p className="text-xl md:text-2xl lg:text-3xl font-black text-neutral-900 dark:text-white tabular-nums mt-0.5 truncate">
                {formatMoney(stats.dineroEnLaCalle)}
              </p>
            </div>
          </div>

          {/* Préstamos Activos */}
          <div className="
            group flex items-center gap-4 flex-1 sm:min-w-[240px]
            bg-white/80 dark:bg-neutral-900/60 backdrop-blur-sm
            border border-neutral-200/60 dark:border-neutral-800/50
            rounded-3xl p-4 md:p-5
            shadow-sm hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700
            transition-all duration-300
          ">
            <div className="
              h-12 w-12 md:h-14 md:w-14 shrink-0
              rounded-2xl flex items-center justify-center
              bg-emerald-500/10 text-emerald-600 dark:text-emerald-400
              group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500
            ">
              <HandCoins size={24} strokeWidth={2.5} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] md:text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Préstamos Activos
              </p>
              <p className="text-xl md:text-2xl lg:text-3xl font-black text-neutral-900 dark:text-white tabular-nums mt-0.5">
                {stats.prestamosActivos}
              </p>
            </div>
          </div>

        </div>

        {/* BOTÓN NUEVO PRÉSTAMO */}
        {canManage && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
            <button
              onClick={onOpenModal}
              className="
                group flex items-center justify-center gap-2.5
                bg-emerald-600 hover:bg-emerald-700
                text-white font-bold text-sm uppercase tracking-wider
                px-8 py-4 md:py-4.5
                rounded-2xl
                transition-all duration-300
                shadow-lg shadow-emerald-600/20
                hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-0.5
                active:scale-95
                w-full lg:w-auto
              "
            >
              <Plus size={18} strokeWidth={3} className="transition-transform duration-300 group-hover:rotate-90" />
              Nuevo Préstamo
            </button>
          </div>
        )}

      </div>
    </div>
  )
}