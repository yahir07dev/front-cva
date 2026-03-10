import React from "react";
import { ShieldX } from "lucide-react";

export default function AccountDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f111a] via-[#141726] to-[#0f111a] p-6">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-10 text-center">
        {/* Icono */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10">
            <ShieldX className="w-10 h-10 text-red-500" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-semibold text-white mb-3">
          Acceso denegado
        </h1>

        {/* Descripción */}
        <p className="text-slate-400 leading-relaxed">
          Su cuenta ha sido dada de baja.
          <br />
          Por favor, comuníquese con Atención a Clientes para más información.
        </p>

        {/* Línea decorativa */}
        <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </div>
  );
}
