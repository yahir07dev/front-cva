'use client'

import { useState, useRef } from 'react'
import { 
  Type, ArrowLeft, Check, Save, Clock, Zap, CircleDot, AlertCircle, Calendar as CalendarIcon, ShieldAlert, Image as ImageIcon, X 
} from 'lucide-react'

// Hooks y Componentes
import { useNuevaActividad } from '@/src/hooks/perfomance/useNuevaActividad'
import SelectorEmpleados from '@/src/components/perfomance/actividades/SelectorEmpleados' 
import DateTimePickerModal from './DateTimePickerModal' 
import ModalAlerta from '@/src/components/shared/ModalAlerta' 

// Definición estricta de las props que vienen del SSR
interface NuevaActividadClientProps {
  initialEmpleados: any[] // Lista pre-filtrada y procesada en el servidor
  userEstado: string      // Estado actual del usuario ('activo', 'baja', etc.)
  userId: string          // ID de Supabase del usuario actual
}

export default function NuevaActividadClient({ 
  initialEmpleados, 
  userEstado, 
  userId 
}: NuevaActividadClientProps) {
  
  // 1. Inicialización del Hook de Lógica
  const { 
    form, loading, success, 
    alerta, cerrarAlerta, 
    toggleEmpleado, handleChange, handleFileChange, handleSubmit, router 
  } = useNuevaActividad({ initialEmpleados, userEstado, userId })

  // 2. Estados Locales de UI
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const isBaja = userEstado === 'baja'
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 3. Helpers de Formateo
  const formatDateForDisplay = (isoString: string) => {
    if (!isoString) return 'Tocar para asignar fecha'
    
    const date = new Date(isoString)
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

  // 4. Renderizado
  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 font-sans">
      
      {/* HEADER FIJO */}
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
              <p className="hidden sm:block text-xs font-medium text-neutral-500">
                Define objetivos claros para el equipo
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading || success || isBaja}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-bold transition-all active:scale-95 disabled:opacity-30 shadow-xl shadow-black/10 dark:shadow-none hover:scale-105"
          >
            {success ? (
              <Check size={18} strokeWidth={3} />
            ) : loading ? (
              <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Save size={18} strokeWidth={2.5} />
            )}
            <span className="hidden xs:inline">{success ? '¡Hecho!' : 'Crear Tarea'}</span>
          </button>
        </div>
      </header>

      {/* CUERPO SCROLLABLE */}
      <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-10 pb-40 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-800 hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-700">
        <div className="mx-auto max-w-5xl space-y-8">
          
          {/* ALERTA: Usuario dado de baja */}
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
            
            {/* COLUMNA IZQUIERDA: Detalles de la tarea y Selector de Empleados */}
            <div className="lg:col-span-2 space-y-8">
              
              <section className="space-y-6 bg-white/40 dark:bg-transparent backdrop-blur-md rounded-[32px] p-6 border border-neutral-200/50 dark:border-0">
                <div className="flex items-center gap-3 pb-2">
                  <Type size={20} className="text-orange-500" />
                  <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">Detalles</h2>
                </div>
                
                <div className="space-y-6">
                  {/* Título */}
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

                  {/* Instrucciones */}
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

                  {/* Evidencia Fotográfica (Referencia) */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1 flex items-center justify-between">
                      <span>Imagen de Referencia</span>
                      <span className="text-neutral-400/50 font-medium lowercase">(Opcional)</span>
                    </label>
                    
                    {/* Input oculto gestionado por referencia */}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                      accept="image/png, image/jpeg, image/jpg" 
                      className="hidden"
                    />

                    {form.previewUrl ? (
                      <div className="relative w-full h-48 rounded-2xl overflow-hidden group border border-neutral-200 dark:border-white/10">
                        <img 
                          src={form.previewUrl} 
                          alt="Vista previa" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <button 
                            onClick={() => handleFileChange(null)}
                            className="bg-rose-500 text-white flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl hover:bg-rose-600 hover:scale-105 transition-all"
                          >
                            <X size={16} strokeWidth={3} /> Quitar imagen
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-neutral-200 dark:border-white/10 hover:border-orange-500/50 dark:hover:border-orange-500/50 bg-neutral-50 dark:bg-white/[0.02] hover:bg-orange-500/5 transition-colors rounded-2xl p-8 flex flex-col items-center justify-center gap-3 group"
                      >
                        <div className="p-3 rounded-xl bg-white dark:bg-white/5 shadow-sm text-neutral-400 group-hover:text-orange-500 group-hover:scale-110 transition-all">
                          <ImageIcon size={24} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            Subir foto de ejemplo
                          </p>
                          <p className="text-xs text-neutral-400 mt-1 font-medium">PNG, JPG hasta 5MB</p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* Selector de Empleados - Recibe la lista procesada desde el SSR */}
              <SelectorEmpleados 
                empleados={initialEmpleados} 
                asignados={form.asignados} 
                onToggle={toggleEmpleado} 
              />
            </div>

            {/* COLUMNA DERECHA: Configuración (Prioridad y Fechas) */}
            <aside className="space-y-8">
              <section className="bg-white/40 dark:bg-transparent backdrop-blur-md rounded-[32px] p-6 border border-neutral-200/50 dark:border-0 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <Zap size={20} className="text-orange-500" />
                  <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">Configuración</h2>
                </div>

                <div className="space-y-8">
                  
                  {/* Prioridad */}
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

                  {/* Fecha de Entrega */}
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

      {/* MODALES */}
      <DateTimePickerModal 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        currentValue={form.fechaLimite} 
        onSelect={(val: string) => handleChange('fechaLimite', val)} 
      />

      <ModalAlerta 
        isOpen={alerta.isOpen}
        onClose={cerrarAlerta}
        titulo={alerta.titulo}
        descripcion={alerta.descripcion}
        variant={alerta.variant}
      />

    </div>
  )
}