// src/components/nomina/configuracion/ConfigNominaClient.tsx
'use client'

import { Search, Users } from 'lucide-react'
import { useConfigNomina } from '@/src/hooks/nomina/useConfigNomina'
import ConfigNominaHeader from './ConfigNominaHeader'
import EmpleadoNominaCard from './EmpleadoNominaCard'
import { NominaConfig } from '@/src/services/nomina/nominaService'

// Props inyectadas directamente desde el servidor (SSR)
interface ConfigNominaClientProps {
  initialEmpleados: any[]
  canManage: boolean
  currentUserId: string
}

export default function ConfigNominaClient({ 
  initialEmpleados, 
  canManage,
  currentUserId // Lo recibimos por si en el futuro quieres resaltar al usuario actual
}: ConfigNominaClientProps) {
  
  // Extraemos estados limpios del hook (el filtro ya ocurre ahí adentro)
  const { 
    empleados, // <--- Este array ya viene filtrado según el searchTerm
    searchTerm, 
    setSearchTerm, 
    handleUpdateConfig 
  } = useConfigNomina({ initialEmpleados, canManage })

  // Función envoltura por si en el futuro quieres añadir Toast/Notificaciones de éxito
  const onSaveConfig = async (id: number, config: NominaConfig) => {
    try {
      await handleUpdateConfig(id, config)
      // toast.success('Configuración guardada exitosamente')
    } catch (error: any) {
      alert('Error al guardar: ' + error.message)
      // toast.error('Error al guardar: ' + error.message)
    }
  }

  // 🚀 ADIÓS A LOS IFs DE CARGA Y PERMISOS 🚀
  // (Si llegamos aquí, es porque el SSR ya verificó sesión, estado y permisos)

  return (
    <div className="flex flex-col h-full -m-4 sm:-m-6 lg:-m-8 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500">

      {/* HEADER FIJO */}
      <ConfigNominaHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        totalEmpleados={empleados.length}
      />

      {/* ÁREA DE LISTADO SCROLLABLE */}
      <div className="
        flex-1 overflow-y-auto px-4 md:px-8 py-6
        scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700
        scrollbar-track-transparent hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-600
      ">
        <div className="w-full">
          
          {empleados.length === 0 ? (
            
            /* ESTADO VACÍO O SIN RESULTADOS */
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
                  ? 'Intenta buscar con otro nombre o asegúrate de que el empleado exista.'
                  : 'Aún no hay empleados activos en el sistema para configurar su nómina.'}
              </p>
            </div>

          ) : (
            
            /* GRID DE TARJETAS DE EMPLEADOS */
            <div className="flex flex-col gap-4 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {empleados.map((emp) => (
                <EmpleadoNominaCard
                  key={emp.id}
                  empleado={emp}
                  canManage={canManage}
                  onSave={onSaveConfig}
                />
              ))}
            </div>

          )}
        </div>
      </div>

    </div>
  )
}