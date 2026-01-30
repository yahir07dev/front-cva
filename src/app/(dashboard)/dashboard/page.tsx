import React from "react";
import { Metadata } from "next";
import { ThemeProvider } from "@/src/context/ThemeContext";
export const metadata: Metadata = {
  title: "Panel Principal",
  description: "Resumen general",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header de Bienvenida */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
          Bienvenido al Panel
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Selecciona un módulo del menú lateral para comenzar a trabajar.
        </p>
      </div>

      {/* Contenedor vacío decorativo para que no se vea tan solo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tarjeta 1 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1a1d29] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <h3 className="font-bold text-lg mb-1">Gestión de Personal</h3>
          <p className="text-sm text-gray-400">
            Administra expedientes y contratos.
          </p>
        </div>

        {/* Tarjeta 2 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1a1d29] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3v18h18"></path>
              <path d="m19 9-5 5-4-4-3 3"></path>
            </svg>
          </div>
          <h3 className="font-bold text-lg mb-1">Rendimiento</h3>
          <p className="text-sm text-gray-400">
            Evalúa objetivos y competencias.
          </p>
        </div>

        {/* Tarjeta 3 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1a1d29] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <h3 className="font-bold text-lg mb-1">Nómina</h3>
          <p className="text-sm text-gray-400">Procesamiento de pagos.</p>
        </div>
      </div>
    </div>
  );
}
