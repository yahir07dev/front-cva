import { createClient } from "@/src/lib/supabase/server";
import SidebarClient from "./SidebarClient";

export default async function SidebarServer() {
  const supabase = await createClient();
  
  // 1. Obtener el usuario actual
  const { data: { user } } = await supabase.auth.getUser();

  let permisos: string[] = [];
  let hasAssignedCourses = false;

  if (user) {
    // 2. Ejecutar peticiones pesadas en PARALELO
    const [permsRes, empRes] = await Promise.all([
      supabase.rpc('get_my_permissions_slugs'),
      supabase.from('empleados').select('id').eq('usuario_id', user.id).single()
    ]);

    permisos = permsRes.data || [];

    // 3. Lógica estricta de Cursos (Calculada en servidor)
    const canManageCourses = permisos.includes("acceso_total") || permisos.includes("cursos.create") || permisos.includes("cursos.update");

    // Si NO es administrador de cursos, verificamos si al menos tiene cursos asignados para mostrarle la pestaña
    if (empRes.data && !canManageCourses) {
      const { count } = await supabase
        .from('asignacion_cursos')
        .select('*', { count: 'exact', head: true })
        .eq('empleado_id', empRes.data.id)
        .neq('estado', 'completado'); // Opcional: solo contar si tiene cursos pendientes
        
      hasAssignedCourses = (count ?? 0) > 0;
    }
  }

  // 4. Renderizamos el cliente enviando solo booleanos y arrays estáticos
  return (
    <SidebarClient 
      permissions={permisos} 
      hasAssignedCourses={hasAssignedCourses} 
    />
  );
}