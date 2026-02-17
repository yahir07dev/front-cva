import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useSession } from '@/src/hooks/useSession' 
import { ActividadConRelaciones } from '@/src/types/performance'
import { getSessionUserWithPermissions } from '@/src/app/auth/getSessionUser'
import { hasPermission } from '@/src/app/auth/permissions' 
import { isSameDay, subDays, startOfDay, parseISO } from 'date-fns'

export function usePerformance(initialData?: ActividadConRelaciones[]) {
  const [supabase] = useState(() => createClient())
  const [actividades, setActividades] = useState<ActividadConRelaciones[]>(initialData || [])
  const [loading, setLoading] = useState(!initialData) 
  const [filtro, setFiltro] = useState('todas')
  const [userPerms, setUserPerms] = useState<string[]>([]) 
  const [now, setNow] = useState(new Date())

  const { session, loading: sessionLoading } = useSession() as any

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

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
      const { data, error } = await supabase
        .from('actividades')
        .select(`
          *,
          areas ( nombre ),
          asignacion_actividades (
            id,
            empleados ( id, usuario_id, nombre, apellidos, foto_perfil_url, estado )
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      
      if (error) throw error;
      
      let datosProcesados = (data as unknown as ActividadConRelaciones[]) || [];
      const currentUserId = session?.user?.id;
      const googleAvatar = session?.user?.user_metadata?.avatar_url;

      datosProcesados = datosProcesados.map(actividad => ({
        ...actividad,
        asignacion_actividades: actividad.asignacion_actividades?.filter((asig: any) => {
            const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados;
            return emp?.estado === 'activo' || emp?.usuario_id === currentUserId;
        }).map((asig: any) => {
            const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados;
            if (emp && emp.usuario_id === currentUserId && googleAvatar) {
                if (!emp.foto_perfil_url || emp.foto_perfil_url.trim() === '') {
                    const empleadoActualizado = { ...emp, foto_perfil_url: googleAvatar };
                    return {
                        ...asig,
                        empleados: Array.isArray(asig.empleados) ? [empleadoActualizado] : empleadoActualizado
                    };
                }
            }
            return asig;
        })
      }));

      setActividades(datosProcesados)
    } catch (err) {
      console.error('Error fetching activities:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase, session])

  useEffect(() => {
    if (!initialData && session) fetchActividades()
  }, [fetchActividades, initialData, session])

  useEffect(() => {
    if (!supabase || !session?.user?.id) return
    const channelId = `perf-${session.user.id}-${Date.now()}`
    const channel = supabase
      .channel(channelId) 
      .on('postgres_changes', { event: '*', schema: 'public', table: 'actividades' }, () => fetchActividades())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'asignacion_actividades' }, () => {
          setTimeout(() => fetchActividades(), 800) 
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'empleados' }, () => fetchActividades())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, session?.user?.id, fetchActividades])

  const actividadesSeguras = useMemo(() => {
      let lista = actividades;
      if (!canManage && session?.user?.id) {
        lista = actividades.filter(act => 
            act.asignacion_actividades?.some((asig: any) => {
                const emp = asig.empleados || asig.empleado;
                const empleadoReal = Array.isArray(emp) ? emp[0] : emp;
                return empleadoReal?.usuario_id === session.user.id
            })
        );
      }
      return lista;
  }, [actividades, canManage, session]);

  // --- NUEVA LÓGICA DE RACHAS (STREAKS) ---
  const rachaData = useMemo(() => {
    const source = actividadesSeguras;
    
    // 1. Agrupar actividades por día (usando fecha_limite o created_at)
    const actividadesPorDia: Record<string, ActividadConRelaciones[]> = {};
    
    source.forEach(act => {
      const fecha = act.fecha_limite ? parseISO(act.fecha_limite) : parseISO(act.created_at as string);
      const diaKey = startOfDay(fecha).toISOString();
      if (!actividadesPorDia[diaKey]) actividadesPorDia[diaKey] = [];
      actividadesPorDia[diaKey].push(act);
    });

    // 2. Calcular Racha de Días Registrados (Días con al menos 1 tarea completada)
    let rachaDias = 0;
    let rachaPerfecta = 0;
    let checkDate = startOfDay(now);

    // Bucle hacia atrás para contar días seguidos
    while (true) {
      const key = checkDate.toISOString();
      const actsDelDia = actividadesPorDia[key] || [];
      
      // ¿Hubo alguna actividad completada este día?
      const algunaCompletada = actsDelDia.some(a => a.estado === 'completada');
      
      if (algunaCompletada) {
        rachaDias++;
        // ¿Fue un día perfecto? (Todas las del día completadas)
        const todoCompletado = actsDelDia.every(a => a.estado === 'completada');
        if (todoCompletado) rachaPerfecta++;
        
        checkDate = subDays(checkDate, 1);
      } else {
        // Si no es hoy y no hubo actividad, se rompe la racha
        if (!isSameDay(checkDate, now)) break;
        // Si es hoy y no hay completadas aún, no rompemos, solo saltamos al día anterior
        checkDate = subDays(checkDate, 1);
        // Pero si el día anterior tampoco tiene nada, ahí sí rompe
        const prevKey = checkDate.toISOString();
        if (!(actividadesPorDia[prevKey]?.some(a => a.estado === 'completada'))) break;
      }
    }

    return {
      diasRegistrados: rachaDias,
      diasPerfectos: rachaPerfecta,
      mejorRacha: rachaDias, // Aquí podrías comparar contra un valor en la DB en el futuro
      mejorRachaPerfecta: rachaPerfecta
    };
  }, [actividadesSeguras, now]);

  const stats = useMemo(() => {
    const source = actividadesSeguras;
    const ahoraMs = now.getTime();

    const completadas = source.filter(a => a.estado === 'completada').length;
    
    const noRealizadas = source.filter(a => {
      if (!a.fecha_limite || a.estado === 'completada') return false;
      const limiteMs = new Date(a.fecha_limite).getTime();
      return limiteMs < ahoraMs;
    }).length;

    const pendientes = source.filter(a => {
      const isEnProceso = ['pendiente', 'en_progreso'].includes(a.estado || '');
      if (!isEnProceso) return false;
      if (!a.fecha_limite) return true;
      const limiteMs = new Date(a.fecha_limite).getTime();
      return limiteMs >= ahoraMs;
    }).length;

    const evaluadas = source.filter(a => (a.calificacion || 0) > 0);
    const promedio = evaluadas.length 
      ? (evaluadas.reduce((sum, a) => sum + (a.calificacion || 0), 0) / evaluadas.length).toFixed(1) 
      : '—';
    
    return { 
      total: source.length, 
      completadas, 
      pendientes, 
      noRealizadas, 
      promedio,
      ...rachaData // Inyectamos las rachas en las stats
    };
  }, [actividadesSeguras, now, rachaData]);

  const actividadesFiltradas = useMemo(() => {
    if (filtro === 'todas') return actividadesSeguras;
    const ahoraMs = now.getTime();
    if (filtro === 'no_realizadas') {
      return actividadesSeguras.filter(a => 
        a.estado !== 'completada' && 
        a.fecha_limite && new Date(a.fecha_limite).getTime() < ahoraMs
      );
    }
    if (filtro === 'pendiente') {
        return actividadesSeguras.filter(a => 
            a.estado === 'pendiente' && 
            (!a.fecha_limite || new Date(a.fecha_limite).getTime() >= ahoraMs)
        );
    }
    return actividadesSeguras.filter(a => a.estado === filtro);
  }, [actividadesSeguras, filtro, now]);

  return {
    actividades: actividadesFiltradas,
    stats,
    loading: loading || sessionLoading,
    canManage, 
    filtro,
    setFiltro,
    recargar: fetchActividades,
  }
}