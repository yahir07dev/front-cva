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
    areas, empleados, loading, canManage, 
    handleCrear, handleEditar, handleEliminar, handleAsignar 
  } = useAreasData(initialAreas, initialEmpleados)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [areaToEdit, setAreaToEdit] = useState<any>(null)
  const [filter, setFilter] = useState('')

  const areasFiltradas = areas.filter(a => 
    a.nombre.toLowerCase().includes(filter.toLowerCase())
  )

  if (loading && areas.length === 0) return <SkeletonLoader type="grid" />

  const permisosParaCard = { canUpdate: canManage, canDelete: canManage }

  const handleModalSubmit = async (nombre: string, descripcion: string, encargadoId: number | null) => {
    try {
      if (areaToEdit) await handleEditar(areaToEdit.id, nombre, descripcion, encargadoId)
      else await handleCrear(nombre, descripcion, encargadoId)
      setIsModalOpen(false); setAreaToEdit(null)
    } catch (error) { console.error(error) }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 bg-neutral-50 dark:bg-neutral-950 min-h-screen">
      
      {/* 1. Estadísticas - Ahora se integra con el fondo */}
      <div className="px-6 pt-6">
        <AreaStats empleados={empleados} areas={areas} />
      </div>

      {/* 2. Buscador y Botón - Integrado sin bordes */}
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

      {/* 3. Grid de Contenido - Sin fondos adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-6 pb-6">
        
        {/* Asignación - Componente con su propio fondo */}
        <div className="lg:col-span-4 order-1 lg:order-2">
          <div className="max-h-[500px] lg:max-h-none flex flex-col h-full">
            <AreaAssignment 
              empleados={empleados} 
              areas={areas} 
              onUpdate={handleAsignar}
            />
          </div>
        </div>

        {/* Catálogo de Áreas - Grid de cards */}
        <div className="lg:col-span-8 order-2 lg:order-1">
          {areasFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {areasFiltradas.map(area => (
                <AreaCard 
                  key={area.id} 
                  area={area} 
                  permisos={permisosParaCard}
                  onEdit={(a) => { setAreaToEdit(a); setIsModalOpen(true); }}
                  onDelete={async (id) => { if(confirm('¿Borrar?')) await handleEliminar(id); }}
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