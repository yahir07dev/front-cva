'use client'

import { useState } from 'react'
import { useGenerarNomina } from '@/src/hooks/useGenerarNomina'
import TablaNominaReactiva from './TablaNominaReactiva'
import { FileCheck2, Loader2, UserPlus, CalendarDays, Save, Download, ChevronDown, Check } from 'lucide-react'
import { generarPDFNomina } from '@/src/lib/utils/reporteNominaGenerator'

export default function GenerarNominaClient({ canManage }: { canManage: boolean }) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('')
  const [extraId, setExtraId] = useState<string>('')
  
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)
  const [isEmpMenuOpen, setIsEmpMenuOpen] = useState(false)
  
  const { 
    loading, guardando, renglones, totales, 
    empleadosDisponibles, fechasDisponibles, fechaActual, isReadOnly,
    cargarGrupo, agregarEmpleadoExtra, handleChangeCelda, 
    aplicarCalculadora, guardarTarjeta, handleGuardarNomina
  } = useGenerarNomina()

  const empleadosParaAgregar = empleadosDisponibles.filter(
    emp => !renglones.some(r => r.empleado_id === emp.id)
  )

  const candadoActivo = isReadOnly || !canManage

  const onSaveAndDownload = async () => {
    await handleGuardarNomina()
    descargarSoloPDF()
  }

  const descargarSoloPDF = () => {
    const detalleParaPDF = renglones.map(r => ({
      ...r, total_percepciones: r.sueldo_calculado,
      empleados: { nombre: r.nombre_completo.split(' ')[0], apellidos: r.nombre_completo.split(' ').slice(1).join(' '), areas: { nombre: 'General' } }
    }))
    generarPDFNomina(fechaActual, detalleParaPDF)
  }

  const selectedDateLabel = fechasDisponibles.find(f => f.fecha === fechaSeleccionada)?.etiqueta || "Selecciona un sábado o domingo..."
  const selectedEmp = empleadosParaAgregar.find(e => e.id.toString() === extraId)
  const selectedEmpLabel = selectedEmp ? `${selectedEmp.nombre} ${selectedEmp.apellidos}` : "Buscar empleado extra..."

  return (
    <div className="max-w-7xl mx-auto pb-32 md:pb-40">
      
      {/* Overlay para cerrar menús */}
      {(isDateMenuOpen || isEmpMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => { setIsDateMenuOpen(false); setIsEmpMenuOpen(false) }} 
        />
      )}

      {/* Header con glassmorphism */}
      <div className="
        bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl 
        border border-neutral-200/30 dark:border-neutral-800/40 
        rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/30 
        p-5 sm:p-6 mb-8 relative z-50
      ">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
          
          {/* Selector de Fecha */}
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full">
            <div className="relative flex-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1.5 ml-1">
                <CalendarDays size={16} />
                Fecha de Pago
              </label>
              
              <button
                onClick={() => { setIsDateMenuOpen(!isDateMenuOpen); setIsEmpMenuOpen(false) }}
                className={`
                  w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200
                  bg-white/60 dark:bg-neutral-950/50 border border-emerald-200/40 dark:border-emerald-900/30
                  hover:border-emerald-400/60 focus:border-emerald-500
                  ${isDateMenuOpen ? 'border-emerald-500 shadow-sm' : ''}
                `}
              >
                <span className="truncate">{selectedDateLabel}</span>
                <ChevronDown size={18} className={`transition-transform ${isDateMenuOpen ? 'rotate-180 text-emerald-600' : 'text-neutral-400'}`} />
              </button>

              {isDateMenuOpen && (
                <div className="
                  absolute top-full mt-2 w-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl 
                  border border-emerald-200/30 dark:border-emerald-900/30 rounded-2xl 
                  shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2
                ">
                  <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300/40 dark:scrollbar-thumb-emerald-700/50 p-2">
                    {fechasDisponibles.map((f, i) => (
                      <button
                        key={i}
                        onClick={() => { setFechaSeleccionada(f.fecha); setIsDateMenuOpen(false) }}
                        className={`
                          w-full flex items-center justify-between text-left px-5 py-3 rounded-xl text-sm font-medium transition-all
                          ${fechaSeleccionada === f.fecha 
                            ? 'bg-emerald-600 text-white font-semibold' 
                            : 'text-neutral-700 dark:text-neutral-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }
                        `}
                      >
                        {f.etiqueta}
                        {fechaSeleccionada === f.fecha && <Check size={18} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => cargarGrupo(fechaSeleccionada)}
              disabled={loading || !fechaSeleccionada}
              className="
                px-8 py-3.5 rounded-2xl font-semibold text-sm shadow-md transition-all
                bg-emerald-600 hover:bg-emerald-700 text-white
                disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 min-w-[160px] h-[54px]
              "
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Cargar Nómina'}
            </button>
          </div>

          {/* Sección Empleados Extra (solo si hay renglones y no candado) */}
          {renglones.length > 0 && !candadoActivo && (
            <>
              <div className="hidden lg:block w-px h-14 bg-emerald-200/40 dark:bg-emerald-900/30 self-center" />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 w-full lg:w-auto">
                <div className="relative flex-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1.5 ml-1">
                    Excepciones
                  </label>
                  
                  <button
                    onClick={() => { setIsEmpMenuOpen(!isEmpMenuOpen); setIsDateMenuOpen(false) }}
                    className={`
                      w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200
                      bg-white/60 dark:bg-neutral-950/50 border border-emerald-200/40 dark:border-emerald-900/30
                      hover:border-emerald-400/60 focus:border-emerald-500
                      ${isEmpMenuOpen ? 'border-emerald-500 shadow-sm' : ''}
                    `}
                  >
                    <span className="truncate">{selectedEmpLabel}</span>
                    <ChevronDown size={18} className={`transition-transform ${isEmpMenuOpen ? 'rotate-180 text-emerald-600' : 'text-neutral-400'}`} />
                  </button>

                  {isEmpMenuOpen && (
                    <div className="
                      absolute top-full mt-2 w-full lg:w-80 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl 
                      border border-emerald-200/30 dark:border-emerald-900/30 rounded-2xl 
                      shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 right-0
                    ">
                      <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300/40 dark:scrollbar-thumb-emerald-700/50 p-2">
                        {empleadosParaAgregar.length === 0 ? (
                          <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 py-6">No hay más empleados disponibles</p>
                        ) : (
                          empleadosParaAgregar.map(emp => (
                            <button
                              key={emp.id}
                              onClick={() => { setExtraId(emp.id.toString()); setIsEmpMenuOpen(false) }}
                              className={`
                                w-full text-left px-5 py-3 rounded-xl transition-all text-sm
                                ${extraId === emp.id.toString() 
                                  ? 'bg-emerald-600 text-white font-semibold' 
                                  : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-neutral-800 dark:text-neutral-200'
                                }
                              `}
                            >
                              <div className="font-semibold">{emp.nombre} {emp.apellidos}</div>
                              <div className="text-xs text-emerald-200/80 mt-0.5">
                                Día asignado: {emp.dia_pago || 'Sin asignar'}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { if (extraId) { agregarEmpleadoExtra(Number(extraId)); setExtraId('') } }}
                  disabled={!extraId}
                  className="
                    p-3.5 rounded-2xl bg-white/60 dark:bg-neutral-950/50 
                    border border-emerald-200/40 dark:border-emerald-900/30
                    hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600
                    disabled:opacity-40 transition-all h-[54px] w-[54px] flex items-center justify-center
                  "
                >
                  <UserPlus size={22} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <TablaNominaReactiva 
        renglones={renglones} 
        isReadOnly={candadoActivo} 
        onChange={handleChangeCelda} 
        onCalculate={aplicarCalculadora}
        onSaveTarjeta={guardarTarjeta}
        totales={totales} 
      />

      {/* Footer flotante con glassmorphism */}
      {renglones.length > 0 && (
        <div className="fixed bottom-6 sm:bottom-8 left-0 right-0 z-50 flex justify-center px-4 animate-in slide-in-from-bottom">
          <div className="
            bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl 
            border border-neutral-200/40 dark:border-neutral-800/40 
            shadow-2xl shadow-black/10 dark:shadow-black/40 
            rounded-full px-5 py-3 sm:py-4 flex items-center gap-6 sm:gap-10
          ">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <FileCheck2 size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">A Pagar en Efectivo</p>
                <p className="text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totales.pagoNetoEfectivo)}
                </p>
              </div>
            </div>

            {!candadoActivo ? (
              <button
                onClick={onSaveAndDownload}
                disabled={guardando}
                className="
                  bg-emerald-600 hover:bg-emerald-700 text-white 
                  px-8 py-3.5 rounded-full font-semibold text-sm 
                  shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-3
                  disabled:opacity-50
                "
              >
                {guardando ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                Guardar y Generar PDF
              </button>
            ) : (
              <button
                onClick={descargarSoloPDF}
                className="
                  bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-200 dark:hover:bg-white 
                  text-white dark:text-neutral-900 
                  px-8 py-3.5 rounded-full font-semibold text-sm 
                  shadow-lg transition-all flex items-center gap-3
                "
              >
                <Download size={20} />
                Descargar PDF
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}