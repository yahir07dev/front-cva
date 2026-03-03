'use client'

import { HandCoins, TrendingDown, Plus } from 'lucide-react'

interface PrestamosHeaderProps {
  stats: {
    prestamosActivos: number;
    dineroEnLaCalle: number;
    totalHistorico: number;
  }
  canManage: boolean;
  onOpenModal: () => void;
}

export default function PrestamosHeader({ stats, canManage, onOpenModal }: PrestamosHeaderProps) {
  // Formateador de moneda
  const formatMoney = (amount: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-in slide-in-from-top-4 duration-500">
      
      {/* Tarjetas de Estadísticas */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        
        <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 p-5 rounded-[28px] border border-neutral-200/60 dark:border-neutral-800 shadow-sm min-w-[240px]">
          <div className="h-12 w-12 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Dinero Pendiente</p>
            <p className="text-2xl font-black text-neutral-900 dark:text-white">
              {formatMoney(stats.dineroEnLaCalle)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 p-5 rounded-[28px] border border-neutral-200/60 dark:border-neutral-800 shadow-sm min-w-[200px]">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <HandCoins size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Activos</p>
            <p className="text-2xl font-black text-neutral-900 dark:text-white">
              {stats.prestamosActivos}
            </p>
          </div>
        </div>

      </div>

      {/* Botón de Acción */}
      {canManage && (
        <button 
          onClick={onOpenModal}
          className="flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-4 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 dark:shadow-white/5 shrink-0"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Nuevo Préstamo</span>
        </button>
      )}
    </div>
  )
}