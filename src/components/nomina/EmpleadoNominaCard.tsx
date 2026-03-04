'use client'

import { useState } from 'react'
import { Check, Edit2, Save, CreditCard, Banknote, Loader2, X } from 'lucide-react'
import Image from 'next/image'
import { NominaConfig } from '@/src/services/nominaService'

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

  const getInitials = (n: string, a: string) => `${n?.[0]||''}${a?.[0]||''}`.toUpperCase()

  return (
    <div className={`
      relative p-5 md:p-6 rounded-3xl transition-all duration-300
      bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm
      border border-emerald-200/30 dark:border-emerald-900/30
      hover:border-emerald-400/40 hover:shadow-md hover:shadow-emerald-500/10
      ${isEditing ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/15 scale-[1.01]' : ''}
    `}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Info Empleado */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative h-14 w-14 shrink-0 rounded-2xl overflow-hidden ring-1 ring-emerald-200/40 dark:ring-emerald-900/30 shadow-sm">
            {empleado.foto_perfil_url ? (
              <Image 
                src={empleado.foto_perfil_url} 
                alt="Avatar" 
                fill 
                className="object-cover" 
                sizes="56px" 
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950 dark:to-neutral-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold text-lg">
                {getInitials(empleado.nombre, empleado.apellidos)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white truncate">
              {empleado.nombre} {empleado.apellidos}
            </h3>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
              {empleado.roles?.nombre || 'Sin Rol'} • {empleado.areas?.nombre || 'Sin Área'}
            </p>
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 lg:gap-8">
          
          {/* Sueldo Base */}
          <div className="flex flex-col gap-1.5 min-w-[120px]">
            <label className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Sueldo Base</label>
            {isEditing ? (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">$</span>
                <input 
                  type="number" 
                  value={sueldo}
                  onChange={e => setSueldo(e.target.value ? Number(e.target.value) : '')}
                  className="
                    w-full pl-8 pr-4 py-2.5 rounded-2xl bg-white/50 dark:bg-neutral-950/40 
                    border border-emerald-200/30 dark:border-emerald-900/30
                    focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20
                    text-sm font-bold outline-none transition-all tabular-nums
                  "
                  placeholder="0.00"
                />
              </div>
            ) : (
              <p className="text-lg font-black text-neutral-900 dark:text-white tabular-nums">
                ${empleado.sueldo_base?.toFixed(2) || '0.00'}
              </p>
            )}
          </div>

          {/* Día de Pago */}
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <label className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Día de Pago</label>
            {isEditing ? (
              <select
                value={diaPago}
                onChange={e => setDiaPago(e.target.value as any)}
                className="
                  w-full px-4 py-2.5 rounded-2xl bg-white/50 dark:bg-neutral-950/40 
                  border border-emerald-200/30 dark:border-emerald-900/30
                  focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20
                  text-sm font-semibold outline-none cursor-pointer transition-all appearance-none
                "
              >
                <option value="">Seleccionar...</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>
            ) : (
              <p className="text-sm font-bold text-neutral-900 dark:text-white py-2.5">
                {empleado.dia_pago || 'No asignado'}
              </p>
            )}
          </div>

          {/* Método de Pago */}
          <div className="flex flex-col gap-1.5 min-w-[110px]">
            <label className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Método</label>
            {isEditing ? (
              <button
                onClick={() => setConTarjeta(!conTarjeta)}
                className={`
                  relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300
                  ${conTarjeta ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-600'}
                  shadow-sm hover:shadow-md
                `}
              >
                <span 
                  className={`
                    inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300
                    ${conTarjeta ? 'translate-x-7' : 'translate-x-1'}
                  `} 
                />
              </button>
            ) : (
              <div className={`
                flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-semibold
                ${empleado.recibe_pago_tarjeta 
                  ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400' 
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'}
              `}>
                {empleado.recibe_pago_tarjeta ? <CreditCard size={16} /> : <Banknote size={16} />}
                <span>{empleado.recibe_pago_tarjeta ? 'Tarjeta' : 'Efectivo'}</span>
              </div>
            )}
          </div>

          {/* Acciones */}
          {canManage && (
            <div className="flex items-center justify-end gap-3 sm:ml-4">
              {isEditing ? (
                <>
                  <button 
                    onClick={cancelEdit} 
                    disabled={loading}
                    className="p-2.5 rounded-2xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="
                      p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white 
                      shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50
                    "
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="
                    p-2.5 rounded-2xl text-emerald-600 hover:text-emerald-700 
                    hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors
                  "
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