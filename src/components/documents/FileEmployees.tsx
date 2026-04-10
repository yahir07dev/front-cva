"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";
import SuccessDialog from "@/src/components/shared/SuccessDialog";
import {
  FileText, ArrowLeft, Eye, Upload, X as CloseIcon,
  CheckCircle2, Clock, User, Loader2, FolderOpen
} from "lucide-react";

interface Documento {
  id?: string;
  tipo: string;
  nombre_archivo: string;
  fecha_carga: string;
  url: string;
}

const DOCS_REQUERIDOS = ["RFC", "CURP", "NSS", "CONTRATO", "ACTA NACIMIENTO"];

// Recibimos los datos iniciales desde el servidor
export default function FileEmployees({ 
  empleadoId, 
  initialEmpleado, 
  initialDocumentos 
}: { 
  empleadoId: string;
  initialEmpleado: any;
  initialDocumentos: Documento[];
}) {
  const router = useRouter();
  const supabase = createClient();

  // Inicializamos el estado con los datos inyectados del servidor
  const [empleado] = useState(initialEmpleado);
  const [documentos, setDocumentos] = useState<Documento[]>(initialDocumentos);
  
  const [uploading, setUploading] = useState<string | null>(null);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [docSeleccionado, setDocSeleccionado] = useState<Documento | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Ya no usamos useEffect para la carga inicial. 
  // Solo creamos una función para refrescar en segundo plano cuando se sube o borra un archivo.
  const refreshDocumentos = async () => {
    const { data } = await supabase.from("expedientes").select("*").eq("empleado_id", empleadoId);
    if (data) setDocumentos(data);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipo: string) => {
    const file = e.target.files?.[0];

    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Solo se permiten archivos en formato PDF.");
      e.target.value = "";
      return;
    }

    setUploading(tipo);
    const filePath = `${empleadoId}/${tipo}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("Expediente")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("Error al subir archivo: " + uploadError.message);
      setUploading(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("Expediente").getPublicUrl(filePath);

    const { error: dbError } = await supabase.from("expedientes").upsert(
      {
        empleado_id: empleadoId,
        tipo: tipo,
        nombre_archivo: file.name,
        url: publicUrl,
        // 👇 SOLUCIÓN: Formato YYYY-MM-DD compatible con PostgreSQL
        fecha_carga: new Date().toISOString().split('T')[0], 
      },
      { onConflict: "empleado_id, tipo" },
    );

    if (dbError) {
      alert("Error en DB: " + dbError.message);
    } else {
      setShowSuccess(true);
      await refreshDocumentos(); // Refrescamos solo los docs localmente
    }

    setUploading(null);
  };

  const handleOpenDelete = (tipo: string) => {
    const doc = documentos.find((d) => d.tipo === tipo);
    if (!doc) return;
    setDocSeleccionado(doc);
    setOpenConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!docSeleccionado) return;

    setDeleting(true);
    const path = `${empleadoId}/${docSeleccionado.tipo}.pdf`;

    const { error: storageError } = await supabase.storage.from("Expediente").remove([path]);
    const { error: dbError } = await supabase.from("expedientes").delete().eq("empleado_id", empleadoId).eq("tipo", docSeleccionado.tipo);

    if (!storageError && !dbError) {
      await refreshDocumentos();
      setShowSuccess(true);
    } else {
      alert("Hubo un error al eliminar el archivo.");
    }

    setDeleting(false);
    setOpenConfirmDelete(false);
    setDocSeleccionado(null);
  };

  const docsCompletados = documentos.length;
  const progreso = (docsCompletados / DOCS_REQUERIDOS.length) * 100;

  return (
    <div className="w-full h-full flex flex-col min-h-0 space-y-8 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <header className="shrink-0 relative overflow-hidden w-full bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50 rounded-[32px] p-6 md:p-10 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none hidden dark:block" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => router.back()}
              className="group p-3 rounded-2xl bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 transition-all text-neutral-500 dark:text-neutral-400 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gradient-to-br from-cyan-50 to-neutral-100 dark:from-cyan-950/40 dark:to-neutral-900 ring-4 ring-white dark:ring-neutral-950 shadow-lg">
                {empleado?.foto_perfil_url ? (
                  <img
                    src={empleado.foto_perfil_url}
                    alt="perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-600/50 dark:text-cyan-400/50" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-white p-1 sm:p-1.5 rounded-full ring-2 sm:ring-4 ring-white dark:ring-neutral-900">
                <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-neutral-900 dark:text-white capitalize truncate">
                {empleado?.nombre} {empleado?.apellidos}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1 truncate">
                Gestión de Expediente Digital
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-4 bg-white/50 dark:bg-black/20 p-4 rounded-3xl border border-neutral-100 dark:border-neutral-800/50">
            <div className="flex flex-col sm:text-right">
              <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">Estado del expediente</span>
              <span className="text-[10px] sm:text-xs font-medium text-cyan-600 dark:text-cyan-400">
                {docsCompletados} de {DOCS_REQUERIDOS.length} documentos
              </span>
            </div>
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 transform -rotate-90">
                <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-neutral-200 dark:text-neutral-800" />
                <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="100%" strokeDashoffset={`${100 - progreso}%`} className="text-cyan-500 transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-neutral-700 dark:text-neutral-300">
                {Math.round(progreso)}%
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-20 pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6 pt-2">
          {DOCS_REQUERIDOS.map((tipoDoc, index) => {
            const doc = documentos.find((d) => d.tipo === tipoDoc);
            const isUploading = uploading === tipoDoc;

            return (
              <div
                key={tipoDoc}
                className="group relative flex flex-col justify-between p-5 sm:p-6 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50 rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-500/30"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`p-3 sm:p-3.5 rounded-2xl transition-colors duration-300 ${doc ? "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "bg-neutral-100 dark:bg-white/5 text-neutral-400"}`}>
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-base sm:text-lg text-neutral-900 dark:text-white tracking-tight truncate">
                        {tipoDoc}
                      </h3>
                      {doc ? (
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-3 h-3" /> Cargado
                        </span>
                      ) : (
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> Pendiente
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {doc && (
                      <div className="text-[10px] sm:text-xs font-medium text-neutral-400 dark:text-neutral-500">
                        Subido el <br />
                        <span className="text-neutral-700 dark:text-neutral-300 font-bold">{doc.fecha_carga.slice(0, 10)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full pt-4 mt-auto border-t border-neutral-100/80 dark:border-neutral-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {doc && (
                      <>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-all shadow-sm"
                          title="Ver documento"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleOpenDelete(tipoDoc)}
                          className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/50 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all shadow-sm"
                          title="Eliminar documento"
                        >
                          <CloseIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  <label className={`flex items-center justify-center gap-2 cursor-pointer px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-md ${doc ? "bg-neutral-900 dark:bg-white text-white dark:text-black hover:scale-105" : "bg-cyan-600 text-white hover:bg-cyan-700 shadow-cyan-600/20 hover:scale-105"}`}>
                    {isUploading ? (
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    {doc ? "Actualizar" : "Subir Archivo"}
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf"
                      onChange={(e) => handleUpload(e, tipoDoc)}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <ConfirmDialog
        open={openConfirmDelete}
        title="Eliminar documento"
        description={`¿Estás seguro de eliminar el documento ${docSeleccionado?.tipo}? Tendrás que volver a cargarlo para completar el expediente.`}
        confirmText="Sí, eliminar"
        loading={deleting}
        onCancel={() => setOpenConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
      />

      <SuccessDialog
        open={showSuccess}
        title="Operación exitosa"
        description="El expediente ha sido actualizado correctamente."
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}