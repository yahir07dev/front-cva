'use client'

import { useState, useEffect } from 'react'
import { 
  Type, ArrowLeft, Check, Save, Clock, Sparkles, Zap, CircleDot, AlertCircle, Calendar, ShieldAlert 
} from 'lucide-react'
import { useNuevaActividad } from '@/src/hooks/useNuevaActividad'
import SelectorEmpleados from '@/src/components/perfomance/SelectorEmpleados'

export default function NuevaActividadClient() {
  const { 
    form, empleados, loading, success, userEstado,
    toggleEmpleado, handleChange, handleSubmit, router 
  } = useNuevaActividad()

  const isBaja = userEstado === 'baja'

  // --- LÓGICA DE BLOQUEO DE FECHA PASADA ---
  const [minDateTime, setMinDateTime] = useState('');

  useEffect(() => {
    // Generar el string YYYY-MM-DDTHH:mm para el atributo 'min' del input
    const ahora = new Date();
    // Ajustamos a la zona horaria local para que el input datetime-local lo entienda
    const offset = ahora.getTimezoneOffset() * 60000;
    const localISOTime = new Date(ahora.getTime() - offset).toISOString().slice(0, 16);
    setMinDateTime(localISOTime);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      
      <div className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 scrollbar-thin">
        <div className="mx-auto max-w-5xl space-y-8">
          
          {isBaja && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 animate-in fade-in slide-in-from-top-2">
              <ShieldAlert className="shrink-0" size={24} />
              <div>
                <p className="font-bold">Acceso restringido</p>
                <p className="text-sm opacity-90">Tu cuenta se encuentra en estado de baja. No tienes permisos para crear nuevas actividades.</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center gap-5">
            <button 
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all active:scale-90"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={22} className="text-orange-500" />
                <h1 className="text-2xl font-bold tracking-tight">Nueva Tarea</h1>
              </div>
              <p className="text-sm text-neutral-500">Asigna objetivos claros para tu equipo</p>
            </div>
          </div>

          <div className={`grid gap-8 lg:grid-cols-3 transition-opacity duration-300 ${isBaja ? 'opacity-50 pointer-events-none select-none' : 'opacity-100'}`}>
            
            {/* Columna Izquierda: Contenido */}
            <div className="lg:col-span-2 space-y-8">
              <div className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
                  <Type size={18} className="text-orange-500" />
                  <h2 className="font-bold">Detalles de la tarea</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-500">Título</label>
                    <input 
                      type="text"
                      disabled={isBaja}
                      value={form.titulo}
                      onChange={e => handleChange('titulo', e.target.value)}
                      className="w-full rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                      placeholder="Ej. Revisión de inventario pasillo 4"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-500">Descripción</label>
                    <textarea 
                      rows={4}
                      disabled={isBaja}
                      value={form.descripcion}
                      onChange={e => handleChange('descripcion', e.target.value)}
                      className="w-full rounded-xl resize-none bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                      placeholder="Describe los pasos a seguir..."
                    />
                  </div>
                </div>
              </div>

              <SelectorEmpleados 
                empleados={empleados} 
                asignados={form.asignados} 
                onToggle={toggleEmpleado} 
              />
            </div>

            {/* Columna Derecha: Configuración */}
            <div className="space-y-8">
              <div className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
                  <Zap size={18} className="text-orange-500" />
                  <h2 className="font-bold">Configuración</h2>
                </div>

                <div className="p-6 space-y-8">
                  {/* Prioridad */}
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-neutral-500">Prioridad</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'baja', label: 'Baja', icon: CircleDot, active: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/30' },
                        { id: 'media', label: 'Media', icon: AlertCircle, active: 'bg-amber-500/10 text-amber-600 ring-amber-500/30' },
                        { id: 'alta', label: 'Alta', icon: Zap, active: 'bg-rose-500/10 text-rose-600 ring-rose-500/30' },
                      ].map((p) => {
                        const isActive = form.prioridad === p.id
                        return (
                          <button
                            key={p.id}
                            type="button"
                            disabled={isBaja}
                            onClick={() => handleChange('prioridad', p.id)}
                            className={`flex flex-col items-center gap-2 py-3 rounded-xl text-[11px] font-bold transition-all border ${isActive ? `${p.active} ring-2 border-transparent` : 'bg-neutral-100 dark:bg-neutral-800/60 border-neutral-300 dark:border-neutral-700 text-neutral-500'}`}
                          >
                            <p.icon size={16} />
                            {p.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Fecha y Hora Límite (Ajustado) */}
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-neutral-500">Fecha y Hora Límite</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                      <input 
                        type="datetime-local" // 👈 Cambio clave para horas/minutos
                        disabled={isBaja}
                        min={minDateTime}     // 👈 Bloqueo de fechas pasadas
                        value={form.fechaLimite}
                        onChange={e => handleChange('fechaLimite', e.target.value)}
                        className="
                          w-full rounded-xl
                          bg-neutral-50 dark:bg-neutral-800/60
                          border border-neutral-300 dark:border-neutral-700
                          pl-10 pr-4 py-3 text-sm text-neutral-900 dark:text-neutral-100
                          outline-none focus:ring-2 focus:ring-orange-500/20
                          dark:[color-scheme:dark]
                        "
                      />
                    </div>
                    <p className="text-[10px] text-neutral-400 italic">
                      Permite asignar tareas para realizarse en los próximos minutos u horas.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 flex gap-3">
                    <Clock size={16} className="text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-600 dark:text-orange-400 leading-relaxed">
                      El sistema marcará la tarea como <strong>"No Realizada"</strong> automáticamente si el plazo expira.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || success || isBaja}
                className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {success ? <><Check size={20}/> ¡Tarea Creada!</> : loading ? "Procesando..." : <><Save size={20}/> Crear Tarea</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}