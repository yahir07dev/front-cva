import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'
import ConfigNominaClient from '@/src/components/nomina/configuracion/ConfigNominaClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Configuración de Nómina',
  description: 'Administra la nómina, sueldos y detalles de pago del personal.'
}

export const dynamic = 'force-dynamic'

export default async function ConfigNominaPage() {
  const supabase = await createClient()

  // 1. Verificación básica de sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. FETCH EN PARALELO (Cero Cascadas) - Query Limpio sin comentarios
  const [perfilRes, permsRes, empleadosRes] = await Promise.all([
    supabase.from('empleados').select('estado').eq('usuario_id', user.id).single(),
    supabase.rpc('get_my_permissions_slugs'),
    supabase.from('empleados')
      .select(`
        id, 
        usuario_id, 
        nombre, 
        apellidos, 
        foto_perfil_url, 
        sueldo_base, 
        dia_pago, 
        recibe_pago_tarjeta, 
        monto_tarjeta_defecto,
        estado, 
        roles ( nombre ), 
        areas!empleados_area_id_fkey ( nombre )
      `)
      .eq('estado', 'activo')
      .is('deleted_at', null)
      .order('nombre', { ascending: true })
  ])

  // 3. BLINDAJE DE ESTADO
  if (perfilRes.data?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  // 4. VERIFICACIÓN DE PERMISOS
  const permisos = permsRes.data || []
  const isAdmin = permisos.includes('acceso_total')
  
  const canAccess = permisos.includes('nomina.read') || isAdmin
  const canManage = permisos.includes('nomina.update') || isAdmin

  if (!canAccess) {
    return (
      <AccessDenied 
        message="Solo el departamento de Contabilidad y Administración tienen acceso a la configuración de nómina." 
      />
    )
  }

  // 5. PROCESAMIENTO DE DATOS
  const googleAvatar = user.user_metadata?.avatar_url;
  const empleadosProcesados = (empleadosRes.data || []).map((emp: any) => {
    if (emp.usuario_id === user.id && (!emp.foto_perfil_url || emp.foto_perfil_url.trim() === '') && googleAvatar) {
      return { ...emp, foto_perfil_url: googleAvatar }
    }
    return emp
  })

  // 6. RENDERIZADO INYECTANDO PROPS - Color Fucsia en el contenedor
  return (
    <div className="h-full p-4 sm:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500">
      <ConfigNominaClient 
        initialEmpleados={empleadosProcesados} 
        canManage={canManage} 
        currentUserId={user.id}
      />
    </div>
  )
}