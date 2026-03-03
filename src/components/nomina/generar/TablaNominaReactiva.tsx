'use client'

import { useState } from 'react'
import { RenglonNomina } from '@/src/services/generarNominaService'
import { Calculator, Save, X, Lock } from 'lucide-react'

interface TablaProps {
  renglones: RenglonNomina[]
  isReadOnly: boolean
  onChange: (id: number, campo: keyof RenglonNomina, valor: number) => void
  onCalculate: (id: number, dias: number, medios: number, horas: number, descansoMode: number) => void
  onSaveTarjeta: (id: number, monto: number) => void
  totales: any
}

export default function TablaNominaReactiva({ renglones, isReadOnly, onChange, onCalculate, onSaveTarjeta, totales }: TablaProps) {
  const [calcOpen, setCalcOpen] = useState<number | null>(null)
  
  const [dias, setDias] = useState(6)
  const [medios, setMedios] = useState(0)
  const [horas, setHoras] = useState(0)
  const [descanso, setDescanso] = useState(1)

  const openCalc = (id: number) => {
    if (isReadOnly) return;
    setDias(6); setMedios(0); setHoras(0); setDescanso(1);
    setCalcOpen(id);
  }

  const applyCalc = () => {
    if(calcOpen) onCalculate(calcOpen, dias, medios, horas, descanso);
    setCalcOpen(null);
  }

  const formatMoney = (num: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num || 0)

  if (renglones.length === 0) return null;

  return (
    <div className={`bg-white dark:bg-neutral-900 rounded-[32px] border shadow-sm overflow-visible animate-in fade-in ${isReadOnly ? 'border-neutral-200/50 opacity-95' : 'border-neutral-200/60 dark:border-neutral-800'}`}>
      
      {/* AVISO DE CANDADO */}
      {isReadOnly && (
        <div className="bg-neutral-100/50 dark:bg-neutral-900/50 p-3 px-6 border-b border-neutral-200/50 flex items-center gap-2 text-xs font-bold text-neutral-500 rounded-t-[32px]">
          <Lock size={14} /> Esta nómina ya ha sido autorizada y procesada. Modo de solo lectura.
        </div>
      )}

      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200/60 text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
              <th className="p-4">Empleado</th>
              <th className="p-4 text-right">Sueldo Generado</th>
              <th className="p-4 text-right text-orange-500">Préstamo</th>
              <th className="p-4 text-right text-rose-500">Anticipo</th>
              <th className="p-4 text-right text-blue-500">Tarjeta (Viernes)</th>
              <th className="p-4 text-right text-emerald-500">A Pagar (Efectivo)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
            {renglones.map((renglon) => (
              <tr key={renglon.empleado_id} className={`transition-colors group relative ${!isReadOnly && 'hover:bg-neutral-50/50'}`}>
                
                <td className="p-4 text-sm font-bold text-neutral-900 dark:text-white">
                  {renglon.nombre_completo}
                  <div className="text-[10px] font-medium text-neutral-400">Base: {formatMoney(renglon.sueldo_base)}</div>
                </td>
                
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end font-black text-neutral-800 dark:text-white relative">
                    {!isReadOnly && (
                      <button onClick={() => openCalc(renglon.empleado_id)} className="mr-2 text-neutral-300 hover:text-orange-500 transition-colors" title="Calculadora de Asistencia">
                        <Calculator size={16} />
                      </button>
                    )}
                    <span className="mr-1">$</span>
                    
                    {isReadOnly ? (
                      <span className="w-20 text-right">{renglon.sueldo_calculado}</span>
                    ) : (
                      <input 
                        type="number" value={renglon.sueldo_calculado || ''} 
                        onChange={e => onChange(renglon.empleado_id, 'sueldo_calculado', Number(e.target.value))}
                        className="w-20 text-right bg-transparent border-b border-transparent focus:border-orange-500 outline-none"
                      />
                    )}

                    {calcOpen === renglon.empleado_id && !isReadOnly && (
                      <div className="absolute top-10 right-0 z-50 w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-3xl shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider">Ajuste Asistencia</h4>
                          <button onClick={() => setCalcOpen(null)}><X size={16} className="text-neutral-400"/></button>
                        </div>
                        <div className="space-y-3 text-left">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-neutral-500">Días Completos</span>
                            <input type="number" min="0" max="7" value={dias} onChange={e=>setDias(Number(e.target.value))} className="w-16 p-1 text-center rounded-lg border outline-none focus:border-orange-500 dark:bg-neutral-950"/>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-neutral-500">Medios Turnos (5 hrs)</span>
                            <input type="number" min="0" max="7" value={medios} onChange={e=>setMedios(Number(e.target.value))} className="w-16 p-1 text-center rounded-lg border outline-none focus:border-orange-500 dark:bg-neutral-950"/>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-neutral-500">Horas Sueltas</span>
                            <input type="number" min="0" value={horas} onChange={e=>setHoras(Number(e.target.value))} className="w-16 p-1 text-center rounded-lg border outline-none focus:border-orange-500 dark:bg-neutral-950"/>
                          </div>
                          <div className="flex justify-between items-center text-xs pt-1">
                            <span className="font-bold text-neutral-500">Día Descanso</span>
                            <select value={descanso} onChange={e=>setDescanso(Number(e.target.value))} className="p-1.5 rounded-lg border outline-none focus:border-orange-500 dark:bg-neutral-950">
                              <option value={1}>Pagado (Completo)</option>
                              <option value={0.5}>Pagado (Medio)</option>
                              <option value={0}>Sin Pagar</option>
                            </select>
                          </div>
                          <button onClick={applyCalc} className="w-full mt-2 bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] transition-transform">
                            Aplicar Redondeo Exacto
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>

                <td className="p-4 text-right">
                  <span className={`text-sm font-bold ${renglon.descuento_prestamo > 0 ? 'text-orange-500' : 'text-neutral-300'}`}>
                    - {formatMoney(renglon.descuento_prestamo)}
                  </span>
                </td>

                <td className="p-3 text-right bg-rose-50/30 dark:bg-rose-900/5">
                  <div className="flex items-center justify-end font-bold text-rose-600">
                    <span className="mr-1">- $</span>
                    {isReadOnly ? (
                      <span className="w-20 text-right">{renglon.descuento_anticipo || 0}</span>
                    ) : (
                      <input type="number" value={renglon.descuento_anticipo || ''} onChange={e => onChange(renglon.empleado_id, 'descuento_anticipo', Number(e.target.value))} className="w-20 text-right bg-transparent border-b border-transparent focus:border-rose-500 outline-none" />
                    )}
                  </div>
                </td>

                <td className={`p-3 text-right ${renglon.recibe_pago_tarjeta ? 'bg-blue-50/30' : ''}`}>
                  {renglon.recibe_pago_tarjeta ? (
                    <div className="flex items-center justify-end font-bold text-blue-600">
                      {!isReadOnly && (
                        <button onClick={() => onSaveTarjeta(renglon.empleado_id, renglon.descuento_tarjeta)} className="mr-2 text-blue-300 hover:text-blue-600 transition-colors" title="Guardar como pago por defecto">
                          <Save size={14} />
                        </button>
                      )}
                      <span className="mr-1">- $</span>
                      {isReadOnly ? (
                        <span className="w-20 text-right">{renglon.descuento_tarjeta || 0}</span>
                      ) : (
                        <input type="number" value={renglon.descuento_tarjeta || ''} onChange={e => onChange(renglon.empleado_id, 'descuento_tarjeta', Number(e.target.value))} className="w-20 text-right bg-transparent border-b border-transparent focus:border-blue-500 outline-none" />
                      )}
                    </div>
                  ) : <span className="text-xs text-neutral-400 italic">Efectivo</span>}
                </td>

                <td className="p-4 text-right text-sm font-black text-emerald-600 bg-emerald-50/30">
                  {formatMoney(renglon.pago_neto)}
                </td>

              </tr>
            ))}
          </tbody>
          <tfoot className="bg-neutral-50 dark:bg-neutral-950 border-t-2">
            <tr className="text-sm font-black">
              <td className="p-4">TOTALES</td>
              <td className="p-4 text-right">{formatMoney(totales.sueldosGenerados)}</td>
              <td className="p-4 text-right text-orange-500">- {formatMoney(totales.prestamos)}</td>
              <td className="p-4 text-right text-rose-500">- {formatMoney(totales.anticipos)}</td>
              <td className="p-4 text-right text-blue-500">- {formatMoney(totales.tarjetas)}</td>
              <td className="p-4 text-right text-emerald-600 text-base">{formatMoney(totales.pagoNetoEfectivo)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}