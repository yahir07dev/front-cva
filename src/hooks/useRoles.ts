'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { getRolesConPermisosAction } from '@/src/actions/roles/rolesActions'
import { useRouter } from 'next/navigation'

interface UseRolesProps {
  initialRoles: any[]
  initialCatalogo: any[]
}

export function useRoles({ initialRoles, initialCatalogo }: UseRolesProps) {
  const [supabase] = useState(() => createClient())
  const router = useRouter()

  const [roles, setRoles] = useState<any[]>(initialRoles)
  const [permisosCatalogo] = useState<any[]>(initialCatalogo) // El catálogo es estático

  // REFRESH SILENCIOSO (Para sincronización en vivo)
  const fetchRolesData = useCallback(async () => {
    try {
      const rolesData = await getRolesConPermisosAction()
      setRoles(rolesData)
    } catch (err) {
      console.error('Error re-fetching roles:', err)
    }
  }, [])

  // REALTIME
  useEffect(() => {
    const channel = supabase.channel(`roles-updates`) 
      .on('postgres_changes', { event: '*', schema: 'public', table: 'roles' }, () => {
        fetchRolesData()
        router.refresh()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rol_permisos' }, () => setTimeout(() => fetchRolesData(), 500))
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchRolesData, router])

  return {
    roles,
    permisosCatalogo,
    recargar: fetchRolesData,
  }
}