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

  // 1. ESTADO DE PERMISOS
  const [userPerms, setUserPerms] = useState<string[]>([])
  const [userEstado, setUserEstado] = useState<string>('activo')
  
  useEffect(() => {
    const loadUserData = async () => {
      const data = await getSessionUserWithPermissions()
      if (data) setUserPerms(data.permissions)

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

  // Lógica de Permisos
  const canCreate = useMemo(() => {
    if (userEstado === 'baja') return false
    return hasPermission(userPerms, ['comentarios.create', 'acceso_total'])
  }, [userPerms, userEstado])

  // NUEVO: canManage define si ve la lista lateral (Admin/Supervisor)
  const canManage = useMemo(() => {
     if (userEstado === 'baja') return false
     // Ajusta estos permisos según tu lógica de "Gestor"
     return hasPermission(userPerms, ['acceso_total', 'comentarios.read_all', 'roles.read'])
  }, [userPerms, userEstado])

  // 2. PROCESAMIENTO DE DATOS
  const [loading, setLoading] = useState(false)
  
  const empleadosProcesados = useMemo(() => {
      if (!initialEmpleados) return [];
      
      return initialEmpleados
        .filter(emp => emp.estado === 'activo')
        .map(emp => {
          if (emp.usuario_id === currentUserId && (!emp.foto_perfil_url || emp.foto_perfil_url.trim() === '')) {
              return { ...emp, foto_perfil_url: googleAvatar };
          }
          return emp;
      });
  }, [initialEmpleados, currentUserId, googleAvatar]);

  const [selectedEmp, setSelectedEmp] = useState<any>(null)
  const [comentarios, setComentarios] = useState<any[]>([])

  // 3. AUTO-SELECCIÓN CORREGIDA (El parche clave)
  useEffect(() => {
    // Si NO puede gestionar (es empleado normal) y no hay nadie seleccionado...
    if (!canManage && initialUser && empleadosProcesados.length > 0 && !selectedEmp) {
      
      // Buscamos el objeto empleado que coincide con el usuario logueado
      const me = empleadosProcesados.find(e => e.usuario_id === initialUser.id)
      
      if (me) {
        // Seleccionamos el perfil CORRECTO (el que tiene id numérico)
        setSelectedEmp(me)
      }
    }
  }, [canManage, initialUser, empleadosProcesados, selectedEmp])

  // 4. UI STATES
  const [searchTerm, setSearchTerm] = useState('')
  const [form, setForm] = useState<{titulo: string, descripcion: string, tipo: TipoComentario}>({
    titulo: '',
    descripcion: '', 
    tipo: 'positivo'
  })

  // 5. FETCHING Y REALTIME
  useEffect(() => {
    if (!selectedEmp) {
      setComentarios([])
      return
    }
    
    const fetchComments = async () => {
      setLoading(true)
      try {
        // Ahora selectedEmp.id siempre será un número gracias al useEffect de arriba
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

    // Suscripción Realtime
    const channel = supabase.channel(`chat-${selectedEmp.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comentarios_rendimiento', filter: `empleado_id=eq.${selectedEmp.id}` }, 
        () => fetchComments()
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'empleados' }, (payload) => {
          if (selectedEmp && payload.new.id === selectedEmp.id && payload.new.estado === 'baja') {
              setSelectedEmp(null);
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (userEstado === 'baja') return alert('Cuenta desactivada.')
    if (!form.descripcion.trim() || !form.titulo.trim() || !selectedEmp) return

    try {
      await crearComentario({
        empleado_id: selectedEmp.id,
        tipo: form.tipo,
        titulo: form.titulo,
        descripcion: form.descripcion
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
    canManage, // <--- EXPORTADO PARA QUE EL CLIENTE LO USE
    userEstado,
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