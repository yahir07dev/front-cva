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
    <div className="w-full flex justify-center  bg-neutral-50 dark:bg-neutral-950 ">

      <div className="
      
        w-full 
        max-w-[1100px] 
        flex flex-col lg:flex-row lg:items-center 
        justify-between gap-5 lg:gap-8
       bg-neutral-50 dark:bg-neutral-950 
      ">

        {/* Estadísticas */}
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">

          {/* Dinero Pendiente */}
          <div className="
            flex items-center gap-3 flex-1 sm:min-w-[240px]
            bg-white dark:bg-neutral-900
            rounded-2xl p-4 md:p-5
          ">
            <div className="
              h-10 w-10 md:h-12 md:w-12
              rounded-xl md:rounded-2xl
              flex items-center justify-center
              bg-emerald-500/10 dark:bg-emerald-600/15
              shrink-0
            ">
              <TrendingDown
                size={20}
                className="md:w-6 md:h-6 text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] md:text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide truncate">
                Dinero Pendiente
              </p>

              <p className="text-xl md:text-2xl lg:text-3xl font-black text-neutral-900 dark:text-white tabular-nums mt-0.5 truncate">
                {formatMoney(stats.dineroEnLaCalle)}
              </p>
            </div>
          </div>


          {/* Préstamos Activos */}
          <div className="
            flex items-center gap-3 flex-1 sm:min-w-[200px]
            bg-white dark:bg-neutral-900
            rounded-2xl p-4 md:p-5
          ">
            <div className="
              h-10 w-10 md:h-12 md:w-12
              rounded-xl md:rounded-2xl
              flex items-center justify-center
              bg-emerald-500/10 dark:bg-emerald-600/15
              shrink-0
            ">
              <HandCoins
                size={20}
                className="md:w-6 md:h-6 text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] md:text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide truncate">
                Préstamos Activos
              </p>

              <p className="text-xl md:text-2xl lg:text-3xl font-black text-neutral-900 dark:text-white tabular-nums mt-0.5">
                {stats.prestamosActivos}
              </p>
            </div>
          </div>

        </div>


        {/* Botón */}
        {canManage && (
          <button
            onClick={onOpenModal}
            className="
              flex items-center justify-center gap-2
              bg-emerald-600 hover:bg-emerald-700
              text-white font-semibold
              px-6 py-3.5
              rounded-2xl
              transition-all
              shadow-lg shadow-emerald-600/20
              hover:shadow-xl hover:shadow-emerald-600/30
              active:scale-[0.98]
              w-full lg:w-auto
              lg:min-w-[210px]
            "
          >
            <Plus size={18} strokeWidth={2.5} />
            Nuevo Préstamo
          </button>
        )}

      </div>
    </div>
  )
}