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
  
  // Estados locales para la edición
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
    // Restaurar valores originales
    setSueldo(empleado.sueldo_base || '')
    setDiaPago(empleado.dia_pago || '')
    setConTarjeta(empleado.recibe_pago_tarjeta || false)
    setIsEditing(false)
  }

  const getInitials = (n: string, a: string) => `${n?.[0]||''}${a?.[0]||''}`.toUpperCase()

  return (
    <div className={`
      relative p-5 rounded-[24px] transition-all duration-300
      border ${isEditing ? 'border-orange-500/50 shadow-md shadow-orange-500/10 bg-white dark:bg-neutral-900' : 'border-neutral-200/60 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/50 hover:bg-white dark:hover:bg-neutral-900'}
    `}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* INFO EMPLEADO */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative h-12 w-12 shrink-0 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 font-bold text-sm">
            {empleado.foto_perfil_url ? (
              <Image src={empleado.foto_perfil_url} alt="Avatar" fill className="object-cover" sizes="48px" />
            ) : (
              <span>{getInitials(empleado.nombre, empleado.apellidos)}</span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-neutral-900 dark:text-white truncate">
              {empleado.nombre} {empleado.apellidos}
            </h3>
            <p className="text-xs font-medium text-neutral-500 truncate">
              {empleado.roles?.nombre || 'Sin Rol'} • {empleado.areas?.nombre || 'Sin Área'}
            </p>
          </div>
        </div>

        {/* CONTROLES DE EDICIÓN */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
          
          {/* Sueldo */}
          <div className="flex flex-col gap-1 w-full sm:w-32">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Sueldo Base</label>
            {isEditing ? (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">$</span>
                <input 
                  type="number" 
                  value={sueldo}
                  onChange={e => setSueldo(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm font-bold outline-none focus:border-orange-500"
                  placeholder="0.00"
                />
              </div>
            ) : (
              <p className="text-sm font-bold text-neutral-900 dark:text-white py-2">
                ${empleado.sueldo_base || '0.00'}
              </p>
            )}
          </div>

          {/* Día de Pago */}
          <div className="flex flex-col gap-1 w-full sm:w-36">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Día de Pago</label>
            {isEditing ? (
              <select
                value={diaPago}
                onChange={e => setDiaPago(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm font-bold outline-none focus:border-orange-500 appearance-none"
              >
                <option value="">Seleccionar...</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>
            ) : (
              <p className="text-sm font-bold text-neutral-900 dark:text-white py-2">
                {empleado.dia_pago || 'No asignado'}
              </p>
            )}
          </div>

          {/* Método de Pago (Tarjeta Toggle) */}
          <div className="flex flex-col gap-1 w-full sm:w-32">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Método</label>
            <div className="flex items-center gap-2 py-2">
              {isEditing ? (
                <button
                  onClick={() => setConTarjeta(!conTarjeta)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${conTarjeta ? 'bg-orange-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${conTarjeta ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              ) : (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${empleado.recibe_pago_tarjeta ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                  {empleado.recibe_pago_tarjeta ? <CreditCard size={14}/> : <Banknote size={14}/>}
                  <span>{empleado.recibe_pago_tarjeta ? 'Tarjeta' : 'Efectivo'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Botones de Acción (Solo visibles si canManage es true) */}
          {canManage && (
            <div className="flex items-center justify-end gap-2 sm:ml-4 border-t sm:border-t-0 sm:border-l border-neutral-100 dark:border-neutral-800 pt-4 sm:pt-0 sm:pl-6">
              {isEditing ? (
                <>
                  <button onClick={cancelEdit} disabled={loading} className="p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                    <X size={18} />
                  </button>
                  <button onClick={handleSave} disabled={loading} className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="p-2 text-neutral-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl transition-colors">
                  <Edit2 size={18} />
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}