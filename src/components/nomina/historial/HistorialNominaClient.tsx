'use client'

import { useState, useMemo, useCallback } from 'react'
import { getDetalleNominaPorFechaAction } from '@/src/actions/nomina/generarActions'
import { generarPDFNomina } from '@/src/lib/utils/reporteNominaGenerator'
import { FileDown, History, Loader2, CalendarDays, ChevronDown } from 'lucide-react'

const MESES = [
  { id: 1, nombre: 'Ene', completo: 'Enero' },
  { id: 2, nombre: 'Feb', completo: 'Febrero' },
  { id: 3, nombre: 'Mar', completo: 'Marzo' },
  { id: 4, nombre: 'Abr', completo: 'Abril' },
  { id: 5, nombre: 'May', completo: 'Mayo' },
  { id: 6, nombre: 'Jun', completo: 'Junio' },
  { id: 7, nombre: 'Jul', completo: 'Julio' },
  { id: 8, nombre: 'Ago', completo: 'Agosto' },
  { id: 9, nombre: 'Sep', completo: 'Septiembre' },
  { id: 10, nombre: 'Oct', completo: 'Octubre' },
  { id: 11, nombre: 'Nov', completo: 'Noviembre' },
  { id: 12, nombre: 'Dic', completo: 'Diciembre' },
];

interface HistorialNominaClientProps {
  initialHistorial: any[]
}

export default function HistorialNominaClient({ initialHistorial }: HistorialNominaClientProps) {
  const [descargando, setDescargando] = useState<string | null>(null)
  
  // ESTADOS (Evitamos recalcular new Date() en cada render)
  const [fechaActual] = useState(() => new Date()) 
  const [selectedYear, setSelectedYear] = useState<number>(fechaActual.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(fechaActual.getMonth() + 1); 
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  const availableYears = useMemo(() => {
    const years = new Set(initialHistorial.map(item => parseInt(item.fecha.split('-')[0])));
    years.add(fechaActual.getFullYear()); 
    return Array.from(years).sort((a, b) => b - a); 
  }, [initialHistorial, fechaActual]);

  const filteredHistorial = useMemo(() => {
    return initialHistorial.filter(item => {
      const [y, m] = item.fecha.split('-');
      return parseInt(y) === selectedYear && parseInt(m) === selectedMonth;
    });
  }, [initialHistorial, selectedYear, selectedMonth]);

  const handleDownload = useCallback(async (fecha: string) => {
    setDescargando(fecha)
    try {
      const detalle = await getDetalleNominaPorFechaAction(fecha)
      generarPDFNomina(fecha, detalle)
    } catch (e: any) {
      alert('Error al generar PDF: ' + e.message)
    } finally {
      setDescargando(null)
    }
  }, [])

  const formatMoney = (n: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

  return (
    <div className="w-full mx-auto flex flex-col min-h-0 h-full">

      <div className="shrink-0 mb-4 sm:mb-5 md:mb-6 space-y-4">
        
        {/* Cabecera Principal */}
        <div className="flex items-center gap-3 sm:gap-4 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-800/50 rounded-[24px] sm:rounded-[32px] p-4 sm:p-5 md:p-6 shadow-sm">
          <div className="h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/50">
            <History size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-neutral-700 dark:text-neutral-300" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-neutral-900 dark:text-white leading-tight">
              Historial de Nóminas
            </h1>
            <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-0.5 sm:mt-1">
              Consulta y descarga reportes anteriores
            </p>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 bg-white/50 dark:bg-neutral-900/30 p-2 sm:p-3 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500">
          
          <div className="relative z-20 shrink-0">
            <button 
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              className={`flex items-center justify-between gap-2 w-[120px] px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${isYearDropdownOpen ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md' : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'}`}
            >
              <span className="flex items-center gap-2">
                <CalendarDays size={16} className={isYearDropdownOpen ? 'opacity-70' : 'text-neutral-400'} />
                {selectedYear}
              </span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${isYearDropdownOpen ? 'rotate-180 opacity-70' : 'text-neutral-400'}`} />
            </button>

            {isYearDropdownOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setIsYearDropdownOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {availableYears.map(year => (
                    <button
                      key={year}
                      onClick={() => { setSelectedYear(year); setIsYearDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${year === selectedYear ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="hidden sm:block w-px h-8 bg-neutral-200 dark:bg-neutral-800" />

          <div className="flex-1 overflow-x-auto scrollbar-none w-full">
            <div className="flex gap-2">
              {MESES.map(mes => (
                <button
                  key={mes.id}
                  onClick={() => setSelectedMonth(mes.id)}
                  className={`px-4 py-2.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${selectedMonth === mes.id ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                >
                  <span className="hidden sm:inline">{mes.completo}</span>
                  <span className="inline sm:hidden">{mes.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="pb-6 sm:pb-8 pr-0.5">

          {filteredHistorial.length === 0 ? (
            <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-800/50 rounded-[24px] sm:rounded-[32px] p-8 sm:p-12 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays size={24} className="text-neutral-400" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
                Mes sin actividad
              </h3>
              <p className="text-sm sm:text-base font-medium text-neutral-500 dark:text-neutral-400">
                No hay nóminas procesadas en {MESES.find(m => m.id === selectedMonth)?.completo} de {selectedYear}.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredHistorial.map((item) => (
                <div key={item.fecha} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md hover:shadow-black/5 p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl transition-all duration-300">
                  
                  <div className="flex flex-wrap items-start sm:items-center gap-4 sm:gap-6 md:gap-8 flex-1 min-w-0">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Fecha de Pago
                      </span>
                      <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white mt-0.5 leading-tight">
                        {new Date(item.fecha + 'T12:00:00').toLocaleDateString('es-MX', { dateStyle: 'long' })}
                      </span>
                    </div>

                    <div className="h-8 sm:h-10 w-px bg-neutral-200 dark:bg-neutral-800 hidden sm:block shrink-0" />

                    <div className="flex flex-col shrink-0">
                      <span className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Personal
                      </span>
                      <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white mt-0.5">
                        {item.total_empleados} Empleados
                      </span>
                    </div>

                    <div className="h-8 sm:h-10 w-px bg-neutral-200 dark:bg-neutral-800 hidden sm:block shrink-0" />

                    <div className="flex flex-col shrink-0">
                      <span className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Total Desembolsado
                      </span>
                      <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                        {formatMoney(item.monto_total)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(item.fecha)}
                    disabled={!!descargando}
                    className={`flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm transition-all duration-200 w-full sm:w-auto shrink-0 active:scale-95 ${descargando === item.fecha ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed' : 'bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 shadow-sm hover:shadow-md'}`}
                  >
                    {descargando === item.fecha ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                    {descargando === item.fecha ? 'Generando...' : 'Descargar PDF'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}