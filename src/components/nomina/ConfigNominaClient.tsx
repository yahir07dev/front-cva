'use client'

import { useState } from 'react'
import { useConfigNomina } from '@/src/hooks/useConfigNomina'
import ConfigNominaHeader from './ConfigNominaHeader'
import EmpleadoNominaCard from './EmpleadoNominaCard'
import { Loader2, Users, Search } from 'lucide-react'

export default function ConfigNominaClient() {
  const { empleados, loading, canManage, canRead, handleUpdateConfig } = useConfigNomina()
  const [searchTerm, setSearchTerm] = useState('')

  // Acceso denegado
  if (!loading && !canRead) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <div className="
          h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6
          ring-1 ring-red-200/40 dark:ring-red-900/30
        ">
          <Users size={32} className="text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-3">
          Acceso Denegado
        </h3>
        <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-md">
          No tienes permisos para ver o modificar la configuración de nómina.
        </p>
      </div>
    )
  }

  // Cargando
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>
    )
  }

  // Filtro de búsqueda
  const empleadosFiltrados = empleados.filter(emp => {
    const nombreCompleto = `${emp.nombre} ${emp.apellidos}`.toLowerCase()
    return nombreCompleto.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-32 animate-in fade-in duration-500">
      
      <ConfigNominaHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        totalEmpleados={empleados.length} 
      />

      <div className="space-y-4 md:space-y-5">
        {empleadosFiltrados.length === 0 ? (
          <div className="
            bg-white/60 dark:bg-neutral-950/50 backdrop-blur-sm
            border border-emerald-200/30 dark:border-emerald-900/30 
            rounded-3xl p-12 md:p-16 text-center shadow-sm
          ">
            <Search className="mx-auto h-12 w-12 text-neutral-400 mb-6" />
            <p className="text-lg font-medium text-neutral-600 dark:text-neutral-300">
              {searchTerm 
                ? `No se encontraron empleados para "${searchTerm}"` 
                : 'No hay empleados registrados o visibles con los filtros actuales.'}
            </p>
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