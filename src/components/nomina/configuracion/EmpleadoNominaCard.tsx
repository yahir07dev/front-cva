'use client'

import { useState } from 'react'
import { Edit2, Save, CreditCard, Banknote, Loader2, X } from 'lucide-react'
import { NominaConfig } from '@/src/services/nomina/nominaService'

interface EmpleadoNominaCardProps {
  empleado: any
  canManage: boolean
  onSave: (id: number, config: NominaConfig) => Promise<void>
}

export default function EmpleadoNominaCard({ empleado, canManage, onSave }: EmpleadoNominaCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [sueldo, setSueldo] = useState<number | ''>(empleado.sueldo_base || '')
  const [diaPago, setDiaPago] = useState<'Sábado' | 'Domingo' | ''>(empleado.dia_pago || '')
  const [conTarjeta, setConTarjeta] = useState<boolean>(empleado.recibe_pago_tarjeta || false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await onSave(empleado.id, {
        sueldo_base: sueldo === '' ? null : Number(sueldo),
        dia_pago: diaPago,
        recibe_pago_tarjeta: conTarjeta
      })
      setIsEditing(false)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setSueldo(empleado.sueldo_base || '')
    setDiaPago(empleado.dia_pago || '')
    setConTarjeta(empleado.recibe_pago_tarjeta || false)
    setIsEditing(false)
  }

  const getInitials = (n: string, a: string) => `${n?.[0] || ''}${a?.[0] || ''}`.toUpperCase()

  return (
    <div className={`
      group relative p-5 md:p-6 transition-all duration-500 ease-out w-full
      bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl
      border rounded-3xl overflow-hidden
      ${isEditing 
        ? 'shadow-xl scale-[1.01] border-emerald-500/40 dark:border-emerald-500/30 ring-4 ring-emerald-500/10' 
        : 'border-neutral-200/50 dark:border-neutral-800/50 shadow-sm hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700'}
    `}>
      {/* Resplandor sutil al editar */}
      {isEditing && (
        <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/10 pointer-events-none animate-pulse-slow" />
      )}

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">

        {/* ========================================================= */}
        {/* INFO EMPLEADO                                             */}
        {/* ========================================================= */}
        <div className="flex items-center gap-4 lg:w-1/3 min-w-0">
          <div className="
            relative h-14 w-14 shrink-0 rounded-full overflow-hidden 
            ring-2 ring-white dark:ring-neutral-950 shadow-md 
            transition-transform duration-500 group-hover:scale-105
          ">
            {empleado.foto_perfil_url ? (
              /* 👇 CAMBIO AQUÍ: Etiqueta img estándar 👇 */
              <img
                src={empleado.foto_perfil_url}
                alt="Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center text-neutral-500 font-bold text-lg">
                {getInitials(empleado.nombre, empleado.apellidos)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base md:text-lg text-neutral-900 dark:text-white truncate transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              {empleado.nombre} {empleado.apellidos}
            </h3>
            <p className="text-[11px] md:text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5 truncate uppercase tracking-wide">
              {empleado.roles?.nombre || 'Sin Rol'} <span className="opacity-50 mx-1">•</span> {empleado.areas?.nombre || 'Sin Área'}
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CONTROLES Y DATOS                                         */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-10 lg:w-2/3 lg:justify-end">

          {/* Sueldo Base */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">Sueldo Base</label>
            {isEditing ? (
              <div className="relative group/input">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold group-focus-within/input:text-emerald-500 transition-colors">$</span>
                <input
                  type="number"
                  value={sueldo}
                  onChange={e => setSueldo(e.target.value ? Number(e.target.value) : '')}
                  className="
                    w-full sm:w-36 pl-8 pr-4 py-3 rounded-2xl 
                    bg-neutral-100 dark:bg-white/5 border-0
                    focus:bg-white dark:focus:bg-neutral-900 focus:ring-2 focus:ring-emerald-500/50
                    text-sm font-bold text-neutral-900 dark:text-white outline-none transition-all tabular-nums placeholder:text-neutral-400
                  "
                  placeholder="0.00"
                />
              </div>
            ) : (
              <p className="text-lg font-black text-neutral-900 dark:text-white tabular-nums px-1">
                ${empleado.sueldo_base?.toFixed(2) || '0.00'}
              </p>
            )}
          </div>

          {/* Día de Pago */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">Día de Pago</label>
            {isEditing ? (
              <select
                value={diaPago}
                onChange={e => setDiaPago(e.target.value as any)}
                className="
                  w-full sm:w-36 px-4 py-3 rounded-2xl 
                  bg-neutral-100 dark:bg-white/5 border-0
                  focus:bg-white dark:focus:bg-neutral-900 focus:ring-2 focus:ring-emerald-500/50
                  text-sm font-bold text-neutral-900 dark:text-white outline-none cursor-pointer transition-all appearance-none
                "
              >
                <option value="" className="text-neutral-500">Seleccionar...</option>
                <option value="Sábado" className="text-neutral-900 dark:text-white">Sábado</option>
                <option value="Domingo" className="text-neutral-900 dark:text-white">Domingo</option>
              </select>
            ) : (
              <p className="text-sm font-bold text-neutral-900 dark:text-white py-1 px-1">
                {empleado.dia_pago || 'No asignado'}
              </p>
            )}
          </div>

          {/* Método de Pago */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">Método</label>
            {isEditing ? (
              <button
                onClick={() => setConTarjeta(!conTarjeta)}
                className={`
                  relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 py-1
                  ${conTarjeta ? 'bg-emerald-500' : 'bg-neutral-200 dark:bg-neutral-700'}
                  shadow-inner
                `}
              >
                <span
                  className={`
                    inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300
                    ${conTarjeta ? 'translate-x-9' : 'translate-x-1'}
                  `}
                />
              </button>
            ) : (
              <div className={`
                flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors
                ${empleado.recibe_pago_tarjeta
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'}
              `}>
                {empleado.recibe_pago_tarjeta ? <CreditCard size={14} /> : <Banknote size={14} />}
                <span>{empleado.recibe_pago_tarjeta ? 'Tarjeta' : 'Efectivo'}</span>
              </div>
            )}
          </div>

          {/* Acciones */}
          {canManage && (
            <div className="flex items-center justify-end gap-2 sm:ml-2 pt-2 sm:pt-0">
              {isEditing ? (
                <>
                  <button
                    onClick={cancelEdit}
                    disabled={loading}
                    className="p-3 rounded-2xl text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95"
                    title="Cancelar"
                  >
                    <X size={20} />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="
                      p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white
                      shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50
                    "
                    title="Guardar Cambios"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="
                    p-3 rounded-2xl text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400
                    hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all active:scale-95
                    opacity-100 lg:opacity-0 group-hover:opacity-100
                  "
                  title="Editar"
                >
                  <Edit2 size={20} />
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}