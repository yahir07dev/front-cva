'use client'

import { useState } from 'react'
import { useConfigNomina } from '@/src/hooks/nomina/useConfigNomina'
import ConfigNominaHeader from './ConfigNominaHeader'
import EmpleadoNominaCard from './EmpleadoNominaCard'
import { Loader2, Search, AlertCircle, Users } from 'lucide-react'

export default function ConfigNominaClient() {
  const { empleados, loading, canManage, canRead, handleUpdateConfig } = useConfigNomina()
  const [searchTerm, setSearchTerm] = useState('')

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
          No tienes los permisos necesarios para ver o modificar la configuración de nómina.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center w-full animate-in fade-in duration-500">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
      </div>
    )
  }

  const empleadosFiltrados = empleados.filter(emp => {
    const nombreCompleto = `${emp.nombre} ${emp.apellidos}`.toLowerCase()
    return nombreCompleto.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="flex flex-col h-full -m-4 sm:-m-6 lg:-m-8 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500">

      {/* Header fijo */}
      <ConfigNominaHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        totalEmpleados={empleados.length}
      />

      {/* Lista scrollable */}
      <div className="
        flex-1 overflow-y-auto px-4 md:px-8 py-6
        scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700
        scrollbar-track-transparent hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-600
      ">
        {/* AQUÍ EL CAMBIO: w-full en lugar de max-w-7xl */}
        <div className="w-full">
          {empleadosFiltrados.length === 0 ? (
            
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-in zoom-in-95 duration-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-neutral-500/10 rounded-full blur-2xl animate-pulse-slow" />
                {searchTerm ? (
                  <Search className="relative h-16 w-16 text-neutral-400 drop-shadow-sm" />
                ) : (
                  <Users className="relative h-16 w-16 text-neutral-400 drop-shadow-sm" />
                )}
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                {searchTerm ? `No se encontró "${searchTerm}"` : 'No hay empleados registrados'}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
                {searchTerm
                  ? 'Intenta con otro nombre o limpia la búsqueda.'
                  : 'Aún no hay empleados activos en el sistema para configurar su nómina.'}
              </p>
            </div>

          ) : (
            
            <div className="flex flex-col gap-4 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {empleadosFiltrados.map((emp) => (
                <EmpleadoNominaCard
                  key={emp.id}
                  empleado={emp}
                  canManage={canManage}
                  onSave={handleUpdateConfig}
                />
              ))}
            </div>

          )}
        </div>
      </div>
    </div>
  )
}