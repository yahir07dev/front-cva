'use client'

import { 
  Type, ArrowLeft, Check, Save, Clock, Sparkles, Zap, CircleDot, AlertCircle, Calendar 
} from 'lucide-react'

// Imports adaptados a la nueva estructura del proyecto
import { useNuevaActividad } from '@/src/hooks/useNuevaActividad'
import SelectorEmpleados from '@/src/components/perfomance/SelectorEmpleados'

export default function NuevaActividadPage() {
  const { 
    form, empleados, loading, success, 
    toggleEmpleado, handleChange, handleSubmit, router 
  } = useNuevaActividad()

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#1a1d29]">
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-8 lg:px-8 scrollbar-thin">
        <div className="mx-auto max-w-6xl">
          
          {/* Header con botón de regreso */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <button 
                onClick={() => router.back()}
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-all hover:bg-gray-50 hover:shadow-md active:scale-95 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                <ArrowLeft size={18} className="text-gray-600 transition-transform group-hover:-translate-x-0.5 dark:text-gray-400" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} className="text-orange-500" />
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Nueva Tarea</h1>
                </div>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Crea y asigna objetivos al equipo</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            
            {/* Columna Izquierda: Detalles del Formulario */}
            <div className="space-y-4 sm:space-y-6 lg:col-span-2">
              <div className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900 sm:rounded-3xl">
                <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-6 sm:py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <Type size={16} className="text-orange-600 dark:text-orange-400" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">Detalles</h2>
                  </div>
                </div>
                
                <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">Título</label>
                    <input 
                      required
                      type="text"
                      value={form.titulo}
                      onChange={e => handleChange('titulo', e.target.value)}
                      className="w-full rounded-xl border-0 px-4 py-3 text-sm ring-1 ring-gray-200 transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900 focus:bg-white dark:bg-gray-950 dark:text-white dark:ring-gray-800 dark:focus:bg-gray-950"
                      placeholder="Ej. Inventario semanal..."
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                    <textarea 
                      rows={4}
                      value={form.descripcion}
                      onChange={e => handleChange('descripcion', e.target.value)}
                      className="w-full resize-none rounded-xl border-0 px-4 py-3 text-sm ring-1 ring-gray-200 transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900 focus:bg-white dark:bg-gray-950 dark:text-white dark:ring-gray-800 dark:focus:bg-gray-950"
                      placeholder="Describe los pasos..."
                    />
                  </div>
                </div>
              </div>

              {/* Selector de Empleados adaptado */}
              <SelectorEmpleados 
                empleados={empleados} 
                asignados={form.asignados} 
                onToggle={toggleEmpleado} 
              />
            </div>

            {/* Columna Derecha: Configuración Adicional */}
            <div className="space-y-4 sm:space-y-6">
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-900 sm:rounded-3xl">
                <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-6 sm:py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <Zap size={16} className="text-orange-600 dark:text-orange-400" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Configuración</h2>
                  </div>
                </div>

                <div className="space-y-5 p-4 sm:p-6">
                  {/* Prioridad con selección visual */}
                  <div>
                    <label className="mb-3 block text-xs font-medium text-gray-700 dark:text-gray-300">Prioridad</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'baja', label: 'Baja', color: 'emerald', icon: CircleDot },
                        { id: 'media', label: 'Media', color: 'amber', icon: AlertCircle },
                        { id: 'alta', label: 'Alta', color: 'rose', icon: Zap },
                      ].map((p) => {
                        const isActive = form.prioridad === p.id
                        const Icon = p.icon
                        const activeClasses = {
                          emerald: 'bg-emerald-500 shadow-emerald-500/30',
                          amber: 'bg-amber-500 shadow-amber-500/30',
                          rose: 'bg-rose-500 shadow-rose-500/30'
                        }
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleChange('prioridad', p.id)}
                            className={`flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-medium transition-all active:scale-95 ${isActive ? `${activeClasses[p.color as keyof typeof activeClasses]} text-white shadow-lg` : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-950 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                          >
                            <Icon size={16} />
                            <span>{p.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Fecha Límite con soporte para modo oscuro */}
                  <div>
                    <label className="mb-3 block text-xs font-medium text-gray-700 dark:text-gray-300">Fecha Límite</label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        required
                        type="date"
                        value={form.fechaLimite}
                        onChange={e => handleChange('fechaLimite', e.target.value)}
                        className="w-full cursor-pointer rounded-xl border-0 py-3 pl-10 pr-4 text-sm ring-1 ring-gray-200 transition-all focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900 focus:bg-white dark:bg-gray-950 dark:text-white dark:ring-gray-800 dark:focus:bg-gray-950 dark:[color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 dark:from-orange-900/20 dark:to-orange-900/10">
                    <div className="flex gap-3">
                      <Clock className="mt-0.5 shrink-0 text-orange-600 dark:text-orange-400" size={16} />
                      <p className="text-xs leading-relaxed text-orange-900 dark:text-orange-200">
                        La tarea se creará con estado <strong>Pendiente</strong> hasta que el empleado la inicie.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de envío con estados de carga/éxito */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || success}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-2xl"
              >
                {success ? (
                  <>
                    <Check size={18} />
                    <span>¡Tarea Creada!</span>
                  </>
                ) : loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} className="transition-transform group-hover:rotate-12" />
                    <span>Crear Tarea</span>
                  </>
                )}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}