'use client'

import { useState } from 'react'
import { usePrestamos } from '@/src/hooks/usePrestamos'
import { Loader2, Users } from 'lucide-react'
import PrestamosHeader from './PrestamosHeader'
import PrestamoCard from './PrestamoCard'
import ModalNuevoPrestamo from './ModalNuevoPrestamo'
import ModalAbono from './ModalAbono'

export default function PrestamosClient() {
  const { prestamos, empleadosLista, stats, loading, canManage, canRead, handleCrearPrestamo, handleAbonar } = usePrestamos()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<any>(null)

  if (!loading && !canRead) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <Users className="h-12 w-12 text-neutral-300 mb-4" />
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Acceso Denegado</h3>
        <p className="text-sm text-neutral-500">No tienes permisos para ver los préstamos.</p>
      </div>
    )
  }

  if (loading && prestamos.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      <PrestamosHeader 
        stats={stats} 
        canManage={canManage} 
        onOpenModal={() => setIsModalOpen(true)} 
      />

      {prestamos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-neutral-900/40 rounded-[32px] border border-dashed border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-500 font-medium">No hay préstamos registrados en el sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {prestamos.map(prestamo => (
            <PrestamoCard 
              key={prestamo.id} 
              prestamo={prestamo} 
              canManage={canManage}
              onOpenAbono={setPrestamoSeleccionado}
            />
          ))}
        </div>
      )}

      {/* Modales separados para mantener el DOM limpio */}
      <ModalNuevoPrestamo 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        empleados={empleadosLista}
        onSave={handleCrearPrestamo}
      />

      <ModalAbono
        isOpen={!!prestamoSeleccionado}
        onClose={() => setPrestamoSeleccionado(null)}
        prestamo={prestamoSeleccionado}
        onAbonar={handleAbonar}
      />

    </div>
  )
}