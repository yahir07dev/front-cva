import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useSession } from '@/src/hooks/useSession'
import { getSessionUserWithPermissions } from '@/src/app/auth/getSessionUser'
import { hasPermission } from '@/src/app/auth/permissions'
import { getPrestamos, getEmpleadosParaPrestamo, crearPrestamo, NuevoPrestamo, registrarAbonoPrestamo } from '@/src/services/nomina/prestamosService'


export function usePrestamos() {

  const [supabase] = useState(() => createClient())
  
  const [prestamos, setPrestamos] = useState<any[]>([])
  const [empleadosLista, setEmpleadosLista] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [userPerms, setUserPerms] = useState<string[]>([])
  const [userEstado, setUserEstado] = useState<string>('activo')
  const { session } = useSession() as any

  // 1. CARGA DE PERMISOS
  useEffect(() => {
    const loadUserData = async () => {
      const data = await getSessionUserWithPermissions()
      if (data) setUserPerms(data.permissions)

      if (session?.user?.id) {
        const { data: emp } = await supabase
          .from('empleados')
          .select('estado')
          .eq('usuario_id', session.user.id)
          .single()
        
        if (emp) setUserEstado(emp.estado)
      }
    }
    if (session) loadUserData()
  }, [session, supabase])

  // 2. LÓGICA DE PERMISOS
  const canManage = useMemo(() => {
    if (!session || userEstado === 'baja') return false;
    // Solo Admin puede crear/editar préstamos
    return hasPermission(userPerms, ['prestamos.create', 'prestamos.update', 'acceso_total']);
  }, [userPerms, session, userEstado]);

  const canRead = useMemo(() => {
    if (!session || userEstado === 'baja') return false;
    // Admin y Contabilidad pueden leer
    return hasPermission(userPerms, ['prestamos.read', 'acceso_total']);
  }, [userPerms, session, userEstado]);

  // 3. FETCH DE DATOS
  const fetchData = useCallback(async () => {
    if (!canRead) return;

    try {
      setLoading(true)
      const [prestamosData, empleadosData] = await Promise.all([
        getPrestamos(),
        getEmpleadosParaPrestamo()
      ]);
      
      const currentUserId = session?.user?.id;
      const googleAvatar = session?.user?.user_metadata?.avatar_url;

      // Inyección de fotos a los préstamos
      const prestamosProcesados = prestamosData.map((p: any) => {
        const emp = p.empleados;
        if (emp && emp.usuario_id === currentUserId && (!emp.foto_perfil_url || emp.foto_perfil_url === '') && googleAvatar) {
            return { ...p, empleados: { ...emp, foto_perfil_url: googleAvatar } };
        }
        return p;
      });

      setPrestamos(prestamosProcesados)
      setEmpleadosLista(empleadosData)
    } catch (error) {
      console.error("Error cargando préstamos:", error)
    } finally {
      setLoading(false)
    }
  }, [canRead, session]);

  useEffect(() => {
    if (session) fetchData();
  }, [fetchData, session]);

  // 4. SUSCRIPCIÓN REALTIME
  useEffect(() => {
    if (!supabase || !canRead) return;
    
    const channel = supabase.channel('prestamos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prestamos' }, () => fetchData())
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [supabase, canRead, fetchData])

  // 5. ACCIÓN: CREAR PRÉSTAMO
  const handleCrearPrestamo = async (datos: NuevoPrestamo) => {
    if (!canManage) throw new Error("No tienes permisos para crear préstamos.");
    if (userEstado === 'baja') throw new Error("Cuenta desactivada.");
    
    if (datos.monto_total <= 0) throw new Error("El monto debe ser mayor a 0.");
    if (!datos.empleado_id) throw new Error("Debes seleccionar un empleado.");

    await crearPrestamo(datos);
    // El Realtime actualizará la lista automáticamente, pero podemos forzar recarga por velocidad:
    await fetchData();
  }

  // 6. ACCIÓN: REGISTRAR PAGO/OMISIÓN
const handleAbonar = async (prestamoId: number, monto: number, omitir: boolean, motivo: string) => {
  if (!canManage) throw new Error("No tienes permisos para registrar pagos.");
  if (userEstado === 'baja') throw new Error("Cuenta desactivada.");

  await registrarAbonoPrestamo(prestamoId, monto, omitir, motivo);
  await fetchData(); // Recargamos para ver el progreso moverse
}

// NUEVO 7. ACCIÓN: PAUSAR COBRO (OMITIR SEMANA)
  const handleTogglePausa = async (prestamoId: number, estadoActual: boolean) => {
    if (!canManage) throw new Error("No tienes permisos para modificar préstamos.");
    
    // Importamos la función sobre la marcha para no tener que subir hasta arriba de tu archivo
    const { togglePausarCobro } = await import('@/src/services/nomina/prestamosService');
    
    await togglePausarCobro(prestamoId, estadoActual);
    await fetchData();
  }

  // Estadísticas rápidas para el Header
  const stats = useMemo(() => {
    const activos = prestamos.filter(p => p.estado === 'activo');
    const totalPrestado = activos.reduce((sum, p) => sum + Number(p.monto_total), 0);
    const totalRestante = activos.reduce((sum, p) => sum + Number(p.saldo_restante), 0);
    
    return {
      prestamosActivos: activos.length,
      dineroEnLaCalle: totalRestante,
      totalHistorico: prestamos.length
    }
  }, [prestamos])

  return {
    prestamos,
    empleadosLista,
    stats,
    loading,
    canManage,
    canRead,
    handleCrearPrestamo,
    handleAbonar,
    handleTogglePausa,
    refreshData: fetchData
  }
}