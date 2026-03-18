import EditEmpleadoPage from "@/src/components/employees/EditEmployees";
import { Metadata } from "next";
import { requirePermission } from "@/src/lib/auth/guard";
export const metadata: Metadata = {
  title: "Editar empleados",
  description: "Informacion del empleado",
};

export default async function FormEmpleadosPage() {
  await requirePermission("empleados.update");
  return (
    <div>
      <EditEmpleadoPage />
    </div>
  );
}
