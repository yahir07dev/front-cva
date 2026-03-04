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
      bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl 
      border border-emerald-200/30 dark:border-emerald-900/30 
      rounded-3xl p-6 md:p-8 mb-8 shadow-sm animate-in slide-in-from-top-4 duration-500
    ">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
        
        {/* Estadísticas */}
        <div className="flex flex-wrap gap-4 md:gap-6">
          
          {/* Dinero Pendiente */}
          <div className="
            flex items-center gap-4 min-w-[240px] 
            bg-white/60 dark:bg-neutral-950/50 
            border border-emerald-200/40 dark:border-emerald-900/30 
            rounded-2xl p-5 hover:border-emerald-400/60 transition-all
          ">
            <div className="
              h-12 w-12 rounded-2xl flex items-center justify-center 
              bg-emerald-500/10 dark:bg-emerald-600/15 
              ring-1 ring-emerald-200/30 dark:ring-emerald-900/30
            ">
              <TrendingDown size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                Dinero Pendiente
              </p>
              <p className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white tabular-nums mt-0.5">
                {formatMoney(stats.dineroEnLaCalle)}
              </p>
            </div>
          </div>

          {/* Préstamos Activos */}
          <div className="
            flex items-center gap-4 min-w-[200px] 
            bg-white/60 dark:bg-neutral-950/50 
            border border-emerald-200/40 dark:border-emerald-900/30 
            rounded-2xl p-5 hover:border-emerald-400/60 transition-all
          ">
            <div className="
              h-12 w-12 rounded-2xl flex items-center justify-center 
              bg-emerald-500/10 dark:bg-emerald-600/15 
              ring-1 ring-emerald-200/30 dark:ring-emerald-900/30
            ">
              <HandCoins size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                Préstamos Activos
              </p>
              <p className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white tabular-nums mt-0.5">
                {stats.prestamosActivos}
              </p>
            </div>
          </div>

        </div>

        {/* Botón Nuevo Préstamo */}
        {canManage && (
          <button
            onClick={onOpenModal}
            className="
              flex items-center justify-center gap-2.5 
              bg-emerald-600 hover:bg-emerald-700 
              text-white font-semibold px-7 py-4 rounded-2xl 
              transition-all shadow-lg shadow-emerald-600/20 
              hover:shadow-xl hover:shadow-emerald-600/30 
              active:scale-[0.98] shrink-0 min-w-[200px]
            "
          >
            <Plus size={20} strokeWidth={2.5} />
            Nuevo Préstamo
          </button>
        )}
      </div>
    </div>
  )
}