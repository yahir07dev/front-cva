'use client'

import { useState } from 'react'
import { RenglonNomina } from '@/src/services/nomina/generarNominaService'
import { Calculator, Save, Lock, UserRound } from 'lucide-react'
import ModalCalculadora from './ModalCalculadora'
import Image from 'next/image'
import { ValoresCalculadora } from '@/src/hooks/nomina/useGenerarNomina'

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
        w-full rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300
        bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm
        border border-neutral-200/40 dark:border-neutral-800/50
        shadow-xl shadow-black/5 dark:shadow-black/30
        ${isReadOnly ? 'opacity-90' : ''}
      `}>

        {/* AVISO DE CANDADO */}
        {isReadOnly && (
          <div className="w-full bg-emerald-900/10 dark:bg-emerald-950/30 p-3 px-4 sm:p-4 sm:px-6 border-b border-emerald-500/10 flex items-center gap-2 sm:gap-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400/90">
            <Lock size={14} className="text-emerald-600 dark:text-emerald-500 shrink-0" />
            <span>Nómina autorizada y procesada — solo lectura</span>
          </div>
        )}

        {/* Tabla con scroll horizontal en móvil */}
        <div className="overflow-x-auto w-full">
          <div className="p-2 sm:p-3 md:p-4 min-w-[800px] w-full">
            <table className="w-full text-left border-separate border-spacing-y-2 sm:border-spacing-y-3">
              <thead>
                <tr className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold">
                  <th className="px-3 sm:px-4 pb-2 sm:pb-3 font-medium">Empleado</th>
                  <th className="px-3 sm:px-4 pb-2 sm:pb-3 text-right font-medium">Sueldo</th>
                  <th className="px-3 sm:px-4 pb-2 sm:pb-3 text-right text-emerald-600/80 font-medium">Préstamo</th>
                  <th className="px-3 sm:px-4 pb-2 sm:pb-3 text-right text-rose-600/80 font-medium">Anticipo</th>
                  <th className="px-3 sm:px-4 pb-2 sm:pb-3 text-right text-blue-600/80 font-medium">Tarjeta</th>
                  <th className="px-3 sm:px-4 pb-2 sm:pb-3 text-right text-emerald-600 font-medium">A Pagar</th>
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
                      ${!isReadOnly ? 'hover:shadow-md hover:scale-[1.002]' : ''}
                      rounded-xl sm:rounded-2xl w-full
                    `}
                  >
                    {/* Empleado */}
                    <td className="p-2.5 sm:p-3 md:p-4 rounded-l-xl sm:rounded-l-2xl w-[30%]">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {renglon.foto_perfil_url ? (
                          <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full overflow-hidden ring-1 ring-emerald-200/50 dark:ring-emerald-900/40 shadow-sm shrink-0">
                            <Image src={renglon.foto_perfil_url} alt={renglon.nombre_completo} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950 dark:to-neutral-900 flex items-center justify-center ring-1 ring-emerald-200/40 dark:ring-emerald-900/30 shadow-sm shrink-0">
                            <UserRound size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-600/70 dark:text-emerald-500/70" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm leading-tight truncate">
                            {renglon.nombre_completo}
                          </div>
                          <div className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                            Base: {formatMoney(renglon.sueldo_base)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Sueldo Calculado */}
                    <td className="p-2.5 sm:p-3 md:p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 sm:gap-2 font-bold text-neutral-800 dark:text-neutral-100">
                        {!isReadOnly && (
                          <button
                            onClick={() => setEmpleadoCalculadora(renglon)}
                            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/80 dark:bg-neutral-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-neutral-200/50 dark:border-neutral-800/50"
                            title="Calculadora de asistencia"
                          >
                            <Calculator size={13} className="sm:w-4 sm:h-4" />
                          </button>
                        )}
                        <span className="text-emerald-600/70 dark:text-emerald-500/70 font-semibold text-xs sm:text-sm">$</span>
                        {isReadOnly ? (
                          <span className="text-sm sm:text-base md:text-lg tabular-nums">{renglon.sueldo_calculado}</span>
                        ) : (
                          <input
                            type="number"
                            value={renglon.sueldo_calculado || ''}
                            onChange={e => onChange(renglon.empleado_id, 'sueldo_calculado', Number(e.target.value))}
                            className="w-20 sm:w-24 md:w-28 text-right bg-transparent border-b-2 border-transparent focus:border-emerald-500 text-sm sm:text-base md:text-lg font-bold outline-none transition-all tabular-nums"
                            placeholder="0"
                          />
                        )}
                      </div>
                    </td>

                    {/* Préstamo */}
                    <td className="p-2.5 sm:p-3 md:p-4 text-right whitespace-nowrap">
                      <span className={`
                        px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold
                        bg-white/70 dark:bg-neutral-900/60
                        border border-emerald-200/40 dark:border-emerald-900/30
                        ${renglon.descuento_prestamo > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-neutral-400'}
                      `}>
                        - {formatMoney(renglon.descuento_prestamo)}
                      </span>
                    </td>

                    {/* Anticipo */}
                    <td className="p-2.5 sm:p-3 md:p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 font-semibold text-rose-600 dark:text-rose-400">
                        <span className="text-rose-400/70 font-normal text-xs sm:text-sm">- $</span>
                        {isReadOnly ? (
                          <span className="tabular-nums text-xs sm:text-sm">{renglon.descuento_anticipo || 0}</span>
                        ) : (
                          <input
                            type="number"
                            value={renglon.descuento_anticipo || ''}
                            onChange={e => onChange(renglon.empleado_id, 'descuento_anticipo', Number(e.target.value))}
                            className="w-16 sm:w-20 md:w-24 text-right bg-white/60 dark:bg-neutral-900/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-rose-200/40 dark:border-rose-900/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 outline-none transition-all shadow-sm tabular-nums text-xs sm:text-sm"
                          />
                        )}
                      </div>
                    </td>

                    {/* Tarjeta */}
                    <td className="p-2.5 sm:p-3 md:p-4 text-right whitespace-nowrap">
                      {renglon.recibe_pago_tarjeta ? (
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2 font-semibold text-blue-600 dark:text-blue-400">
                          {!isReadOnly && (
                            <button
                              onClick={() => onSaveTarjeta(renglon.empleado_id, renglon.descuento_tarjeta)}
                              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/70 dark:bg-neutral-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-400 hover:text-blue-600 transition-colors border border-blue-200/40 dark:border-blue-900/30"
                            >
                              <Save size={13} className="sm:w-4 sm:h-4" />
                            </button>
                          )}
                          <span className="text-blue-400/70 font-normal text-xs sm:text-sm">- $</span>
                          {isReadOnly ? (
                            <span className="tabular-nums text-xs sm:text-sm">{renglon.descuento_tarjeta || 0}</span>
                          ) : (
                            <input
                              type="number"
                              value={renglon.descuento_tarjeta || ''}
                              onChange={e => onChange(renglon.empleado_id, 'descuento_tarjeta', Number(e.target.value))}
                              className="w-16 sm:w-20 md:w-24 text-right bg-white/60 dark:bg-neutral-900/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-blue-200/40 dark:border-blue-900/30 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all shadow-sm tabular-nums text-xs sm:text-sm"
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] sm:text-xs font-medium text-neutral-500 dark:text-neutral-400 italic px-2 py-1 sm:px-4 sm:py-1.5 bg-neutral-100/70 dark:bg-neutral-800/40 rounded-lg sm:rounded-xl whitespace-nowrap">
                          Efectivo
                        </span>
                      )}
                    </td>

                    {/* Neto Efectivo */}
                    <td className="p-2.5 sm:p-3 md:p-4 text-right rounded-r-xl sm:rounded-r-2xl bg-emerald-50/40 dark:bg-emerald-950/30 border-l border-emerald-500/20 whitespace-nowrap">
                      <span className="text-base sm:text-xl md:text-2xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {formatMoney(renglon.pago_neto)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totales */}
        <div className="w-full bg-emerald-50/40 dark:bg-emerald-950/30 border-t border-emerald-500/10 p-3 sm:p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700/80 dark:text-emerald-400/80 hidden sm:block shrink-0">
              Resumen Total
            </span>

            {/* Scroll horizontal en móvil para los totales */}
            <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 w-full flex sm:justify-end">
              <div className="flex gap-4 sm:gap-6 md:gap-10 text-sm font-medium min-w-max sm:min-w-0 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400 uppercase">Generado</span>
                  <span className="text-neutral-800 dark:text-neutral-200 tabular-nums text-xs sm:text-sm">{formatMoney(totales.sueldosGenerados)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] sm:text-[10px] text-emerald-600/80 uppercase">Préstamos</span>
                  <span className="text-emerald-700 dark:text-emerald-400 tabular-nums text-xs sm:text-sm">- {formatMoney(totales.prestamos)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] sm:text-[10px] text-rose-600/80 uppercase">Anticipos</span>
                  <span className="text-rose-600 tabular-nums text-xs sm:text-sm">- {formatMoney(totales.anticipos)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] sm:text-[10px] text-blue-600/80 uppercase">Tarjetas</span>
                  <span className="text-blue-600 tabular-nums text-xs sm:text-sm">- {formatMoney(totales.tarjetas)}</span>
                </div>
                <div className="flex flex-col items-end pl-4 border-l border-emerald-500/20 shrink-0">
                  <span className="text-[9px] sm:text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-semibold">Efectivo Total</span>
                  <span className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {formatMoney(totales.pagoNetoEfectivo)}
                  </span>
                </div>
              </div>
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