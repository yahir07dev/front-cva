"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";
import SuccessDialog from "@/src/components/shared/SuccessDialog";
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

const DOCS_REQUERIDOS = ["RFC", "CURP", "NSS", "CONTRATO", "ACTA NACIMIENTO"];

export default function DetalleExpedientePage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [empleado, setEmpleado] = useState<any>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [docSeleccionado, setDocSeleccionado] = useState<Documento | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

    if (!file) return;
    if (file.type !== "application/pdf") {
      e.target.value = "";
      return;
    }

    setUploading(tipo);
    const filePath = `${id}/${tipo}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("Expediente")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploading(null);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("Expediente").getPublicUrl(filePath);

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

    if (!dbError) {
      setShowSuccess(true);
    }

    await fetchExpediente();
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

    const path = `${id}/${docSeleccionado.tipo}.pdf`;

    const { error: storageError } = await supabase.storage
      .from("Expediente")
      .remove([path]);

    const { error: dbError } = await supabase
      .from("expedientes")
      .delete()
      .eq("empleado_id", id)
      .eq("tipo", docSeleccionado.tipo);

    if (!storageError && !dbError) {
      await fetchExpediente();
      setShowSuccess(true);
    }

    setDeleting(false);
    setOpenConfirmDelete(false);
    setDocSeleccionado(null);
  };

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center w-full bg-white dark:bg-[#1a1d29]">
        <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      </div>
    );

  return (
    <>
      <div className="w-full min-h-full bg-white transition-colors duration-300 dark:bg-[#1a1d29] border-2 border-gray-100 dark:border-[#2d3142] rounded-2xl overflow-hidden shadow-sm">
        <header className="px-6 py-8 md:px-10 border-b border-gray-50 dark:border-[#2d3142] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#232734] transition-all text-gray-500"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 overflow-hidden flex items-center justify-center">
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

            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white capitalize">
                {empleado?.nombre} {empleado?.apellidos}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Expediente Digital
              </p>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-10">
          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-[#2d3142]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#232734] text-gray-400 text-xs font-bold uppercase tracking-widest">
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
                    <tr key={tipoDoc}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5" />
                          <span className="font-bold">{tipoDoc}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        {doc ? (
                          <span className="text-emerald-600 font-bold">
                            CARGADO
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold">
                            PENDIENTE
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        {doc ? doc.fecha_carga.slice(0, 10) : "---"}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-3 items-center">
                          {/* VER DOCUMENTO */}
                          {doc && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-[#232734] transition cursor-pointer"
                            >
                              <Eye className="w-5 h-5" />
                            </a>
                          )}

                          {/* SUBIR DOCUMENTO SOLO SI NO EXISTE */}
                          {!doc && (
                            <label className="p-2 rounded-lg text-gray-400 hover:text-green-500 hover:bg-gray-100 dark:hover:bg-[#232734] transition cursor-pointer">
                              {isUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Upload className="w-5 h-5" />
                              )}

                              <input
                                type="file"
                                className="hidden"
                                accept="application/pdf"
                                onChange={(e) => handleUpload(e, tipoDoc)}
                              />
                            </label>
                          )}

                          {/* ELIMINAR */}
                          {doc && (
                            <button
                              onClick={() => handleOpenDelete(tipoDoc)}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
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

      <ConfirmDialog
        open={openConfirmDelete}
        title="Eliminar documento"
        description={`¿Estás seguro de eliminar el documento ${docSeleccionado?.tipo}?`}
        confirmText="Sí, eliminar"
        loading={deleting}
        onCancel={() => setOpenConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
      />

      <SuccessDialog
        open={showSuccess}
        title="Operación exitosa"
        description="La operación se realizó correctamente."
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
