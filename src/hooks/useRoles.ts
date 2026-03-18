'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useSession } from '@/src/hooks/useSession' 
import { getSessionUserWithPermissions } from '@/src/app/auth/getSessionUser'
import { getRolesConPermisos, getCatalogoPermisos } from '@/src/services/rolesService'

// Opcional: Si tienes tu tipo Role, puedes importarlo, si no, usamos any[]
// import { Role } from "@/src/types/role"

export function useRoles(enabled: boolean = true, initialData?: any[]) {
  const [supabase] = useState(() => createClient())
  const [roles, setRoles] = useState<any[]>(initialData || [])
  const [permisosCatalogo, setPermisosCatalogo] = useState<any[]>([])
  
  // Si enabled es true y no hay data inicial, empezamos en modo carga
  const [loading, setLoading] = useState(enabled && !initialData) 
  const [userPerms, setUserPerms] = useState<string[]>([]) 

  const { session, loading: sessionLoading } = useSession() as any

  // 1. Cargar permisos del usuario actual
  useEffect(() => {
    const loadUserPermissions = async () => {
      const data = await getSessionUserWithPermissions()
      if (data) setUserPerms(data.permissions)
    }
    if (session) loadUserPermissions()
  }, [session])

  // 🛡️ REGLA ESTRICTA: Solo es Superadmin si tiene el permiso "superadmin" explícitamente.
  const isSuperAdmin = useMemo(() => {
    return userPerms.includes('superadmin');
  }, [userPerms]);
  
  // 2. Función de obtención de datos
  const fetchRolesData = useCallback(async () => {
    // Respetamos la lógica de tu compañero: si no está habilitado, no hacemos nada
    if (!enabled) return; 

    try {
      setLoading(true);
      
      // Si es Superadmin, traemos los roles y también el catálogo completo de permisos para asignarlos.
      // Si es un admin normal (por ejemplo, en el select de crear empleado), igual traemos los roles sin romper nada.
      const [rolesData, permisosData] = await Promise.all([
        getRolesConPermisos(),
        isSuperAdmin ? getCatalogoPermisos() : Promise.resolve([]) 
      ]);
      
      setRoles(rolesData);
      setPermisosCatalogo(permisosData);
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled, isSuperAdmin]);

  // 3. Ejecutar la consulta cuando la sesión esté lista y el hook esté habilitado
  useEffect(() => {
    if (enabled && !initialData && session) {
      fetchRolesData();
    }
  }, [fetchRolesData, initialData, session, enabled])

  // 4. Realtime (Sincronización en vivo)
  useEffect(() => {
    if (!enabled || !supabase || !session?.user?.id) return;
    
    // Escuchamos cambios en la tabla de roles y en la tabla pivote de permisos
    const channel = supabase.channel(`roles-updates`) 
      .on('postgres_changes', { event: '*', schema: 'public', table: 'roles' }, () => fetchRolesData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rol_permisos' }, () => setTimeout(() => fetchRolesData(), 500))
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [supabase, session?.user?.id, fetchRolesData, enabled])

  return {
    roles, // <-- Tu compañero usaba esto
    loading: loading || sessionLoading, // <-- Tu compañero usaba esto
    permisosCatalogo, // <-- Nuevo
    isSuperAdmin,     // <-- Nuevo: Bandera para proteger tu vista de roles
    recargar: fetchRolesData, // <-- Nuevo
  }
}