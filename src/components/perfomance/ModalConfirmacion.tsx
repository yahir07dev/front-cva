'use client'

import { CheckCircle2, AlertTriangle, Trash2, Eye } from 'lucide-react'

interface ModalConfirmacionProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  titulo: string
  descripcion: string
  variant?: 'success' | 'danger' | 'info' // <--- Agregamos 'info'
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

  // Configuración de Estilos por Variante
  const getStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-rose-100 dark:bg-rose-900/30',
          iconColor: 'text-rose-600 dark:text-rose-400',
          btnBg: 'bg-rose-500 shadow-rose-500/25 hover:bg-rose-600',
          alertBg: 'bg-rose-50 dark:bg-rose-900/10',
          alertText: 'text-rose-800 dark:text-rose-200',
          alertIconColor: 'text-rose-600',
          Icon: Trash2,
          btnText: 'Sí, eliminar',
          alertMessage: 'Esta acción es irreversible y no se podrá recuperar.'
        }
      case 'info': // <--- Nueva configuración para Revisión
        return {
          iconBg: 'bg-purple-100 dark:bg-purple-900/30',
          iconColor: 'text-purple-600 dark:text-purple-400',
          btnBg: 'bg-purple-600 shadow-purple-500/25 hover:bg-purple-700',
          alertBg: 'bg-purple-50 dark:bg-purple-900/10',
          alertText: 'text-purple-800 dark:text-purple-200',
          alertIconColor: 'text-purple-600',
          Icon: Eye,
          btnText: 'Sí, solicitar',
          alertMessage: 'La tarea quedará bloqueada hasta ser aprobada.'
        }
      case 'success':
      default:
        return {
          iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          btnBg: 'bg-emerald-500 shadow-emerald-500/25 hover:bg-emerald-600',
          alertBg: 'bg-orange-50 dark:bg-orange-900/10',
          alertText: 'text-orange-800 dark:text-orange-200',
          alertIconColor: 'text-orange-600',
          Icon: CheckCircle2,
          btnText: 'Sí, confirmar',
          alertMessage: 'Esta acción registrará la fecha y hora exacta.'
        }
    }
  }

  const styles = getStyles()
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
          <div className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-left ${styles.alertBg}`}>
            <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${styles.alertIconColor}`} />
            <p className={`text-xs ${styles.alertText}`}>
              {styles.alertMessage}
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
            {styles.btnText}
          </button>
        </div>
      </div>
    </div>
  )
}