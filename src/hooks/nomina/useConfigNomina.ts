import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { actualizarConfigNominaEmpleado, NominaConfig } from '@/src/services/nomina/nominaService'

interface UseConfigNominaProps {
  initialEmpleados: any[]
  canManage: boolean
}

export function useConfigNomina({ initialEmpleados, canManage }: UseConfigNominaProps) {
  const [supabase] = useState(() => createClient())
  
  // 1. Estados
  const [empleados, setEmpleados] = useState<any[]>(initialEmpleados)
  const [searchTerm, setSearchTerm] = useState('')

  // 2. Búsqueda Optimizada (useMemo)
  const empleadosFiltrados = useMemo(() => {
    if (!searchTerm) return empleados
    const term = searchTerm.toLowerCase()
    return empleados.filter(emp => {
      const nombreCompleto = `${emp.nombre} ${emp.apellidos}`.toLowerCase()
      return nombreCompleto.includes(term)
    })
  }, [empleados, searchTerm])

  // 3. Suscripción Realtime (Para que Contabilidad vea cambios al instante)
  const fetchEmpleadosUpdates = useCallback(async () => {
    const { data } = await supabase
      .from('empleados')
      .select('id, sueldo_base, dia_pago, recibe_pago_tarjeta, estado')
      .eq('estado', 'activo')
      .is('deleted_at', null)

    if (data) {
      setEmpleados(prev => prev.map(emp => {
        const actualizado = data.find(d => d.id === emp.id)
        return actualizado ? { ...emp, ...actualizado } : emp
      }))
    }
  }, [supabase])

  useEffect(() => {
    const channel = supabase.channel('config-nomina-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'empleados' }, () => {
         fetchEmpleadosUpdates()
      })
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchEmpleadosUpdates])

  // 4. Acción Update con Optimistic UI
  const handleUpdateConfig = async (empleadoId: number, config: NominaConfig) => {
    if (!canManage) throw new Error("No tienes permisos para modificar la configuración.")

    // Guardamos el estado anterior en caso de que falle
    const prevEmpleados = [...empleados]

    try {
      // 1. Actualización Optimista local (UI inmediata)
      setEmpleados(prev => prev.map(emp => 
        emp.id === empleadoId ? { ...emp, ...config } : emp
      ))
      
      // 2. Llamada al Backend
      await actualizarConfigNominaEmpleado(empleadoId, config)
    } catch (error) {
      // Revertimos si hay error
      setEmpleados(prevEmpleados)
      throw error 
    }
  }

  return {
    empleados: empleadosFiltrados,
    searchTerm,
    setSearchTerm,
    canManage,
    handleUpdateConfig
  }
}