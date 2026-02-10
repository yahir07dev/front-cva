"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";
import SuccessDialog from "@/src/components/shared/SuccessDialog";

interface EmpleadoForm {
  nombre: string;
  apellidos: string;
  estado: string;
  rol_id: number | null;
  area_id: number | null;
  sueldo_base: number;
  fecha_ingreso: string | null;
  fecha_baja: string | null;
}

interface Rol {
  id: number;
  nombre: string;
}

interface Area {
  id: number;
  nombre: string;
}

export default function EditEmpleadoPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [form, setForm] = useState<EmpleadoForm>({
    nombre: "",
    apellidos: "",
    estado: "activo",
    rol_id: 3,
    area_id: 2,
    sueldo_base: 0,
    fecha_ingreso: null,
    fecha_baja: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Cargar empleado
  useEffect(() => {
    const fetchData = async () => {
      // cargar el empleado
      const { data: empleado, error: empleadoError } = await supabase
        .from("empleados")
        .select(
          "nombre, apellidos, estado, fecha_ingreso, rol_id, area_id, sueldo_base, fecha_baja",
        )
        .eq("id", id)
        .single();

      if (empleadoError || !empleado) {
        router.push("/dashboard/personal/empleados");
        return;
      }
      setForm({
        nombre: empleado.nombre ?? "",
        apellidos: empleado.apellidos ?? "",
        estado: empleado.estado ?? "activo",
        rol_id: empleado.rol_id ?? null,
        area_id: empleado.area_id ?? null,
        sueldo_base: empleado.sueldo_base ?? 0,
        fecha_ingreso: empleado.fecha_ingreso ?? null,
        fecha_baja: empleado.fecha_baja ?? null,
      });

      // cargar el rol
      const { data: roles, error: rolesError } = await supabase
        .from("roles")
        .select("id, nombre")
        .order("nombre");

      if (roles && !rolesError) setRoles(roles);

      // cargar areas
      const { data: areas, error: rolesAreas } = await supabase
        .from("areas")
        .select("id, nombre")
        .order("nombre");

      if (areas && !rolesAreas) setAreas(areas);

      setLoading(false);
    };

    fetchData();
  }, [id]);

  // 🔹 Guardar cambios
  const handleSubmit = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("empleados")
      .update({
        nombre: form.nombre,
        apellidos: form.apellidos,
        estado: form.estado,
        rol_id: form.rol_id,
        area_id: form.area_id,
        sueldo_base: form.sueldo_base,
        fecha_ingreso: form.fecha_ingreso,
        updated_at: new Date(),
      })
      .eq("id", id);

    setSaving(false);
    setShowConfirm(false);

    if (!error) {
      setShowSuccess(true); // mostramos éxito
    }
    if (error) {
      console.error("Error de supabase: ", error);
      alert(error.message);
      return;
    }
  };

  if (loading) return <p>Cargando empleado...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Editar empleado</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirm(true);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full px-3 py-2 rounded border border-gray-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Apellidos</label>
          <input
            value={form.apellidos}
            onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
            className="w-full px-3 py-2 rounded border border-gray-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Rol</label>
          <select
            value={form.rol_id ?? 3}
            onChange={(e) =>
              setForm({ ...form, rol_id: Number(e.target.value) })
            }
            className="w-full px-3 py-2 rounded border border-gray-200"
            required
          >
            <option value="">Selecciona un rol</option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Area</label>
          <select
            value={form.area_id ?? 0}
            onChange={(e) =>
              setForm({ ...form, area_id: Number(e.target.value) })
            }
            className="w-full px-3 py-2 rounded border border-gray-200"
            required
          >
            <option value="">Selecciona un area</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Sueldo base</label>
          <input
            type="number"
            value={form.sueldo_base ?? ""}
            onChange={(e) =>
              setForm({ ...form, sueldo_base: Number(e.target.value) })
            }
            className="w-full px-3 py-2 rounded border border-gray-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Estado</label>
          <select
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value })}
            className="w-full px-3 py-2 rounded border border-gray-200"
          >
            <option value="activo">Activo</option>
            <option value="baja">Baja</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Fecha ingreso</label>
          <input
            type="date"
            value={form.fecha_ingreso ?? ""}
            onChange={(e) =>
              setForm({ ...form, fecha_ingreso: e.target.value })
            }
            className="w-full px-3 py-2 rounded border border-gray-200 "
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded border-gray-200"
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* 🔹 Confirmar guardado */}
      <ConfirmDialog
        open={showConfirm}
        title="Guardar cambios"
        description="¿Estás seguro de que deseas guardar los cambios del empleado?"
        confirmText="Sí, guardar"
        cancelText="Cancelar"
        loading={saving}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleSubmit}
      />

      <SuccessDialog
        open={showSuccess}
        title="Cambios guardados"
        description="Se guardó correctamente."
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}
