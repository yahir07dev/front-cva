import React from "react";
import { Plus } from "lucide-react";
import { Metadata } from "next";
import EmpleadosTable from "@/src/components/employees/EmployeesTable";
import { requirePermission } from "@/src/lib/auth/guard";
export const metadata: Metadata = {
  title: "Empleados",
  description: "Resumen general",
};
export default async function EmpleadosPage() {
  await requirePermission("empleados.update");
  return (
    <div className="">
      {/* Header de la sección */}
      <div className="flex items-center justify-between pb-5">
        <div>
          <h1 className="text-2xl font-bold">Empleados</h1>
        </div>

        <button className="flex flex-row px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition items-center">
          <Plus size={20} className="mr-2 " />
          Nuevo empleado
        </button>
      </div>

      {/* Tabla */}
      <EmpleadosTable />
    </div>
  );
}
