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
    <div className="max-w-7xl mx-auto pb-28 sm:pb-32 md:pb-40 relative">

      {/* Overlay cierra menús */}
      {(isDateMenuOpen || isEmpMenuOpen) && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => { setIsDateMenuOpen(false); setIsEmpMenuOpen(false) }}
        />
      )}

      {/* Header principal */}
      <div className="
        bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl
        border border-neutral-200/30 dark:border-neutral-800/40
        rounded-2xl sm:rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/30
        p-4 sm:p-5 md:p-6 mb-5 sm:mb-6 md:mb-8 relative z-10
      ">
        <div className="flex flex-col gap-4 lg:gap-0 lg:flex-row lg:items-center lg:gap-8">

          {/* Selector de Fecha */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 w-full lg:flex-1">
            <div className="relative flex-1 min-w-0">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1.5 ml-1">
                <CalendarDays size={14} />
                Fecha de Pago
              </label>

              <button
                onClick={() => { setIsDateMenuOpen(!isDateMenuOpen); setIsEmpMenuOpen(false) }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm font-semibold transition-all duration-200
                  bg-white/60 dark:bg-neutral-950/50 border border-emerald-200/40 dark:border-emerald-900/30
                  hover:border-emerald-400/60
                  ${isDateMenuOpen ? 'border-emerald-500 shadow-sm' : ''}
                `}
              >
                <span className="truncate text-xs sm:text-sm">{selectedDateLabel}</span>
                <ChevronDown size={16} className={`shrink-0 ml-2 transition-transform ${isDateMenuOpen ? 'rotate-180 text-emerald-600' : 'text-neutral-400'}`} />
              </button>

              {/* Dropdown fechas */}
              {isDateMenuOpen && (
                <div className="
                  absolute top-full mt-2 left-0 right-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl
                  border border-emerald-200/30 dark:border-emerald-900/30 rounded-2xl
                  shadow-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2
                ">
                  <div className="max-h-52 overflow-y-auto overscroll-contain p-1.5 sm:p-2">
                    {fechasDisponibles.map((f, i) => (
                      <button
                        key={i}
                        onClick={() => { setFechaSeleccionada(f.fecha); setIsDateMenuOpen(false) }}
                        className={`
                          w-full flex items-center justify-between text-left px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all
                          ${fechaSeleccionada === f.fecha
                            ? 'bg-emerald-600 text-white font-semibold'
                            : 'text-neutral-700 dark:text-neutral-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }
                        `}
                      >
                        {f.etiqueta}
                        {fechaSeleccionada === f.fecha && <Check size={15} />}
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
                px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm shadow-md transition-all
                bg-emerald-600 hover:bg-emerald-700 text-white
                disabled:opacity-50 disabled:pointer-events-none
                flex items-center justify-center gap-2
                h-[46px] sm:h-[54px] shrink-0
              "
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Cargar Nómina'}
            </button>
          </div>

          {/* Divider desktop */}
          {renglones.length > 0 && !candadoActivo && (
            <div className="hidden lg:block w-px h-14 bg-emerald-200/40 dark:bg-emerald-900/30 mx-2 shrink-0" />
          )}

          {/* Empleados Extra */}
          {renglones.length > 0 && !candadoActivo && (
            <div className="flex flex-col xs:flex-row items-stretch xs:items-end gap-3 w-full lg:w-auto">
              <div className="relative flex-1 min-w-0">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1.5 ml-1">
                  Excepciones
                </label>

                <button
                  onClick={() => { setIsEmpMenuOpen(!isEmpMenuOpen); setIsDateMenuOpen(false) }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200
                    bg-white/60 dark:bg-neutral-950/50 border border-emerald-200/40 dark:border-emerald-900/30
                    hover:border-emerald-400/60
                    ${isEmpMenuOpen ? 'border-emerald-500 shadow-sm' : ''}
                  `}
                >
                  <span className="truncate">{selectedEmpLabel}</span>
                  <ChevronDown size={16} className={`shrink-0 ml-2 transition-transform ${isEmpMenuOpen ? 'rotate-180 text-emerald-600' : 'text-neutral-400'}`} />
                </button>

                {/* Dropdown empleados */}
                {isEmpMenuOpen && (
                  <div className="
                    absolute top-full mt-2 left-0 right-0 lg:right-auto lg:w-80 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl
                    border border-emerald-200/30 dark:border-emerald-900/30 rounded-2xl
                    shadow-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2
                  ">
                    <div className="max-h-52 overflow-y-auto overscroll-contain p-1.5 sm:p-2">
                      {empleadosParaAgregar.length === 0 ? (
                        <p className="text-xs sm:text-sm text-center text-neutral-500 dark:text-neutral-400 py-5">
                          No hay más empleados disponibles
                        </p>
                      ) : (
                        empleadosParaAgregar.map(emp => (
                          <button
                            key={emp.id}
                            onClick={() => { setExtraId(emp.id.toString()); setIsEmpMenuOpen(false) }}
                            className={`
                              w-full text-left px-4 py-2.5 rounded-xl transition-all text-xs sm:text-sm
                              ${extraId === emp.id.toString()
                                ? 'bg-emerald-600 text-white font-semibold'
                                : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-neutral-800 dark:text-neutral-200'
                              }
                            `}
                          >
                            <div className="font-semibold">{emp.nombre} {emp.apellidos}</div>
                            <div className={`text-[10px] mt-0.5 ${extraId === emp.id.toString() ? 'text-emerald-200' : 'text-neutral-400 dark:text-neutral-500'}`}>
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
                  p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-neutral-950/50
                  border border-emerald-200/40 dark:border-emerald-900/30
                  hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600
                  disabled:opacity-40 transition-all
                  h-[46px] sm:h-[54px] w-[46px] sm:w-[54px] flex items-center justify-center shrink-0
                "
              >
                <UserPlus size={18} className="sm:w-[22px] sm:h-[22px]" />
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

      {/* Footer flotante */}
      {renglones.length > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 md:bottom-8 left-0 right-0 z-10 flex justify-center px-3 sm:px-4 md:pl-64 animate-in slide-in-from-bottom">
          <div className="
            bg-white/85 dark:bg-neutral-900/85 backdrop-blur-2xl
            border border-neutral-200/40 dark:border-neutral-800/40
            shadow-2xl shadow-black/10 dark:shadow-black/40
            rounded-2xl sm:rounded-full
            px-4 sm:px-5 py-3 sm:py-3.5 md:py-4
            flex flex-col xs:flex-row items-center gap-3 sm:gap-6 md:gap-10
            w-full xs:w-auto max-w-sm xs:max-w-none
          ">
            <div className="flex items-center gap-3 sm:gap-4 w-full xs:w-auto">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <FileCheck2 size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1 xs:flex-none">
                <p className="text-[9px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">A Pagar en Efectivo</p>
                <p className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totales.pagoNetoEfectivo)}
                </p>
              </div>
            </div>

            {!candadoActivo ? (
              <button
                onClick={onSaveAndDownload}
                disabled={guardando}
                className="
                  w-full xs:w-auto
                  bg-emerald-600 hover:bg-emerald-700 text-white
                  px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-full font-semibold text-xs sm:text-sm
                  shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2
                  disabled:opacity-50
                "
              >
                {guardando ? <Loader2 size={16} className="sm:w-5 sm:h-5 animate-spin" /> : <Save size={16} className="sm:w-5 sm:h-5" />}
                Guardar y PDF
              </button>
            ) : (
              <button
                onClick={descargarSoloPDF}
                className="
                  w-full xs:w-auto
                  bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-200 dark:hover:bg-white
                  text-white dark:text-neutral-900
                  px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-full font-semibold text-xs sm:text-sm
                  shadow-lg transition-all flex items-center justify-center gap-2
                "
              >
                <Download size={16} className="sm:w-5 sm:h-5" />
                Descargar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}