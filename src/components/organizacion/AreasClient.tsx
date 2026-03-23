'use client'

import { useState } from 'react'
import { Plus, Search, LayoutGrid, Loader2 } from 'lucide-react'
import { useAreasData } from '@/src/hooks/organizacion/useAreasData'
import AreaCard from './AreaCard'
import AreaModal from './AreaModal'
import AreaStats from './AreaStats'
import AreaAssignment from './AreaAssignment'
import ModalConfirmacion from '@/src/components/shared/ModalConfirmacion'

interface AreasClientProps {
  initialAreas: any[]
  initialEmpleados: any[]
  canManage: boolean
}

export default function AreasClient({ initialAreas, initialEmpleados, canManage }: AreasClientProps) {
  const { 
    areas, empleados, 
    handleCrear, handleEditar, handleEliminar, handleAsignar 
  } = useAreasData(initialAreas, initialEmpleados, canManage)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [areaToEdit, setAreaToEdit] = useState<any>(null)
  const [filter, setFilter] = useState('')

  const [areaToDelete, setAreaToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const areasFiltradas = areas.filter(a => 
    a.nombre.toLowerCase().includes(filter.toLowerCase())
  )

  const permisosParaCard = { canUpdate: canManage, canDelete: canManage }

  const handleModalSubmit = async (nombre: string, descripcion: string, encargadoId: number | null) => {
    setIsSaving(true)
    try {
      if (areaToEdit) await handleEditar(areaToEdit.id, nombre, descripcion, encargadoId)
      else await handleCrear(nombre, descripcion, encargadoId)
      setIsModalOpen(false); setAreaToEdit(null)
    } catch (error: any) { 
      alert("Error al guardar: " + error.message) 
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!areaToDelete) return;
    setIsDeleting(true);
    try {
      await handleEliminar(areaToDelete);
    } catch (error: any) {
      alert("Error al eliminar: " + error.message);
    } finally {
      setIsDeleting(false);
      setAreaToDelete(null);
    }
  }

  // Se ha removido el SkeletonLoader (if loading return Skeleton) ya que ahora todo lo hace el SSR
  // El componente nunca nace "loading", nace listo con los initialAreas.

  return (
    <div className="space-y-6 animate-in fade-in duration-500 bg-neutral-50 dark:bg-neutral-950 min-h-screen relative">
      
      {/* OVERLAY DE GUARDADO (opcional pero ayuda a la percepción de rapidez) */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm cursor-wait">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      )}

      {/* 1. Estadísticas */}
      <div className="px-6 pt-6">
        <AreaStats empleados={empleados} areas={areas} />
      </div>

      {/* 2. Buscador y Botón */}
      <div className="sticky top-0 z-10 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md py-4 px-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar departamento..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-neutral-200/50 dark:border-0 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
            />
          </div>

          {canManage && (
            <button 
              onClick={() => { setAreaToEdit(null); setIsModalOpen(true); }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all hover:bg-blue-700"
            >
              <Plus size={18} />
              <span>Nueva Área</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Grid de Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-6 pb-6">
        
        {/* Asignación */}
        <div className={`lg:col-span-4 order-1 lg:order-2 transition-opacity ${!canManage ? 'opacity-50 pointer-events-none hidden lg:block' : ''}`}>
          <div className="max-h-[500px] lg:max-h-none flex flex-col h-full">
            <AreaAssignment 
              empleados={empleados} 
              areas={areas} 
              onUpdate={handleAsignar}
            />
          </div>
        </div>

        {/* Catálogo de Áreas */}
        <div className={`${canManage ? 'lg:col-span-8' : 'lg:col-span-12'} order-2 lg:order-1`}>
          {areasFiltradas.length > 0 ? (
            <div className={`grid grid-cols-1 gap-4 ${canManage ? 'md:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
              {areasFiltradas.map(area => (
                <AreaCard 
                  key={area.id} 
                  area={area} 
                  permisos={permisosParaCard}
                  onEdit={(a) => { setAreaToEdit(a); setIsModalOpen(true); }}
                  onDelete={(id) => setAreaToDelete(id)} 
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-transparent">
              <LayoutGrid size={40} className="mb-2 text-neutral-400" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Sin resultados.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODALES */}
      <AreaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleModalSubmit} 
        initialData={areaToEdit} 
        empleados={empleados}
      />

      <ModalConfirmacion 
        isOpen={!!areaToDelete}
        onClose={() => setAreaToDelete(null)}
        onConfirm={confirmDelete}
        titulo="¿Eliminar Departamento?"
        descripcion="Si hay empleados asignados a esta área, quedarán temporalmente sin departamento asignado."
        variant="danger"
        textConfirmar="Sí, eliminar área"
        loading={isDeleting}
      />
      
    </div>
  )
}