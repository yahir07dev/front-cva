'use client'

import { useState } from 'react'
import { 
  Type, ArrowLeft, Check, Save, Clock, Sparkles, Zap, CircleDot, AlertCircle, Calendar as CalendarIcon, ShieldAlert 
} from 'lucide-react'
import { useNuevaActividad } from '@/src/hooks/useNuevaActividad'
import SelectorEmpleados from '@/src/components/perfomance/SelectorEmpleados' // Ajusta la ruta si es necesario
import DateTimePickerModal from './DateTimePickerModal' 

export default function NuevaActividadClient() {
  const { 
    form, empleados, loading, success, userEstado,
    toggleEmpleado, handleChange, handleSubmit, router 
  } = useNuevaActividad()

  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const isBaja = userEstado === 'baja'

  const formatDateForDisplay = (isoString: string) => {
    if (!isoString) return 'Tocar para asignar fecha'
    const date = new Date(isoString)
    // Validación extra por si acaso
    if (isNaN(date.getTime())) return 'Fecha inválida'
    
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 font-sans">
      
      {/* 1. Header Fijo (z-20 para no tapar selectores o modales) */}
      <header className="flex-none sticky top-0 z-20 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-0 px-4 py-4 sm:px-8">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-white/5 border border-neutral-200 dark:border-0 transition-all active:scale-90 hover:bg-neutral-100 dark:hover:bg-white/10"
            >
              <ArrowLeft size={20} className="text-neutral-600 dark:text-neutral-400" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Nueva tarea
              </h1>
              <p className="hidden sm:block text-xs font-medium text-neutral-500">Define objetivos claros para el equipo</p>
            </div>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading || success || isBaja}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-bold transition-all active:scale-95 disabled:opacity-30 shadow-xl shadow-black/10 dark:shadow-none hover:scale-105"
          >
            {success ? <Check size={18} strokeWidth={3} /> : loading ? <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" /> : <Save size={18} strokeWidth={2.5} />}
            <span className="hidden xs:inline">{success ? '¡Hecho!' : 'Crear Tarea'}</span>
          </button>
        </div>
      </header>

      {/* 2. Cuerpo SCROLLABLE */}
      <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-10 pb-40 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-800 hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-700">
        <div className="mx-auto max-w-5xl space-y-8">
          
          {/* Alerta de Usuario Baja */}
          {isBaja && (
            <div className="flex items-center gap-4 p-5 rounded-[24px] bg-rose-500/5 border border-rose-500/10 text-rose-600 dark:text-rose-400 animate-in fade-in slide-in-from-top-2">
              <ShieldAlert className="shrink-0" size={24} />
              <div className="text-sm">
                <p className="font-bold">Acceso restringido</p>
                <p className="opacity-80 font-medium">No tienes permisos para crear actividades en este momento.</p>
              </div>
            </div>
          )}

          <div className={`grid gap-8 lg:grid-cols-3 transition-opacity duration-500 ${isBaja ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
            
            {/* Columna Izquierda: Detalles y Selector */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Formulario Principal */}
              <section className="space-y-6 bg-white/40 dark:bg-transparent backdrop-blur-md rounded-[32px] p-6 border border-neutral-200/50 dark:border-0">
                <div className="flex items-center gap-3 pb-2">
                  <Type size={20} className="text-orange-500" />
                  <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">Detalles</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Título de actividad</label>
                    <input 
                      type="text"
                      value={form.titulo}
                      onChange={e => handleChange('titulo', e.target.value)}
                      className="w-full rounded-2xl bg-neutral-100 dark:bg-white/5 border-0 px-5 py-4 text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500/30 outline-none transition-all placeholder:text-neutral-500"
                      placeholder="Ej. Revisión de inventario pasillo 4"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Instrucciones</label>
                    <textarea 
                      rows={5}
                      value={form.descripcion}
                      onChange={e => handleChange('descripcion', e.target.value)}
                      className="w-full rounded-2xl resize-none bg-neutral-100 dark:bg-white/5 border-0 px-5 py-4 text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500/30 outline-none transition-all placeholder:text-neutral-500"
                      placeholder="Describe los pasos detalladamente..."
                    />
                  </div>
                </div>
              </section>

              {/* Selector de Empleados Mejorado (con Áreas) */}
              <SelectorEmpleados 
                empleados={empleados} 
                asignados={form.asignados} 
                onToggle={toggleEmpleado} 
              />
            </div>

            {/* Columna Derecha: Configuración */}
            <aside className="space-y-8">
              <section className="bg-white/40 dark:bg-transparent backdrop-blur-md rounded-[32px] p-6 border border-neutral-200/50 dark:border-0 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <Zap size={20} className="text-orange-500" />
                  <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">Configuración</h2>
                </div>

                <div className="space-y-8">
                  {/* Selector de Prioridad */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Prioridad</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'baja', label: 'Baja', icon: CircleDot, active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
                        { id: 'media', label: 'Media', icon: AlertCircle, active: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
                        { id: 'alta', label: 'Alta', icon: Zap, active: 'bg-rose-500/10 text-rose-600 border-rose-500/20' }
                      ].map((p) => {
                        const isActive = form.prioridad === p.id
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleChange('prioridad', p.id)}
                            className={`flex flex-col items-center gap-2 py-3 rounded-2xl text-[10px] font-bold transition-all border ${isActive ? `${p.active} shadow-sm scale-105` : 'bg-neutral-100 dark:bg-white/5 border-transparent text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/10'}`}
                          >
                            <p.icon size={16} strokeWidth={isActive ? 3 : 2} />
                            {p.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Selector de Fecha */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Plazo de entrega</label>
                    <button 
                      type="button" 
                      onClick={() => setIsPickerOpen(true)} 
                      className={`w-full p-4 rounded-[28px] transition-all duration-500 border text-left flex items-center justify-between group ${form.fechaLimite ? 'bg-orange-500/10 border-orange-500/20' : 'bg-neutral-100 dark:bg-white/5 border-transparent hover:bg-neutral-200 dark:hover:bg-white/10'}`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${form.fechaLimite ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-neutral-200 dark:bg-white/5 text-neutral-400'}`}>
                          <CalendarIcon size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-[10px] font-bold uppercase tracking-tighter ${form.fechaLimite ? 'text-orange-600 dark:text-orange-400' : 'text-neutral-500'}`}>
                            {form.fechaLimite ? 'Fecha asignada' : 'No definida'}
                          </p>
                          <p className={`text-sm font-bold capitalize leading-tight truncate ${form.fechaLimite ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
                            {formatDateForDisplay(form.fechaLimite)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex gap-3">
                    <Clock size={18} className="text-orange-500 shrink-0" />
                    <p className="text-[10px] font-medium text-orange-600 dark:text-orange-400/80 leading-relaxed uppercase tracking-tighter">
                      Vencimiento automático al expirar el plazo.
                    </p>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <DateTimePickerModal 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        currentValue={form.fechaLimite} 
        onSelect={(val: string) => handleChange('fechaLimite', val)} 
      />
    </div>
  )
}