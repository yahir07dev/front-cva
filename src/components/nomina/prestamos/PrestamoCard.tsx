'use client'

import Image from 'next/image'
import { Calendar, Banknote } from 'lucide-react'

export default function PrestamoCard({ prestamo, canManage, onOpenAbono }: { prestamo: any, canManage: boolean, onOpenAbono: (p: any) => void }) {
  const emp = prestamo.empleados;
  const isCompleted = prestamo.estado === 'completado';
  
  // Cálculo de progreso
  const total = Number(prestamo.monto_total);
  const pagado = total - Number(prestamo.saldo_restante);
  const porcentaje = total > 0 ? Math.round((pagado / total) * 100) : 0;

  const formatMoney = (num: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num)

  return (
    <div className={`p-5 rounded-[28px] border transition-all ${isCompleted ? 'bg-neutral-50 dark:bg-neutral-900/40 border-neutral-100 dark:border-neutral-800 opacity-70' : 'bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800 shadow-sm hover:shadow-md'}`}>
      
      {/* Header Card */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800">
            {emp?.foto_perfil_url ? (
              <Image src={emp.foto_perfil_url} alt="Avatar" fill className="object-cover" sizes="40px"/>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs font-bold text-neutral-500">
                {emp?.nombre?.charAt(0)}{emp?.apellidos?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">
              {emp?.nombre} {emp?.apellidos}
            </h3>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              {emp?.areas?.nombre || 'General'}
            </p>
          </div>
        </div>
        
        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'bg-emerald-500/10 text-emerald-600' : 'bg-orange-500/10 text-orange-600'}`}>
          {prestamo.estado}
        </div>
      </div>

      {/* Financiero */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Monto Total</p>
          <p className="font-black text-neutral-900 dark:text-white">{formatMoney(total)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Saldo Restante</p>
          <p className={`font-black ${isCompleted ? 'text-emerald-500' : 'text-rose-500'}`}>
            {formatMoney(Number(prestamo.saldo_restante))}
          </p>
        </div>
      </div>

      {/* Barra de Progreso */}
      <div className="space-y-2 mb-5">
        <div className="flex justify-between text-[10px] font-bold text-neutral-500">
          <span>Progreso de pago</span>
          <span>{porcentaje}%</span>
        </div>
        <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-orange-500'}`} 
            style={{ width: `${porcentaje}%` }} 
          />
        </div>
      </div>

      {/* Footer Card */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800/50">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500">
          <Banknote size={14} />
          <span>{prestamo.numero_pagos} pagos de {formatMoney(Number(prestamo.cuota_semanal))}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-400">
          <Calendar size={12} />
          <span>{new Date(prestamo.fecha_otorgamiento).toLocaleDateString('es-MX')}</span>
        </div>
      </div>

      {/* Botón de Abonar (Solo visible para admin y si no está completado) */}
      {canManage && !isCompleted && (
        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/50">
          <button 
            onClick={() => onOpenAbono(prestamo)}
            className="w-full py-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 text-neutral-900 dark:text-white font-bold text-xs hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            Registrar Semana
          </button>
        </div>
      )}

    </div>
  )
}