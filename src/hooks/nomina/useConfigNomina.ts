import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useSession } from '@/src/hooks/useSession'
import { getSessionUserWithPermissions } from '@/src/app/auth/getSessionUser'
import { hasPermission } from '@/src/app/auth/permissions'
import { getEmpleadosConfigNomina, actualizarConfigNominaEmpleado, NominaConfig } from '@/src/services/nomina/nominaService'

export function useConfigNomina() {
  const [supabase] = useState(() => createClient())
  
  // Estados de datos
  const [empleados, setEmpleados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados de seguridad y sesión
  const [userPerms, setUserPerms] = useState<string[]>([])
  const [userEstado, setUserEstado] = useState<string>('activo')
  const { session } = useSession() as any

  // 1. CARGA DE PERMISOS Y ESTADO REAL (Blindaje)
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
    // Solo el Administrador (acceso_total o nomina.update) puede modificar sueldos
    return hasPermission(userPerms, ['nomina.update', 'acceso_total']);
  }, [userPerms, session, userEstado]);

  const canRead = useMemo(() => {
    if (!session || userEstado === 'baja') return false;
    // Contabilidad puede leer (nomina.read), Admin también
    return hasPermission(userPerms, ['nomina.read', 'acceso_total']);
  }, [userPerms, session, userEstado]);

  // 3. OBTENER DATOS E INYECTAR FOTO DE GOOGLE
  const fetchEmpleados = useCallback(async () => {
    if (!canRead) return;

    try {
      setLoading(true)
      const data = await getEmpleadosConfigNomina();
      
      const currentUserId = session?.user?.id;
      const googleAvatar = session?.user?.user_metadata?.avatar_url;

      const empleadosProcesados = data.map((emp: any) => {
        const esElUsuarioActual = emp.usuario_id === currentUserId;
        const noTieneFotoBD = !emp.foto_perfil_url || emp.foto_perfil_url.trim() === '';

        if (esElUsuarioActual && noTieneFotoBD && googleAvatar) {
            return { ...emp, foto_perfil_url: googleAvatar };
        }
        return emp;
      });

      setEmpleados(empleadosProcesados)
    } catch (error) {
      console.error("Error al cargar configuración de nómina:", error)
    } finally {
      setLoading(false)
    }
  }, [canRead, session]);

  // Carga inicial
  useEffect(() => {
    if (session) fetchEmpleados();
  }, [fetchEmpleados, session]);

  // 4. SUSCRIPCIÓN REALTIME (Opcional pero recomendado para que Contabilidad vea cambios en vivo)
  useEffect(() => {
    if (!supabase || !canRead) return;
    
    const channel = supabase.channel('config-nomina-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'empleados' }, () => {
         // Si alguien actualiza un empleado, recargamos la lista
         fetchEmpleados();
      })
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [supabase, canRead, fetchEmpleados])

  // 5. ACCIÓN: ACTUALIZAR CONFIGURACIÓN
  const handleUpdateConfig = async (empleadoId: number, config: NominaConfig) => {
    if (!canManage) throw new Error("No tienes permisos para modificar la configuración de nómina.");
    if (userEstado === 'baja') throw new Error("Tu cuenta está desactivada.");

    try {
      // 1. Llamamos al servicio
      await actualizarConfigNominaEmpleado(empleadoId, config);
      
      // 2. Actualización Optimista local (Para que la UI se sienta ultra rápida)
      setEmpleados(prev => prev.map(emp => 
        emp.id === empleadoId ? { ...emp, ...config } : emp
      ));
      
    } catch (error) {
      throw error; // Lanzamos el error para que el Cliente (UI) muestre un alert/toast
    }
  }

  return {
    empleados,
    loading,
    canManage,
    canRead,
    handleUpdateConfig,
    refreshData: fetchEmpleados
  }
}