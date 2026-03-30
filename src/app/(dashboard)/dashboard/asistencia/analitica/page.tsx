"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import { evaluarPuntualidad, evaluarComida } from "@/src/utils/attendance";
import {
  Trophy,
  AlertTriangle,
  Clock,
  Utensils,
  TrendingUp,
  ChevronRight,
  Loader2,
  Calendar,
  History,
} from "lucide-react";

// --- Interfaces ---
interface RankingItem {
  nombre_completo: string;
  valor: number;
  extra: string;
}

export default function ModuloAnalitica() {
  const [loading, setLoading] = useState(true);
  const [diasRango, setDiasRango] = useState(7); // Por defecto 7 días
  const [rankings, setRankings] = useState<{
    puntualidad: RankingItem[];
    tolerancia: RankingItem[];
    retardos: RankingItem[];
    comidaExcesiva: RankingItem[];
  }>({ puntualidad: [], tolerancia: [], retardos: [], comidaExcesiva: [] });

  useEffect(() => {
    generarAnalitica();
  }, [diasRango]);

  const generarAnalitica = async () => {
    setLoading(true);

    // Calcular la fecha de inicio basada en el rango seleccionado
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasRango);
    const fechaISO = fechaLimite.toISOString();

    const { data: asistencias, error } = await supabase
      .from("asistencias")
      .select(`*, empleados ( nombre, apellidos )`)
      .gte("fecha", fechaISO) // Validación de rango de tiempo
      .order("fecha", { ascending: true });

    if (error || !asistencias) {
      setLoading(false);
      return;
    }

    const stats: Record<number, any> = {};

    asistencias.forEach((reg: any) => {
      const id = reg.empleado_id;
      if (!stats[id]) {
        stats[id] = {
          nombre: `${reg.empleados.nombre} ${reg.empleados.apellidos}`,
          conteoPuntual: 0,
          conteoTolerancia: 0,
          conteoRetardos: 0,
          excesosComidaMinutos: 0,
          lastComidaEntrada: null,
        };
      }

      const fechaObj = new Date(reg.fecha);

      if (reg.tipo === "asistencia" && reg.accion === "entrada") {
        const estatus = evaluarPuntualidad(fechaObj);
        if (estatus === "A tiempo") stats[id].conteoPuntual++;
        if (estatus === "Tolerancia") stats[id].conteoTolerancia++;
        if (estatus === "Retardo") stats[id].conteoRetardos++;
      }

      if (reg.tipo === "comida") {
        if (reg.accion === "entrada") {
          stats[id].lastComidaEntrada = fechaObj;
        } else if (reg.accion === "salida" && stats[id].lastComidaEntrada) {
          const estatusComida = evaluarComida(
            stats[id].lastComidaEntrada,
            fechaObj,
          );
          if (estatusComida === "Excedido") {
            const diffMinutos =
              (fechaObj.getTime() - stats[id].lastComidaEntrada.getTime()) /
              60000;
            stats[id].excesosComidaMinutos += diffMinutos - 45;
          }
          stats[id].lastComidaEntrada = null;
        }
      }
    });

    const rawData = Object.values(stats);

    setRankings({
      puntualidad: [...rawData]
        .filter((i) => i.conteoPuntual > 0)
        .sort((a, b) => b.conteoPuntual - a.conteoPuntual)
        .slice(0, 5)
        .map((i) => ({
          nombre_completo: i.nombre,
          valor: i.conteoPuntual,
          extra: "Puntuales",
        })),

      retardos: [...rawData]
        .filter((i) => i.conteoRetardos > 0)
        .sort((a, b) => b.conteoRetardos - a.conteoRetardos)
        .slice(0, 5)
        .map((i) => ({
          nombre_completo: i.nombre,
          valor: i.conteoRetardos,
          extra: "Retardos",
        })),

      tolerancia: [...rawData]
        .filter((i) => i.conteoTolerancia > 0)
        .sort((a, b) => b.conteoTolerancia - a.conteoTolerancia)
        .slice(0, 5)
        .map((i) => ({
          nombre_completo: i.nombre,
          valor: i.conteoTolerancia,
          extra: "Usos",
        })),

      comidaExcesiva: [...rawData]
        .filter((i) => i.excesosComidaMinutos > 0)
        .sort((a, b) => b.excesosComidaMinutos - a.excesosComidaMinutos)
        .slice(0, 5)
        .map((i) => ({
          nombre_completo: i.nombre,
          valor: Math.round(i.excesosComidaMinutos),
          extra: "Min. extra",
        })),
    });

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0e14] p-6 md:p-12 transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header con Selector de Rango */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
              Analítica <span className="text-indigo-600">.</span>
            </h1>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold uppercase text-xs tracking-widest">
              <History className="w-3 h-3" />
              Basado en los últimos{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                {diasRango} días
              </span>
            </div>
          </div>

          {/* Selector de Rango Minimalista */}
          <div className="flex bg-white dark:bg-[#1a1d29] p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            {[7, 15, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDiasRango(d)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  diasRango === d
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                }`}
              >
                {d === 30 ? "Mes" : `${d}D`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            {/* Grid de Rankings Superiores */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <RankingCard
                title="Puntualidad"
                subtitle="Más constantes"
                icon={<Trophy className="w-5 h-5 text-emerald-500" />}
                data={rankings.puntualidad}
                color="emerald"
              />
              <RankingCard
                title="Retardos"
                subtitle="Alertas críticas"
                icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
                data={rankings.retardos}
                color="red"
              />
              <RankingCard
                title="Tolerancia"
                subtitle="Zona de 5 min"
                icon={<Clock className="w-5 h-5 text-amber-500" />}
                data={rankings.tolerancia}
                color="amber"
              />
            </div>

            {/* Sección de Comida - Top 5 Horizontal */}
            <div className="bg-white dark:bg-[#1a1d29] rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Utensils className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    Top 5 Excesos Comida
                  </h2>
                  <p className="text-gray-500 text-sm font-bold tracking-tight">
                    Minutos acumulados por encima de los 45 Minutos permitidos.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {rankings.comidaExcesiva.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-6 bg-gray-50 dark:bg-black/30 rounded-[2rem] border border-transparent hover:border-indigo-500/30 transition-all group"
                  >
                    <p className="text-3xl font-black text-blue-500 dark:text-blue-400 mb-2">
                      #{idx + 1}
                    </p>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                      {item.nombre_completo}
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingUp className="w-3 h-3 text-red-500" />
                      <span className="text-xs font-black text-red-500">
                        {item.valor} min
                      </span>
                    </div>
                  </div>
                ))}
                {rankings.comidaExcesiva.length === 0 && (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center bg-gray-50 dark:bg-black/10 rounded-4xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                    <Utensils className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Sin excesos de comida
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- Subcomponente: Ranking Card ---
function RankingCard({ title, subtitle, icon, data, color }: any) {
  const colorMap: any = {
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  };

  return (
    <div className="bg-white dark:bg-[#1a1d29] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col min-h-[400px]">
      <div className="flex items-center gap-3 mb-1">
        <div className={`p-2 rounded-xl ${colorMap[color]}`}>{icon}</div>
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          {title}
        </h3>
      </div>
      <p className="text-gray-900 dark:text-white font-black text-xl mb-8">
        {subtitle}
      </p>

      <div className="space-y-6 flex-1">
        {data.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-gray-300 dark:text-gray-700">
                0{idx + 1}
              </span>
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 transition-colors">
                  {item.nombre_completo}
                </p>
                <p className="text-[10px] font-black text-gray-400 uppercase">
                  {item.valor} {item.extra}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-200 dark:text-gray-800 opacity-0 group-hover:opacity-100 transition-all" />
          </div>
        ))}

        {data.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center py-10">
            <div className="w-16 h-16 bg-gray-50 dark:bg-black/20 rounded-full flex items-center justify-center mb-4">
              {icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Sin registros
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
