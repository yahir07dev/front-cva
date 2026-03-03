'use client'

import { useState } from 'react'
import { useGenerarNomina } from '@/src/hooks/useGenerarNomina'
import TablaNominaReactiva from './TablaNominaReactiva'
import { FileCheck2, Loader2, UserPlus, CalendarDays, Save, Download } from 'lucide-react'
import { generarPDFNomina } from '@/src/lib/utils/reporteNominaGenerator'

export default function GenerarNominaClient({ canManage }: { canManage: boolean }) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('')
  const [extraId, setExtraId] = useState<string>('') 
  
  const { 
    loading, guardando, renglones, totales, 
    empleadosDisponibles, fechasDisponibles, fechaActual, isReadOnly,
    cargarGrupo, agregarEmpleadoExtra, handleChangeCelda, 
    aplicarCalculadora, guardarTarjeta, handleGuardarNomina
  } = useGenerarNomina()

  const empleadosParaAgregar = empleadosDisponibles.filter(
    emp => !renglones.some(r => r.empleado_id === emp.id)
  )

  // Candado definitivo
  const candadoActivo = isReadOnly || !canManage;

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
    }));
    generarPDFNomina(fechaActual, detalleParaPDF)
  }

  return (
    <div className="max-w-7xl mx-auto pb-32">
      
      <div className="bg-white dark:bg-neutral-900 p-5 rounded-[24px] border border-neutral-200/60 dark:border-neutral-800 shadow-sm mb-6 flex flex-col md:flex-row md:items-end gap-4">
        
        <div className="flex-1">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1 mb-1">
            <CalendarDays size={14}/> Seleccionar Fecha de Pago
          </label>
          <select 
            value={fechaSeleccionada} 
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm font-bold outline-none focus:border-orange-500 transition-all"
          >
            <option value="">Selecciona un sábado o domingo del mes...</option>
            {fechasDisponibles.map((f, i) => (
              <option key={i} value={f.fecha}>{f.etiqueta}</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={() => cargarGrupo(fechaSeleccionada)} 
          disabled={loading || !fechaSeleccionada} 
          className="bg-black dark:bg-white text-white dark:text-black px-8 py-3.5 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 h-[52px]"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Generar Tabla'}
        </button>

        {/* Solo mostramos el input de Extras si no está bloqueado */}
        {renglones.length > 0 && !candadoActivo && (
           <div className="flex gap-2 border-l pl-4 border-neutral-200 dark:border-neutral-800">
             <select 
               value={extraId} 
               onChange={e => setExtraId(e.target.value)}
               className="w-48 sm:w-60 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-sm font-bold text-neutral-700 dark:text-neutral-300 outline-none focus:border-orange-500 transition-all"
             >
               <option value="">Buscar empleado extra...</option>
               {empleadosParaAgregar.map(emp => (
                 <option key={emp.id} value={emp.id}>{emp.nombre} {emp.apellidos} ({emp.dia_pago || 'Sin asignar'})</option>
               ))}
             </select>
             <button 
               onClick={() => { if(extraId) { agregarEmpleadoExtra(Number(extraId)); setExtraId(''); } }} 
               disabled={!extraId}
               className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors disabled:opacity-50"
             >
               <UserPlus size={18} />
             </button>
           </div>
        )}
      </div>

      <TablaNominaReactiva 
        renglones={renglones} 
        isReadOnly={candadoActivo} 
        onChange={handleChangeCelda} 
        onCalculate={aplicarCalculadora}
        onSaveTarjeta={guardarTarjeta}
        totales={totales} 
      />

      {renglones.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 animate-in slide-in-from-bottom-10">
          <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800 shadow-2xl rounded-full p-2 pr-6 flex items-center gap-6">
            
            <div className="flex items-center gap-3 pl-4">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <FileCheck2 size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">A Pagar en Efectivo</p>
                <p className="text-xl font-black text-neutral-900 dark:text-white leading-none">
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totales.pagoNetoEfectivo)}
                </p>
              </div>
            </div>

            {!candadoActivo ? (
              <button onClick={onSaveAndDownload} disabled={guardando} className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-8 py-3.5 rounded-full flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50">
                {guardando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span>Guardar Nómina y Generar PDF</span>
              </button>
            ) : (
              <button onClick={descargarSoloPDF} className="bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-sm px-8 py-3.5 rounded-full flex items-center gap-2 transition-all shadow-lg">
                <Download size={18} />
                <span>Descargar PDF de esta Nómina</span>
              </button>
            )}

          </div>
        </div>
      )}
    </div>
  )
}