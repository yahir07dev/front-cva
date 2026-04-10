// src/components/nomina/generar/GenerarNominaClient.tsx
'use client'

import { useState, useMemo, useCallback } from 'react'
import { Loader2, UserPlus, CalendarDays, ChevronDown, Check } from 'lucide-react'
import { useGenerarNomina } from '@/src/hooks/nomina/useGenerarNomina'
import TablaNominaReactiva from './TablaNominaReactiva'
import { generarPDFNomina } from '@/src/lib/utils/reporteNominaGenerator'

export default function GenerarNominaClient({ canManage }: { canManage: boolean }) {
  // 1. ESTADOS LOCALES DE UI
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('')
  const [extraId, setExtraId] = useState<string>('')
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)
  const [isEmpMenuOpen, setIsEmpMenuOpen] = useState(false)

  // 2. HOOK DE LÓGICA PRINCIPAL
  const {
    loading, 
    guardando, 
    renglones, 
    empleadosDisponibles, 
    fechasDisponibles, 
    fechaActual, 
    isReadOnly,
    cargarGrupo, 
    agregarEmpleadoExtra, 
    handleChangeCelda,
    aplicarCalculadora,  
    handleGuardarNomina
  } = useGenerarNomina()

  // 3. OPTIMIZACIONES CON USEMEMO
  // Evitamos recalcular la lista de empleados extra en cada renderizado (tecleo, scroll, etc.)
  const empleadosParaAgregar = useMemo(() => {
    return empleadosDisponibles.filter(
      emp => !renglones.some(r => r.empleado_id === emp.id)
    )
  }, [empleadosDisponibles, renglones])

  const candadoActivo = isReadOnly || !canManage

  const selectedDateLabel = useMemo(() => {
    return fechasDisponibles.find(f => f.fecha === fechaSeleccionada)?.etiqueta || 'Selecciona un sábado o domingo...'
  }, [fechasDisponibles, fechaSeleccionada])

  const selectedEmp = useMemo(() => {
    return empleadosParaAgregar.find(e => e.id.toString() === extraId)
  }, [empleadosParaAgregar, extraId])
  
  const selectedEmpLabel = selectedEmp ? `${selectedEmp.nombre} ${selectedEmp.apellidos}` : 'Buscar empleado extra...'

  // 4. FUNCIONES DE ACCIÓN MEMORIZADAS (useCallback)
  const descargarSoloPDF = useCallback(() => {
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
  }, [renglones, fechaActual])

  const onSaveAndDownload = async () => {
    await handleGuardarNomina()
    descargarSoloPDF()
  }

  // 5. RENDERIZADO
  return (
    <div className="w-full mx-auto flex flex-col h-[calc(100vh-8rem)] pb-4 sm:pb-8 relative">

      {/* Overlay cierra menús */}
      {(isDateMenuOpen || isEmpMenuOpen) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => { setIsDateMenuOpen(false); setIsEmpMenuOpen(false) }}
        />
      )}

      {/* HEADER DE CONTROLES */}
      <div className="
        shrink-0 w-full bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl
        border border-neutral-200/60 dark:border-neutral-800/50
        rounded-[24px] sm:rounded-[32px] shadow-sm
        p-4 sm:p-5 md:p-6 mb-4 md:mb-6 relative z-30
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
                  <div className="max-h-52 overflow-y-auto overscroll-contain p-2 scrollbar-thin scrollbar-thumb-emerald-200 dark:scrollbar-thumb-emerald-900/50">
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
                    <div className="max-h-52 overflow-y-auto overscroll-contain p-2 scrollbar-thin scrollbar-thumb-emerald-200 dark:scrollbar-thumb-emerald-900/50">
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

      <div className="flex-1 min-h-0 flex flex-col w-full">
        {/*  El componente Tabla recibe exactamente las funciones que necesita */}
        <TablaNominaReactiva
          renglones={renglones}
          isReadOnly={candadoActivo}
          onChange={handleChangeCelda}
          onCalculate={aplicarCalculadora}
          onSaveAndDownload={onSaveAndDownload}
          descargarSoloPDF={descargarSoloPDF}
          guardando={guardando}
        />
      </div>
    </div>
  )
}