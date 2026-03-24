import { Metadata } from "next";
import { createClient } from "@/src/lib/supabase/server";
import AccessDenied from "@/src/components/shared/AccessDenied";
import { notFound } from "next/navigation";
import FileEmployees from "@/src/components/documents/FileEmployees";

export const metadata: Metadata = {
  title: "Expediente del Empleado",
  description: "Gestión de documentos oficiales",
};

// 👇 1. CAMBIO AQUÍ: En Next.js 15, params se tipa como una Promesa
export default async function DetalleExpedienteSSRPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  
  // 👇 2. CAMBIO AQUÍ: Ahora es obligatorio hacerle 'await' a params
  const { id } = await params;

  // 3. Validar Permisos explícitamente desde la base de datos (Seguridad primero)
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs');
  const permisos = perms || [];
  const tieneAcceso = permisos.includes('acceso_total') || permisos.includes('documentos.update');

  if (!tieneAcceso) {
    return <AccessDenied message="No tienes permisos para gestionar los expedientes." />;
  }

  // 4. Fetch en Paralelo (Eliminamos el Waterfall)
  const [empRes, docsRes] = await Promise.all([
    supabase.from("empleados").select("nombre, apellidos, foto_perfil_url").eq("id", id).single(),
    supabase.from("expedientes").select("*").eq("empleado_id", id)
  ]);

  if (empRes.error || !empRes.data) {
    console.error("Error al cargar empleado:", empRes.error?.message);
    notFound(); // Si el empleado no existe o fue borrado, mandamos a 404
  }

  // 5. Pasamos los datos listos al Componente Cliente
  return (
    <FileEmployees 
      empleadoId={id} 
      initialEmpleado={empRes.data} 
      initialDocumentos={docsRes.data || []} 
    />
  );
}