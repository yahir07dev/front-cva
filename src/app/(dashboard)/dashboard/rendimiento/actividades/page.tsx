import { createClient } from '@/src/lib/supabase/server'
import ActividadesClient from '@/src/components/perfomance/actividades/ActividadesClient'
import { ActividadConRelaciones } from '@/src/types/performance'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0 

export default async function ActividadesPage() { 
  const supabase = await createClient() 

  // 1. BLINDAJE: Verificar si el usuario que accede está ACTIVO
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: perfil } = await supabase
      .from('empleados')
      .select('estado')
      .eq('usuario_id', user.id)
      .single()

    // Si el usuario es "baja", lo sacamos de aquí inmediatamente
    if (perfil?.estado === 'baja') { //
      redirect('/login?error=cuenta_desactivada')
    }
  }

  // 2. FETCH: Cargamos datos, pero aseguramos filtrar lo eliminado lógicamente
  const { data, error } = await supabase 
    .from('actividades') 
    .select(`
      *,
      areas ( nombre ),
      asignacion_actividades (
        *,
        empleados (
          id,
          usuario_id,
          nombre,
          apellidos,
          foto_perfil_url,
          estado
        )
      )
    `)
    .is('deleted_at', null) //
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando actividades:', error)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <ActividadesClient
        initialData={(data as unknown as ActividadConRelaciones[]) || []}
      />
    </div>
  )
}