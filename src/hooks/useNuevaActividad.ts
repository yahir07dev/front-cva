// src/hooks/useNuevaActividad.ts
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'
import { crearNuevaActividad } from '@/src/services/performanceService'
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

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media' as PrioridadActividad,
    fechaLimite: '',
    asignados: [] as string[]
  })

  // --- CARGA DE PERMISOS ---
  useEffect(() => {
    const loadUserPermissions = async () => {
      const data = await getSessionUserWithPermissions()
      if (data) {
        setUserPerms(data.permissions)
      }
    }
    if (session) {
      loadUserPermissions()
    }
  }, [session])

  const canCreate = useMemo(() => {
    if (!session) return false;
    return hasPermission(userPerms, ['actividades.create', 'acceso_total']);
  }, [userPerms, session]);

  // --- CARGAR EMPLEADOS E INYECTAR FOTO DE GOOGLE ---
  useEffect(() => {
    let isMounted = true;
    
    const fetchEmpleados = async () => {
        try {
            // 1. Agregamos 'usuario_id' para saber cuál es el usuario actual
            const { data, error } = await supabase
                .from('empleados')
                .select(`
                    id, 
                    usuario_id, 
                    nombre, 
                    apellidos, 
                    foto_perfil_url, 
                    roles ( nombre )
                `)
                .eq('estado', 'activo')
                .order('nombre', { ascending: true })

            if (error) throw error

            if (isMounted && data) {
                // 2. Lógica de "Inyección": 
                // Si el empleado es el usuario actual y no tiene foto en BD, le ponemos la de Google
                const currentUserId = session?.user?.id;
                const googleAvatar = session?.user?.user_metadata?.avatar_url;

                const empleadosProcesados = data.map((emp) => {
                    const esElUsuarioActual = emp.usuario_id === currentUserId;
                    const noTieneFotoBD = !emp.foto_perfil_url || emp.foto_perfil_url.trim() === '';

                    if (esElUsuarioActual && noTieneFotoBD && googleAvatar) {
                        return { ...emp, foto_perfil_url: googleAvatar };
                    }
                    return emp;
                });

                console.log("Empleados cargados (con foto inyectada):", empleadosProcesados)
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
  }, [canCreate, supabase, session]); // Agregamos 'session' a dependencias

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

  const handleSubmit = async () => {
    if (!canCreate) {
      return alert('No tienes permisos (slug: actividades.create) para realizar esta acción.')
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
      console.error("Error al crear:", error.message);
      alert('Error de base de datos: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    form,
    empleados,
    loading,
    success,
    toggleEmpleado,
    handleChange,
    handleSubmit,
    router
  }
}