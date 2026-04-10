import { Metadata } from "next";
import { createClient } from "@/src/lib/supabase/server";
import AccessDenied from "@/src/components/shared/AccessDenied";
import { notFound } from "next/navigation";
import FileEmployees from "@/src/components/documents/FileEmployees";

export const metadata: Metadata = {
  title: "Expediente del Empleado",
  description: "Gestión de documentos oficiales",
};

export default async function DetalleExpedienteSSRPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  
  // 1. En Next.js 15+ los params son asíncronos
  const { id } = await params;

  // 2. Validar Permisos
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs');
  const permisos = perms || [];
  
  // Permitimos el acceso si tiene acceso total, permisos de actualización o permisos de LECTURA
  const tieneAcceso = permisos.includes('acceso_total') || 
                      permisos.includes('documentos.update') || 
                      permisos.includes('documentos.read');

  if (!tieneAcceso) {
    return <AccessDenied message="No tienes permisos para ver o gestionar los expedientes." />;
  }

  // 3. Fetch en Paralelo
  const [empRes, docsRes] = await Promise.all([
    supabase.from("empleados").select("nombre, apellidos, foto_perfil_url").eq("id", id).single(),
    supabase.from("expedientes").select("*").eq("empleado_id", id)
  ]);

  if (empRes.error || !empRes.data) {
    console.error("Error al cargar empleado:", empRes.error?.message);
    notFound(); // Si el empleado no existe, mandamos a 404
  }

  // 4. Inyección al cliente
  return (
    <FileEmployees 
      empleadoId={id} 
      initialEmpleado={empRes.data} 
      initialDocumentos={docsRes.data || []} 
    />
  );
}