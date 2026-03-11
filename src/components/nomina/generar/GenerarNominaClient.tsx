'use client'

import { useState } from 'react'
import { useGenerarNomina } from '@/src/hooks/nomina/useGenerarNomina'
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
      ...r,
      total_percepciones: r.sueldo_calculado,
      empleados: {
        nombre: r.nombre_completo.split(' ')[0],
        apellidos: r.nombre_completo.split(' ').slice(1).join(' '),
        areas: { nombre: 'General' }
      }
    }))
    generarPDFNomina(fechaActual, detalleParaPDF)
  }

  const selectedDateLabel = fechasDisponibles.find(f => f.fecha === fechaSeleccionada)?.etiqueta || 'Selecciona un sábado o domingo...'
  const selectedEmp = empleadosParaAgregar.find(e => e.id.toString() === extraId)
  const selectedEmpLabel = selectedEmp ? `${selectedEmp.nombre} ${selectedEmp.apellidos}` : 'Buscar empleado extra...'

  return (
    <div className="w-full mx-auto pb-20 md:pb-24 relative">

      {/* Overlay cierra menús */}
      {(isDateMenuOpen || isEmpMenuOpen) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => { setIsDateMenuOpen(false); setIsEmpMenuOpen(false) }}
        />
      )}

      {/* HEADER DE CONTROLES */}
      <div className="
        w-full bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl
        border border-neutral-200/60 dark:border-neutral-800/50
        rounded-[24px] sm:rounded-[32px] shadow-sm
        p-4 sm:p-5 md:p-6 mb-6 md:mb-8 relative z-30
      ">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 w-full">

          {/* Selector de Fecha */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full lg:w-1/2">
            <div className="relative flex-1 min-w-0">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">
                <CalendarDays size={14} />
                Fecha de Pago
              </label>

              <button
                onClick={() => { setIsDateMenuOpen(!isDateMenuOpen); setIsEmpMenuOpen(false) }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 sm:py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200
                  bg-neutral-50 dark:bg-neutral-950 border 
                  ${isDateMenuOpen 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                    : 'border-neutral-200/60 dark:border-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-700'}
                `}
              >
                <span className="truncate text-neutral-900 dark:text-white">{selectedDateLabel}</span>
                <ChevronDown size={16} className={`shrink-0 ml-2 transition-transform ${isDateMenuOpen ? 'rotate-180 text-emerald-500' : 'text-neutral-400'}`} />
              </button>

              {/* Dropdown fechas */}
              {isDateMenuOpen && (
                <div className="
                  absolute top-full mt-2 left-0 right-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl
                  border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl
                  shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2
                ">
                  <div className="max-h-52 overflow-y-auto overscroll-contain p-2">
                    {fechasDisponibles.map((f, i) => (
                      <button
                        key={i}
                        onClick={() => { setFechaSeleccionada(f.fecha); setIsDateMenuOpen(false) }}
                        className={`
                          w-full flex items-center justify-between text-left px-4 py-3 rounded-xl text-sm font-medium transition-all
                          ${fechaSeleccionada === f.fecha
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          }
                        `}
                      >
                        {f.etiqueta}
                        {fechaSeleccionada === f.fecha && <Check size={16} strokeWidth={3} />}
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
                px-6 py-3 sm:py-3.5 rounded-2xl font-bold text-sm shadow-sm transition-all
                bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black
                disabled:opacity-50 disabled:pointer-events-none hover:shadow-lg active:scale-95
                flex items-center justify-center gap-2 h-[46px] sm:h-[52px] shrink-0
              "
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Cargar Nómina'}
            </button>
          </div>

          {/* Divider desktop */}
          {renglones.length > 0 && !candadoActivo && (
            <div className="hidden lg:block w-px h-12 bg-neutral-200 dark:bg-neutral-800 mx-2 shrink-0" />
          )}

          {/* Empleados Extra */}
          {renglones.length > 0 && !candadoActivo && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full lg:w-1/2">
              <div className="relative flex-1 min-w-0">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">
                  Excepciones
                </label>

                <button
                  onClick={() => { setIsEmpMenuOpen(!isEmpMenuOpen); setIsDateMenuOpen(false) }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 sm:py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200
                    bg-neutral-50 dark:bg-neutral-950 border
                    ${isEmpMenuOpen 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                      : 'border-neutral-200/60 dark:border-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-700'}
                  `}
                >
                  <span className="truncate text-neutral-900 dark:text-white">{selectedEmpLabel}</span>
                  <ChevronDown size={16} className={`shrink-0 ml-2 transition-transform ${isEmpMenuOpen ? 'rotate-180 text-emerald-500' : 'text-neutral-400'}`} />
                </button>

                {/* Dropdown empleados */}
                {isEmpMenuOpen && (
                  <div className="
                    absolute top-full mt-2 left-0 right-0 lg:right-auto lg:w-80 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl
                    border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl
                    shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2
                  ">
                    <div className="max-h-52 overflow-y-auto overscroll-contain p-2">
                      {empleadosParaAgregar.length === 0 ? (
                        <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 py-6 font-medium">
                          No hay más empleados disponibles
                        </p>
                      ) : (
                        empleadosParaAgregar.map(emp => (
                          <button
                            key={emp.id}
                            onClick={() => { setExtraId(emp.id.toString()); setIsEmpMenuOpen(false) }}
                            className={`
                              w-full text-left px-4 py-3 rounded-xl transition-all text-sm
                              ${extraId === emp.id.toString()
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                              }
                            `}
                          >
                            <div className="font-bold">{emp.nombre} {emp.apellidos}</div>
                            <div className={`text-[10px] uppercase tracking-widest mt-0.5 ${extraId === emp.id.toString() ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-neutral-400'}`}>
                              Día de pago: {emp.dia_pago || 'Sin asignar'}
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
                  p-3 sm:p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400
                  border border-neutral-200/60 dark:border-neutral-800/50
                  hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10
                  disabled:opacity-40 transition-all active:scale-95
                  h-[46px] sm:h-[52px] w-[46px] sm:w-[52px] flex items-center justify-center shrink-0
                "
              >
                <UserPlus size={20} />
              </button>
            </div>
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

      {/* FOOTER FLOTANTE COMPACTO CORREGIDO */}
      {renglones.length > 0 && (
        <div className="fixed bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-8 fade-in duration-500 pointer-events-none">
          
          <div className="
            pointer-events-auto
            bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white
            p-2 pr-2 pl-6 rounded-full shadow-2xl shadow-black/10 dark:shadow-black/40
            flex items-center gap-4 sm:gap-6 border border-neutral-200 dark:border-neutral-800
          ">
            {/* Texto y Total */}
            <div className="flex items-center gap-3">
              <FileCheck2 size={18} className="text-emerald-600 dark:text-emerald-400 hidden sm:block" />
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Total Efectivo
                </span>
                <span className="text-lg sm:text-xl font-black tabular-nums text-emerald-600 dark:text-emerald-400 leading-none">
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totales.pagoNetoEfectivo)}
                </span>
              </div>
            </div>

            {/* Separador */}
            <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800" />

            {/* Botón de Acción */}
            {!candadoActivo ? (
              <button
                onClick={onSaveAndDownload}
                disabled={guardando}
                className="
                  bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500
                  text-white
                  px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm transition-all
                  flex items-center gap-2 disabled:opacity-50 active:scale-95 shrink-0
                "
              >
                {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span className="hidden sm:inline">Guardar y PDF</span>
                <span className="sm:hidden">Guardar</span>
              </button>
            ) : (
              <button
                onClick={descargarSoloPDF}
                className="
                  bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700
                  text-neutral-900 dark:text-white
                  px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm transition-all
                  flex items-center gap-2 active:scale-95 shrink-0
                "
              >
                <Download size={16} />
                <span className="hidden sm:inline">Descargar PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  )
}