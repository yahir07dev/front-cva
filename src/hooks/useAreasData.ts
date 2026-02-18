import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useSession } from '@/src/hooks/useSession' 
import { getSessionUserWithPermissions } from '@/src/app/auth/getSessionUser'
import { hasPermission } from '@/src/app/auth/permissions'
import { 
  getAreasConEncargado, 
  getEmpleadosActivos, 
  crearArea, 
  asignarEmpleadoAArea, 
  actualizarArea, 
  eliminarArea 
} from '@/src/services/areasService'

export function useAreasData(initialAreas: any[] = [], initialEmpleados: any[] = []) {
  const [supabase] = useState(() => createClient())
  const [areas, setAreas] = useState<any[]>(initialAreas)
  const [empleados, setEmpleados] = useState<any[]>(initialEmpleados)
  
  const [loading, setLoading] = useState(false)
  const [userPerms, setUserPerms] = useState<string[]>([])
  const { session } = useSession() as any

  // 1. Cargar Permisos
  useEffect(() => {
    const loadUserPermissions = async () => {
      const data = await getSessionUserWithPermissions()
      if (data) setUserPerms(data.permissions)
    }
    if (session) loadUserPermissions()
  }, [session])

  // 2. Calcular si puede gestionar (Admin)
  const canManage = useMemo(() => {
    return hasPermission(userPerms, ['areas.create', 'areas.delete', 'acceso_total']);
  }, [userPerms]);

  // 3. Función de Recarga
  const refreshData = useCallback(async () => {
    try {
      setLoading(true) // Opcional: mostrar loading al recargar
      const [areasData, empleadosData] = await Promise.all([
        getAreasConEncargado(),
        getEmpleadosActivos()
      ])
      setAreas(areasData)
      setEmpleados(empleadosData)
    } catch (err) {
      console.error('Error refrescando datos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // 4. Realtime
  useEffect(() => {
    if (!supabase || !session?.user?.id) return
    const channel = supabase.channel('areas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'areas' }, () => refreshData())
      // Escuchamos cambios en empleados para ver cuando cambian de área
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'empleados' }, () => refreshData())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, session?.user?.id, refreshData])

  // 5. Acciones
  const handleCrear = async (nombre: string, descripcion: string, encargadoId: number | null) => {
    if (!canManage) throw new Error("No tienes permiso")
    
    // Al llamar a crearArea, el servicio se encarga de mover al empleado
    await crearArea(nombre, descripcion, encargadoId ?? undefined)
    await refreshData()
  }

  const handleEditar = async (id: number, nombre: string, descripcion: string, encargadoId: number | null) => {
    if (!canManage) throw new Error("No tienes permiso")
    
    // Al llamar a actualizarArea, el servicio se encarga de mover al empleado si cambió
    await actualizarArea(id, { nombre, descripcion, encargado_id: encargadoId })
    await refreshData()
  }

  const handleEliminar = async (id: number) => {
    if (!canManage) throw new Error("No tienes permiso")
    await eliminarArea(id)
    await refreshData()
  }

  const handleAsignar = async (empId: number, areaId: number | null) => {
    if (!hasPermission(userPerms, ['empleados.area.assign', 'acceso_total'])) {
      throw new Error("No tienes permiso")
    }
    await asignarEmpleadoAArea(empId, areaId)
    await refreshData()
  }

  return {
    areas,
    empleados,
    loading,
    canManage, 
    handleCrear,
    handleEditar,
    handleEliminar,
    handleAsignar,
    refreshData
  }
}