import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'
// Importamos AMBAS funciones del servicio
import { crearNuevaActividad, getEmpleadosParaAsignacion } from '@/src/services/performanceService'
import { PrioridadActividad } from '@/src/types/performance'
import { useSession } from '@/src/hooks/useSession'
import { getSessionUserWithPermissions } from '@/src/app/auth/getSessionUser'
import { hasPermission } from '@/src/app/auth/permissions' 

export function useNuevaActividad() {
  const router = useRouter()
  const { session } = useSession() as any
  const supabase = createClient()
  
  const [empleados, setEmpleados] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [userPerms, setUserPerms] = useState<string[]>([]) 
  const [userEstado, setUserEstado] = useState<string>('activo')

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media' as PrioridadActividad,
    fechaLimite: '',
    asignados: [] as string[]
  })

  // 1. CARGA DE PERMISOS Y ESTADO REAL
  useEffect(() => {
    const loadUserData = async () => {
      const data = await getSessionUserWithPermissions()
      if (data) {
        setUserPerms(data.permissions)
      }

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

  const canCreate = useMemo(() => {
    if (!session || userEstado === 'baja') return false; 
    return hasPermission(userPerms, ['actividades.create', 'acceso_total']);
  }, [userPerms, session, userEstado]);

  // 2. CARGAR EMPLEADOS USANDO EL SERVICIO (CORRECCIÓN CLAVE)
  useEffect(() => {
    let isMounted = true;
    
    const fetchEmpleados = async () => {
        try {
            // USAMOS LA FUNCIÓN DEL SERVICIO QUE YA TIENE EL SELECT COMPLETO CON ÁREAS
            const data = await getEmpleadosParaAsignacion();

            if (isMounted && data) {
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
            }
        } catch (error) {
            console.error("Error al cargar empleados:", error)
        }
    }

    if (canCreate && session) {
      fetchEmpleados()
    }

    return () => { isMounted = false; };
  }, [canCreate, session]); // Quitamos 'supabase' de las dependencias porque el servicio ya instancia su cliente

  const toggleEmpleado = (id: string) => {
    setForm(prev => ({
      ...prev,
      asignados: prev.asignados.includes(id)
        ? prev.asignados.filter(item => item !== id)
        : [...prev.asignados, id]
    }))
  }

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // 3. ENVÍO SEGURO
  const handleSubmit = async () => {
    if (userEstado === 'baja') {
      return alert('Acceso denegado. Tu cuenta no está activa.')
    }

    if (!canCreate) {
      return alert('No tienes permisos para realizar esta acción.')
    }

    if (form.asignados.length === 0) return alert('Selecciona al menos un empleado.')
    if (!form.titulo || !form.fechaLimite) return alert('Completa título y fecha límite.')

    setLoading(true)
    try {
      await crearNuevaActividad({
        titulo: form.titulo,
        descripcion: form.descripcion,
        prioridad: form.prioridad,
        fecha_limite: form.fechaLimite
      }, form.asignados)

      setSuccess(true)
      
      setTimeout(() => {
        router.push('/dashboard/rendimiento/actividades') 
        router.refresh()
      }, 1500)
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    form,
    empleados,
    loading,
    success,
    userEstado,
    toggleEmpleado,
    handleChange,
    handleSubmit,
    router
  }
}