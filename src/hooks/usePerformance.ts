import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useSession } from '@/src/hooks/useSession' 
import { ActividadConRelaciones } from '@/src/types/performance'
import { getSessionUserWithPermissions } from '@/src/app/auth/getSessionUser'
import { hasPermission } from '@/src/app/auth/permissions' 
// Importamos el tipo para el payload si quieres ser estricto, o usamos any
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export function usePerformance(initialData?: ActividadConRelaciones[]) {
  const [supabase] = useState(() => createClient())
  const [actividades, setActividades] = useState<ActividadConRelaciones[]>(initialData || [])
  const [loading, setLoading] = useState(!initialData) 
  const [filtro, setFiltro] = useState('todas')
  const [userPerms, setUserPerms] = useState<string[]>([]) 
  
  const { session, loading: sessionLoading } = useSession() as any

  // 1. Permisos
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
  
  // 2. Fetch
  const fetchActividades = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('actividades')
        .select(`
          *,
          areas ( nombre ),
          asignacion_actividades (
            id,
            empleados ( id, usuario_id, nombre, apellidos, foto_perfil_url )
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error;
      
      // console.log("🔄 Refresh datos:", data?.length)
      setActividades(data as unknown as ActividadConRelaciones[] || [])
    } catch (err) {
      console.error('Error fetching:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // 3. Carga inicial
  useEffect(() => {
    if (!initialData && session) fetchActividades()
  }, [fetchActividades, initialData, session])

  // 4. --- REALTIME CORREGIDO ---
  useEffect(() => {
    if (!supabase || !session?.user?.id) return

    // ID único para evitar colisiones de canales
    const channelId = `perf-${session.user.id}-${Date.now()}`
    
    console.log('🔌 Conectando Realtime:', channelId)

    const channel = supabase
      .channel(channelId) 
      // A) Escuchar cambios en ACTIVIDADES
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'actividades' },
        (payload: any) => { // <--- TIPADO COMO ANY PARA EVITAR ERRORES DE TS
          console.log('🔔 Cambio en Actividades:', payload.eventType)
          fetchActividades()
        }
      )
      // B) Escuchar ASIGNACIONES
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'asignacion_actividades' },
        (payload: any) => { // <--- TIPADO COMO ANY
          console.log('🔔 Cambio en Asignación:', payload.eventType)
          // Delay de seguridad vital para RLS
          setTimeout(() => fetchActividades(), 800) 
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('✅ Realtime Listo')
        if (status === 'CHANNEL_ERROR') console.error('❌ Error de conexión Realtime')
      })
    
    // Cleanup
    return () => {
      console.log('🧹 Desconectando:', channelId)
      supabase.removeChannel(channel)
    }
  }, [supabase, session?.user?.id, fetchActividades])

  // 5. Filtrado Frontend
  const actividadesSeguras = useMemo(() => {
     let lista = actividades;
     if (!canManage && session?.user?.id) {
       lista = actividades.filter(act => 
           act.asignacion_actividades?.some((asig: any) => 
               asig.empleados?.usuario_id === session.user.id
           )
       );
     }
     return lista;
  }, [actividades, canManage, session]);

  // 6. Stats & Filtros
  const stats = useMemo(() => {
    const source = actividadesSeguras;
    const total = source.length
    const completadas = source.filter(a => a.estado === 'completada').length
    const pendientes = source.filter(a => ['pendiente', 'en_progreso'].includes(a.estado || '')).length
    const evaluadas = source.filter(a => (a.calificacion || 0) > 0)
    const promedio = evaluadas.length 
      ? (evaluadas.reduce((sum, a) => sum + (a.calificacion || 0), 0) / evaluadas.length).toFixed(1) 
      : '—'
    return { total, completadas, pendientes, promedio }
  }, [actividadesSeguras])

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