"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { Pencil, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "../shared/ConfirmDialog";
import SuccessDialog from "../shared/SuccessDialog";
interface Empleado {
  id: number;
  nombre: string;
  apellidos: string;
  estado: string;
  fecha_ingreso: string | null;
  rol: { nombre: string } | null;
  area: { nombre: string } | null;
}

export default function EmpleadosTable() {
  const supabase = createClient();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] =
    useState<Empleado | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const fetchEmpleados = async () => {
      const { data, error } = await supabase
        .from("empleados")
        .select(
          "id, nombre, apellidos, estado, fecha_ingreso, rol:roles!empleados_rol_id_fkey(nombre) , area:areas!empleados_area_id_fkey(nombre)",
        )
        .eq("estado", "activo")
        .order("created_at", { ascending: false });
      console.log("data de empleado: ", data);

      if (!error && data) {
        const empleadosNormalizados: Empleado[] = data.map((emp: any) => ({
          ...emp,
          rol: Array.isArray(emp.rol)
            ? (emp.rol[0] ?? null)
            : (emp.rol ?? null),
          area: Array.isArray(emp.area)
            ? (emp.area[0] ?? null)
            : (emp.area ?? null),
        }));

        setEmpleados(empleadosNormalizados);

        console.log(
          "rol del primer user",
          empleadosNormalizados[0]?.rol?.nombre,
        );
      }

      setLoading(false);
    };

    fetchEmpleados();
  }, []);

  // eliminacion de empleado
  const handleOpenDelete = (empleado: Empleado) => {
    setEmpleadoSeleccionado(empleado);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!empleadoSeleccionado) return;

    setDeleting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("empleados")
      .update({
        estado: "baja",
        deleted_at: new Date().toISOString(),
        deleted_by: user?.id ?? null,
        fecha_baja: new Date().toISOString(),
      })
      .eq("id", empleadoSeleccionado.id);

    if (!error) {
      setShowSuccess(true);
      setEmpleados((prev) =>
        prev.filter((e) => e.id !== empleadoSeleccionado.id),
      );
      setOpenConfirm(false);
      setEmpleadoSeleccionado(null);
    }
    setDeleting(false);
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando empleados...</p>;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-[#2d3142]">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-[#1f2333]">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-left">Area</th>
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

                <td className="px-4 py-3 capitalize">{emp.estado ?? "-"}</td>
                <td className="px-4 py-3 capitalize">
                  {" "}
                  {emp.rol?.nombre ?? "-"}{" "}
                </td>
                <td className="px-4 py-3 capitalize">
                  {emp.area?.nombre ?? "-"}
                </td>
                <td className="px-4 py-3">{emp.fecha_ingreso ?? "-"}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  {/* boton de editar */}
                  <button
                    onClick={() => {
                      router.push(`/dashboard/personal/empleados/${emp.id}`);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    <Pencil size={20} className="in-dark:text-blue-400 mr-3" />
                  </button>
                  <button
                    onClick={() => {
                      handleOpenDelete(emp);
                    }}
                    className="text-red-600 hover:underline"
                  >
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

      <ConfirmDialog
        open={openConfirm}
        title="Dar de baja empleado"
        description={`¿Estás seguro de dar de baja a ${empleadoSeleccionado?.nombre} ${empleadoSeleccionado?.apellidos}?`}
        confirmText="Sí, dar de baja"
        loading={deleting}
        onCancel={() => setOpenConfirm(false)}
        onConfirm={handleConfirmDelete}
      />

      <SuccessDialog
        open={showSuccess}
        title="Cambios guardados"
        description={`Se elimino correctamente a ${empleadoSeleccionado?.nombre} ${empleadoSeleccionado?.apellidos}.`}
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
