"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";
import SuccessDialog from "@/src/components/shared/SuccessDialog";
import { 
  User, Briefcase, DollarSign, Calendar, Shield, 
  Save, ArrowLeft, Building2, Loader2, ChevronDown, Check 
} from "lucide-react";
import { actualizarEmpleadoAction } from "@/src/actions/personal/empleadosActions";

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

interface EditEmpleadoProps {
  empleadoId: string;
  initialData: any;
  rolesList: any[];
  areasList: any[];
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE SELECT PERSONALIZADO (Diseño Premium)
// ─────────────────────────────────────────────────────────────────────────────
const CustomSelect = ({ 
  value, 
  options, 
  onChange, 
  placeholder, 
  icon: Icon 
}: { 
  value: number | null; 
  options: any[]; 
  onChange: (val: number) => void; 
  placeholder: string; 
  icon: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.id === value);

  return (
    <div className="relative">
      {/* Capa invisible para cerrar al hacer clic afuera */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Botón Principal (Reemplaza al Select) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-12 pr-5 py-3.5 rounded-2xl bg-neutral-100 dark:bg-white/5 border-0 text-sm font-medium focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all flex items-center justify-between text-left relative z-10
          ${!selectedOption ? "text-neutral-500" : "text-neutral-900 dark:text-white"}
        `}
      >
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <span className="truncate block flex-1">
          {selectedOption ? selectedOption.nombre : placeholder}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-neutral-400 transition-transform duration-300 ml-2 shrink-0 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {/* Menú Desplegable Animado */}
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-50 py-2 animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-neutral-500 text-center">No hay opciones disponibles</div>
          ) : (
            options.map((opt) => {
              const isSelected = value === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors
                    ${isSelected 
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10' 
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                    }
                  `}
                >
                  <span className="truncate">{opt.nombre}</span>
                  {isSelected && <Check size={16} strokeWidth={3} className="shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

export default function EditEmpleadoPage({ empleadoId, initialData, rolesList, areasList }: EditEmpleadoProps) {
  const router = useRouter();

  const [form, setForm] = useState<EmpleadoForm>({
    nombre: initialData.nombre ?? "",
    apellidos: initialData.apellidos ?? "",
    estado: initialData.estado ?? "activo",
    rol_id: initialData.rol_id,
    area_id: initialData.area_id,
    sueldo_base: initialData.sueldo_base ?? 0,
    fecha_ingreso: initialData.fecha_ingreso,
    fecha_baja: initialData.fecha_baja,
  });

  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await actualizarEmpleadoAction(empleadoId, form);
      setShowConfirm(false);
      setShowSuccess(true);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = "w-full pl-12 pr-5 py-3.5 rounded-2xl bg-neutral-100 dark:bg-white/5 border-0 text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-neutral-500";
  const sectionLabelStyle = "flex items-center gap-3 mb-6 text-lg font-bold text-neutral-800 dark:text-neutral-200";
  const fieldLabelStyle = "block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2 px-1";
  const iconWrapperStyle = "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-indigo-500 transition-colors";

  return (
    <div className="w-full h-full flex flex-col min-h-0 animate-in fade-in duration-500 mx-auto">
      
      <header className="shrink-0 w-full bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-neutral-200/30 dark:border-neutral-800/50 rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm mb-6">
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

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-24 pr-2 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
        <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }} className="flex flex-col h-full space-y-6">
          <div className="grid gap-6 xl:grid-cols-2 w-full">
            
            <section className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-8 border border-neutral-200/50 dark:border-neutral-800/30 shadow-sm transition-shadow">
              <h2 className={sectionLabelStyle}><User className="text-indigo-500" /> Detalles Personales</h2>
              <div className="space-y-6">
                <div className="group">
                  <label className={fieldLabelStyle}>Nombre(s)</label>
                  <div className="relative">
                    <User className={iconWrapperStyle} />
                    <input placeholder="Ej. Daniel" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputStyle} required />
                  </div>
                </div>
                <div className="group">
                  <label className={fieldLabelStyle}>Apellidos</label>
                  <div className="relative">
                    <User className={iconWrapperStyle} />
                    <input placeholder="Ej. Toledo Villegas" value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} className={inputStyle} required />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-8 border border-neutral-200/50 dark:border-neutral-800/30 shadow-sm transition-shadow">
              <h2 className={sectionLabelStyle}><Briefcase className="text-indigo-500" /> Rol y Salario</h2>
              <div className="space-y-6">
                
                {/* 👇 AQUI USAMOS NUESTRO CUSTOM SELECT PARA EL ROL 👇 */}
                <div className="group">
                  <label className={fieldLabelStyle}>Rol / Puesto</label>
                  <CustomSelect 
                    value={form.rol_id}
                    options={rolesList}
                    onChange={(val) => setForm({ ...form, rol_id: val })}
                    placeholder="Seleccionar Rol..."
                    icon={Shield}
                  />
                </div>

                {/* 👇 AQUI USAMOS NUESTRO CUSTOM SELECT PARA EL ÁREA 👇 */}
                <div className="group">
                  <label className={fieldLabelStyle}>Área / Departamento</label>
                  <CustomSelect 
                    value={form.area_id}
                    options={areasList}
                    onChange={(val) => setForm({ ...form, area_id: val })}
                    placeholder="Seleccionar Área..."
                    icon={Building2}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="group">
                    <label className={fieldLabelStyle}>Sueldo Mensual</label>
                    <div className="relative">
                      <DollarSign className={iconWrapperStyle} />
                      <input type="number" placeholder="0.00" value={form.sueldo_base || ""} onChange={(e) => setForm({ ...form, sueldo_base: Number(e.target.value) })} className={inputStyle} required />
                    </div>
                  </div>
                  <div className="group">
                    <label className={fieldLabelStyle}>Ingreso</label>
                    <div className="relative">
                      <Calendar className={iconWrapperStyle} />
                      <input type="date" value={form.fecha_ingreso ?? ""} onChange={(e) => setForm({ ...form, fecha_ingreso: e.target.value })} className={`${inputStyle} [color-scheme:light] dark:[color-scheme:dark]`} />
                    </div>
                  </div>
                </div>

              </div>
            </section>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-4 mt-auto">
            <button type="button" onClick={() => router.back()} className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border-0 bg-neutral-200/50 dark:bg-white/5 text-neutral-600 dark:text-neutral-300 font-bold hover:bg-neutral-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <ArrowLeft size={18} /> Cancelar
            </button>
            <button type="submit" disabled={saving} className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
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