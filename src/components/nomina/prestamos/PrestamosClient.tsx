'use client'

import { useState, useMemo } from 'react'
import { usePrestamos } from '@/src/hooks/nomina/usePrestamos'
import { Loader2, Users, Search, Wallet, CheckCircle2, AlertCircle, Banknote } from 'lucide-react'
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

  // --- ESTADO DE ACCESO DENEGADO ---
  if (!loading && !canRead) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
        <div className="h-20 w-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 ring-4 ring-rose-500/5">
          <AlertCircle size={32} className="text-rose-500" />
        </div>
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
          Acceso Denegado
        </h3>
        <p className="text-base text-neutral-500 dark:text-neutral-400 max-w-sm">
          No tienes los permisos necesarios para ver los préstamos del sistema.
        </p>
      </div>
    )
  }

  // --- ESTADO DE CARGA ---
  if (loading && prestamos.length === 0) {
    return (
      <div className="flex h-[70vh] items-center justify-center w-full animate-in fade-in duration-500">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
      </div>
    )
  }

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

      {/* Controles: Pestañas + Buscador (Fijos debajo del Header) */}
      {prestamos.length > 0 && (
        <div className="
          flex-none sticky top-0 z-10 
          bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-xl 
          px-6 lg:px-10 py-4 border-b border-neutral-200/50 dark:border-neutral-800/50
        ">
          {/* AQUÍ EL CAMBIO: Quitamos max-w-7xl y pusimos w-full */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            
            {/* Pestañas Neutrales/Elegantes */}
            <div className="
              flex p-1.5 bg-neutral-200/50 dark:bg-neutral-900/80 
              rounded-2xl w-full md:w-auto shadow-inner ring-1 ring-black/5 dark:ring-white/5
            ">
              <button
                onClick={() => setActiveTab('activo')}
                className={`
                  flex items-center justify-center gap-2 flex-1 md:flex-none px-6 py-2.5 
                  rounded-xl text-sm font-bold transition-all duration-300
                  ${activeTab === 'activo' 
                    ? 'bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5' 
                    : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}
                `}
              >
                <Wallet size={16} />
                <span>Activos</span>
                <span className={`
                  ml-1 px-2 py-0.5 rounded-full text-[10px] font-black
                  ${activeTab === 'activo' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-neutral-300/50 dark:bg-neutral-800 text-neutral-500'}
                `}>
                  {prestamos.filter(p => p.estado === 'activo').length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('completado')}
                className={`
                  flex items-center justify-center gap-2 flex-1 md:flex-none px-6 py-2.5 
                  rounded-xl text-sm font-bold transition-all duration-300
                  ${activeTab === 'completado' 
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5' 
                    : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}
                `}
              >
                <CheckCircle2 size={16} />
                <span>Completados</span>
                <span className={`
                  ml-1 px-2 py-0.5 rounded-full text-[10px] font-black
                  ${activeTab === 'completado' 
                    ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200' 
                    : 'bg-neutral-300/50 dark:bg-neutral-800 text-neutral-500'}
                `}>
                  {prestamos.filter(p => p.estado === 'completado').length}
                </span>
              </button>
            </div>

            {/* Buscador Premium Neutral */}
            <div className="relative w-full md:w-80 group">
              <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-500 transition-colors duration-300" 
                size={18} 
              />
              <input
                type="text"
                placeholder="Buscar préstamo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full pl-12 pr-5 py-3 
                  rounded-2xl bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl 
                  text-sm font-medium outline-none 
                  border border-neutral-200/60 dark:border-neutral-800/50
                  focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50
                  hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700
                  transition-all duration-300 placeholder:text-neutral-500
                "
              />
            </div>
          </div>
        </div>
      )}

      {/* Contenedor scrollable de Tarjetas */}
      <div className="
        flex-1 overflow-y-auto px-6 lg:px-10 py-6
        scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700
        scrollbar-track-transparent hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-600
      ">
        {/* AQUÍ EL CAMBIO: Quitamos max-w-7xl y dejamos que ocupe todo w-full */}
        <div className="w-full">
          {prestamos.length === 0 ? (
            
            /* ESTADO VACÍO: Sin Préstamos (Diseño Glass) */
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-in zoom-in-95 duration-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl animate-pulse-slow" />
                <Banknote className="relative h-16 w-16 text-emerald-500/50 drop-shadow-sm" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                No hay préstamos registrados
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
                Parece que aún no has registrado ningún préstamo en el sistema. Usa el botón superior para crear uno.
              </p>
            </div>

          ) : prestamosFiltrados.length === 0 ? (
            
            /* ESTADO VACÍO: Búsqueda sin resultados (Diseño Glass) */
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center animate-in fade-in duration-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-neutral-500/10 rounded-full blur-2xl animate-pulse-slow" />
                <Search className="relative h-16 w-16 text-neutral-400 drop-shadow-sm" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
                {searchQuery 
                  ? `No hay coincidencias para "${searchQuery}".` 
                  : `No hay préstamos ${activeTab === 'activo' ? 'activos' : 'completados'} actualmente.`}
              </p>
            </div>

          ) : (
            
            /* GRID DE TARJETAS ESPACIADAS Y ANIMADAS */
            <div className="flex flex-col gap-5 pb-32">
              {prestamosFiltrados.map((prestamo, index) => (
                <div 
                  key={prestamo.id}
                  className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                  style={{ animationDelay: `${index * 100}ms`, animationDuration: '700ms' }}
                >
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