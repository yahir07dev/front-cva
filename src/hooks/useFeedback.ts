// src/hooks/useFeedback.ts
import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { TipoComentario } from '@/src/types/performance'
import { getSessionUserWithPermissions } from '@/src/app/auth/getSessionUser'
import { hasPermission } from '@/src/app/auth/permissions'
import { getComentarios, crearComentario } from '@/src/services/feedbackService'

export function useFeedback(initialUser?: any, initialEmpleados?: any[]) {
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. ESTADO DE PERMISOS (Reemplaza a isAdmin manual)
  const [userPerms, setUserPerms] = useState<string[]>([])
  
  // Cargamos permisos reales al inicio
  useEffect(() => {
    const loadPerms = async () => {
      const data = await getSessionUserWithPermissions()
      if (data) setUserPerms(data.permissions)
    }
    if (initialUser) loadPerms()
  }, [initialUser])

  // canCreate = Admin o Supervisor (quien puede escribir)
  const canCreate = useMemo(() => {
    return hasPermission(userPerms, ['comentarios.create', 'acceso_total'])
  }, [userPerms])

  // 2. ESTADOS DE DATOS
  const [loading, setLoading] = useState(false)
  const [empleados] = useState<any[]>(initialEmpleados || [])
  
  // Selección de Empleado:
  // - Si puede crear (Admin), empieza en null.
  // - Si NO puede crear (Empleado), se auto-selecciona a sí mismo.
  const [selectedEmp, setSelectedEmp] = useState<any>(null)

  useEffect(() => {
    if (!canCreate && initialUser && initialEmpleados) {
      const me = initialEmpleados.find(e => e.usuario_id === initialUser.id)
      if (me) setSelectedEmp(me)
    }
  }, [canCreate, initialUser, initialEmpleados])

  const [comentarios, setComentarios] = useState<any[]>([])

  // 3. ESTADOS DE UI
  const [searchTerm, setSearchTerm] = useState('')
  // Ajustamos 'mensaje' a 'descripcion' para coincidir con tu BD
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '', 
    tipo: 'positivo' as TipoComentario
  })

  // 4. CARGAR COMENTARIOS (y Realtime)
  useEffect(() => {
    if (!selectedEmp) {
      setComentarios([])
      return
    }
    
    // Función de carga
    const fetchComments = async () => {
      setLoading(true)
      try {
        // Obtenemos TODOS (el RLS filtra por nosotros, pero aquí filtramos en memoria
        // para asegurar que solo vemos los del empleado seleccionado en la UI de Admin)
        const data = await getComentarios() 
        const filtrados = data.filter((c: any) => c.empleado_id === selectedEmp.id)
        setComentarios(filtrados)
        scrollToBottom()
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()

    // Suscripción Realtime
    const channel = supabase.channel('chat-feedback-realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'comentarios_rendimiento', 
          filter: `empleado_id=eq.${selectedEmp.id}` 
        }, 
        () => {
          // Recargamos silenciosamente al recibir evento
          getComentarios().then(data => {
             const filtrados = data.filter((c: any) => c.empleado_id === selectedEmp.id)
             setComentarios(filtrados)
             scrollToBottom()
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedEmp, supabase])

  // Helpers
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
      // Limpiamos form
      setForm({ ...form, titulo: '', descripcion: '', tipo: 'positivo' })
      scrollToBottom()
    } catch (error: any) {
      alert('Error: ' + error.message)
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
    canCreate,       // Usamos esto en vez de isAdmin
    selectedEmp,
    setSelectedEmp,
    empleados,       // Lista completa (el componente visual filtra con searchTerm)
    comentarios,
    searchTerm,
    setSearchTerm,
    form,
    setForm,
    handleSend,
    stats,
    scrollRef
  }
}