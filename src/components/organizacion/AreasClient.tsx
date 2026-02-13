'use client'

import { useState } from 'react'
import { Plus, Search, LayoutGrid } from 'lucide-react'
import { useAreasData } from '@/src/hooks/useAreasData'
import AreaCard from './AreaCard'
import AreaModal from './AreaModal'
import AreaStats from './AreaStats'
import AreaAssignment from './AreaAssignment'
import SkeletonLoader from '@/src/components/shared/SkeletonLoader'

interface AreasClientProps {
  initialAreas: any[]
  initialEmpleados: any[]
}

export default function AreasClient({ initialAreas, initialEmpleados }: AreasClientProps) {
  const { 
    areas, 
    empleados, 
    loading, 
    canManage, 
    handleCrear, 
    handleEditar, 
    handleEliminar, 
    handleAsignar 
  } = useAreasData(initialAreas, initialEmpleados)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [areaToEdit, setAreaToEdit] = useState<any>(null)
  const [filter, setFilter] = useState('')

  const areasFiltradas = areas.filter(a => 
    a.nombre.toLowerCase().includes(filter.toLowerCase())
  )

  if (loading && areas.length === 0) return <SkeletonLoader type="grid" />

  const permisosParaCard = {
    canUpdate: canManage,
    canDelete: canManage
  }

  const openCreateModal = () => {
    setAreaToEdit(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (area: any) => {
    setAreaToEdit(area)
    setIsModalOpen(true)
  }

  const handleDeleteClick = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este departamento? Esta acción no se puede deshacer.')) {
      await handleEliminar(id)
    }
  }

  const handleModalSubmit = async (nombre: string, descripcion: string, encargadoId: number | null) => {
    try {
      if (areaToEdit) {
        await handleEditar(areaToEdit.id, nombre, descripcion, encargadoId)
      } else {
        await handleCrear(nombre, descripcion, encargadoId)
      }
      setIsModalOpen(false)
      setAreaToEdit(null)
    } catch (error) {
      console.error("Error al guardar área:", error)
      alert("Ocurrió un error al guardar. Revisa la consola.")
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Dashboard de Estadísticas */}
      <AreaStats empleados={empleados} areas={areas} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Sección de Catálogo de Áreas (Izquierda) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text"
                placeholder="Buscar departamento..."
                // CAMBIO: focus:ring-blue-500/40 (Antes Orange)
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border focus:ring-2 focus:ring-blue-500/40 outline-none transition-all text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>

            {canManage && (
              <button 
                onClick={openCreateModal}
                // CAMBIO: bg-blue-600 y shadow-blue-600 (Antes Orange)
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-600/20"
              >
                <Plus size={18} />
                <span>Nueva Área</span>
              </button>
            )}
          </div>

          {areasFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {areasFiltradas.map(area => (
                <AreaCard 
                  key={area.id} 
                  area={area} 
                  permisos={permisosParaCard}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-card/50 border border-dashed border-border rounded-3xl text-muted-foreground">
              <LayoutGrid size={40} className="mb-3 opacity-20" />
              <p className="text-sm italic">No se encontraron departamentos registrados.</p>
            </div>
          )}
        </div>

        {/* 3. Panel de Asignación de Personal (Derecha) */}
        <div className="space-y-6">
          <AreaAssignment 
            empleados={empleados} 
            areas={areas} 
            onUpdate={handleAsignar}
          />
        </div>
      </div>

      <AreaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleModalSubmit} 
        initialData={areaToEdit}
        empleados={empleados}
      />
    </div>
  )
}