'use client'

import { useState, useMemo } from 'react'
import { usePrestamos } from '@/src/hooks/nomina/usePrestamos'
import { Search, Wallet, CheckCircle2, Banknote } from 'lucide-react'
import PrestamosHeader from './PrestamosHeader'
import PrestamoCard from './PrestamoCard'
import ModalNuevoPrestamo from './ModalNuevoPrestamo'
import ModalAbono from './ModalAbono'

interface PrestamosClientProps {
  initialPrestamos: any[]
  empleadosLista: any[]
  canManage: boolean
}

export default function PrestamosClient({ initialPrestamos, empleadosLista, canManage }: PrestamosClientProps) {
  const { 
    prestamos, 
    stats, 
    loading, // Estado de guardado/actualizado, no de carga inicial
    handleCrearPrestamo, 
    handleAbonar, 
    handleTogglePausa
  } = usePrestamos({ initialPrestamos, initialEmpleados: empleadosLista })
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<any>(null)

  const [activeTab, setActiveTab] = useState<'activo' | 'completado'>('activo')
  const [searchQuery, setSearchQuery] = useState('')

  const prestamosFiltrados = useMemo(() => {
    return prestamos
      .filter(p => p.estado === activeTab)
      .filter(p => {
        if (!searchQuery) return true
        const nombreCompleto = `${p.empleados?.nombre} ${p.empleados?.apellidos}`.toLowerCase()
        return nombreCompleto.includes(searchQuery.toLowerCase())
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [prestamos, activeTab, searchQuery])

  // ELIMINADO: Los condicionales !canRead y loading inicial (Ya los maneja SSR y loading.tsx)

  return (
    <div className="h-full flex flex-col -m-4 sm:-m-6 lg:-m-8 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 overflow-hidden">
      
      {/* Header fijo (sticky) superior */}
      <div className="flex-none z-20">
        <PrestamosHeader 
          stats={stats} 
          canManage={canManage} 
          onOpenModal={() => setIsModalOpen(true)} 
        />
      </div>

      {/* Controles: Pestañas + Buscador */}
      {(prestamos.length > 0 || searchQuery !== '') && (
        <div className="flex-none sticky top-0 z-10 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-xl px-6 lg:px-10 py-4 border-b border-neutral-200/50 dark:border-neutral-800/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            
            {/* Pestañas Neutrales/Elegantes */}
            <div className="flex p-1.5 bg-neutral-200/50 dark:bg-neutral-900/80 rounded-2xl w-full md:w-auto shadow-inner ring-1 ring-black/5 dark:ring-white/5">
              <button
                onClick={() => setActiveTab('activo')}
                className={`flex items-center justify-center gap-2 flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'activo' ? 'bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
              >
                <Wallet size={16} />
                <span>Activos</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'activo' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-neutral-300/50 dark:bg-neutral-800 text-neutral-500'}`}>
                  {prestamos.filter(p => p.estado === 'activo').length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('completado')}
                className={`flex items-center justify-center gap-2 flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'completado' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
              >
                <CheckCircle2 size={16} />
                <span>Completados</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'completado' ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200' : 'bg-neutral-300/50 dark:bg-neutral-800 text-neutral-500'}`}>
                  {prestamos.filter(p => p.estado === 'completado').length}
                </span>
              </button>
            </div>

            {/* Buscador */}
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-500 transition-colors duration-300" size={18} />
              <input
                type="text"
                placeholder="Buscar préstamo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-5 py-3 rounded-2xl bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl text-sm font-medium outline-none border border-neutral-200/60 dark:border-neutral-800/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 placeholder:text-neutral-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Contenedor scrollable de Tarjetas */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-6 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-600">
        <div className="w-full">
          {prestamos.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-in zoom-in-95 duration-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl animate-pulse-slow" />
                <Banknote className="relative h-16 w-16 text-emerald-500/50 drop-shadow-sm" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No hay préstamos registrados</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md">Parece que aún no has registrado ningún préstamo en el sistema. Usa el botón superior para crear uno.</p>
            </div>
          ) : prestamosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center animate-in fade-in duration-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-neutral-500/10 rounded-full blur-2xl animate-pulse-slow" />
                <Search className="relative h-16 w-16 text-neutral-400 drop-shadow-sm" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No se encontraron resultados</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
                {searchQuery ? `No hay coincidencias para "${searchQuery}".` : `No hay préstamos ${activeTab === 'activo' ? 'activos' : 'completados'} actualmente.`}
              </p>
            </div>
          ) : (
            <div className={`flex flex-col gap-5 pb-32 ${loading ? 'opacity-60 pointer-events-none transition-opacity' : 'transition-opacity duration-300'}`}>
              {prestamosFiltrados.map((prestamo, index) => (
                <div key={prestamo.id} className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: `${index * 50}ms`, animationDuration: '400ms' }}>
                  <PrestamoCard 
                    prestamo={prestamo} 
                    canManage={canManage}
                    onOpenAbono={setPrestamoSeleccionado}
                    onTogglePausa={handleTogglePausa}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
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