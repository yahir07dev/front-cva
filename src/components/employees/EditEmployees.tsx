"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";
import SuccessDialog from "@/src/components/shared/SuccessDialog";
import {
  User,
  Briefcase,
  DollarSign,
  Calendar,
  Shield,
  Save,
  ArrowLeft,
  Building2,
} from "lucide-react";

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
    rol_id: null,
    area_id: null,
    sueldo_base: 0,
    fecha_ingreso: null,
    fecha_baja: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: empleado, error } = await supabase
        .from("empleados")
        .select(
          "nombre, apellidos, estado, fecha_ingreso, rol_id, area_id, sueldo_base, fecha_baja",
        )
        .eq("id", id)
        .single();

      if (error || !empleado) {
        router.push("/dashboard/personal/empleados");
        return;
      }

      setForm({
        nombre: empleado.nombre ?? "",
        apellidos: empleado.apellidos ?? "",
        estado: empleado.estado ?? "activo",
        rol_id: empleado.rol_id,
        area_id: empleado.area_id,
        sueldo_base: empleado.sueldo_base ?? 0,
        fecha_ingreso: empleado.fecha_ingreso,
        fecha_baja: empleado.fecha_baja,
      });

      const [{ data: rolesData }, { data: areasData }] = await Promise.all([
        supabase.from("roles").select("id, nombre").order("nombre"),
        supabase.from("areas").select("id, nombre").order("nombre"),
      ]);

      if (rolesData) setRoles(rolesData);
      if (areasData) setAreas(areasData);

      setLoading(false);
    };

    fetchData();
  }, [id, supabase, router]);

  const handleSubmit = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("empleados")
      .update({
        ...form,
        updated_at: new Date(),
      })
      .eq("id", id);

    setSaving(false);
    setShowConfirm(false);

    if (!error) {
      setShowSuccess(true);
    } else {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center w-full bg-white dark:bg-[#1a1d29]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Estilos base con soporte para Dark Mode
  const inputStyle =
    "w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white transition-all outline-none text-gray-700 shadow-sm " +
    "focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 " +
    "dark:bg-[#232734] dark:border-[#2d3142] dark:text-gray-200 dark:focus:border-indigo-400";

  const sectionLabelStyle =
    "flex items-center gap-2 mb-6 text-xs font-bold text-gray-400 uppercase tracking-widest dark:text-gray-500";

  const fieldLabelStyle =
    "block text-sm font-semibold text-gray-600 mb-2 ml-1 dark:text-gray-300";

  return (
    <div className="w-full min-h-full bg-white border-2 rounded-2xl border-gray-100 transition-colors duration-300 dark:bg-[#1a1d29] dark:border-[#2d3142]">
      {/* HEADER */}
      <header className="px-6 py-8 md:px-10 border-b border-gray-50 dark:border-[#2d3142]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20">
            <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
              Perfil de {form.nombre}
            </h1>
          </div>
        </div>
      </header>

      <main className="w-full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowConfirm(true);
          }}
          className="p-6 md:p-10 space-y-4"
        >
          {/* SECCIÓN INFORMACIÓN PERSONAL */}
          <section className="max-w-6xl pb-6">
            <h2 className={sectionLabelStyle}>
              <User className="w-4 h-4" /> Información Personal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* CAMPO: NOMBRE */}
              <div className="group">
                <label className={fieldLabelStyle}>Nombre(s)</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    placeholder="Ej. Daniel"
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
                    className={inputStyle}
                    required
                  />
                </div>
              </div>

              {/* CAMPO: APELLIDOS */}
              <div className="group">
                <label className={fieldLabelStyle}>Apellidos</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    placeholder="Ej. Toledo Villegas"
                    value={form.apellidos}
                    onChange={(e) =>
                      setForm({ ...form, apellidos: e.target.value })
                    }
                    className={inputStyle}
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN DETALLES LABORALES */}
          <section className="max-w-6xl pt-10 border-t border-gray-100 dark:border-[#2d3142]">
            <h2 className={sectionLabelStyle}>
              <Briefcase className="w-4 h-4" /> Detalles del Puesto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* CAMPO: ROL */}
              <div className="group">
                <label className={fieldLabelStyle}>Rol / Puesto</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500" />
                  <select
                    value={form.rol_id ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, rol_id: Number(e.target.value) })
                    }
                    className={inputStyle}
                    required
                  >
                    <option value="">Seleccionar Rol</option>
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CAMPO: ÁREA */}
              <div className="group">
                <label className={fieldLabelStyle}>Área / Departamento</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500" />
                  <select
                    value={form.area_id ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, area_id: Number(e.target.value) })
                    }
                    className={inputStyle}
                    required
                  >
                    <option value="">Seleccionar Área</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CAMPO: SUELDO */}
              <div className="group">
                <label className={fieldLabelStyle}>Sueldo Mensual</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500" />
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.sueldo_base || ""}
                    onChange={(e) =>
                      setForm({ ...form, sueldo_base: Number(e.target.value) })
                    }
                    className={inputStyle}
                    required
                  />
                </div>
              </div>

              {/* CAMPO: FECHA INGRESO */}
              <div className="group">
                <label className={fieldLabelStyle}>Fecha de Ingreso</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500" />
                  <input
                    type="date"
                    value={form.fecha_ingreso ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, fecha_ingreso: e.target.value })
                    }
                    className={`${inputStyle} [color-scheme:light] dark:[color-scheme:dark]`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* BARRA DE ACCIONES FINAL */}
          <footer className="flex items-center justify-end gap-4 pt-10 border-t border-gray-100 dark:border-[#2d3142]">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-medium hover:bg-gray-50 transition-all flex items-center gap-2 dark:border-[#2d3142] dark:text-gray-400 dark:hover:bg-[#232734] dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 dark:shadow-none items-center gap-2 flex"
            >
              <Save className="size-4" />
              {saving ? "Guardando..." : "Actualizar"}
            </button>
          </footer>
        </form>
      </main>

      {/* COMPONENTES DE DIÁLOGO */}
      <ConfirmDialog
        open={showConfirm}
        title="Confirmar cambios"
        description="¿Estás seguro de que deseas actualizar la información de este empleado?"
        confirmText="Sí, actualizar"
        cancelText="No, revisar"
        loading={saving}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleSubmit}
      />

      <SuccessDialog
        open={showSuccess}
        title="Cambios realizados"
        description="Los datos del colaborador se han actualizado correctamente en el sistema."
        onClose={() => {
          setShowSuccess(false);
          router.push("/dashboard/personal/empleados");
        }}
      />
    </div>
  );
}
