"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { Pencil, Trash, Search, Users, ShieldAlert, Loader2 } from "lucide-react";
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
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null);
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
      <div className="flex min-h-[60vh] items-center justify-center w-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin w-12 h-12 text-indigo-500 dark:text-indigo-400" />
          <span className="text-lg font-medium text-neutral-600 dark:text-neutral-300 animate-pulse">
            Cargando empleados...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-24 animate-in fade-in duration-700">
      
      {/* Barra de búsqueda premium */}
      <div className="relative max-w-3xl mx-auto group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre, rol o área..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full pl-14 pr-6 py-4 rounded-3xl 
            bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl
            border border-neutral-200/60 dark:border-neutral-800/60 
            shadow-sm hover:shadow-lg focus:shadow-xl outline-none transition-all duration-300
            text-base font-medium text-neutral-900 dark:text-white placeholder:text-neutral-500/70
            focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/15
          "
        />
      </div>

      {/* Tabla con estilo moderno */}
      <div className="
        w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl 
        border border-neutral-200/60 dark:border-neutral-800/60 
        rounded-3xl overflow-hidden shadow-md
      ">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap border-collapse">
            <thead>
              <tr className="border-b border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-950/50">
                <th className="px-6 py-5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Nombre Completo</th>
                <th className="px-6 py-5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Área</th>
                <th className="px-6 py-5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Ingreso</th>
                <th className="px-6 py-5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100/50 dark:divide-neutral-800/50">
              {filteredEmpleados.map((emp) => (
                <tr
                  key={emp.id}
                  className="
                    group hover:bg-neutral-50/80 dark:hover:bg-neutral-950/50 
                    transition-all duration-200
                  "
                >
                  <td className="px-6 py-5">
                    <div className="font-semibold text-sm text-neutral-900 dark:text-white capitalize">
                      {emp.nombre} {emp.apellidos}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="
                      inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300
                      shadow-sm
                    ">
                      {emp.estado ?? "-"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-neutral-600 dark:text-neutral-400 capitalize">
                    {emp.rol?.nombre ?? "-"}
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-neutral-600 dark:text-neutral-400 capitalize">
                    {emp.area?.nombre ?? "-"}
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    {emp.fecha_ingreso 
                      ? new Date(emp.fecha_ingreso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) 
                      : "-"}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => router.push(`/dashboard/personal/empleados/${emp.id}`)}
                        className="
                          p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 
                          hover:bg-indigo-100 dark:hover:bg-indigo-900/50 
                          text-indigo-600 transition-colors shadow-sm
                        "
                        title="Editar Perfil"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(emp)}
                        className="
                          p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 
                          hover:bg-rose-100 dark:hover:bg-rose-900/50 
                          text-rose-600 transition-colors shadow-sm
                        "
                        title="Dar de baja"
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

        {/* Estado vacío */}
        {filteredEmpleados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-in zoom-in-95 duration-500">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-3xl animate-pulse-slow" />
              <ShieldAlert className="relative h-20 w-20 text-indigo-400 dark:text-indigo-500 drop-shadow-md" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              No se encontraron empleados
            </h2>
            <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-md leading-relaxed">
              Intenta con otros términos de búsqueda o verifica que haya empleados activos en el sistema.
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={openConfirm}
        title="Dar de baja empleado"
        description={`¿Estás seguro de dar de baja a ${empleadoSeleccionado?.nombre} ${empleadoSeleccionado?.apellidos}? Esta acción revocará sus accesos al sistema.`}
        confirmText="Sí, dar de baja"
        loading={deleting}
        onCancel={() => setOpenConfirm(false)}
        onConfirm={handleConfirmDelete}
      />

      <SuccessDialog
        open={showSuccess}
        title="Empleado dado de baja"
        description={`Se procesó correctamente la baja de ${empleadoSeleccionado?.nombre} ${empleadoSeleccionado?.apellidos}.`}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}