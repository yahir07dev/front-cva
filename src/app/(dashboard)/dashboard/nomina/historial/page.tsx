import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'
import HistorialNominaClient from '@/src/components/nomina/historial/HistorialNominaClient'
import { getHistorialResumenAction } from '@/src/actions/nomina/generarActions'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Historial de Nómina',
  description: 'Revisa el historial de nóminas generadas, con detalles de cada periodo y su estado.'
}

export const dynamic = 'force-dynamic'

export default async function HistorialNominaPage() {
  // 🚀 OPTIMIZACIÓN EXTREMA: 
  // Disparamos la consulta pesada INMEDIATAMENTE, en segundo plano, SIN hacer 'await' todavía.
  // No esperamos a que Supabase valide el token del usuario para empezar a traer los datos.
  const historialPromise = getHistorialResumenAction() 
  
  const supabase = await createClient()

  // 1. Verificación de sesión (Esto toma su tiempo en la red)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Traemos el perfil y los permisos en paralelo
  const [perfilRes, permsRes] = await Promise.all([
    supabase.from('empleados').select('estado').eq('usuario_id', user.id).single(),
    supabase.rpc('get_my_permissions_slugs')
  ])

  // 3. Blindaje de Estado
  if (perfilRes.data?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  // 4. Verificación de Permisos
  const permisos = permsRes.data || []
  const canAccess = permisos.includes('nomina.read') || permisos.includes('acceso_total')

  if (!canAccess) {
    return <AccessDenied message="No tienes permisos para ver el historial de nóminas." />
  }

  // 5. RECOLECCIÓN
  // Ahora sí, esperamos la promesa del historial. Lo más probable es que 
  // para este momento ya se haya resuelto en segundo plano = Tiempo de espera 0ms.
  const historialData = await historialPromise

  return (
    <div className="h-full px-4 sm:px-6 lg:px-8 py-6">
      <HistorialNominaClient initialHistorial={historialData} />
    </div>
  )
}