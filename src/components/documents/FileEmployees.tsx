"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import {
  FileText,
  ArrowLeft,
  Eye,
  Upload,
  X as CloseIcon,
  FileCheck,
  FileClock,
  User,
  Loader2,
} from "lucide-react";

interface Documento {
  id?: string;
  tipo: string;
  nombre_archivo: string;
  fecha_carga: string;
  url: string;
}

const DOCS_REQUERIDOS = ["RFC", "CURP", "NSS", "CONTRATO"];

export default function DetalleExpedientePage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [empleado, setEmpleado] = useState<any>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetchExpediente();
  }, [id]);

  const fetchExpediente = async () => {
    const { data: empData } = await supabase
      .from("empleados")
      .select("nombre, apellidos, foto_perfil_url")
      .eq("id", id)
      .single();
    if (empData) setEmpleado(empData);

    const { data: docsData } = await supabase
      .from("expedientes")
      .select("*")
      .eq("empleado_id", id);
    if (docsData) setDocumentos(docsData);
    setLoading(false);
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: string,
  ) => {
    const file = e.target.files?.[0];

    // Validación de existencia y tipo de archivo (Solo PDF)
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Solo se permiten archivos en formato PDF.");
      e.target.value = "";
      return;
    }

    setUploading(tipo);
    const filePath = `${id}/${tipo}.pdf`;

    // 1. Subir al Storage "Expedientes"
    const { error: uploadError } = await supabase.storage
      .from("Expediente") // Nombre corregido
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("Error al subir archivo: " + uploadError.message);
      setUploading(null);
      return;
    }

    // 2. Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("Expediente").getPublicUrl(filePath);

    // 3. Registrar en la base de datos
    const { error: dbError } = await supabase.from("expedientes").upsert(
      {
        empleado_id: id,
        tipo: tipo,
        nombre_archivo: file.name,
        url: publicUrl,
        fecha_carga: new Date().toLocaleDateString("es-MX"),
      },
      { onConflict: "empleado_id, tipo" },
    );

    if (dbError) alert("Error en DB: " + dbError.message);

    await fetchExpediente();
    setUploading(null);
  };

  const handleDelete = async (tipo: string, url: string) => {
    if (!confirm(`¿Estás seguro de quitar el documento ${tipo}?`)) return;

    // Extraer la ruta correcta para borrar del Storage
    const path = `${id}/${tipo}.pdf`;

    const { error: storageError } = await supabase.storage
      .from("Expediente")
      .remove([path]);
    const { error: dbError } = await supabase
      .from("expedientes")
      .delete()
      .eq("empleado_id", id)
      .eq("tipo", tipo);

    if (!storageError && !dbError) {
      await fetchExpediente();
    } else {
      alert("Hubo un error al eliminar el archivo.");
    }
  };

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center w-full bg-white dark:bg-[#1a1d29]">
        <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      </div>
    );

  return (
    // CAMBIO 1: h-full flex flex-col min-h-0 para habilitar el scroll interno
    <div className="w-full h-full flex flex-col min-h-0 bg-white transition-colors duration-300 dark:bg-[#1a1d29] border-2 border-gray-100 dark:border-[#2d3142] rounded-2xl overflow-hidden shadow-sm">
      
      {/* HEADER: shrink-0 para que no se aplaste */}
      <header className="shrink-0 px-6 py-8 md:px-10 border-b border-gray-50 dark:border-[#2d3142] flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#232734] transition-all text-gray-500"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 overflow-hidden flex items-center justify-center shrink-0">
            {empleado?.foto_perfil_url ? (
              <img
                src={empleado.foto_perfil_url}
                alt="perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-indigo-400" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white capitalize truncate">
              {empleado?.nombre} {empleado?.apellidos}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              Expediente Digital
            </p>
          </div>
        </div>
      </header>

      {/* TABLA DE DOCUMENTOS */}
      {/* CAMBIO 2: flex-1 min-h-0 para que el main empuje el contenido y permita el overflow */}
      <main className="flex-1 min-h-0 p-6 md:p-10 flex flex-col">
        {/* CAMBIO 3: overflow-auto y clases de scrollbar */}
        <div className="overflow-auto rounded-2xl border border-gray-100 dark:border-[#2d3142] scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-[#3a3f55]">
          <table className="w-full text-left border-collapse relative">
            {/* CAMBIO 4: sticky top-0 z-10 para anclar la cabecera */}
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="bg-gray-50 dark:bg-[#232734] text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-100 dark:border-[#2d3142]">
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha de Carga</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#2d3142]">
              {DOCS_REQUERIDOS.map((tipoDoc) => {
                const doc = documentos.find((d) => d.tipo === tipoDoc);
                const isUploading = uploading === tipoDoc;

                return (
                  <tr
                    key={tipoDoc}
                    className="hover:bg-gray-50/50 dark:hover:bg-[#232734]/30 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${doc ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-700 dark:text-gray-200">
                          {tipoDoc}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      {doc ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit">
                          <FileCheck className="w-3.5 h-3.5" /> CARGADO
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full w-fit">
                          <FileClock className="w-3.5 h-3.5" /> PENDIENTE
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-500 dark:text-gray-400">
                      {doc ? doc.fecha_carga : "---"}
                    </td>

                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        {/* BOTÓN OJO (VISUALIZAR) */}
                        {doc && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-gray-400 hover:text-indigo-500 transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                        )}

                        {/* BOTÓN MODIFICAR / SUBIR */}
                        <label
                          className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            doc
                              ? "text-gray-500 bg-gray-100 hover:bg-gray-200 dark:bg-[#232734] dark:text-gray-400"
                              : "bg-indigo-600 text-white hover:bg-indigo-700"
                          }`}
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {doc ? "MODIFICAR" : "SUBIR"}
                          <input
                            type="file"
                            className="hidden"
                            accept="application/pdf"
                            onChange={(e) => handleUpload(e, tipoDoc)}
                            disabled={isUploading}
                          />
                        </label>

                        {/* BOTÓN X (ELIMINAR) */}
                        {doc && (
                          <button
                            onClick={() => handleDelete(tipoDoc, doc.url)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <CloseIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}