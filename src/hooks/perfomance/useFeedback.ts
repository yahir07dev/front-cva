import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useSession } from '@/src/hooks/useSession'
import { TipoComentario } from '@/src/types/performance'
import { getSessionUserWithPermissions } from '@/src/app/auth/getSessionUser'
import { hasPermission } from '@/src/app/auth/permissions'
import { getComentarios, crearComentario, eliminarComentario } from '@/src/services/perfomance/feedbackService'

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

  // Lógica de Permisos Clásica
  const canCreate = useMemo(() => {
    if (userEstado === 'baja') return false
    return hasPermission(userPerms, ['comentarios.create', 'acceso_total'])
  }, [userPerms, userEstado])

  const canManage = useMemo(() => {
     if (userEstado === 'baja') return false
     return hasPermission(userPerms, ['acceso_total', 'comentarios.read_all', 'roles.read'])
  }, [userPerms, userEstado])

  // LÓGICA NUEVA: Discriminación de Autoridad
  const isAdmin = useMemo(() => {
    return hasPermission(userPerms, ['acceso_total']);
  }, [userPerms]);

  const isSupervisor = useMemo(() => {
    // Si puede crear o administrar, pero NO tiene acceso_total, es un supervisor.
    return (canCreate || canManage) && !isAdmin;
  }, [canCreate, canManage, isAdmin]);


  // 2. PROCESAMIENTO DE DATOS
  const [loading, setLoading] = useState(false)
  
  const empleadosProcesados = useMemo(() => {
      if (!initialEmpleados) return [];
      
      let procesados = initialEmpleados
        .filter(emp => emp.estado === 'activo')
        .map(emp => {
          if (emp.usuario_id === currentUserId && (!emp.foto_perfil_url || emp.foto_perfil_url.trim() === '')) {
              return { ...emp, foto_perfil_url: googleAvatar };
          }
          return emp;
      });

      // FILTRO MÁGICO: El Supervisor no debe interactuar con Contabilidad
      if (isSupervisor) {
        procesados = procesados.filter(
          (emp: any) => emp.roles?.nombre !== 'Contabilidad'
        );
      }

      return procesados;
  }, [initialEmpleados, currentUserId, googleAvatar, isSupervisor]);

  const [selectedEmp, setSelectedEmp] = useState<any>(null)
  const [comentarios, setComentarios] = useState<any[]>([])

  // 3. AUTO-SELECCIÓN
  useEffect(() => {
    if (!canManage && initialUser && empleadosProcesados.length > 0 && !selectedEmp) {
      const me = empleadosProcesados.find(e => e.usuario_id === initialUser.id)
      if (me) setSelectedEmp(me)
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

    // --- SUSCRIPCIÓN REALTIME ---
    const channel = supabase.channel(`chat-${selectedEmp.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'comentarios_rendimiento'
        }, 
        (payload) => {
           if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              if (payload.new.empleado_id === selectedEmp.id) {
                 fetchComments()
              }
           }

           if (payload.eventType === 'DELETE') {
              setComentarios((prevComentarios) => {
                 const existe = prevComentarios.find(c => c.id === payload.old.id)
                 if (existe) {
                    return prevComentarios.filter(c => c.id !== payload.old.id)
                 }
                 return prevComentarios
              })
           }
        }
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
    if (!comentarios.length) return { total: 0, positivos: 0, mejora: 0, negativos: 0 }
    return {
      total: comentarios.length,
      positivos: comentarios.filter(c => c.tipo === 'positivo').length,
      mejora: comentarios.filter(c => c.tipo === 'mejora').length,
      negativos: comentarios.filter(c => c.tipo === 'negativo').length
    }
  }, [comentarios])

  return {
    loading,
    canCreate,
    canManage,
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