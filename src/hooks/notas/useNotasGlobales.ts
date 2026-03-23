import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import {
  obtenerNotasAction,
  guardarNotaAction,
  actualizarNotaAction,
  eliminarNotaAction,
  togglePinNotaAction
} from '@/src/actions/notas/notasActions'
import { useRouter } from 'next/navigation'

interface UseNotasGlobalesProps {
  initialNotas: any[]
  userId: string
}

export function useNotasGlobales({ initialNotas, userId }: UseNotasGlobalesProps) {
  const [supabase] = useState(() => createClient())
  const router = useRouter()
  
  const [notas, setNotas] = useState<any[]>(initialNotas)
  const [filtro, setFiltro] = useState('todas')

  // 1. REFRESH SILENCIOSO (Para Realtime global)
  const fetchNotas = useCallback(async () => {
    try {
      const data = await obtenerNotasAction()
      setNotas(data || [])
    } catch (error) {
      console.error('Error fetching notas:', error)
    }
  }, [])

  // 2. Suscripción en tiempo real a la tabla GLOBAL
  // (Nota: Tu editor usa otro canal para las notas individuales colaborativas, este es para la lista principal)
  useEffect(() => {
    const channel = supabase.channel(`notas-updates-list-${userId}`) 
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notas_globales' }, () => {
        // Debounce simple para no saturar si hay muchos cambios rápidos
        setTimeout(() => {
            fetchNotas();
            router.refresh();
        }, 500)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, userId, fetchNotas, router])

  // 3. Funciones CRUD con Server Actions
  const handleCreate = async (titulo: string, contenidoJson: any, colorFondo: string) => {
    const nueva = await guardarNotaAction(titulo, contenidoJson, colorFondo)
    await fetchNotas() // Refresh local
    return nueva
  }

  const handleUpdate = async (id: string, titulo: string, contenidoJson: any, colorFondo: string) => {
    const actualizada = await actualizarNotaAction(id, titulo, contenidoJson, colorFondo)
    // Nota: El editor colaborativo (Tiptap) maneja su propio estado, pero llamamos a fetchNotas por consistencia de la lista
    await fetchNotas()
    return actualizada
  }

  const handleDelete = async (id: string) => {
    await eliminarNotaAction(id)
    setNotas(prev => prev.filter(n => n.id !== id)) // Optimistic Update
  }

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    // Optimistic Update
    setNotas(prev => prev.map(n => n.id === id ? { ...n, pinned: !isPinned } : n)
      .sort((a, b) => Number(b.pinned || false) - Number(a.pinned || false) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    );
    await togglePinNotaAction(id, isPinned)
    await fetchNotas()
  }

  return {
    notas,
    filtro,
    setFiltro,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleTogglePin
  }
}