'use client'

import { useState } from 'react'
import { RenglonNomina } from '@/src/services/generarNominaService'
import { Calculator, Save, Lock, UserRound } from 'lucide-react'
import ModalCalculadora from './ModalCalculadora'
import Image from 'next/image'
import { ValoresCalculadora } from '@/src/hooks/useGenerarNomina'

interface TablaProps {
  renglones: RenglonNomina[]
  isReadOnly: boolean
  onChange: (id: number, campo: keyof RenglonNomina, valor: number) => void
  onCalculate: (id: number, valores: ValoresCalculadora) => void
  onSaveTarjeta: (id: number, monto: number) => void
  totales: any
}

export default function TablaNominaReactiva({ renglones, isReadOnly, onChange, onCalculate, onSaveTarjeta, totales }: TablaProps) {
  const [empleadoCalculadora, setEmpleadoCalculadora] = useState<RenglonNomina | null>(null)

  const formatMoney = (num: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num || 0)

  if (renglones.length === 0) return null

  return (
    <>
      <div className={`
        rounded-3xl overflow-hidden transition-all duration-300
        bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm
        border border-neutral-200/40 dark:border-neutral-800/50
        shadow-xl shadow-black/5 dark:shadow-black/30
        ${isReadOnly ? 'opacity-90' : ''}
      `}>
        
        {/* AVISO DE CANDADO */}
        {isReadOnly && (
          <div className="bg-emerald-900/10 dark:bg-emerald-950/30 p-4 px-6 border-b border-emerald-500/10 flex items-center gap-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400/90">
            <Lock size={16} className="text-emerald-600 dark:text-emerald-500" />
            Nómina autorizada y procesada — solo lectura
          </div>
        )}

        <div className="overflow-x-auto p-3 md:p-4">
          <table className="w-full text-left border-separate border-spacing-y-3 md:border-spacing-y-4">
            <thead>
              <tr className="text-[10px] md:text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold">
                <th className="px-4 pb-3 font-medium">Empleado</th>
                <th className="px-4 pb-3 text-right font-medium">Sueldo Generado</th>
                <th className="px-4 pb-3 text-right text-emerald-600/80 font-medium">Préstamo</th>
                <th className="px-4 pb-3 text-right text-rose-600/80 font-medium">Anticipo</th>
                <th className="px-4 pb-3 text-right text-blue-600/80 font-medium">Tarjeta</th>
                <th className="px-4 pb-3 text-right text-emerald-600 font-medium">A Pagar</th>
              </tr>
            </thead>
            <tbody>
              {renglones.map((renglon) => (
                <tr
                  key={renglon.empleado_id}
                  className={`
                    group transition-all duration-200
                    bg-white/40 dark:bg-neutral-950/40
                    hover:bg-white/70 dark:hover:bg-neutral-900/60
                    ${!isReadOnly ? 'hover:shadow-md hover:scale-[1.005]' : ''}
                    rounded-2xl
                  `}
                >
                  {/* Empleado */}
                  <td className="p-4 rounded-l-2xl">
                    <div className="flex items-center gap-3.5">
                      {renglon.foto_perfil_url ? (
                        <div className="relative w-11 h-11 rounded-full overflow-hidden ring-1 ring-emerald-200/50 dark:ring-emerald-900/40 shadow-sm flex-shrink-0">
                          <Image src={renglon.foto_perfil_url} alt={renglon.nombre_completo} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950 dark:to-neutral-900 flex items-center justify-center ring-1 ring-emerald-200/40 dark:ring-emerald-900/30 shadow-sm flex-shrink-0">
                          <UserRound size={20} className="text-emerald-600/70 dark:text-emerald-500/70" />
                        </div>
                      )}
                      
                      <div>
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm leading-tight">
                          {renglon.nombre_completo}
                        </div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                          Base: {formatMoney(renglon.sueldo_base)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Sueldo Calculado */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2.5 font-bold text-neutral-800 dark:text-neutral-100">
                      {!isReadOnly && (
                        <button
                          onClick={() => setEmpleadoCalculadora(renglon)}
                          className="p-2 rounded-xl bg-white/80 dark:bg-neutral-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-neutral-200/50 dark:border-neutral-800/50"
                          title="Calculadora de asistencia"
                        >
                          <Calculator size={16} />
                        </button>
                      )}
                      <span className="text-emerald-600/70 dark:text-emerald-500/70 font-semibold">$</span>
                      
                      {isReadOnly ? (
                        <span className="text-lg tabular-nums">{renglon.sueldo_calculado}</span>
                      ) : (
                        <input
                          type="number"
                          value={renglon.sueldo_calculado || ''}
                          onChange={e => onChange(renglon.empleado_id, 'sueldo_calculado', Number(e.target.value))}
                          className="w-28 text-right bg-transparent border-b-2 border-transparent focus:border-emerald-500 text-lg font-bold outline-none transition-all tabular-nums"
                          placeholder="0"
                        />
                      )}
                    </div>
                  </td>

                  {/* Préstamo */}
                  <td className="p-4 text-right">
                    <span className={`
                      px-3 py-1.5 rounded-lg text-sm font-semibold
                      bg-white/70 dark:bg-neutral-900/60
                      border border-emerald-200/40 dark:border-emerald-900/30
                      ${renglon.descuento_prestamo > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-neutral-400'}
                    `}>
                      - {formatMoney(renglon.descuento_prestamo)}
                    </span>
                  </td>

                  {/* Anticipo */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                      <span className="text-rose-400/70 font-normal">- $</span>
                      {isReadOnly ? (
                        <span className="tabular-nums">{renglon.descuento_anticipo || 0}</span>
                      ) : (
                        <input
                          type="number"
                          value={renglon.descuento_anticipo || ''}
                          onChange={e => onChange(renglon.empleado_id, 'descuento_anticipo', Number(e.target.value))}
                          className="w-24 text-right bg-white/60 dark:bg-neutral-900/50 px-3 py-1.5 rounded-xl border border-rose-200/40 dark:border-rose-900/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 outline-none transition-all shadow-sm tabular-nums"
                        />
                      )}
                    </div>
                  </td>

                  {/* Tarjeta */}
                  <td className="p-4 text-right">
                    {renglon.recibe_pago_tarjeta ? (
                      <div className="flex items-center justify-end gap-2 font-semibold text-blue-600 dark:text-blue-400">
                        {!isReadOnly && (
                          <button
                            onClick={() => onSaveTarjeta(renglon.empleado_id, renglon.descuento_tarjeta)}
                            className="p-2 rounded-xl bg-white/70 dark:bg-neutral-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-400 hover:text-blue-600 transition-colors border border-blue-200/40 dark:border-blue-900/30"
                            title="Guardar como pago por defecto"
                          >
                            <Save size={16} />
                          </button>
                        )}
                        <span className="text-blue-400/70 font-normal">- $</span>
                        {isReadOnly ? (
                          <span className="tabular-nums">{renglon.descuento_tarjeta || 0}</span>
                        ) : (
                          <input
                            type="number"
                            value={renglon.descuento_tarjeta || ''}
                            onChange={e => onChange(renglon.empleado_id, 'descuento_tarjeta', Number(e.target.value))}
                            className="w-24 text-right bg-white/60 dark:bg-neutral-900/50 px-3 py-1.5 rounded-xl border border-blue-200/40 dark:border-blue-900/30 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all shadow-sm tabular-nums"
                          />
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 italic px-4 py-1.5 bg-neutral-100/70 dark:bg-neutral-800/40 rounded-xl">
                        Efectivo
                      </span>
                    )}
                  </td>

                  {/* Neto Efectivo */}
                  <td className="p-4 text-right rounded-r-2xl bg-emerald-50/40 dark:bg-emerald-950/30 border-l border-emerald-500/20">
                    <span className="text-xl md:text-2xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {formatMoney(renglon.pago_neto)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="bg-emerald-50/40 dark:bg-emerald-950/30 border-t border-emerald-500/10 p-5 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-emerald-700/80 dark:text-emerald-400/80 hidden sm:block">
            Resumen Total
          </span>

          <div className="flex flex-wrap gap-6 md:gap-10 text-sm font-medium ml-auto">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase">Generado</span>
              <span className="text-neutral-800 dark:text-neutral-200 tabular-nums">{formatMoney(totales.sueldosGenerados)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-emerald-600/80 uppercase">Préstamos</span>
              <span className="text-emerald-700 dark:text-emerald-400 tabular-nums">- {formatMoney(totales.prestamos)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-rose-600/80 uppercase">Anticipos</span>
              <span className="text-rose-600 tabular-nums">- {formatMoney(totales.anticipos)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-blue-600/80 uppercase">Tarjetas</span>
              <span className="text-blue-600 tabular-nums">- {formatMoney(totales.tarjetas)}</span>
            </div>
            <div className="flex flex-col items-end pl-4 border-l border-emerald-500/20">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-semibold">Efectivo Total</span>
              <span className="text-2xl md:text-3xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                {formatMoney(totales.pagoNetoEfectivo)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ModalCalculadora
        isOpen={empleadoCalculadora !== null}
        onClose={() => setEmpleadoCalculadora(null)}
        empleadoNombre={empleadoCalculadora?.nombre_completo || ''}
        onApply={(valores) => {
          if (empleadoCalculadora) onCalculate(empleadoCalculadora.empleado_id, valores)
        }}
      />
    </>
  )
}