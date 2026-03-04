'use client'

import { useState, useMemo } from 'react'
import { usePrestamos } from '@/src/hooks/usePrestamos'
import { Loader2, Users, Search, Wallet, CheckCircle2 } from 'lucide-react'
import PrestamosHeader from './PrestamosHeader'
import PrestamoCard from './PrestamoCard'
import ModalNuevoPrestamo from './ModalNuevoPrestamo'
import ModalAbono from './ModalAbono'

export default function PrestamosClient() {
  const { 
    prestamos, 
    empleadosLista, 
    stats, 
    loading, 
    canManage, 
    canRead, 
    handleCrearPrestamo, 
    handleAbonar, 
    handleTogglePausa
  } = usePrestamos()
  
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

  if (!loading && !canRead) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <Users className="h-12 w-12 text-neutral-400 dark:text-neutral-600 mb-4" />
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Acceso Denegado</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-md">
          No tienes permisos para ver los préstamos.
        </p>
      </div>
    )
  }

  if (loading && prestamos.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-32">
      
      <PrestamosHeader 
        stats={stats} 
        canManage={canManage} 
        onOpenModal={() => setIsModalOpen(true)} 
      />

      {/* Controles: Pestañas + Buscador */}
      {prestamos.length > 0 && (
        <div className="
          bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm 
          border border-emerald-200/30 dark:border-emerald-900/30 
          rounded-3xl p-4 mb-8 shadow-sm
        ">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            
            {/* Pestañas */}
            <div className="
              flex p-1.5 bg-white/50 dark:bg-neutral-950/40 
              border border-emerald-200/40 dark:border-emerald-900/30 
              rounded-2xl w-fit shadow-inner
            ">
              <button
                onClick={() => setActiveTab('activo')}
                className={`
                  flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                  ${activeTab === 'activo' 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'}
                `}
              >
                <Wallet size={18} />
                Activos
                <span className={`
                  ml-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                  ${activeTab === 'activo' 
                    ? 'bg-white/30 text-white' 
                    : 'bg-neutral-200/80 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300'}
                `}>
                  {prestamos.filter(p => p.estado === 'activo').length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('completado')}
                className={`
                  flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                  ${activeTab === 'completado' 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'}
                `}
              >
                <CheckCircle2 size={18} />
                Completados
                <span className={`
                  ml-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                  ${activeTab === 'completado' 
                    ? 'bg-white/30 text-white' 
                    : 'bg-neutral-200/80 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300'}
                `}>
                  {prestamos.filter(p => p.estado === 'completado').length}
                </span>
              </button>
            </div>

            {/* Buscador */}
            <div className="relative w-full sm:w-80">
              <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-600 transition-colors" 
                size={18} 
              />
              <input
                type="text"
                placeholder="Buscar empleado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full pl-11 pr-5 py-3.5 rounded-2xl bg-white/60 dark:bg-neutral-950/50 
                  border border-emerald-200/40 dark:border-emerald-900/30
                  text-sm font-medium outline-none 
                  focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20
                  transition-all placeholder:text-neutral-400/70 hover:border-emerald-400/60
                "
              />
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {prestamos.length === 0 ? (
        <div className="
          bg-white/60 dark:bg-neutral-950/50 backdrop-blur-sm
          border border-emerald-200/30 dark:border-emerald-900/30 
          rounded-3xl p-12 text-center
        ">
          <p className="text-lg font-medium text-neutral-600 dark:text-neutral-300">
            No hay préstamos registrados en el sistema.
          </p>
        </div>
      ) : prestamosFiltrados.length === 0 ? (
        <div className="
          bg-white/60 dark:bg-neutral-950/50 backdrop-blur-sm
          border border-emerald-200/30 dark:border-emerald-900/30 
          rounded-3xl p-12 text-center
        ">
          <Search className="mx-auto h-10 w-10 text-neutral-400 mb-4" />
          <p className="text-lg font-medium text-neutral-600 dark:text-neutral-300">
            {searchQuery 
              ? `No se encontraron resultados para "${searchQuery}"` 
              : `No hay préstamos ${activeTab === 'activo' ? 'activos' : 'completados'}.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 animate-in fade-in duration-300">
          {prestamosFiltrados.map(prestamo => (
            <PrestamoCard 
              key={prestamo.id} 
              prestamo={prestamo} 
              canManage={canManage}
              onOpenAbono={setPrestamoSeleccionado}
              onTogglePausa={handleTogglePausa}
            />
          ))}
        </div>
      )}

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