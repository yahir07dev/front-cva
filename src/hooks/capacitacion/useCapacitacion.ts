import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useSession } from '@/src/hooks/useSession' 
import { getSessionUserWithPermissions } from '@/src/app/auth/getSessionUser'
import { hasPermission } from '@/src/app/auth/permissions' 
import { 
  getCursos, 
  crearCursoCompleto, 
  actualizarCursoCompleto, 
  eliminarCurso, 
  enviarEvaluacion, 
  guardarProgresoBorrador,
  getDetalleEvaluacion // <--- Nueva importación
} from '@/src/services/capacitacion/capacitacionService'
import { CursoCapacitacion } from '@/src/types/capacitacion'

export function useCapacitacion(initialData?: any[]) {
  const [supabase] = useState(() => createClient())
  const [cursos, setCursos] = useState<any[]>(initialData || [])
  const [loading, setLoading] = useState(!initialData) 
  const [filtro, setFiltro] = useState('todos')
  const [userPerms, setUserPerms] = useState<string[]>([]) 
  const [empleadoId, setEmpleadoId] = useState<number | null>(null)

  const { session, loading: sessionLoading } = useSession() as any

  // 1. Cargar Permisos y Datos del Empleado Actual
  useEffect(() => {
    const initData = async () => {
      if (!session?.user?.id) return;

      const data = await getSessionUserWithPermissions()
      if (data) setUserPerms(data.permissions)

      const { data: emp } = await supabase
        .from('empleados')
        .select('id')
        .eq('usuario_id', session.user.id)
        .single()
      
      if (emp) setEmpleadoId(emp.id)
    }

    if (session) initData()
  }, [session, supabase])

  // 2. Lógica de Roles
  const canManage = useMemo(() => {
    return hasPermission(userPerms, ['cursos.create', 'cursos.update', 'acceso_total']);
  }, [userPerms]);

  const isAdmin = useMemo(() => {
    return hasPermission(userPerms, ['acceso_total']);
  }, [userPerms]);
  
  // 3. Fetch Principal
  const fetchCursosData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getCursos()
      setCursos(data)
    } catch (err) {
      console.error('Error fetching cursos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!initialData && session) fetchCursosData()
  }, [fetchCursosData, initialData, session])

  // 4. Suscripción en Tiempo Real
  useEffect(() => {
    if (!supabase || !session?.user?.id) return
    const channel = supabase.channel(`cursos-updates-${session.user.id}`) 
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cursos' }, () => fetchCursosData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'asignacion_cursos' }, () => setTimeout(() => fetchCursosData(), 500))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, session?.user?.id, fetchCursosData])

  // 5. Filtros para la UI
  const cursosFiltrados = useMemo(() => {
    if (!cursos) return [];
    if (filtro === 'todos') return cursos;

    return cursos.filter(curso => {
        const miAsignacion = curso.asignacion_cursos?.find((asig: any) => {
            const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados;
            return emp?.usuario_id === session?.user?.id;
        });

        if (filtro === 'completados') return miAsignacion?.estado === 'completado';
        if (filtro === 'pendientes') return miAsignacion?.estado === 'asignado' || miAsignacion?.estado === 'en_progreso';
        
        return true;
    });
  }, [cursos, filtro, session?.user?.id]);

  // 6. Funciones Wrapper para la UI

  const handleCrearCurso = async (cursoData: CursoCapacitacion, empleadosIds: number[]) => {
    if (!canManage) throw new Error("No tienes permisos para crear cursos.");
    await crearCursoCompleto(cursoData, empleadosIds);
    await fetchCursosData();
  };

  const handleEditarCurso = async (cursoId: number, cursoData: CursoCapacitacion, empleadosIds: number[]) => {
    if (!canManage) throw new Error("No tienes permisos para editar cursos.");
    await actualizarCursoCompleto(cursoId, cursoData, empleadosIds);
    await fetchCursosData();
  };

  const handleEliminarCurso = async (cursoId: number) => {
    if (!canManage) throw new Error("No tienes permisos para eliminar cursos.");
    await eliminarCurso(cursoId);
    await fetchCursosData();
  };

  const handleGuardarProgreso = async (cursoId: number, progresoData: any) => {
    if (!empleadoId) return;
    await guardarProgresoBorrador(cursoId, empleadoId, progresoData);
  };

  const handleEnviarExamen = async (cursoId: number, respuestas: any[], tiempoInicio: string) => {
    const resultado = await enviarEvaluacion(cursoId, respuestas, tiempoInicio);
    await fetchCursosData(); 
    return resultado;
  };

  // NUEVO: Función para que el empleado vea el desglose de sus aciertos y errores
  const handleObtenerDetalles = async (cursoId: number) => {
    if (!empleadoId) return null;
    return await getDetalleEvaluacion(cursoId, empleadoId);
  };

  return {
    cursos: cursosFiltrados,
    loading: loading || sessionLoading,
    canManage, 
    isAdmin,      
    filtro,
    setFiltro,
    recargar: fetchCursosData,
    crearCurso: handleCrearCurso,
    editarCurso: handleEditarCurso,
    eliminarCurso: handleEliminarCurso,
    guardarProgreso: handleGuardarProgreso,
    enviarExamen: handleEnviarExamen,
    obtenerDetallesEvaluacion: handleObtenerDetalles // <--- Nueva exportación
  }
}