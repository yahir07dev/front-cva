import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'
import { crearNuevaActividad, getEmpleadosParaAsignacion } from '@/src/services/perfomance/performanceService'
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

  // NUEVO: Estado para controlar el modal de alerta
  const [alerta, setAlerta] = useState({
    isOpen: false,
    titulo: '',
    descripcion: '',
    variant: 'warning' as 'warning' | 'danger' | 'info' | 'success'
  })

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media' as PrioridadActividad,
    fechaLimite: '',
    asignados: [] as string[]
  })

  const mostrarAlerta = (titulo: string, descripcion: string, variant: 'warning'|'danger'|'info' = 'warning') => {
    setAlerta({ isOpen: true, titulo, descripcion, variant })
  }

  const cerrarAlerta = () => setAlerta(prev => ({ ...prev, isOpen: false }))

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

  // LÓGICA DE ROLES Y PERMISOS
  const canCreate = useMemo(() => {
    if (!session || userEstado === 'baja') return false; 
    return hasPermission(userPerms, ['actividades.create', 'acceso_total']);
  }, [userPerms, session, userEstado]);

  const isAdmin = useMemo(() => {
    return hasPermission(userPerms, ['acceso_total']);
  }, [userPerms]);

  const isSupervisor = useMemo(() => {
    return canCreate && !isAdmin;
  }, [canCreate, isAdmin]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchEmpleados = async () => {
        try {
            const data = await getEmpleadosParaAsignacion();
            if (isMounted && data) {
                const currentUserId = session?.user?.id;
                const googleAvatar = session?.user?.user_metadata?.avatar_url;

                // 1. Procesamos los avatares como lo tenías originalmente
                let empleadosProcesados = data.map((emp: any) => {
                    const esElUsuarioActual = emp.usuario_id === currentUserId;
                    const noTieneFotoBD = !emp.foto_perfil_url || emp.foto_perfil_url.trim() === '';

                    if (esElUsuarioActual && noTieneFotoBD && googleAvatar) {
                        return { ...emp, foto_perfil_url: googleAvatar };
                    }
                    return emp;
                });

                // 2. FILTRO MÁGICO: Si es Supervisor, borramos a los de Contabilidad de la lista
                if (isSupervisor) {
                  empleadosProcesados = empleadosProcesados.filter(
                    (emp: any) => emp.roles?.nombre !== 'Contabilidad'
                  );
                }

                setEmpleados(empleadosProcesados)
            }
        } catch (error) {
            console.error("Error al cargar empleados:", error)
        }
    }

    if (canCreate && session) fetchEmpleados()

    return () => { isMounted = false; };
  }, [canCreate, session, isSupervisor]); // Agregamos isSupervisor a las dependencias

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

  // ENVÍO SEGURO CON MODALES
  const handleSubmit = async () => {
    if (userEstado === 'baja') {
      return mostrarAlerta('Acceso Denegado', 'Tu cuenta no está activa. Contacta a recursos humanos.', 'danger')
    }

    if (!canCreate) {
      return mostrarAlerta('Sin Permisos', 'No tienes los permisos necesarios para realizar esta acción.', 'danger')
    }

    if (!form.titulo || !form.fechaLimite) {
      return mostrarAlerta('Campos Incompletos', 'Asegúrate de escribir un título y seleccionar la fecha límite de la tarea.', 'warning')
    }

    if (form.asignados.length === 0) {
      return mostrarAlerta('Sin Asignaciones', 'Por favor, selecciona al menos un empleado para esta tarea.', 'warning')
    }

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
      mostrarAlerta('Error del Servidor', error.message, 'danger')
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
    alerta,        
    cerrarAlerta,  
    toggleEmpleado,
    handleChange,
    handleSubmit,
    router
  }
}