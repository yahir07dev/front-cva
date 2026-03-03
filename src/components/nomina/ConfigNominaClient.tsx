'use client'

import { useState } from 'react'
import { useConfigNomina } from '@/src/hooks/useConfigNomina'
import ConfigNominaHeader from './ConfigNominaHeader'
import EmpleadoNominaCard from './EmpleadoNominaCard'
import { Loader2, Users } from 'lucide-react'

export default function ConfigNominaClient() {
  const { empleados, loading, canManage, canRead, handleUpdateConfig } = useConfigNomina()
  const [searchTerm, setSearchTerm] = useState('')

  // Bloqueo total si no tiene permisos de lectura
  if (!loading && !canRead) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <Users className="h-12 w-12 text-neutral-300 mb-4" />
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Acceso Denegado</h3>
        <p className="text-sm text-neutral-500">No tienes permisos para ver la configuración de nómina.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  // Filtro de búsqueda
  const empleadosFiltrados = empleados.filter(emp => {
    const nombreCompleto = `${emp.nombre} ${emp.apellidos}`.toLowerCase()
    return nombreCompleto.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      
      <ConfigNominaHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        totalEmpleados={empleados.length} 
      />

      <div className="space-y-3">
        {empleadosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white/40 dark:bg-neutral-900/40 rounded-[32px] border border-dashed border-neutral-200 dark:border-neutral-800">
            <p className="text-neutral-500 font-medium">No se encontraron empleados.</p>
          </div>
        ) : (
          empleadosFiltrados.map(emp => (
            <EmpleadoNominaCard 
              key={emp.id} 
              empleado={emp} 
              canManage={canManage} 
              onSave={handleUpdateConfig} 
            />
          ))
        )}
      </div>

    </div>
  )
}