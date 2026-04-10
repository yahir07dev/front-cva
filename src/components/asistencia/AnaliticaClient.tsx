"use client";

import { useState, useEffect } from "react";
import { evaluarPuntualidad, evaluarComida } from "@/src/lib/utils/attendance";
import { getAnaliticaAsistenciaAction } from "@/src/actions/asistencia/analiticaActions";
import {
  Trophy, AlertTriangle, Clock, Utensils, TrendingUp, ChevronRight, Loader2, History
} from "lucide-react";

interface RankingItem {
  nombre_completo: string;
  valor: number;
  extra: string;
}

export default function AnaliticaClient({ initialAsistencias }: { initialAsistencias: any[] }) {
  const [loading, setLoading] = useState(false);
  const [diasRango, setDiasRango] = useState(7); 

  const [rankings, setRankings] = useState<{
    puntualidad: RankingItem[];
    tolerancia: RankingItem[];
    retardos: RankingItem[];
    comidaExcesiva: RankingItem[];
  }>({ puntualidad: [], tolerancia: [], retardos: [], comidaExcesiva: [] });

  const procesarDatos = (asistencias: any[]) => {
    const stats: Record<number, any> = {};

    asistencias.forEach((reg: any) => {
      const id = reg.empleado_id;
      if (!stats[id]) {
        stats[id] = {
          nombre: `${reg.empleados.nombre} ${reg.empleados.apellidos}`,
          conteoPuntual: 0, conteoTolerancia: 0, conteoRetardos: 0, excesosComidaMinutos: 0, lastComidaEntrada: null,
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
          const estatusComida = evaluarComida(stats[id].lastComidaEntrada, fechaObj);
          if (estatusComida === "Excedido") {
            const diffMinutos = (fechaObj.getTime() - stats[id].lastComidaEntrada.getTime()) / 60000;
            stats[id].excesosComidaMinutos += diffMinutos - 45;
          }
          stats[id].lastComidaEntrada = null;
        }
      }
    });

    const rawData = Object.values(stats);

    setRankings({
      puntualidad: [...rawData].filter((i) => i.conteoPuntual > 0).sort((a, b) => b.conteoPuntual - a.conteoPuntual).slice(0, 5).map((i) => ({ nombre_completo: i.nombre, valor: i.conteoPuntual, extra: "Puntuales" })),
      retardos: [...rawData].filter((i) => i.conteoRetardos > 0).sort((a, b) => b.conteoRetardos - a.conteoRetardos).slice(0, 5).map((i) => ({ nombre_completo: i.nombre, valor: i.conteoRetardos, extra: "Retardos" })),
      tolerancia: [...rawData].filter((i) => i.conteoTolerancia > 0).sort((a, b) => b.conteoTolerancia - a.conteoTolerancia).slice(0, 5).map((i) => ({ nombre_completo: i.nombre, valor: i.conteoTolerancia, extra: "Usos" })),
      comidaExcesiva: [...rawData].filter((i) => i.excesosComidaMinutos > 0).sort((a, b) => b.excesosComidaMinutos - a.excesosComidaMinutos).slice(0, 5).map((i) => ({ nombre_completo: i.nombre, valor: Math.round(i.excesosComidaMinutos), extra: "Min. extra" })),
    });
  }

  useEffect(() => {
    procesarDatos(initialAsistencias);
  }, [initialAsistencias]);

  useEffect(() => {
    if (diasRango === 7) return; 
    const fetchNuevaData = async () => {
      setLoading(true);
      try {
        const newData = await getAnaliticaAsistenciaAction(diasRango);
        procesarDatos(newData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchNuevaData();
  }, [diasRango]);

  return (
    <div className="flex flex-col h-full overflow-hidden transition-colors duration-500">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800 p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tighter">
                Analítica <span className="text-fuchsia-600">.</span>
              </h1>
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-bold uppercase text-xs tracking-widest">
                <History className="w-3 h-3" />
                Basado en los últimos <span className="text-fuchsia-600 dark:text-fuchsia-400">{diasRango} días</span>
              </div>
            </div>

            <div className="flex bg-white dark:bg-neutral-900 p-1.5 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm shrink-0">
              {[7, 15, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDiasRango(d)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    diasRango === d
                      ? "bg-fuchsia-600 text-white shadow-lg"
                      : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  }`}
                >
                  {d === 30 ? "Mes" : `${d}D`}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-fuchsia-600" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <RankingCard title="Puntualidad" subtitle="Más constantes" icon={<Trophy className="w-5 h-5 text-emerald-500" />} data={rankings.puntualidad} color="emerald" />
                <RankingCard title="Retardos" subtitle="Alertas críticas" icon={<AlertTriangle className="w-5 h-5 text-rose-500" />} data={rankings.retardos} color="rose" />
                {/* 🚀 Cambio del color 'sky' al tema fuchsia */}
                <RankingCard title="Tolerancia" subtitle="Zona de 5 min" icon={<Clock className="w-5 h-5 text-fuchsia-500" />} data={rankings.tolerancia} color="fuchsia" />
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-10 border border-neutral-100 dark:border-neutral-800 shadow-sm">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 bg-fuchsia-50 dark:bg-fuchsia-500/10 rounded-2xl flex items-center justify-center text-fuchsia-600">
                    <Utensils className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">
                      Top 5 Excesos Comida
                    </h2>
                    <p className="text-neutral-500 text-sm font-bold tracking-tight">
                      Minutos acumulados por encima de los 45 Minutos permitidos.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
                  {rankings.comidaExcesiva.map((item, idx) => (
                    <div key={idx} className="p-6 bg-neutral-50 dark:bg-black/30 rounded-[2rem] border border-transparent hover:border-fuchsia-500/30 transition-all group">
                      <p className="text-3xl font-black text-fuchsia-500 dark:text-fuchsia-400 mb-2">
                        #{idx + 1}
                      </p>
                      <h4 className="font-bold text-neutral-900 dark:text-white text-sm truncate">
                        {item.nombre_completo}
                      </h4>
                      <div className="flex items-center gap-2 mt-2">
                        <TrendingUp className="w-3 h-3 text-rose-500" />
                        <span className="text-xs font-black text-rose-500">
                          {item.valor} min
                        </span>
                      </div>
                    </div>
                  ))}
                  {rankings.comidaExcesiva.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center bg-neutral-50 dark:bg-black/10 rounded-4xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                      <Utensils className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mb-2" />
                      <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">
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
    </div>
  );
}

function RankingCard({ title, subtitle, icon, data, color }: any) {
  const colorMap: any = {
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
    // 🚀 Ajustado al fuchsia
    fuchsia: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-400",
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 border border-neutral-100 dark:border-neutral-800 shadow-sm flex flex-col min-h-[400px]">
      <div className="flex items-center gap-3 mb-1">
        <div className={`p-2 rounded-xl ${colorMap[color]}`}>{icon}</div>
        <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
          {title}
        </h3>
      </div>
      <p className="text-neutral-900 dark:text-white font-black text-xl mb-8">
        {subtitle}
      </p>

      <div className="space-y-6 flex-1">
        {data.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-neutral-300 dark:text-neutral-700">
                0{idx + 1}
              </span>
              <div>
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-fuchsia-600 transition-colors">
                  {item.nombre_completo}
                </p>
                <p className="text-[10px] font-black text-neutral-400 uppercase">
                  {item.valor} {item.extra}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-200 dark:text-neutral-800 opacity-0 group-hover:opacity-100 transition-all" />
          </div>
        ))}

        {data.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center py-10">
            <div className="w-16 h-16 bg-neutral-50 dark:bg-black/20 rounded-full flex items-center justify-center mb-4">
              {icon}
            </div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
              Sin registros
            </p>
          </div>
        )}
      </div>
    </div>
  );
}