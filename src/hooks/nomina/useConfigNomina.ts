import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { actualizarConfigNominaEmpleado, NominaConfig } from '@/src/services/nomina/nominaService'

interface UseConfigNominaProps {
  initialEmpleados: any[]
  canManage: boolean
}

export function useConfigNomina({ initialEmpleados, canManage }: UseConfigNominaProps) {
  const [supabase] = useState(() => createClient())
  const [empleados, setEmpleados] = useState<any[]>(initialEmpleados)
  const [searchTerm, setSearchTerm] = useState('')

  const empleadosFiltrados = useMemo(() => {
    if (!searchTerm) return empleados
    const term = searchTerm.toLowerCase()
    return empleados.filter(emp => {
      const nombreCompleto = `${emp.nombre} ${emp.apellidos}`.toLowerCase()
      return nombreCompleto.includes(term)
    })
  }, [empleados, searchTerm])

  const fetchEmpleadosUpdates = useCallback(async () => {
    const { data } = await supabase
      .from('empleados')
      .select('id, sueldo_base, dia_pago, recibe_pago_tarjeta, monto_tarjeta_defecto, estado') // 👈 AÑADIDO: monto_tarjeta_defecto
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

  const handleUpdateConfig = async (empleadoId: number, config: NominaConfig) => {
    if (!canManage) throw new Error("No tienes permisos para modificar la configuración.")
    const prevEmpleados = [...empleados]

    try {
      setEmpleados(prev => prev.map(emp => 
        emp.id === empleadoId ? { ...emp, ...config } : emp
      ))
      await actualizarConfigNominaEmpleado(empleadoId, config)
    } catch (error) {
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