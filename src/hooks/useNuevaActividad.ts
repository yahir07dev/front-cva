// src/hooks/useNuevaActividad.ts
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getEmpleadosParaAsignacion, crearNuevaActividad } from '@/src/services/performanceService'
import { PrioridadActividad } from '@/src/types/performance'
import { useSession } from '@/src/hooks/useSession'
import { getSessionUserWithPermissions } from '@/src/app/auth/getSessionUser'
import { hasPermission } from '@/src/app/auth/permissions' 

export function useNuevaActividad() {
  const router = useRouter()
  const { session } = useSession() as any
  
  // Estados de Datos
  const [empleados, setEmpleados] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [userPerms, setUserPerms] = useState<string[]>([]) 

  // Estados del Formulario
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media' as PrioridadActividad,
    fechaLimite: '',
    asignados: [] as string[]
  })

  // --- CARGA DE PERMISOS REALES DESDE DB ---
  useEffect(() => {
    const loadUserPermissions = async () => {
      // Obtenemos los slugs vinculados al usuario
      const data = await getSessionUserWithPermissions()
      if (data) {
        setUserPerms(data.permissions)
      }
    }
    
    if (session) {
      loadUserPermissions()
    }
  }, [session])

  // --- LÓGICA DE PERMISOS BASADA EN EL PERFIL DE DB ---
  const canCreate = useMemo(() => {
    if (!session) return false;

    // Yahir tiene 'acceso_total', lo que debe habilitar canCreate
    const result = hasPermission(userPerms, ['actividades.create', 'acceso_total']);

    console.log("=== NUEVA ACTIVIDAD PERMISSIONS DEBUG ===");
    console.log("Slugs detectados:", userPerms);
    console.log("¿Habilitar formulario (canCreate)?:", result);
    
    return result;
  }, [userPerms, session]);

  // Cargar empleados al iniciar (CORREGIDO)
  useEffect(() => {
    let isMounted = true;
    
    if (canCreate) {
      getEmpleadosParaAsignacion()
        .then(data => {
          if (isMounted) {
            // Verificamos que los datos lleguen con la propiedad 'rol'
            console.log("Empleados cargados para asignación:", data);
            setEmpleados(data);
          }
        })
        .catch(err => {
          console.error("Error al cargar empleados:", err);
        });
    }

    return () => { isMounted = false; };
  }, [canCreate]);

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
      // El servicio valida contra las políticas RLS actualizadas
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