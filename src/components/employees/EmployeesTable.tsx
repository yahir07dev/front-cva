"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { Pencil, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
interface Empleado {
  id: number;
  nombre: string;
  apellidos: string;
  estado: string;
  fecha_ingreso: string | null;
}

export default function EmpleadosTable() {
  const supabase = createClient();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const fetchEmpleados = async () => {
      const { data, error } = await supabase
        .from("empleados")
        .select("id, nombre, apellidos, estado, fecha_ingreso")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setEmpleados(data);
      }

      setLoading(false);
    };

    fetchEmpleados();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando empleados...</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-[#2d3142]">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 dark:bg-[#1f2333]">
          <tr>
            <th className="px-4 py-3 text-left">Nombre</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-left">Ingreso</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((emp) => (
            <tr
              key={emp.id}
              className="border-t border-gray-200 dark:border-[#2d3142]"
            >
              <td className="px-4 py-3">
                {emp.nombre} {emp.apellidos}
              </td>
              <td className="px-4 py-3 capitalize">{emp.estado}</td>
              <td className="px-4 py-3">{emp.fecha_ingreso ?? "—"}</td>
              <td className="px-4 py-3 text-right space-x-2">
                {/* boton de editar */}
                <button
                  onClick={() => {
                    router.push(`/dashboard/personal/empleados/${emp.id}`);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  <Pencil size={20} className="in-dark:text-blue-400" />
                </button>
                <button className="text-red-600 hover:underline">
                  <Trash size={20} />
                </button>
              </td>
            </tr>
          ))}

          {empleados.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                No hay empleados registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
