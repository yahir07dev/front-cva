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
      <div className="flex h-[60vh] flex-col items-center justify-center text-center px-4">
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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      
      {/* Header fijo (sticky) */}
      <div className="flex-none z-10">
        <PrestamosHeader 
          stats={stats} 
          canManage={canManage} 
          onOpenModal={() => setIsModalOpen(true)} 
        />
      </div>

      {/* Controles: Pestañas + Buscador - sticky */}
      {prestamos.length > 0 && (
        <div className="
          sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-950/90 backdrop-blur-xl 
        
          px-3 sm:px-4 py-3 md:py-4
        ">
          <div className="flex flex-col gap-3 max-w-6xl mx-auto">
            {/* Pestañas */}
            <div className="
              flex p-1 bg-white/50 dark:bg-neutral-950/40 
              rounded-xl md:rounded-2xl w-full shadow-inner
            ">
              <button
                onClick={() => setActiveTab('activo')}
                className={`
                  flex items-center justify-center gap-1.5 md:gap-2.5 flex-1 px-2 md:px-6 py-2.5 md:py-3 
                  rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-200
                  ${activeTab === 'activo' 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'}
                `}
              >
                <Wallet size={16} className="md:w-[18px] md:h-[18px]" />
                <span className="hidden xs:inline">Activos</span>
                <span className={`
                  ml-0.5 md:ml-1.5 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold
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
                  flex items-center justify-center gap-1.5 md:gap-2.5 flex-1 px-2 md:px-6 py-2.5 md:py-3 
                  rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-200
                  ${activeTab === 'completado' 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'}
                `}
              >
                <CheckCircle2 size={16} className="md:w-[18px] md:h-[18px]" />
                <span className="hidden xs:inline">Completados</span>
                <span className={`
                  ml-0.5 md:ml-1.5 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold
                  ${activeTab === 'completado' 
                    ? 'bg-white/30 text-white' 
                    : 'bg-neutral-200/80 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300'}
                `}>
                  {prestamos.filter(p => p.estado === 'completado').length}
                </span>
              </button>
            </div>

            {/* Buscador */}
            <div className="relative w-full">
              <Search 
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-600 transition-colors" 
                size={16} 
              />
              <input
                type="text"
                placeholder="Buscar empleado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full pl-9 md:pl-11 pr-4 md:pr-5 py-3 md:py-3.5 
                  rounded-xl md:rounded-2xl bg-white/60 dark:bg-neutral-950/50 
                  text-sm font-medium outline-none 
                  focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500
                  transition-all placeholder:text-neutral-400/70
                  border-0 ring-1 ring-neutral-200/30 dark:ring-neutral-800/30
                "
              />
            </div>
          </div>
        </div>
      )}

      {/* Contenedor scrollable - fondo transparente */}
      <div className="
        flex-1 overflow-hidden relative
        bg-neutral-50 dark:bg-neutral-950 
      ">
        <div className="
          absolute inset-0 overflow-y-auto px-3 sm:px-4 pb-20 pt-2
          scrollbar-thin scrollbar-thumb-emerald-300/50 dark:scrollbar-thumb-emerald-700/50
          scrollbar-track-transparent hover:scrollbar-thumb-emerald-400/70
        ">
          <div className="max-w-6xl mx-auto">
            {prestamos.length === 0 ? (
              <div className="
                bg-white/60 dark:bg-neutral-950/50 backdrop-blur-sm
                rounded-2xl md:rounded-3xl p-8 md:p-12 text-center mt-4
              ">
                <p className="text-base md:text-lg font-medium text-neutral-600 dark:text-neutral-300">
                  No hay préstamos registrados en el sistema.
                </p>
              </div>
            ) : prestamosFiltrados.length === 0 ? (
              <div className="
                bg-white/60 dark:bg-neutral-950/50 backdrop-blur-sm
                rounded-2xl md:rounded-3xl p-8 md:p-12 text-center mt-4
              ">
                <Search className="mx-auto h-8 w-8 md:h-10 md:w-10 text-neutral-400 mb-3 md:mb-4" />
                <p className="text-base md:text-lg font-medium text-neutral-600 dark:text-neutral-300">
                  {searchQuery 
                    ? `No se encontraron resultados para "${searchQuery}"` 
                    : `No hay préstamos ${activeTab === 'activo' ? 'activos' : 'completados'}.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4 pb-16 md:space-y-6">
                {prestamosFiltrados.map(prestamo => (
                  <PrestamoCard 
                    key={prestamo.id} 
                    prestamo={prestamo} 
                    canManage={canManage}
                    onOpenAbono={setPrestamoSeleccionado}
                    onTogglePausa={handleTogglePausa}
                  />
                ))}
                {/* Espacio extra al final para que la última card se vea completa */}
                <div className="h-8 md:h-12" />
              </div>
            )}
          </div>
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