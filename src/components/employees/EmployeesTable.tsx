"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { Pencil, Trash, Search, Users } from "lucide-react";
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
  const [search, setSearch] = useState("");
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
      }
      setLoading(false);
    };

    fetchEmpleados();
  }, [supabase]);

  // Filtro de búsqueda en tiempo real
  const filteredEmpleados = empleados.filter((e) => {
    const fullSearch =
      `${e.nombre} ${e.apellidos} ${e.rol?.nombre || ""} ${e.area?.nombre || ""}`.toLowerCase();
    return fullSearch.includes(search.toLowerCase());
  });

  // Eliminación de empleado
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
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {/* BARRA DE BÚSQUEDA */}
      {/* relative mb-8 max-w-2xl mx-auto */}
      <div className="relative mb-8 max-w-2xl mx-auto ">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Buscar empleado por nombre, rol o área..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-100 bg-white shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:bg-[#1a1d29] dark:border-[#2d3142] dark:text-white dark:focus:border-indigo-400"
        />
      </div>

      {/* CONTENEDOR DE LA TABLA */}
      <div className="bg-white dark:bg-[#1a1d29] rounded-[2rem] border-2 border-gray-50 dark:border-[#2d3142] p-2 md:p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-[#232734]/50 rounded-xl">
              <tr>
                <th className="px-6 py-4 font-semibold rounded-l-xl">Nombre</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Rol</th>
                <th className="px-6 py-4 font-semibold">Área</th>
                <th className="px-6 py-4 font-semibold">Ingreso</th>
                <th className="px-6 py-4 font-semibold text-right rounded-r-xl">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmpleados.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-gray-50 dark:border-[#2d3142] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-white capitalize">
                    {emp.nombre} {emp.apellidos}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold capitalize">
                      {emp.estado ?? "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 capitalize">
                    {emp.rol?.nombre ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 capitalize">
                    {emp.area?.nombre ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {emp.fecha_ingreso ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/personal/empleados/${emp.id}`)
                        }
                        className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(emp)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ESTADO VACÍO */}
        {filteredEmpleados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-[#232734] rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-200 dark:border-gray-700">
              <Users className="text-gray-300 dark:text-gray-600 w-10 h-10" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              No se encontraron empleados
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Intenta con otros términos de búsqueda.
            </p>
          </div>
        )}
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
        description={`Se dio de baja correctamente a ${empleadoSeleccionado?.nombre} ${empleadoSeleccionado?.apellidos}.`}
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
