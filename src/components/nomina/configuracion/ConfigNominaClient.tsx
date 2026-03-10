'use client'

import { useState } from 'react'
import { useConfigNomina } from '@/src/hooks/useConfigNomina'
import ConfigNominaHeader from './ConfigNominaHeader'
import EmpleadoNominaCard from './EmpleadoNominaCard'
import { Loader2, Search, AlertCircle } from 'lucide-react'

export default function ConfigNominaClient() {
  const { empleados, loading, canManage, canRead, handleUpdateConfig } = useConfigNomina()
  const [searchTerm, setSearchTerm] = useState('')

  if (!loading && !canRead) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center px-4">
        <div className="h-14 w-14 rounded-xl bg-rose-500/10 flex items-center justify-center mb-4">
          <AlertCircle size={28} className="text-rose-500" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
          Acceso Denegado
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
          No tienes permisos para ver o modificar la configuración de nómina.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>
    )
  }

  const empleadosFiltrados = empleados.filter(emp => {
    const nombreCompleto = `${emp.nombre} ${emp.apellidos}`.toLowerCase()
    return nombreCompleto.includes(searchTerm.toLowerCase())
  })

  return (
    // -m-4 sm:-m-6 lg:-m-8 cancela exactamente el padding p-4 sm:p-6 lg:p-8 del layout padre
    <div className="flex flex-col h-full -m-4 sm:-m-6 lg:-m-8 bg-neutral-50 dark:bg-neutral-950">

      {/* Header fijo */}
      <ConfigNominaHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        totalEmpleados={empleados.length}
      />

      {/* Lista scrollable que ocupa todo el espacio restante */}
      <div className="
        flex-1 overflow-y-auto px-4 md:px-6 py-4
        scrollbar-thin scrollbar-thumb-emerald-300/60 dark:scrollbar-thumb-emerald-700/60
        scrollbar-track-transparent hover:scrollbar-thumb-emerald-400/80
      ">
        <div className="max-w-6xl mx-auto">
          {empleadosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <div className="h-16 w-16 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <Search size={28} className="text-emerald-500/70" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                {searchTerm ? `No se encontró "${searchTerm}"` : 'No hay empleados'}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
                {searchTerm
                  ? 'Intenta con otro nombre o limpia la búsqueda'
                  : 'Agrega empleados para empezar a configurar la nómina'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 pb-6">
              {empleadosFiltrados.map(emp => (
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