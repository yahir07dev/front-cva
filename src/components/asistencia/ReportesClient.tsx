"use client";

import { useState, useEffect, useRef } from "react";
import { evaluarPuntualidad, evaluarComida, calcularLapso } from "@/src/lib/utils/attendance";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Users, Clock, CheckCircle, AlertCircle, XCircle, Loader2 } from "lucide-react";
import AlertDialog from "@/src/components/shared/AlertDialog";
import { getRegistrosAsistenciaAction } from "@/src/actions/asistencia/reportesActions";

interface FilaReporte {
  empleado_id: number;
  nombre_completo: string;
  fecha: string;
  entrada: Date | null;
  salida: Date | null;
  lapso: string;
  estatus: string;
}

interface Empleado {
  id: number;
  nombre: string;
  apellidos: string;
}

// ─── Componente: EmpleadoCombobox ──────────────────────────────────────────────
function EmpleadoCombobox({ empleados, seleccionados, onChange }: { empleados: Empleado[]; seleccionados: number[]; onChange: (ids: number[]) => void; }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const todosActivos = seleccionados.length === 0;
  const filtrados = empleados.filter((e) => `${e.nombre} ${e.apellidos}`.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false); setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`min-h-12 w-full flex flex-wrap items-center gap-2 px-4 py-2 rounded-2xl border-2 transition-all duration-200 cursor-text ${
          open ? "border-fuchsia-500 ring-4 ring-fuchsia-500/10 bg-white dark:bg-neutral-900" : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
        }`}
        onClick={() => setOpen(true)}
      >
        <Users className="w-4 h-4 text-neutral-400 mr-1" />
        {todosActivos ? (
          <span className="text-sm text-neutral-400 select-none">Todos los empleados</span>
        ) : (
          empleados.filter((e) => seleccionados.includes(e.id)).map((e) => (
            <span key={e.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-fuchsia-600 text-white text-[11px] font-bold uppercase tracking-wider">
              {e.nombre}
              <button onClick={(ev) => { ev.stopPropagation(); onChange(seleccionados.filter((s) => s !== e.id)); }} className="hover:text-fuchsia-200 cursor-pointer">×</button>
            </span>
          ))
        )}
        <input type="text" value={query} onChange={(e) => { setQuery(e.target.value); setOpen(true); }} className="flex-1 min-w-[60px] text-sm outline-none bg-transparent text-neutral-900 dark:text-white" />
      </div>
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
          <button type="button" onClick={() => { onChange([]); setOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${todosActivos ? "bg-fuchsia-600 text-white" : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}>
            <div className={`w-4 h-4 rounded border-2 ${todosActivos ? "border-white" : "border-neutral-300 dark:border-neutral-600"}`} />
            TODOS LOS EMPLEADOS
          </button>
          <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 border-t border-neutral-100 dark:border-neutral-800">
            {filtrados.map((emp) => {
              const selected = seleccionados.includes(emp.id);
              return (
                <button key={emp.id} type="button" onClick={() => { if (selected) onChange(seleccionados.filter((s) => s !== emp.id)); else onChange([...seleccionados, emp.id]); }} className={`w-full flex items-center gap-3 px-4 py-3 text-sm cursor-pointer transition-colors ${selected ? "bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400 font-bold" : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}>
                  <div className={`w-4 h-4 rounded border-2 transition-colors ${selected ? "border-fuchsia-600 bg-fuchsia-600" : "border-neutral-300 dark:border-neutral-600"}`} />
                  {emp.nombre} {emp.apellidos}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componente: StatusBadge ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    "A tiempo": { bg: "bg-fuchsia-50 dark:bg-fuchsia-500/10", text: "text-fuchsia-600 dark:text-fuchsia-400" },
    "En límite": { bg: "bg-fuchsia-50 dark:bg-fuchsia-500/10", text: "text-fuchsia-600 dark:text-fuchsia-400" },
    "Tolerancia": { bg: "bg-neutral-100 dark:bg-neutral-800", text: "text-neutral-600 dark:text-neutral-400" },
    "Retardo": { bg: "bg-pink-50 dark:bg-pink-500/10", text: "text-pink-600 dark:text-pink-400" },
    "Excedido": { bg: "bg-pink-50 dark:bg-pink-500/10", text: "text-pink-600 dark:text-pink-400" },
    "Incompleto": { bg: "bg-neutral-100 dark:bg-neutral-800", text: "text-neutral-500 dark:text-neutral-400" },
  };
  const style = map[status] ?? { bg: "bg-neutral-100 dark:bg-neutral-800", text: "text-neutral-500 dark:text-neutral-400" };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${style.bg} ${style.text}`}>
      {status}
    </span>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function ReportesClient({ initialEmpleados }: { initialEmpleados: Empleado[] }) {
  const [reporte, setReporte] = useState<FilaReporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<"asistencia" | "comida">("asistencia");
  const [tipoMostrado, setTipoMostrado] = useState<"asistencia" | "comida">("asistencia");
  const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState<number[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const formatTime = (d: Date | null) => d ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }) : "—";

  const exportarPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const nombreEmpresa = "Comercial V.A.";
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(nombreEmpresa, 14, 15);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Reporte de: ${tipoMostrado === "asistencia" ? "Asistencia" : "Comida"}`, 14, 22);
        doc.text(`Intervalo: ${fechaInicio} al ${fechaFin}`, 14, 28);
        doc.text(`Registros totales: ${reporte.length}`, 60, 22);

        autoTable(doc, {
          startY: 34,
          head: [["Fecha", "Empleado", "Entrada", "Salida", "Duración", "Estatus"]],
          body: reporte.map((r) => [r.fecha, r.nombre_completo, formatTime(r.entrada), formatTime(r.salida), r.lapso, r.estatus]),
          // Color fuchsia oscuro para el encabezado del PDF
          headStyles: { fillColor: [192, 38, 211], textColor: [255, 255, 255] }, 
        });

        doc.save(`Reporte_${tipoMostrado}_${fechaInicio}.pdf`);
      } catch (e) {
        console.error("Error al exportar:", e);
      } finally {
        setIsExporting(false);
      }
    }, 150);
  };

  const generarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      setShowErrorModal(true);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    setTipoMostrado(tipoFiltro);

    try {
      // 🚀 LLAMADA A LA SERVER ACTION
      const data = await getRegistrosAsistenciaAction(fechaInicio, fechaFin, tipoFiltro, empleadosSeleccionados);

      const filasProcesadas: FilaReporte[] = [];
      const estadosAbiertos: Record<number, any> = {};

      data.forEach((registro: any) => {
        const empId = registro.empleado_id;
        const nombreCompleto = `${registro.empleados.nombre} ${registro.empleados.apellidos}`;
        const fechaObj = new Date(registro.fecha);
        const fechaDia = fechaObj.toLocaleDateString("en-CA");

        if (registro.accion === "entrada") {
          if (estadosAbiertos[empId]) {
            const item = estadosAbiertos[empId];
            filasProcesadas.push({
              ...item, salida: null, lapso: "—",
              estatus: tipoFiltro === "asistencia" ? evaluarPuntualidad(item.entrada) : "Incompleto",
            });
          }
          estadosAbiertos[empId] = { empleado_id: empId, nombre_completo: nombreCompleto, fecha: fechaDia, entrada: fechaObj };
        } else if (registro.accion === "salida") {
          if (estadosAbiertos[empId]) {
            const item = estadosAbiertos[empId];
            filasProcesadas.push({
              ...item, salida: fechaObj, lapso: calcularLapso(item.entrada, fechaObj, tipoFiltro),
              estatus: tipoFiltro === "asistencia" ? evaluarPuntualidad(item.entrada) : evaluarComida(item.entrada, fechaObj),
            });
            delete estadosAbiertos[empId];
          } else {
            filasProcesadas.push({ empleado_id: empId, nombre_completo: nombreCompleto, fecha: fechaDia, entrada: null, salida: fechaObj, lapso: "—", estatus: "Sin entrada" });
          }
        }
      });

      Object.values(estadosAbiertos).forEach((item: any) => {
        filasProcesadas.push({ ...item, salida: null, lapso: "—", estatus: tipoFiltro === "asistencia" ? evaluarPuntualidad(item.entrada) : "En curso" });
      });

      setReporte(filasProcesadas.reverse());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const stats = reporte.reduce(
    (acc, curr) => {
      if (curr.estatus === "A tiempo" || curr.estatus === "En límite") acc.aTiempo++;
      if (curr.estatus === "Tolerancia") acc.tolerancia++;
      if (curr.estatus === "Retardo" || curr.estatus === "Excedido") acc.retardos++;
      return acc;
    },
    { aTiempo: 0, tolerancia: 0, retardos: 0 },
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AlertDialog open={showErrorModal} title="Faltan datos" description="Por favor, selecciona una fecha de inicio y una fecha de fin." onClose={() => setShowErrorModal(false)} />

      {/* CONTENEDOR CON SCROLL */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800 p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">Reportes de Asistencia</h1>
              <p className="text-neutral-500 dark:text-neutral-400 font-medium">Control de puntualidad e historial.</p>
            </div>
            {hasSearched && reporte.length > 0 && (
              <button onClick={exportarPDF} disabled={isExporting} className={`flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl ${isExporting ? "bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed" : "bg-fuchsia-600 text-white hover:bg-fuchsia-500 hover:scale-105 active:scale-95"}`}>
                {isExporting ? <><Loader2 className="w-5 h-5 animate-spin" /> GENERANDO...</> : <><Download className="w-5 h-5" /> EXPORTAR PDF</>}
              </button>
            )}
          </div>

          {/* STATS */}
          {hasSearched && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border-2 border-neutral-100 dark:border-neutral-800/60 flex items-center gap-5 shadow-sm">
                <div className="w-14 h-14 bg-fuchsia-50 dark:bg-fuchsia-500/10 rounded-2xl flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400"><CheckCircle className="w-8 h-8" /></div>
                <div><p className="text-xs font-black text-neutral-400 uppercase tracking-widest">A Tiempo</p><p className="text-3xl font-black text-neutral-900 dark:text-white">{stats.aTiempo}</p></div>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border-2 border-neutral-100 dark:border-neutral-800/60 flex items-center gap-5 shadow-sm">
                <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center text-neutral-600 dark:text-neutral-400"><AlertCircle className="w-8 h-8" /></div>
                <div><p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Tolerancia</p><p className="text-3xl font-black text-neutral-900 dark:text-white">{stats.tolerancia}</p></div>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border-2 border-neutral-100 dark:border-neutral-800/60 flex items-center gap-5 shadow-sm">
                <div className="w-14 h-14 bg-pink-50 dark:bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-600 dark:text-pink-400"><XCircle className="w-8 h-8" /></div>
                <div><p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Retardos</p><p className="text-3xl font-black text-neutral-900 dark:text-white">{stats.retardos}</p></div>
              </div>
            </div>
          )}

          {/* FILTERS PANEL */}
          <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border-2 border-neutral-100 dark:border-neutral-800/60 p-6 md:p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end">
              <div className="lg:col-span-4 space-y-3">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Empleados</label>
                <EmpleadoCombobox empleados={initialEmpleados} seleccionados={empleadosSeleccionados} onChange={setEmpleadosSeleccionados} />
              </div>
              <div className="lg:col-span-3 space-y-3">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Categoría</label>
                <div className="flex p-1.5 bg-neutral-100 dark:bg-black/20 rounded-[1.25rem] border-2 border-neutral-200/50 dark:border-neutral-800">
                  {(["asistencia", "comida"] as const).map((t) => (
                    <button key={t} onClick={() => setTipoFiltro(t)} className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${tipoFiltro === t ? "bg-white dark:bg-neutral-800 text-fuchsia-600 dark:text-fuchsia-400 shadow-md" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"}`}>
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-3 space-y-3">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Período</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer text-neutral-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" />
                  <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer text-neutral-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" />
                </div>
              </div>
              <div className="lg:col-span-2">
                <button onClick={generarReporte} disabled={loading} className="w-full py-4 bg-fuchsia-600 text-white rounded-[1.25rem] font-black text-sm hover:bg-fuchsia-500 shadow-lg shadow-fuchsia-500/20 cursor-pointer disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "BUSCAR"}
                </button>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border-2 border-neutral-100 dark:border-neutral-800/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-black/20 border-b-2 border-neutral-100 dark:border-neutral-800/60">
                    {["Fecha", "Empleado", "Entrada", "Salida", "Duración", "Estatus"].map((h) => (
                      <th key={h} className="px-6 py-5 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
                  {reporte.map((fila, i) => (
                    <tr key={i} className={`hover:bg-neutral-50/50 dark:hover:bg-white/[0.02] transition-colors ${fila.estatus === "Retardo" || fila.estatus === "Excedido" ? "bg-pink-50/30 dark:bg-pink-900/10" : ""}`}>
                      <td className="px-6 py-4 text-sm font-medium text-neutral-500 dark:text-neutral-400 tabular-nums">{fila.fecha}</td>
                      <td className="px-6 py-4"><span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{fila.nombre_completo}</span></td>
                      <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 tabular-nums">{formatTime(fila.entrada)}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 tabular-nums">{formatTime(fila.salida)}</td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 font-black tabular-nums ${fila.estatus === "Retardo" || fila.estatus === "Excedido" ? "text-pink-500" : "text-fuchsia-600 dark:text-fuchsia-400"}`}>
                          <Clock className="w-3 h-3" /> {fila.lapso}
                        </div>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={fila.estatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}