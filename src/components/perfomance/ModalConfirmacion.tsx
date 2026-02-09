'use client'

import { CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react'

interface ModalConfirmacionProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  titulo: string
  descripcion: string
  variant?: 'success' | 'danger'
}

export default function ModalConfirmacion({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  descripcion,
  variant = 'success'
}: ModalConfirmacionProps) {
  
  if (!isOpen) return null

  // Configuración según variante (se mantiene tu diseño original)
  const styles = variant === 'danger' ? {
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    btnBg: 'bg-rose-500 shadow-rose-500/25 hover:bg-rose-600',
    Icon: Trash2
  } : {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    btnBg: 'bg-emerald-500 shadow-emerald-500/25 hover:bg-emerald-600',
    Icon: CheckCircle2
  }

  const IconComponent = styles.Icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900 animate-in zoom-in-95 duration-200">
        
        {/* Icono Header */}
        <div className="pt-8 flex justify-center">
          <div className={`flex h-20 w-20 items-center justify-center rounded-full ${styles.iconBg}`}>
            <IconComponent className={`h-10 w-10 ${styles.iconColor}`} />
          </div>
        </div>

        {/* Contenido Texto */}
        <div className="px-6 py-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {titulo}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {descripcion}
          </p>
          
          {/* Alerta visual dinámica */}
          <div className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-left ${variant === 'danger' ? 'bg-rose-50 dark:bg-rose-900/10' : 'bg-orange-50 dark:bg-orange-900/10'}`}>
            <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${variant === 'danger' ? 'text-rose-600' : 'text-orange-600'}`} />
            <p className={`text-xs ${variant === 'danger' ? 'text-rose-800 dark:text-rose-200' : 'text-orange-800 dark:text-orange-200'}`}>
              {variant === 'danger' 
                ? 'Esta acción es irreversible y no se podrá recuperar.'
                : 'Esta acción registrará la fecha y hora exacta.'
              }
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-3 p-6 pt-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`rounded-xl py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${styles.btnBg}`}
          >
            {variant === 'danger' ? 'Sí, eliminar' : 'Sí, confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}