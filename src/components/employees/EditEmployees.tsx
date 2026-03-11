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
  Loader2
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
      <div className="flex h-[60vh] items-center justify-center w-full">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  const inputStyle =
    "w-full pl-12 pr-5 py-3.5 rounded-2xl bg-neutral-100 dark:bg-white/5 border-0 text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-neutral-500";

  const sectionLabelStyle =
    "flex items-center gap-3 mb-6 text-lg font-bold text-neutral-800 dark:text-neutral-200";

  const fieldLabelStyle =
    "block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2 px-1";

  const iconWrapperStyle =
    "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-indigo-500 transition-colors";

  return (
    <div className="w-full h-full flex flex-col min-h-0 animate-in fade-in duration-500 mx-auto">
      
      <header className="
        shrink-0 w-full bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl 
        border border-neutral-200/30 dark:border-neutral-800/50 
        rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm mb-6
      ">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <User className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-neutral-900 dark:text-white truncate">
              Perfil de {form.nombre}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1 truncate">
              Gestión de información personal y laboral
            </p>
          </div>
        </div>
      </header>

      {/* AQUÍ ESTÁ EL CAMBIO: Se añadieron las clases de scrollbar */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-24 pr-2 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowConfirm(true);
          }}
          className="flex flex-col h-full space-y-6"
        >
          <div className="grid gap-6 xl:grid-cols-2 w-full">
            
            <section className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-8 border border-neutral-200/50 dark:border-neutral-800/30 shadow-sm transition-shadow">
              <h2 className={sectionLabelStyle}>
                <User className="text-indigo-500" /> Detalles Personales
              </h2>
              <div className="space-y-6">
                
                <div className="group">
                  <label className={fieldLabelStyle}>Nombre(s)</label>
                  <div className="relative">
                    <User className={iconWrapperStyle} />
                    <input
                      placeholder="Ej. Daniel"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className={inputStyle}
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <label className={fieldLabelStyle}>Apellidos</label>
                  <div className="relative">
                    <User className={iconWrapperStyle} />
                    <input
                      placeholder="Ej. Toledo Villegas"
                      value={form.apellidos}
                      onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                      className={inputStyle}
                      required
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-8 border border-neutral-200/50 dark:border-neutral-800/30 shadow-sm transition-shadow">
              <h2 className={sectionLabelStyle}>
                <Briefcase className="text-indigo-500" /> Rol y Salario
              </h2>
              <div className="space-y-6">
                
                <div className="group">
                  <label className={fieldLabelStyle}>Rol / Puesto</label>
                  <div className="relative">
                    <Shield className={iconWrapperStyle} />
                    <select
                      value={form.rol_id ?? ""}
                      onChange={(e) => setForm({ ...form, rol_id: Number(e.target.value) })}
                      className={`${inputStyle} appearance-none cursor-pointer`}
                      required
                    >
                      <option value="" className="bg-white dark:bg-neutral-900 text-neutral-500">Seleccionar Rol</option>
                      {roles.map((rol) => (
                        <option key={rol.id} value={rol.id} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                          {rol.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="group">
                  <label className={fieldLabelStyle}>Área / Departamento</label>
                  <div className="relative">
                    <Building2 className={iconWrapperStyle} />
                    <select
                      value={form.area_id ?? ""}
                      onChange={(e) => setForm({ ...form, area_id: Number(e.target.value) })}
                      className={`${inputStyle} appearance-none cursor-pointer`}
                      required
                    >
                      <option value="" className="bg-white dark:bg-neutral-900 text-neutral-500">Seleccionar Área</option>
                      {areas.map((area) => (
                        <option key={area.id} value={area.id} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                          {area.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="group">
                    <label className={fieldLabelStyle}>Sueldo Mensual</label>
                    <div className="relative">
                      <DollarSign className={iconWrapperStyle} />
                      <input
                        type="number"
                        placeholder="0.00"
                        value={form.sueldo_base || ""}
                        onChange={(e) => setForm({ ...form, sueldo_base: Number(e.target.value) })}
                        className={inputStyle}
                        required
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className={fieldLabelStyle}>Ingreso</label>
                    <div className="relative">
                      <Calendar className={iconWrapperStyle} />
                      <input
                        type="date"
                        value={form.fecha_ingreso ?? ""}
                        onChange={(e) => setForm({ ...form, fecha_ingreso: e.target.value })}
                        className={`${inputStyle} [color-scheme:light] dark:[color-scheme:dark]`}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </section>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-4 mt-auto">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border-0 bg-neutral-200/50 dark:bg-white/5 text-neutral-600 dark:text-neutral-300 font-bold hover:bg-neutral-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? "Guardando..." : "Actualizar Perfil"}
            </button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Confirmar cambios"
        description="¿Estás seguro de que deseas actualizar la información de este empleado?"
        confirmText="Sí, actualizar"
        cancelText="Revisar"
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