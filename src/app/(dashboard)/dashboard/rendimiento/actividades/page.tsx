import { createClient } from '@/src/lib/supabase/server'
import ActividadesClient from '@/src/components/perfomance/ActividadesClient'
import { ActividadConRelaciones } from '@/src/types/performance'

export const dynamic = 'force-dynamic'
export const revalidate = 0 

export default async function ActividadesPage() { 
  const supabase = await createClient() 

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
          foto_perfil_url
        )
      )
    `)
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
