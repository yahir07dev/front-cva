import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useSession } from '@/src/hooks/useSession' 
import { ActividadConRelaciones } from '@/src/types/performance'
import { getSessionUserWithPermissions } from '@/src/app/auth/getSessionUser'
import { hasPermission } from '@/src/app/auth/permissions' 

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
  
  // 2. Fetch (CON INYECCIÓN DE AVATAR DE GOOGLE)
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
      
      // --- INICIO LÓGICA DE FOTO GOOGLE ---
      let datosProcesados = (data as unknown as ActividadConRelaciones[]) || [];

      // Si tenemos sesión activa y avatar de Google...
      if (session?.user?.user_metadata?.avatar_url) {
         const currentUserId = session.user.id;
         const googleAvatar = session.user.user_metadata.avatar_url;

         // Recorremos todas las actividades
         datosProcesados = datosProcesados.map(actividad => ({
            ...actividad,
            // Recorremos las asignaciones de cada actividad
            asignacion_actividades: actividad.asignacion_actividades?.map((asig: any) => {
               // Obtenemos el objeto empleado (manejamos si viene como array o objeto por seguridad)
               const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados;

               // Si es el usuario actual Y no tiene foto en BD...
               if (emp && emp.usuario_id === currentUserId) {
                  if (!emp.foto_perfil_url || emp.foto_perfil_url.trim() === '') {
                      // ... Le inyectamos la foto de Google "al vuelo"
                      // IMPORTANTE: Aseguramos devolver la estructura correcta dependiendo de si 'empleados' era array u objeto
                      const empleadoActualizado = {
                          ...emp,
                          foto_perfil_url: googleAvatar
                      };

                      return {
                          ...asig,
                          empleados: Array.isArray(asig.empleados) ? [empleadoActualizado] : empleadoActualizado
                      };
                  }
               }
               return asig;
            })
         }));
      }
      // --- FIN LÓGICA ---

      setActividades(datosProcesados)

    } catch (err) {
      console.error('Error fetching:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase, session]) // Agregamos 'session' a las dependencias

  // 3. Carga inicial
  useEffect(() => {
    if (!initialData && session) fetchActividades()
  }, [fetchActividades, initialData, session])

  // 4. --- REALTIME ---
  useEffect(() => {
    if (!supabase || !session?.user?.id) return

    const channelId = `perf-${session.user.id}-${Date.now()}`
    
    // console.log('🔌 Conectando Realtime:', channelId)

    const channel = supabase
      .channel(channelId) 
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'actividades' },
        (payload: any) => { 
          // console.log('🔔 Cambio en Actividades')
          fetchActividades()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'asignacion_actividades' },
        (payload: any) => { 
          // console.log('🔔 Cambio en Asignación')
          setTimeout(() => fetchActividades(), 800) 
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, session?.user?.id, fetchActividades])

  // 5. Filtrado Frontend
  const actividadesSeguras = useMemo(() => {
     let lista = actividades;
     // Si NO puede gestionar (es empleado normal), solo ve las suyas
     if (!canManage && session?.user?.id) {
       lista = actividades.filter(act => 
           act.asignacion_actividades?.some((asig: any) => {
               const emp = asig.empleados || asig.empleado;
               return emp?.usuario_id === session.user.id
           })
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