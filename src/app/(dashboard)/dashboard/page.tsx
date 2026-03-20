import React from "react";
import { Metadata } from "next";
import { createClient } from "@/src/lib/supabase/server";
import DashboardAdmin from "@/src/components/dashboard/DashboardAdmin";
import DashboardEmpleado from "@/src/components/dashboard/DashboardEmpleado";

export const metadata: Metadata = {
  title: "Panel Principal | Comercial V.A.",
  description: "Resumen general del sistema",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Obtenemos los permisos del usuario logueado
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs');
  const permisos = perms || [];

  // 2. Definimos si es un Administrador (Superadmin o Admin con ciertos permisos)
  const isAdministrador = permisos.includes('acceso_total') || permisos.includes('empleados.read') || permisos.includes('reportes.read_all');

  // 3. Mostramos el Dashboard correspondiente
  if (isAdministrador) {
    return <DashboardAdmin />;
  }

  // Si es un empleado normal, le mostramos su vista simplificada
  return <DashboardEmpleado />;
}