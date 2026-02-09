// src/hooks/usePerformance.ts
import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useSession } from '@/src/hooks/useSession' 
import { ActividadConRelaciones } from '@/src/types/performance'
import { getSessionUserWithPermissions } from '@/src/app/auth/getSessionUser'
import { hasPermission } from '@/src/app/auth/permissions' 

export function usePerformance(initialData?: ActividadConRelaciones[]) {
  const [actividades, setActividades] = useState<ActividadConRelaciones[]>(initialData || [])
  const [loading, setLoading] = useState(!initialData) 
  const [filtro, setFiltro] = useState('todas')
  const [userPerms, setUserPerms] = useState<string[]>([]) 
  
  const supabase = createClient()
  const { session, loading: sessionLoading } = useSession() as any

  useEffect(() => {
    const loadUserPermissions = async () => {
      const data = await getSessionUserWithPermissions()
      if (data) setUserPerms(data.permissions)
    }
    if (session) loadUserPermissions()
  }, [session])

  const canManage = useMemo(() => {
    return hasPermission(userPerms, ['actividades.update', 'acceso_total']);
  }, [userPerms]);
  
  const fetchActividades = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('actividades')
        .select(`
          *,
          areas ( nombre ),
          asignacion_actividades (
            id,
            empleados ( 
              id,
              usuario_id, 
              nombre, 
              apellidos, 
              foto_perfil_url
            )
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error("SUPABASE ERROR:", error);
        throw error;
      }
      setActividades(data as unknown as ActividadConRelaciones[] || [])
    } catch (err) {
      console.error('Error fetching actividades:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (!initialData) fetchActividades()
  }, [fetchActividades, initialData])

  useEffect(() => {
    const channel = supabase
      .channel('realtime-performance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'actividades' }, fetchActividades)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'asignacion_actividades' }, fetchActividades)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchActividades])

  // --- LÓGICA DE FILTRADO UNIFICADA ---
  // Creamos una lista base segura para usar tanto en la Tabla como en las Stats
  const actividadesSeguras = useMemo(() => {
     let lista = actividades;
     
     // Si NO es Admin, filtramos para dejar solo sus asignaciones
     if (!canManage && session?.user?.id) {
        lista = actividades.filter(act => 
            act.asignacion_actividades?.some((asig: any) => 
                asig.empleados?.usuario_id === session.user.id
            )
        );
     }
     return lista;
  }, [actividades, canManage, session]);

  // CORRECCIÓN: Calculamos las Stats basándonos en 'actividadesSeguras'
  const stats = useMemo(() => {
    const source = actividadesSeguras; // <--- Usamos la lista filtrada
    
    const total = source.length
    const completadas = source.filter(a => a.estado === 'completada').length
    const pendientes = source.filter(a => ['pendiente', 'en_progreso'].includes(a.estado || '')).length
    const evaluadas = source.filter(a => (a.calificacion || 0) > 0)
    const promedio = evaluadas.length 
      ? (evaluadas.reduce((sum, a) => sum + (a.calificacion || 0), 0) / evaluadas.length).toFixed(1) 
      : '—'
    return { total, completadas, pendientes, promedio }
  }, [actividadesSeguras]) // Dependencia actualizada

  // Filtro Visual (Tabs)
  const actividadesFiltradas = useMemo(() => {
    if (filtro === 'todas') return actividadesSeguras
    if (filtro === 'explicacion') return actividadesSeguras.filter(a => a.estado === 'explicacion_requerida')
    return actividadesSeguras.filter(a => a.estado === filtro)
  }, [actividadesSeguras, filtro])

  return {
    actividades: actividadesFiltradas,
    stats,
    loading: loading || sessionLoading,
    canManage, 
    filtro,
    setFiltro,
    recargar: fetchActividades
  }
}