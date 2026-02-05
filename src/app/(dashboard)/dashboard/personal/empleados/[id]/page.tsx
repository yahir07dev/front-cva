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
  fecha_ingreso: string | null;
}

export default function EditEmpleadoPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<EmpleadoForm>({
    nombre: "",
    apellidos: "",
    estado: "activo",
    fecha_ingreso: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 🔹 Cargar empleado
  useEffect(() => {
    const fetchEmpleado = async () => {
      const { data, error } = await supabase
        .from("empleados")
        .select("nombre, apellidos, estado, fecha_ingreso")
        .eq("id", id)
        .single();

      if (error || !data) {
        router.push("/dashboard/personal/empleados");
        return;
      }

      setForm(data);
      setLoading(false);
    };

    fetchEmpleado();
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
        fecha_ingreso: form.fecha_ingreso,
        updated_at: new Date(),
      })
      .eq("id", id);

    setSaving(false);
    setShowConfirm(false);

    if (!error) {
      setShowSuccess(true); // mostramos éxito
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
            className="w-full px-3 py-2 rounded border border-gray-200"
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
