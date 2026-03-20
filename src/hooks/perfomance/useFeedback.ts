import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { TipoComentario } from '@/src/types/performance'
import { getComentarios, crearComentario, eliminarComentario } from '@/src/services/perfomance/feedbackService'

// 👇 Definimos estrictamente lo que el hook espera recibir desde el SSR
interface UseFeedbackProps {
  initialEmpleados: any[]
  userId: string
  userEstado: string
  canManage: boolean
  canCreate: boolean
  googleAvatar?: string // Opcional, por si el usuario usa auth de Google y no tiene foto en BD
}

export function useFeedback({ 
  initialEmpleados, 
  userId, 
  userEstado, 
  canManage, 
  canCreate, 
  googleAvatar 
}: UseFeedbackProps) {
  
  const [supabase] = useState(() => createClient())
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. ESTADOS DE LA UI
  const [loading, setLoading] = useState(false)
  const [empleados] = useState(initialEmpleados) // Ya vienen limpios y filtrados desde el SSR
  const [selectedEmp, setSelectedEmp] = useState<any>(null)
  const [comentarios, setComentarios] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [form, setForm] = useState<{titulo: string, descripcion: string, tipo: TipoComentario}>({
    titulo: '',
    descripcion: '', 
    tipo: 'positivo' 
  })

  // 2. UTILIDAD: Scroll automático al final del chat
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    }, 100)
  }, [])

  // 3. FETCHING CENTRALIZADO
  const fetchComments = useCallback(async (empId: number) => {
    setLoading(true)
    try {
      const data = await getComentarios(empId) 
      
      // Inyectamos el avatar de Google si el usuario actual escribió el comentario y no tiene foto en BD
      const comentariosConFoto = data.map((comentario: any) => {
          const autor = comentario.autor;
          if ((autor?.usuario_id === userId || comentario.autor_id === userId) && !autor?.foto_perfil_url && googleAvatar) {
              return {
                  ...comentario,
                  autor: { ...autor, foto_perfil_url: googleAvatar }
              };
          }
          return comentario;
      });

      setComentarios(comentariosConFoto)
      scrollToBottom()
    } catch (error) {
      console.error("Error cargando comentarios:", error)
    } finally {
      setLoading(false)
    }
  }, [userId, googleAvatar, scrollToBottom])

  // 4. EFECTOS REACTIVOS Y REALTIME
  useEffect(() => {
    if (!selectedEmp) {
      setComentarios([])
      return
    }
    
    // Carga inicial de comentarios
    fetchComments(selectedEmp.id)

    // --- SUSCRIPCIÓN REALTIME ---
    const channel = supabase.channel(`chat-${selectedEmp.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'comentarios_rendimiento',
          // 🚀 Micro-optimización: Filtramos directamente desde Supabase para no recibir basura de otros chats
          filter: `empleado_id=eq.${selectedEmp.id}` 
        }, 
        (payload) => {
           if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              fetchComments(selectedEmp.id)
           }
           if (payload.eventType === 'DELETE') {
              setComentarios((prev) => prev.filter(c => c.id !== payload.old.id))
           }
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'empleados',
          filter: `id=eq.${selectedEmp.id}`
        }, 
        (payload) => {
          // Si el empleado actual es dado de baja mientras lo estamos viendo, lo quitamos de la vista
          if (payload.new.estado === 'baja') {
              setSelectedEmp(null);
          }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedEmp, supabase, fetchComments])


  // 5. MUTACIONES (Eventos del usuario)
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (userEstado === 'baja') return alert('Cuenta desactivada.')
    if (!form.descripcion.trim() || !form.titulo.trim() || !selectedEmp) return

    try {
      await crearComentario({
        empleado_id: selectedEmp.id,
        tipo: form.tipo,
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim()
      })
      
      // Limpiamos el form. El Realtime (o el fetchComments) se encargará de actualizar la lista solos.
      setForm({ ...form, titulo: '', descripcion: '', tipo: 'positivo' })
      scrollToBottom()
    } catch (error: any) {
      alert('Error al enviar: ' + error.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (userEstado === 'baja') return alert('Acceso denegado.')
    try {
      await eliminarComentario(id)
      // Optimistic update: Lo quitamos de la UI inmediatamente para mayor fluidez
      setComentarios(prev => prev.filter(c => c.id !== id))
    } catch (error: any) {
      alert('Error al eliminar: ' + error.message)
    }
  }

  // 6. ESTADÍSTICAS DERIVADAS
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
    empleados,
    comentarios,
    searchTerm,
    setSearchTerm,
    form,
    setForm,
    handleSend,
    handleDelete,
    stats,
    scrollRef,
    currentUserId: userId
  }
}