// src/hooks/useFeedback.ts
import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useSession } from '@/src/hooks/useSession'
import { TipoComentario } from '@/src/types/performance'
import { getSessionUserWithPermissions } from '@/src/app/auth/getSessionUser'
import { hasPermission } from '@/src/app/auth/permissions'
// IMPORTANTE: Importamos eliminarComentario
import { getComentarios, crearComentario, eliminarComentario } from '@/src/services/feedbackService'

export function useFeedback(initialUser?: any, initialEmpleados?: any[]) {
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const { session } = useSession() as any
  const currentUserId = session?.user?.id
  const googleAvatar = session?.user?.user_metadata?.avatar_url

  // 1. ESTADO DE PERMISOS
  const [userPerms, setUserPerms] = useState<string[]>([])
  
  useEffect(() => {
    const loadPerms = async () => {
      const data = await getSessionUserWithPermissions()
      if (data) setUserPerms(data.permissions)
    }
    if (initialUser) loadPerms()
  }, [initialUser])

  const canCreate = useMemo(() => {
    return hasPermission(userPerms, ['comentarios.create', 'acceso_total'])
  }, [userPerms])

  // 2. ESTADOS DE DATOS
  const [loading, setLoading] = useState(false)
  
  // --- INYECCIÓN DE FOTO EN EMPLEADOS ---
  const empleadosProcesados = useMemo(() => {
      if (!initialEmpleados) return [];
      
      return initialEmpleados.map(emp => {
          if (emp.usuario_id === currentUserId && (!emp.foto_perfil_url || emp.foto_perfil_url.trim() === '')) {
              return { ...emp, foto_perfil_url: googleAvatar };
          }
          return emp;
      });
  }, [initialEmpleados, currentUserId, googleAvatar]);

  const [empleados] = useState<any[]>(empleadosProcesados)
  const [selectedEmp, setSelectedEmp] = useState<any>(null)

  useEffect(() => {
    if (!canCreate && initialUser && empleadosProcesados.length > 0) {
      const me = empleadosProcesados.find(e => e.usuario_id === initialUser.id)
      if (me) setSelectedEmp(me)
    }
  }, [canCreate, initialUser, empleadosProcesados])

  const [comentarios, setComentarios] = useState<any[]>([])

  // 3. ESTADOS DE UI
  const [searchTerm, setSearchTerm] = useState('')
  const [form, setForm] = useState<{titulo: string, descripcion: string, tipo: TipoComentario}>({
    titulo: '',
    descripcion: '', 
    tipo: 'positivo'
  })

  // 4. CARGAR COMENTARIOS
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
                 if (!autor?.foto_perfil_url) {
                     return {
                         ...comentario,
                         autor: {
                             ...autor,
                             foto_perfil_url: googleAvatar
                         }
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

    // Suscripción Realtime (Escucha DELETE también)
    const channel = supabase.channel('chat-feedback-realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'comentarios_rendimiento', 
          filter: `empleado_id=eq.${selectedEmp.id}` 
        }, 
        () => {
          // Al recibir evento (INSERT, UPDATE o DELETE), recargamos
           getComentarios(selectedEmp.id).then(data => {
             const conFoto = data.map((c: any) => {
                 if (c.autor?.usuario_id === currentUserId) {
                     if (!c.autor?.foto_perfil_url) {
                         return { ...c, autor: { ...c.autor, foto_perfil_url: googleAvatar } }
                     }
                 }
                 return c;
             })
             setComentarios(conFoto)
             // Solo hacemos scroll si fue un insert (opcional, pero mejora UX)
             // scrollToBottom() 
           })
        }
      )
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

  // Acción de Enviar
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
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

  // --- NUEVA FUNCIÓN: ELIMINAR ---
  const handleDelete = async (id: number) => {
    try {
      // 1. Llamamos al servicio
      await eliminarComentario(id)
      
      // 2. Actualización optimista (borramos de la lista visualmente al instante)
      setComentarios(prev => prev.filter(c => c.id !== id))
      
    } catch (error: any) {
      alert('Error al eliminar: ' + error.message)
    }
  }

  // Stats Calculados
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
    selectedEmp,
    setSelectedEmp,
    empleados: empleadosProcesados,
    comentarios,
    searchTerm,
    setSearchTerm,
    form,
    setForm,
    handleSend,
    handleDelete, // 👈 ¡Ahora exportamos esto!
    stats,
    scrollRef,
    currentUserId // Exportamos esto para saber qué botones de borrar mostrar
  }
}