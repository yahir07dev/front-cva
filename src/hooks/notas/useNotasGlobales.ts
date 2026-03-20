import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useSession } from '@/src/hooks/useSession'
import { getSessionUserWithPermissions } from '@/src/app/auth/getSessionUser'
import { hasPermission } from '@/src/app/auth/permissions'
import {
  obtenerNotas,
  guardarNota,
  actualizarNota,
  eliminarNota,
  togglePinNota
} from '@/src/services/notas/notasService'

export function useNotasGlobales() {
  const [supabase] = useState(() => createClient())
  const [notas, setNotas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userPerms, setUserPerms] = useState<string[]>([])
  const [filtro, setFiltro] = useState('todas') // Por si en el futuro quieres filtrar por categorías

  const { session, loading: sessionLoading } = useSession() as any

  useEffect(() => {
    const loadUserPermissions = async () => {
      const data = await getSessionUserWithPermissions()
      if (data) setUserPerms(data.permissions)
    }
    if (session) loadUserPermissions()
  }, [session])

  // LÓGICA DE ROLES Y PERMISOS ACTUALIZADA (Igual que en usePerformance)
  const canManage = useMemo(() => {
    // Si tiene permiso de update, asumimos que es manager (Admin o Supervisor)
    return hasPermission(userPerms, ['notas.update', 'acceso_total']);
  }, [userPerms]);

  // Evaluamos si es Administrador total
  const isAdmin = useMemo(() => {
    return hasPermission(userPerms, ['acceso_total']);
  }, [userPerms]);

  // Evaluamos si es Supervisor (puede gestionar pero no es Admin)
  const isSupervisor = useMemo(() => {
    return canManage && !isAdmin;
  }, [canManage, isAdmin]);

  // Evaluamos permisos CRUD específicos para notas
  const canRead = useMemo(() => hasPermission(userPerms, ['notas.read', 'acceso_total']), [userPerms]);
  const canCreate = useMemo(() => hasPermission(userPerms, ['notas.create', 'acceso_total']), [userPerms]);
  const canDelete = useMemo(() => hasPermission(userPerms, ['notas.delete', 'acceso_total']), [userPerms]);

  const fetchNotas = useCallback(async () => {
    if (!canRead) {
      setLoading(false)
      return
    }
    
    try {
      const data = await obtenerNotas()
      setNotas(data || [])
    } catch (error) {
      console.error('Error fetching notas:', error)
    } finally {
      setLoading(false)
    }
  }, [canRead])

  useEffect(() => {
    if (session && userPerms.length > 0) fetchNotas()
  }, [fetchNotas, session, userPerms])

  // Suscripción en tiempo real (Opcional, pero muy útil si varios admins editan a la vez)
  useEffect(() => {
    if (!supabase || !session?.user?.id || !canRead) return

    const channel = supabase.channel(`notas-updates-${session.user.id}`) 
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notas_globales' }, () => {
        setTimeout(() => fetchNotas(), 500)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, session?.user?.id, fetchNotas, canRead])

  // Funciones CRUD
  const handleCreate = async (titulo: string, contenidoJson: any, colorFondo: string) => {
    if (!canCreate) throw new Error("No tienes permiso para crear notas.")
    const nueva = await guardarNota(titulo, contenidoJson, colorFondo)
    // La suscripción en tiempo real debería actualizar la lista, pero forzamos recarga por si acaso
    await fetchNotas() 
    return nueva
  }

  const handleUpdate = async (id: string, titulo: string, contenidoJson: any, colorFondo: string) => {
    if (!canManage) throw new Error("No tienes permiso para editar notas.")
    const actualizada = await actualizarNota(id, titulo, contenidoJson, colorFondo)
    await fetchNotas()
    return actualizada
  }

  const handleDelete = async (id: string) => {
    if (!canDelete) throw new Error("No tienes permiso para eliminar notas.")
    await eliminarNota(id)
    setNotas(prev => prev.filter(n => n.id !== id))
  }

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    if (!canManage) throw new Error("No tienes permiso para editar notas.")
    await togglePinNota(id, isPinned)
    await fetchNotas()
  }

  return {
    notas,
    loading: loading || sessionLoading,
    canManage,
    isAdmin,
    isSupervisor,
    canCreate,
    canDelete,
    filtro,
    setFiltro,
    recargar: fetchNotas,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleTogglePin
  }
}