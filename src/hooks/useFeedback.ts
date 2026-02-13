// src/hooks/useFeedback.ts
import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useSession } from '@/src/hooks/useSession'
import { TipoComentario } from '@/src/types/performance'
import { getSessionUserWithPermissions } from '@/src/app/auth/getSessionUser'
import { hasPermission } from '@/src/app/auth/permissions'
import { getComentarios, crearComentario, eliminarComentario } from '@/src/services/feedbackService'

export function useFeedback(initialUser?: any, initialEmpleados?: any[]) {
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const { session } = useSession() as any
  const currentUserId = session?.user?.id
  const googleAvatar = session?.user?.user_metadata?.avatar_url

  // 1. ESTADO DE PERMISOS Y SEGURIDAD (Blindaje)
  const [userPerms, setUserPerms] = useState<string[]>([])
  const [userEstado, setUserEstado] = useState<string>('activo')
  
  useEffect(() => {
    const loadUserData = async () => {
      // Carga de permisos
      const data = await getSessionUserWithPermissions()
      if (data) setUserPerms(data.permissions)

      // Verificación de estado de cuenta
      if (currentUserId) {
        const { data: emp } = await supabase
          .from('empleados')
          .select('estado')
          .eq('usuario_id', currentUserId)
          .single()
        
        if (emp) setUserEstado(emp.estado)
      }
    }
    if (initialUser) loadUserData()
  }, [initialUser, currentUserId, supabase])

  const canCreate = useMemo(() => {
    // Bloqueo preventivo si el usuario está de baja
    if (userEstado === 'baja') return false
    return hasPermission(userPerms, ['comentarios.create', 'acceso_total'])
  }, [userPerms, userEstado])

  // 2. ESTADOS DE DATOS
  const [loading, setLoading] = useState(false)
  
  // Filtrado y procesamiento de empleados (Solo activos para la lista)
  const empleadosProcesados = useMemo(() => {
      if (!initialEmpleados) return [];
      
      return initialEmpleados
        .filter(emp => emp.estado === 'activo') // Filtro de seguridad
        .map(emp => {
          if (emp.usuario_id === currentUserId && (!emp.foto_perfil_url || emp.foto_perfil_url.trim() === '')) {
              return { ...emp, foto_perfil_url: googleAvatar };
          }
          return emp;
      });
  }, [initialEmpleados, currentUserId, googleAvatar]);

  const [selectedEmp, setSelectedEmp] = useState<any>(null)
  const [comentarios, setComentarios] = useState<any[]>([])

  // Autoselección para empleados sin permiso de gestión
  useEffect(() => {
    if (!canCreate && initialUser && empleadosProcesados.length > 0) {
      const me = empleadosProcesados.find(e => e.usuario_id === initialUser.id)
      if (me) setSelectedEmp(me)
    }
  }, [canCreate, initialUser, empleadosProcesados])

  // 3. UI Y FILTROS
  const [searchTerm, setSearchTerm] = useState('')
  const [form, setForm] = useState<{titulo: string, descripcion: string, tipo: TipoComentario}>({
    titulo: '',
    descripcion: '', 
    tipo: 'positivo'
  })

  // 4. CARGAR COMENTARIOS Y REALTIME
  useEffect(() => {
    if (!selectedEmp) {
      setComentarios([])
      return
    }
    
    const fetchComments = async () => {
      setLoading(true)
      try {
        const data = await getComentarios(selectedEmp.id) 
        
        const comentariosConFoto = data.map((comentario: any) => {
            const autor = comentario.autor;
            if (autor?.usuario_id === currentUserId || comentario.autor_id === currentUserId) {
                 if (!autor?.foto_perfil_url && googleAvatar) {
                     return {
                         ...comentario,
                         autor: { ...autor, foto_perfil_url: googleAvatar }
                     };
                 }
            }
            return comentario;
        });

        setComentarios(comentariosConFoto)
        scrollToBottom()
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()

    // Suscripción Realtime optimizada
    const channel = supabase.channel(`chat-${selectedEmp.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comentarios_rendimiento', filter: `empleado_id=eq.${selectedEmp.id}` }, 
        () => fetchComments()
      )
      // Si el estado de un empleado cambia a baja, refrescamos la lista
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'empleados' }, () => {
          // Si el empleado seleccionado es dado de baja, lo deseleccionamos
          if (selectedEmp) {
              supabase.from('empleados').select('estado').eq('id', selectedEmp.id).single().then(({data}) => {
                  if (data?.estado === 'baja') setSelectedEmp(null);
              });
          }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedEmp, supabase, currentUserId, googleAvatar])

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    }, 100)
  }

  // Acción de Enviar Segura
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (userEstado === 'baja') return alert('Cuenta desactivada.')
    if (!form.descripcion.trim() || !form.titulo.trim() || !selectedEmp) return

    try {
      await crearComentario({
        empleado_id: selectedEmp.id,
        tipo: form.tipo,
        descripcion: form.descripcion,
        titulo: form.titulo
      })
      setForm({ ...form, titulo: '', descripcion: '', tipo: 'positivo' })
      scrollToBottom()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (userEstado === 'baja') return alert('Acceso denegado.')
    try {
      await eliminarComentario(id)
      setComentarios(prev => prev.filter(c => c.id !== id))
    } catch (error: any) {
      alert('Error al eliminar: ' + error.message)
    }
  }

  const stats = useMemo(() => {
    if (!comentarios.length) return { total: 0, positivos: 0, mejora: 0 }
    return {
      total: comentarios.length,
      positivos: comentarios.filter(c => c.tipo === 'positivo').length,
      mejora: comentarios.filter(c => c.tipo !== 'positivo').length
    }
  }, [comentarios])

  return {
    loading,
    canCreate,
    userEstado, // Exportamos estado para la UI
    selectedEmp,
    setSelectedEmp,
    empleados: empleadosProcesados,
    comentarios,
    searchTerm,
    setSearchTerm,
    form,
    setForm,
    handleSend,
    handleDelete,
    stats,
    scrollRef,
    currentUserId
  }
}