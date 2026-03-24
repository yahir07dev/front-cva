'use server'

import { createClient } from '@/src/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function actualizarEmpleadoAction(id: string, form: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { error } = await supabase
    .from('empleados')
    .update({ ...form, updated_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/personal/empleados')
  revalidatePath(`/dashboard/personal/empleados/${id}`)
}

export async function darDeBajaEmpleadoAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { error } = await supabase
    .from('empleados')
    .update({
      estado: 'baja',
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
      fecha_baja: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/personal/empleados')
}