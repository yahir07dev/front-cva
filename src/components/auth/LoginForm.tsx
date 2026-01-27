"use client";
import { useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lógica para Login con Correo
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("Login correo exitoso:", data);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  // Lógica para Login con Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Error al conectar con Google");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#121212] text-white">
      {/* Columna Izquierda - Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-12 lg:p-24">
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-4xl font-bold mb-2">Bienvenido!</h2>
          <p className="text-gray-400 mb-8">Inicia sesión para continuar</p>

          {/* Mensaje de Error Global */}
          {error && (
            <div className="mb-6 p-3 text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Botón de Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500 transition-all"
            >
              {loading ? (
                <span className="text-gray-400">Conectando...</span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continua con Google
                </>
              )}
            </button>

            {/* Separador Visual */}
            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-gray-700 w-full"></div>
              <span className="bg-[#121212] px-4 text-xs text-gray-500 uppercase">
                O
              </span>
              <div className="border-t border-gray-700 w-full"></div>
            </div>

            {/* Formulario de Correo */}
            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-400">
                  Correo
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder-gray-500"
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-400">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder-gray-500"
                  placeholder="••••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 font-bold text-white rounded-lg transition-all shadow-lg
                  ${
                    loading
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-purple-500/30"
                  }
                `}
              >
                {loading ? "Cargando inicio..." : "Inicia sesión"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-400 mt-6">
              No tienes una cuenta?{" "}
              <span className="text-purple-500 hover:underline">
                Contacta Atencion al cliente
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Columna Derecha - Imagen y Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-purple-900/20 to-black z-0"></div>
        <div className="text-center z-10 px-12 relative">
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Trabajando para
            <br />
            Usted.
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Gestiona tus recursos de forma eficiente y segura.
          </p>
          {/* Reemplaza la siguiente imagen con la ilustración 3D de tu preferencia */}
          <div className="relative w-full max-w-lg mx-auto">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-600/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-600/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-600/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
          <img
            src="/png/login.png" // Asegúrate de tener esta imagen o una similar en tu carpeta public
            alt="3D Illustration"
            className="relative w-full h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}
