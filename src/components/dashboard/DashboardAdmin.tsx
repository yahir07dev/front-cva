"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import {
  Users, Target, Banknote, GraduationCap,
  DownloadCloud, Loader2, TrendingUp, CheckCircle2, AlertCircle,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export default function DashboardClient() {
  const supabase = createClient();
  const [loadingStats, setLoadingStats] = useState(true);
  const [backingUp, setBackingUp] = useState(false);
  const [backupExito, setBackupExito] = useState(false);

  const [stats, setStats] = useState({
    empleados: 0,
    actividadesPendientes: 0,
    cursosActivos: 0,
    nominasGeneradas: 0,
  });

  const [graphData, setGraphData] = useState<
    { label: string; count: number; percentage: number }[]
  >([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 6);
        fechaLimite.setHours(0, 0, 0, 0);

        const [emp, act, cur, nom, actSemanal] = await Promise.all([
          supabase.from("empleados").select("id", { count: "exact", head: true }).eq("estado", "activo").is("deleted_at", null),
          supabase.from("actividades").select("id", { count: "exact", head: true }).in("estado", ["pendiente", "en_progreso", "revision"]).is("deleted_at", null),
          supabase.from("cursos").select("id", { count: "exact", head: true }).eq("esta_activo", true).is("deleted_at", null),
          supabase.from("registros_nomina").select("id", { count: "exact", head: true }).is("deleted_at", null),
          supabase.from("actividades").select("created_at").gte("created_at", fechaLimite.toISOString()).is("deleted_at", null),
        ]);

        setStats({
          empleados: emp.count || 0,
          actividadesPendientes: act.count || 0,
          cursosActivos: cur.count || 0,
          nominasGeneradas: nom.count || 0,
        });

        const diasData = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            dateStr: d.toISOString().split("T")[0],
            label: d.toLocaleDateString("es-MX", { weekday: "short" }).substring(0, 3),
            count: 0,
          };
        });

        if (actSemanal.data) {
          actSemanal.data.forEach((actividad) => {
            const dStr = new Date(actividad.created_at).toISOString().split("T")[0];
            const diaMatch = diasData.find((d) => d.dateStr === dStr);
            if (diaMatch) diaMatch.count++;
          });
        }

        const maxCount = Math.max(...diasData.map((d) => d.count), 1);
        setGraphData(
          diasData.map((d) => ({
            label: d.label,
            count: d.count,
            percentage: Math.round((d.count / maxCount) * 100),
          }))
        );
      } catch (error) {
        console.error("Error cargando estadísticas", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [supabase]);

  const handleBackup = async () => {
    setBackingUp(true);
    setBackupExito(false);
    try {
      const [empleados, areas, roles, actividades, cursos, nominas] = await Promise.all([
        supabase.from("empleados").select("*").is("deleted_at", null),
        supabase.from("areas").select("*").is("deleted_at", null),
        supabase.from("roles").select("*").is("deleted_at", null),
        supabase.from("actividades").select("*").is("deleted_at", null),
        supabase.from("cursos").select("*").is("deleted_at", null),
        supabase.from("registros_nomina").select("*").is("deleted_at", null),
      ]);

      const backupData = {
        fecha_respaldo: new Date().toISOString(),
        datos: {
          empleados: empleados.data,
          areas: areas.data,
          roles: roles.data,
          actividades: actividades.data,
          cursos: cursos.data,
          nominas: nominas.data,
        },
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Backup_ComercialVA_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupExito(true);
      setTimeout(() => setBackupExito(false), 3000);
    } catch (error) {
      alert("Hubo un error al generar el respaldo.");
      console.error(error);
    } finally {
      setBackingUp(false);
    }
  };

  const kpis = [
    {
      label: "Empleados Activos",
      value: stats.empleados,
      icon: Users,
      color: "indigo",
      badge: null,
    },
    {
      label: "Actividades en Proceso",
      value: stats.actividadesPendientes,
      icon: Target,
      color: "amber",
      badge: stats.actividadesPendientes > 0 ? "Atención" : null,
    },
    {
      label: "Cursos Activos",
      value: stats.cursosActivos,
      icon: GraduationCap,
      color: "rose",
      badge: null,
    },
    {
      label: "Nóminas Generadas",
      value: stats.nominasGeneradas,
      icon: Banknote,
      color: "emerald",
      badge: null,
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; glow: string; bar: string; badgeBg: string; badgeText: string }> = {
    indigo: {
      bg: "bg-indigo-50 dark:bg-indigo-500/10",
      icon: "text-indigo-600 dark:text-indigo-400",
      glow: "bg-indigo-100 dark:bg-indigo-500/5",
      bar: "bg-indigo-500",
      badgeBg: "",
      badgeText: "",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-500/10",
      icon: "text-amber-600 dark:text-amber-400",
      glow: "bg-amber-100 dark:bg-amber-500/5",
      bar: "bg-amber-500",
      badgeBg: "bg-amber-100 dark:bg-amber-500/20",
      badgeText: "text-amber-600 dark:text-amber-400",
    },
    rose: {
      bg: "bg-rose-50 dark:bg-rose-500/10",
      icon: "text-rose-600 dark:text-rose-400",
      glow: "bg-rose-100 dark:bg-rose-500/5",
      bar: "bg-rose-500",
      badgeBg: "",
      badgeText: "",
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      icon: "text-emerald-600 dark:text-emerald-400",
      glow: "bg-emerald-100 dark:bg-emerald-500/5",
      bar: "bg-emerald-500",
      badgeBg: "",
      badgeText: "",
    },
  };

  const modules = [
    {
      href: "/dashboard/personal/empleados",
      label: "Gestión de Personal",
      sub: "Expedientes y contratos",
      icon: Users,
      color: "indigo",
    },
    {
      href: "/dashboard/rendimiento/actividades",
      label: "Rendimiento",
      sub: "Objetivos y evaluación",
      icon: Target,
      color: "amber",
    },
    {
      href: "/dashboard/nomina/generar",
      label: "Nómina",
      sub: "Procesamiento de pagos",
      icon: Banknote,
      color: "emerald",
    },
    {
      href: "/dashboard/capacitacion",
      label: "Capacitación",
      sub: "Cursos y formación",
      icon: GraduationCap,
      color: "rose",
    },
  ];

  const moduleHover: Record<string, string> = {
    indigo: "hover:border-indigo-400/40 dark:hover:border-indigo-400/30 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/5",
    amber: "hover:border-amber-400/40 dark:hover:border-amber-400/30 hover:bg-amber-50/60 dark:hover:bg-amber-500/5",
    emerald: "hover:border-emerald-400/40 dark:hover:border-emerald-400/30 hover:bg-emerald-50/60 dark:hover:bg-emerald-500/5",
    rose: "hover:border-rose-400/40 dark:hover:border-rose-400/30 hover:bg-rose-50/60 dark:hover:bg-rose-500/5",
  };

  return (
    <div className="h-full w-full overflow-y-auto scrollbar-hide pb-24">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer { 100% { transform: translateX(100%); } }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes barGrow {
            from { transform: scaleY(0); }
            to   { transform: scaleY(1); }
          }
          .anim-fade-up { animation: fadeUp 0.45s cubic-bezier(.22,.68,0,1.2) both; }
          .bar-grow { transform-origin: bottom; animation: barGrow 0.6s cubic-bezier(.22,.68,0,1.2) both; }
        `
      }} />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 space-y-8">

        {/* ── HEADER ── */}
        <div
          className="anim-fade-up flex flex-col md:flex-row md:items-start justify-between gap-5"
          style={{ animationDelay: "0ms" }}
        >
          <div className="space-y-1">
            {/* Pill de fecha */}
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              {new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight leading-none">
              Resumen del Sistema
            </h1>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 font-medium pt-1">
              Vista general de tu operación en tiempo real
            </p>
          </div>

          <button
            onClick={handleBackup}
            disabled={backingUp}
            className={`
              relative overflow-hidden shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-[13px]
              shadow-lg transition-all duration-200 active:scale-95
              ${backupExito
                ? "bg-emerald-500 text-white shadow-emerald-500/25"
                : "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 shadow-black/15 dark:shadow-white/10"
              }
            `}
          >
            {backingUp ? (
              <Loader2 size={16} className="animate-spin shrink-0" />
            ) : backupExito ? (
              <CheckCircle2 size={16} className="shrink-0" />
            ) : (
              <DownloadCloud size={16} className="shrink-0" />
            )}
            {backingUp ? "Generando…" : backupExito ? "¡Respaldo exitoso!" : "Respaldo Local"}

            {!backingUp && !backupExito && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-[shimmer_1.8s_infinite]" />
            )}
          </button>
        </div>

        {/* ── KPI CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => {
            const c = colorMap[kpi.color];
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="anim-fade-up group relative bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/70 dark:border-neutral-800 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                style={{ animationDelay: `${80 + idx * 60}ms` }}
              >
                {/* Glow blob */}
                <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full blur-3xl opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 ${c.glow}`} />

                {/* Top row */}
                <div className="flex items-center justify-between mb-5 relative z-10">
                  <div className={`p-2.5 rounded-xl ${c.bg}`}>
                    <Icon size={18} className={c.icon} strokeWidth={2.2} />
                  </div>
                  {kpi.badge && (
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badgeBg} ${c.badgeText}`}>
                      <AlertCircle size={9} />
                      {kpi.badge}
                    </span>
                  )}
                </div>

                {/* Number */}
                <div className="relative z-10">
                  {loadingStats ? (
                    <div className="h-9 w-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse mb-2" />
                  ) : (
                    <p className="text-4xl font-black text-neutral-900 dark:text-white tabular-nums leading-none mb-1">
                      {kpi.value.toLocaleString("es-MX")}
                    </p>
                  )}
                  <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
                    {kpi.label}
                  </p>
                </div>

                {/* Bottom thin accent bar */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${c.bar}`} />
              </div>
            );
          })}
        </div>

        {/* ── CENTRAL SECTION ── */}
        <div
          className="anim-fade-up grid grid-cols-1 lg:grid-cols-5 gap-5"
          style={{ animationDelay: "380ms" }}
        >
          {/* ── MÓDULOS (left, spans 3 cols) ── */}
          <div className="lg:col-span-3 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-0.5">Navegación</p>
              <h2 className="text-lg font-black text-neutral-900 dark:text-white">Módulos Principales</h2>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {modules.map((mod) => {
                const Icon = mod.icon;
                const c = colorMap[mod.color];
                return (
                  <Link
                    key={mod.href}
                    href={mod.href}
                    className={`
                      group flex items-center gap-4 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800
                      transition-all duration-200 ${moduleHover[mod.color]}
                    `}
                  >
                    <div className={`shrink-0 p-3 rounded-xl ${c.bg} group-hover:scale-105 transition-transform duration-200`}>
                      <Icon size={19} className={c.icon} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[14px] text-neutral-900 dark:text-white leading-tight">{mod.label}</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">{mod.sub}</p>
                    </div>
                    <ArrowUpRight
                      size={15}
                      className="shrink-0 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── CHART (right, spans 2 cols) ── */}
          <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col">
            {/* Card header */}
            <div className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-0.5">Últimos 7 días</p>
                <h2 className="text-lg font-black text-neutral-900 dark:text-white">Actividades</h2>
              </div>
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                <TrendingUp size={16} className="text-indigo-500 dark:text-indigo-400" />
              </div>
            </div>

            <div className="flex-1 px-6 pt-5 pb-6 flex flex-col justify-end">
              {loadingStats ? (
                <div className="flex-1 flex items-center justify-center py-10">
                  <Loader2 size={22} className="animate-spin text-neutral-300 dark:text-neutral-700" />
                </div>
              ) : (
                <>
                  {/* Total summary */}
                  <div className="mb-5 flex items-end gap-2">
                    <span className="text-3xl font-black text-neutral-900 dark:text-white tabular-nums leading-none">
                      {graphData.reduce((s, d) => s + d.count, 0)}
                    </span>
                    <span className="text-xs font-semibold text-neutral-400 mb-0.5">actividades</span>
                  </div>

                  {/* Bars */}
                  <div className="flex items-end justify-between gap-1.5 h-28">
                    {graphData.map((d, i) => {
                      const isMax = d.percentage === 100 && d.count > 0;
                      return (
                        <div key={i} className="w-full flex flex-col items-center gap-1.5 group cursor-pointer">
                          {/* Tooltip count */}
                          <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-indigo-500 dark:text-indigo-400 transition-opacity duration-150 min-h-[14px]">
                            {d.count > 0 ? d.count : ""}
                          </span>
                          {/* Bar */}
                          <div
                            className={`
                              bar-grow w-full rounded-t-lg transition-colors duration-200
                              ${d.count === 0
                                ? "bg-neutral-100 dark:bg-neutral-800"
                                : isMax
                                  ? "bg-indigo-500 group-hover:bg-indigo-400"
                                  : "bg-indigo-200 dark:bg-indigo-500/30 group-hover:bg-indigo-400 dark:group-hover:bg-indigo-400"
                              }
                            `}
                            style={{
                              height: `${Math.max(d.percentage, 6)}%`,
                              animationDelay: `${i * 55}ms`,
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* X-axis labels */}
                  <div className="flex justify-between mt-2.5">
                    {graphData.map((d, i) => (
                      <span key={i} className="text-[10px] font-bold text-neutral-400 dark:text-neutral-600 uppercase w-full text-center">
                        {d.label}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}