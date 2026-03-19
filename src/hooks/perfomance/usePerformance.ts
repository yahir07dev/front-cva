// src/hooks/perfomance/usePerformance.ts
import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { ActividadConRelaciones } from '@/src/types/performance'
import { isSameDay, subDays, startOfDay, parseISO, isValid } from 'date-fns'

// 🛠️ HELPER EXTERNO: Calcula la racha para cualquier lista de actividades dada.
function calcularRachas(listaActividades: ActividadConRelaciones[], fechaActual: Date) {
  if (!listaActividades || listaActividades.length === 0) {
      return { diasRegistrados: 0, diasPerfectos: 0 };
  }

  const actividadesPorDia: Record<string, ActividadConRelaciones[]> = {};
  
  listaActividades.forEach(act => {
    const fechaRef = act.fecha_limite || act.created_at;
    if(!fechaRef) return;

    const fecha = parseISO(fechaRef as string);
    if (!isValid(fecha)) return; 

    const diaKey = startOfDay(fecha).toISOString();
    if (!actividadesPorDia[diaKey]) actividadesPorDia[diaKey] = [];
    actividadesPorDia[diaKey].push(act);
  });

  let rachaDias = 0;
  let rachaPerfecta = 0;
  let checkDate = startOfDay(fechaActual);

  let safetyCounter = 0; 

  while (safetyCounter < 365) { 
    safetyCounter++;
    const key = checkDate.toISOString();
    const actsDelDia = actividadesPorDia[key] || [];
    
    if (actsDelDia.length > 0) {
       const algunaCompletada = actsDelDia.some(a => a.estado === 'completada');
       
       if (algunaCompletada) {
         rachaDias++;
         const todoExito = actsDelDia.every(a => a.estado === 'completada');
         if (todoExito) rachaPerfecta++;
         checkDate = subDays(checkDate, 1);
       } else {
         if (isSameDay(checkDate, fechaActual)) {
            checkDate = subDays(checkDate, 1);
            continue;
         }
         break; 
       }
    } else {
       checkDate = subDays(checkDate, 1);
    }
  }

  return { diasRegistrados: rachaDias, diasPerfectos: rachaPerfecta };
}

interface UsePerformanceArgs {
  initialData: ActividadConRelaciones[]
  initialPermisos: string[]
  sessionUser: any // Pasamos el usuario de Supabase directamente desde el SSR
}

export function usePerformance({ initialData, initialPermisos, sessionUser }: UsePerformanceArgs) {
  const [supabase] = useState(() => createClient())
  
  // Inicializamos directamente con los datos del servidor
  const [actividades, setActividades] = useState<ActividadConRelaciones[]>(initialData || [])
  const [filtro, setFiltro] = useState('todas')
  const [now, setNow] = useState(new Date())

  // Reloj interno para actualizar estados relativos al tiempo (ej: vencimiento)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // LÓGICA DE ROLES Y PERMISOS SÍNCRONA
  const canManage = useMemo(() => {
    return initialPermisos.includes('actividades.update') || initialPermisos.includes('acceso_total');
  }, [initialPermisos]);

  const isAdmin = useMemo(() => {
    return initialPermisos.includes('acceso_total');
  }, [initialPermisos]);

  const isSupervisor = useMemo(() => {
    return canManage && !isAdmin;
  }, [canManage, isAdmin]);
  
  // Función para recargar datos en cliente (usada para Realtime o tras mutaciones)
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
      const currentUserId = sessionUser?.id;
      const googleAvatar = sessionUser?.user_metadata?.avatar_url;

      datosProcesados = datosProcesados.map(actividad => ({
        ...actividad,
        asignacion_actividades: actividad.asignacion_actividades?.filter((asig: any) => {
            const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados;
            return emp && (emp.estado === 'activo' || emp.usuario_id === currentUserId);
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
    }
  }, [supabase, sessionUser])

  // Suscripción a Realtime para mantener los datos vivos sin necesidad de refrescar
  useEffect(() => {
    if (!supabase || !sessionUser?.id) return
    const channel = supabase.channel(`perf-updates-${sessionUser.id}`) 
      .on('postgres_changes', { event: '*', schema: 'public', table: 'actividades' }, () => fetchActividades())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'asignacion_actividades' }, () => setTimeout(() => fetchActividades(), 500))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, sessionUser?.id, fetchActividades])

  // Filtrado de seguridad basado en permisos
  const actividadesSeguras = useMemo(() => {
      if (!actividades) return [];
      if (!canManage && sessionUser?.id) {
        return actividades.filter(act => 
            act.asignacion_actividades?.some((asig: any) => {
                const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados;
                return emp?.usuario_id === sessionUser.id
            })
        );
      }
      return actividades;
  }, [actividades, canManage, sessionUser]);

  // Actividades exclusivas del usuario (para cálculos personales)
  const actividadesSoloMias = useMemo(() => {
      if (!sessionUser?.id || !actividades) return [];
      return actividades.filter(act => 
          act.asignacion_actividades?.some((asig: any) => {
              const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados;
              return emp?.usuario_id === sessionUser.id
          })
      );
  }, [actividades, sessionUser]);

  // Cálculo de rachas
  const rachaData = useMemo(() => {
    const global = calcularRachas(actividadesSeguras, now);
    const personal = calcularRachas(actividadesSoloMias, now);
    return { global, personal };
  }, [actividadesSeguras, actividadesSoloMias, now]);

  // Estadísticas globales del panel
  const stats = useMemo(() => {
    const source = actividadesSeguras;
    const ahoraMs = now.getTime();

    const completadas = source.filter(a => a.estado === 'completada').length;
    
    const noRealizadas = source.filter(a => {
      if (!a.fecha_limite || a.estado === 'completada') return false;
      const d = new Date(a.fecha_limite);
      if (isNaN(d.getTime())) return false;
      return d.getTime() < ahoraMs;
    }).length;

    const pendientes = source.filter(a => {
      const isEnProceso = ['pendiente', 'en_progreso', 'revision'].includes(a.estado || '');
      if (!isEnProceso) return false;
      if (!a.fecha_limite) return true;
      const d = new Date(a.fecha_limite);
      if (isNaN(d.getTime())) return false;
      return d.getTime() >= ahoraMs;
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
      rachaGlobal: rachaData.global,
      rachaPersonal: rachaData.personal
    };
  }, [actividadesSeguras, now, rachaData]);

  // Aplicación del filtro seleccionado por el usuario en la UI
  const actividadesFiltradas = useMemo(() => {
    if (!actividadesSeguras) return [];
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
    canManage, 
    isAdmin,      
    isSupervisor, 
    filtro,
    setFiltro,
    recargar: fetchActividades,
  }
}