"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import {
  Target, GraduationCap, Loader2, ArrowRight,
  Clock, CheckCircle2, Calendar, PlayCircle, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

interface TareaPendiente {
  id: number;
  actividades: {
    titulo: string;
    fecha_limite: string | null;
    prioridad: "baja" | "media" | "alta";
  };
}

interface CursoPendiente {
  id: number;
  cursos: {
    titulo: string;
    duracion_minutos: number | null;
  };
}

export default function DashboardEmpleado() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");

  const [stats, setStats] = useState({
    tareasPendientes: 0,
    tareasCompletadas: 0,
    cursosPendientes: 0,
  });

  const [proximasTareas, setProximasTareas] = useState<TareaPendiente[]>([]);
  const [proximosCursos, setProximosCursos] = useState<CursoPendiente[]>([]);

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: perfil } = await supabase
          .from("empleados")
          .select("id, nombre")
          .eq("usuario_id", user.id)
          .single();

        if (perfil) {
          setNombre(perfil.nombre);

          const [tareasRaw, cursosRaw] = await Promise.all([
            supabase.from("asignacion_actividades")
              .select(`id, estado_individual, actividades ( titulo, fecha_limite, prioridad, estado )`)
              .eq("empleado_id", perfil.id),
            supabase.from("asignacion_cursos")
              .select(`id, estado, cursos ( titulo, duracion_minutos )`)
              .eq("empleado_id", perfil.id),
          ]);

          const misTareas = (tareasRaw.data || []) as any[];
          const misCursos = (cursosRaw.data || []) as any[];

          const pendientes = misTareas.filter(
            (t) => ["asignada", "en_progreso", "revision"].includes(t.estado_individual) && t.actividades?.estado !== "completada"
          );
          const completadas = misTareas.filter(
            (t) => t.estado_individual === "completada" || t.actividades?.estado === "completada"
          );
          const cursosPend = misCursos.filter((c) => c.estado !== "completado");

          setStats({
            tareasPendientes: pendientes.length,
            tareasCompletadas: completadas.length,
            cursosPendientes: cursosPend.length,
          });

          const tareasOrdenadas = pendientes
            .filter((t) => t.actividades)
            .sort((a, b) => {
              if (!a.actividades.fecha_limite) return 1;
              if (!b.actividades.fecha_limite) return -1;
              return new Date(a.actividades.fecha_limite).getTime() - new Date(b.actividades.fecha_limite).getTime();
            })
            .slice(0, 4);

          setProximasTareas(tareasOrdenadas);
          setProximosCursos(cursosPend.filter((c) => c.cursos).slice(0, 3));
        }
      } catch (error) {
        console.error("Error cargando dashboard de empleado", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyData();
  }, [supabase]);

  const getPrioridadConfig = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return { cls: "text-rose-600 bg-rose-100 dark:bg-rose-500/20 dark:text-rose-400", dot: "bg-rose-500", label: "Alta" };
      case "media":
        return { cls: "text-amber-600 bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400", dot: "bg-amber-500", label: "Media" };
      default:
        return { cls: "text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400", dot: "bg-emerald-500", label: "Baja" };
    }
  };

  // Completion ratio for progress ring
  const total = stats.tareasPendientes + stats.tareasCompletadas;
  const completionPct = total > 0 ? Math.round((stats.tareasCompletadas / total) * 100) : 0;
  const circumference = 2 * Math.PI * 20; // r=20
  const strokeDash = (completionPct / 100) * circumference;

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  const firstName = nombre ? nombre.split(" ")[0] : "";
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="h-full w-full overflow-y-auto scrollbar-hide pb-24">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes ringFill {
            from { stroke-dasharray: 0 ${circumference}; }
            to   { stroke-dasharray: ${strokeDash} ${circumference}; }
          }
          .anim-fade-up { animation: fadeUp 0.45s cubic-bezier(.22,.68,0,1.2) both; }
          .ring-anim { animation: ringFill 1s cubic-bezier(.22,.68,0,1.2) 0.5s both; }
        `
      }} />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 space-y-8">

        {/* ── HEADER ── */}
        <div
          className="anim-fade-up flex flex-col md:flex-row md:items-center justify-between gap-5 pb-7 border-b border-neutral-200/60 dark:border-neutral-800"
          style={{ animationDelay: "0ms" }}
        >
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight leading-none">
              {greeting()}{firstName ? `, ${firstName}` : ""} 👋
            </h1>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 font-medium pt-1">
              Aquí tienes el resumen de tu jornada laboral.
            </p>
          </div>

          {/* Date chip */}
          <div className="shrink-0 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 shadow-sm text-sm font-bold text-neutral-500 dark:text-neutral-400">
            <Calendar size={15} className="text-indigo-500" />
            {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>

        {/* ── KPI CARDS ── */}
        <div
          className="anim-fade-up grid grid-cols-1 sm:grid-cols-3 gap-4"
          style={{ animationDelay: "80ms" }}
        >
          {/* Card: Tareas por entregar */}
          <div className="group relative bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-amber-50 dark:bg-amber-500/5 rounded-full blur-3xl opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500" />
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10">
                <Clock size={18} className="text-amber-600 dark:text-amber-400" strokeWidth={2.2} />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-black text-neutral-900 dark:text-white tabular-nums leading-none mb-1">
                {stats.tareasPendientes}
              </p>
              <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
                Tareas por entregar
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Card: Completadas — with progress ring */}
          <div className="group relative bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-emerald-50 dark:bg-emerald-500/5 rounded-full blur-3xl opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.2} />
              </div>
              {/* Tiny progress ring */}
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-neutral-100 dark:text-neutral-800" />
                  <circle
                    cx="24" cy="24" r="20" fill="none"
                    stroke="currentColor" strokeWidth="4"
                    strokeLinecap="round"
                    className="text-emerald-500 ring-anim"
                    style={{ strokeDasharray: `${strokeDash} ${circumference}` }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                  {completionPct}%
                </span>
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-black text-neutral-900 dark:text-white tabular-nums leading-none mb-1">
                {stats.tareasCompletadas}
              </p>
              <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
                Tareas completadas
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Card: Cursos pendientes */}
          <div className="group relative bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-indigo-50 dark:bg-indigo-500/5 rounded-full blur-3xl opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500" />
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                <GraduationCap size={18} className="text-indigo-600 dark:text-indigo-400" strokeWidth={2.2} />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-black text-neutral-900 dark:text-white tabular-nums leading-none mb-1">
                {stats.cursosPendientes}
              </p>
              <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
                Cursos pendientes
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        {/* ── DETAIL LISTS ── */}
        <div
          className="anim-fade-up grid grid-cols-1 lg:grid-cols-2 gap-5"
          style={{ animationDelay: "200ms" }}
        >
          {/* ── ACTIVIDADES ── */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col">
            {/* Card header */}
            <div className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-0.5">Prioridad</p>
                <h2 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                  <Target size={18} className="text-amber-500" strokeWidth={2.5} />
                  Próximas Entregas
                </h2>
              </div>
              {stats.tareasPendientes > 0 && (
                <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  {stats.tareasPendientes} activas
                </span>
              )}
            </div>

            <div className="flex-1 flex flex-col p-4 gap-2">
              {proximasTareas.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-neutral-50 dark:bg-neutral-800/30 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700 my-2">
                  <CheckCircle2 size={30} className="text-emerald-400 mb-2.5" />
                  <p className="text-sm font-bold text-neutral-600 dark:text-neutral-400">¡Todo al día!</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">No tienes tareas pendientes.</p>
                </div>
              ) : (
                proximasTareas.map((tarea, i) => {
                  const p = getPrioridadConfig(tarea.actividades.prioridad);
                  const isUrgent = tarea.actividades.prioridad === "alta";
                  return (
                    <div
                      key={tarea.id || i}
                      className={`
                        group flex items-center gap-3.5 p-4 rounded-2xl border transition-all duration-200 cursor-default
                        ${isUrgent
                          ? "border-rose-100 dark:border-rose-500/20 bg-rose-50/40 dark:bg-rose-500/5 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                          : "border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50"
                        }
                      `}
                    >
                      {/* Priority dot */}
                      <div className={`shrink-0 w-2 h-2 rounded-full mt-0.5 ${p.dot}`} />

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-neutral-900 dark:text-white truncate leading-tight">
                          {tarea.actividades.titulo}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${p.cls}`}>
                            {p.label}
                          </span>
                          {tarea.actividades.fecha_limite && (
                            <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                              <Clock size={11} />
                              {new Date(tarea.actividades.fecha_limite).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                            </span>
                          )}
                        </div>
                      </div>

                      <ArrowUpRight
                        size={14}
                        className="shrink-0 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-400 dark:group-hover:text-neutral-500 transition-colors"
                      />
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-4 pb-4">
              <Link
                href="/dashboard/rendimiento/actividades"
                className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 font-bold text-sm text-neutral-600 dark:text-neutral-400 transition-all duration-200"
              >
                Ver todas las actividades
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* ── CURSOS ── */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col">
            {/* Card header */}
            <div className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-0.5">Formación</p>
                <h2 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                  <GraduationCap size={18} className="text-indigo-500" strokeWidth={2.5} />
                  Continuar Aprendiendo
                </h2>
              </div>
              {stats.cursosPendientes > 0 && (
                <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  {stats.cursosPendientes} pendientes
                </span>
              )}
            </div>

            <div className="flex-1 flex flex-col p-4 gap-2">
              {proximosCursos.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-neutral-50 dark:bg-neutral-800/30 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700 my-2">
                  <CheckCircle2 size={30} className="text-emerald-400 mb-2.5" />
                  <p className="text-sm font-bold text-neutral-600 dark:text-neutral-400">¡Al día con tu formación!</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Has completado todos tus cursos asignados.</p>
                </div>
              ) : (
                proximosCursos.map((curso, i) => (
                  <div
                    key={curso.id || i}
                    className="group flex items-center gap-3.5 p-4 rounded-2xl border border-indigo-100/70 dark:border-indigo-500/10 bg-indigo-50/30 dark:bg-indigo-500/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200 cursor-default"
                  >
                    {/* Icon */}
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <PlayCircle size={18} strokeWidth={2} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-neutral-900 dark:text-white truncate leading-tight">
                        {curso.cursos.titulo}
                      </p>
                      <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        {curso.cursos.duracion_minutos
                          ? `${curso.cursos.duracion_minutos} min`
                          : "Sin duración estimada"}
                      </p>
                    </div>

                    <ArrowUpRight
                      size={14}
                      className="shrink-0 text-indigo-300 dark:text-indigo-700 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors"
                    />
                  </div>
                ))
              )}
            </div>

            <div className="px-4 pb-4">
              <Link
                href="/dashboard/capacitacion"
                className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm text-neutral-600 dark:text-neutral-400 transition-all duration-200"
              >
                Ir a mis cursos
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}