"use client";
import { useState } from "react";
import Link from "next/link";
import { User, ChevronRight, FileText, Search } from "lucide-react";

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
    <>
      {/* BARRA DE BÚSQUEDA */}
      <div className="relative mb-8 max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por nombre o apellido..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-100 bg-white shadow-sm outline-none transition-all
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 
                     dark:bg-[#1a1d29] dark:border-[#2d3142] dark:text-white dark:focus:border-indigo-400"
        />
      </div>

      {/* GRID DE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEmpleados.map((empleado) => (
          <Link
            key={empleado.id}
            href={`/dashboard/documentos/${empleado.id}`}
            className="group bg-white dark:bg-[#1a1d29] rounded-[2rem] border-2 border-gray-50 dark:border-[#2d3142] p-6 shadow-sm hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all duration-300"
          >
            <div className="flex flex-col items-center">
              <div className="relative mb-5">
                <div className="w-24 h-24 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-500/5 flex items-center justify-center border border-indigo-50 dark:border-indigo-500/10 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  {empleado.foto_perfil_url ? (
                    <img
                      src={empleado.foto_perfil_url}
                      alt={empleado.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-indigo-300 dark:text-indigo-900/40" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-[#232734] p-2 rounded-xl shadow-lg border border-gray-50 dark:border-[#2d3142]">
                  <FileText className="w-4 h-4 text-indigo-500" />
                </div>
              </div>

              <div className="text-center space-y-1 mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors capitalize">
                  {empleado.nombre}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium capitalize">
                  {empleado.apellidos}
                </p>
              </div>

              <div className="w-full pt-4 border-t border-gray-50 dark:border-[#2d3142] flex items-center justify-between text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest">
                <span>Gestionar</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ESTADO VACÍO (DURANTE BÚSQUEDA) */}
      {filteredEmpleados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 dark:bg-[#1a1d29] rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-200 dark:border-gray-800">
            <Search className="text-gray-300 dark:text-gray-700 w-10 h-10" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            No se encontraron resultados
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Intenta con otro nombre o apellido.
          </p>
        </div>
      )}
    </>
  );
}
