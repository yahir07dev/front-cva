"use client";

import { useState } from "react";
import Link from "next/link";
import { User, ChevronRight, FileText, Search, FolderOpen } from "lucide-react";

interface Empleado {
  id: string;
  nombre: string;
  apellidos: string;
  foto_perfil_url: string | null;
}

export default function EmpleadoGrid({ empleados }: { empleados: Empleado[] }) {
  const [search, setSearch] = useState("");

  // Filtrado en tiempo real
  const filteredEmpleados = empleados.filter((e) => {
    const fullSearch = `${e.nombre} ${e.apellidos}`.toLowerCase();
    return fullSearch.includes(search.toLowerCase());
  });

  return (
    // Se agregó h-full flex flex-col min-h-0 para permitir que el hijo haga scroll
    <div className="w-full h-full flex flex-col min-h-0 space-y-6 animate-in fade-in duration-700">
      
      {/* Barra de búsqueda premium (shrink-0 para que no se aplaste) */}
      <div className="relative w-full max-w-3xl mx-auto group shrink-0">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-neutral-400 group-focus-within:text-cyan-500 transition-colors duration-300" />
        </div>
        <input
          type="text"
          placeholder="Buscar empleado por nombre o apellido..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full pl-14 pr-6 py-4 rounded-[28px] 
            bg-white/80 dark:bg-neutral-900/70 backdrop-blur-xl
            border border-neutral-200/60 dark:border-neutral-800/50 
            shadow-sm hover:shadow-md outline-none transition-all duration-300
            text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400
            focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10
          "
        />
      </div>

      {/* CONTENEDOR CON SCROLL PARA LAS TARJETAS */}
      {/* flex-1 min-h-0 permite que ocupe el resto del espacio y haga scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-24 pr-2 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
        
        {/* Grid responsivo de tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
          {filteredEmpleados.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-2xl animate-pulse-slow" />
                <FolderOpen className="relative h-16 w-16 text-cyan-500/50 dark:text-cyan-400/50 drop-shadow-sm" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                No se encontraron expedientes
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
                Intenta con otro nombre o asegúrate de que el empleado esté registrado.
              </p>
            </div>
          ) : (
            filteredEmpleados.map((empleado) => (
              <Link
                key={empleado.id}
                href={`/dashboard/documentos/empleados/${empleado.id}`}
                className="
                  group relative flex flex-col items-center p-6 md:p-8
                  bg-white/90 dark:bg-neutral-900/60 backdrop-blur-xl 
                  border border-neutral-200/80 dark:border-neutral-800/50 
                  rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl 
                  hover:-translate-y-1 hover:scale-[1.01] transition-all duration-500
                "
              >
                {/* Badge de Documento Superior Derecho */}
                <div className="
                  absolute top-5 right-5 p-2.5 rounded-2xl 
                  bg-cyan-50/80 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400
                  border border-cyan-100/50 dark:border-cyan-500/20 shadow-sm
                  transition-all duration-300 group-hover:scale-110 group-hover:rotate-6
                  group-hover:bg-cyan-100 group-hover:shadow-cyan-500/20
                ">
                  <FileText className="w-5 h-5" />
                </div>

                {/* Resplandor de fondo en hover */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-32 bg-cyan-500/10 dark:bg-cyan-500/20 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {/* Avatar Redondo */}
                <div className="relative mb-5 z-10">
                  <div className="
                    w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden 
                    bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-950/40 dark:to-neutral-900 
                    ring-4 ring-white dark:ring-neutral-950 shadow-md 
                    flex-shrink-0 transition-transform duration-500 group-hover:scale-105
                  ">
                    {empleado.foto_perfil_url ? (
                      <img
                        src={empleado.foto_perfil_url}
                        alt={`${empleado.nombre} ${empleado.apellidos}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <User className="w-10 h-10 text-cyan-500/50 dark:text-cyan-400/50" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Textos */}
                <div className="text-center space-y-1.5 w-full z-10 mb-6">
                  <h3 className="
                    text-lg md:text-xl font-bold text-neutral-900 dark:text-white 
                    group-hover:text-cyan-600 dark:group-hover:text-cyan-400 
                    transition-colors capitalize leading-tight truncate px-2
                  ">
                    {empleado.nombre}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium capitalize truncate px-2">
                    {empleado.apellidos}
                  </p>
                </div>

                {/* Botón Inferior Integrado */}
                <div className="
                  w-full pt-5 mt-auto border-t border-neutral-100 dark:border-neutral-800/50 
                  flex items-center justify-center gap-2 text-cyan-600 dark:text-cyan-400 
                  text-[11px] font-bold uppercase tracking-widest z-10
                ">
                  <span>Ver Expediente</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}