import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { 
  crearAreaAction, 
  asignarEmpleadoAAreaAction, 
  actualizarAreaAction, 
  eliminarAreaAction 
} from '@/src/actions/organizacion/areasActions'
import { useRouter } from 'next/navigation'

export function useAreasData(initialAreas: any[] = [], initialEmpleados: any[] = [], canManage: boolean) {
  const [supabase] = useState(() => createClient())
  const router = useRouter()
  
  const [areas, setAreas] = useState<any[]>(initialAreas)
  const [empleados, setEmpleados] = useState<any[]>(initialEmpleados)

  // 1. REFRESH SILENCIOSO (Para Realtime)
  const refreshData = useCallback(async () => {
    const [areasData, empleadosData] = await Promise.all([
      supabase.from('areas').select(`*, encargado:empleados!fk_areas_encargado(*)`).is('deleted_at', null).order('nombre'),
      supabase.from('empleados').select('*').eq('estado', 'activo').is('deleted_at', null).order('nombre')
    ])
    if (areasData.data) setAreas(areasData.data)
    if (empleadosData.data) setEmpleados(empleadosData.data)
  }, [supabase])

  // 2. REALTIME SUBSCRIPTION
  useEffect(() => {
    const channel = supabase.channel('areas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'areas' }, () => {
         refreshData()
         router.refresh()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'empleados' }, () => {
         refreshData()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, refreshData, router])

  // 3. MUTACIONES CON SERVER ACTIONS
  const handleCrear = async (nombre: string, descripcion: string, encargadoId: number | null) => {
    if (!canManage) throw new Error("No tienes permiso de Administrador")
    await crearAreaAction(nombre, descripcion, encargadoId ?? undefined)
    await refreshData()
  }

  const handleEditar = async (id: number, nombre: string, descripcion: string, encargadoId: number | null) => {
    if (!canManage) throw new Error("No tienes permiso de Administrador")
    await actualizarAreaAction(id, { nombre, descripcion, encargado_id: encargadoId })
    await refreshData()
  }

  const handleEliminar = async (id: number) => {
    if (!canManage) throw new Error("No tienes permiso de Administrador")
    await eliminarAreaAction(id)
    await refreshData()
  }

  const handleAsignar = async (empId: number, areaId: number | null) => {
    if (!canManage) throw new Error("Solo los administradores pueden asignar áreas")
    
    // Optimistic UI (Acelera la percepción visual)
    setEmpleados(prev => prev.map(emp => emp.id === empId ? { ...emp, area_id: areaId } : emp))
    
    try {
      await asignarEmpleadoAAreaAction(empId, areaId)
    } catch (error) {
      await refreshData() // Rollback
      throw error;
    }
  }

  return {
    areas,
    empleados,
    handleCrear,
    handleEditar,
    handleEliminar,
    handleAsignar
  }
}