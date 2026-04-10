"use client";

import { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!isVisible && !open) return null;

  // Detectamos si es una acción destructiva basándonos en palabras clave
  const isDestructive = confirmText.toLowerCase().includes("eliminar") || 
                        confirmText.toLowerCase().includes("borrar") || 
                        confirmText.toLowerCase().includes("baja");

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ease-out ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop Glassmorphism */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          open ? "bg-neutral-900/40 dark:bg-black/60 backdrop-blur-md" : "bg-black/0 backdrop-blur-0"
        }`}
        onClick={!loading ? onCancel : undefined}
      />

      {/* Modal Box */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm sm:max-w-md rounded-[2rem] bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-2xl shadow-black/10 dark:shadow-black/40 border border-neutral-100 dark:border-neutral-800 transition-all duration-300 ease-out ${
          open ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Botón de cerrar */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute right-6 top-6 z-10 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:text-neutral-300 dark:hover:bg-neutral-800 transition-all duration-200 active:scale-90 disabled:opacity-50 disabled:pointer-events-none"
        >
          <X size={20} />
        </button>

        <div>
          {/* Título */}
          <h2 className="text-xl font-black text-neutral-900 dark:text-white pr-8 tracking-tight">
            {title}
          </h2>

          {/* Descripción */}
          {description && (
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-3 leading-relaxed">
              {description}
            </p>
          )}

          {/* Advertencia Destructiva */}
          {isDestructive && (
            <div className="flex items-center gap-3 mt-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20">
              <AlertCircle size={18} className="shrink-0" />
              <span className="text-xs font-bold uppercase tracking-widest">Esta acción no se puede deshacer.</span>
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8">
            <button
              onClick={onCancel}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-sm font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg ${
                isDestructive 
                  ? "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 shadow-rose-500/25" 
                  : "bg-neutral-900 text-white hover:bg-black dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 shadow-black/20 dark:shadow-white/10"
              }`}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Procesando...</span>
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}