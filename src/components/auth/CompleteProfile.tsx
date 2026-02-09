"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";
import { useSession } from "@/src/hooks/useSession";

export default function CompleteProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");

  // lógica existente...
  // const { session } = useSession();
  // if (!session) {
  //   return null;
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        setLoading(false);
        throw new Error("Usuario no autenticado");
      }
      const { data: dataRole, error: errorRole } = await supabase
        .from("roles")
        .select("*")
        .eq("nombre", "Empleado")
        .single();

      if (errorRole || !dataRole)
        throw new Error("No se pudo obtener el rol por defecto");

      const roleId = dataRole.id;

      const { error: errorInsert } = await supabase.from("empleados").insert({
        usuario_id: user.data.user.id,
        nombre: nombre,
        apellidos: apellidos,
        rol_id: roleId,
      });

      if (errorInsert)
        throw new Error("No se pudo crear el perfil de empleado");

      router.replace("/");
    } catch (err: any) {
      setError(err.message || "Error al intentar guardar el perfil");
    }
  };

  return (
    // Contenedor principal oscuro centrado
    <div className="min-h-screen w-full bg-[#0f111a] flex items-center justify-center p-4">
      <div className="w-full max-w-lg p-20 bg border-2  rounded-3xl ">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Finalizar registro
          </h1>
          <p className="text-slate-400 text-lg">
            Ya casi está lista tu cuenta, completa tus datos.
          </p>
        </div>

        {/* Manejo de errores */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid para Nombre y Apellidos (side-by-side) */}
          <div className="md:grid-cols-2 gap-4 flex flex-col">
            {/* Input Nombre */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-medium text-slate-400 ml-1">
                Nombre(s)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full bg-[#1f232e] text-white border border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl px-4 py-3.5 outline-none transition-all placeholder-slate-500"
                />
              </div>
            </div>

            {/* Input Apellidos */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-medium text-slate-400 ml-1">
                Apellidos
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Apellidos"
                  className="w-full bg-[#1f232e] text-white border border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl px-4 py-3.5 outline-none transition-all placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Botón de Acción */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#008aff] hover:bg-blue-600 text-white font-semibold rounded-full py-4 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-8 text-lg shadow-lg shadow-blue-500/20"
          >
            {loading ? "Guardando..." : "Completar Registro"}
          </button>
        </form>
      </div>
    </div>
  );
}
