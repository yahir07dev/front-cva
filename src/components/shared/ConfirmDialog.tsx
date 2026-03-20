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

  // Detectamos si es una acción destructiva basándonos en el texto del botón
  const isDestructive = confirmText.toLowerCase().includes("eliminar") || confirmText.toLowerCase().includes("borrar");

  return (
    <div
      className={`
        fixed inset-0 z-[100] flex items-center justify-center p-4
        transition-all duration-300 ease-out
        ${open ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      {/* Backdrop con animación (No se puede cerrar haciendo clic si está cargando) */}
      <div
        className={`
          absolute inset-0 transition-all duration-300
          ${open 
            ? "bg-black/40 backdrop-blur-sm" 
            : "bg-black/0 backdrop-blur-0"
          }
        `}
        onClick={!loading ? onCancel : undefined}
      />

      {/* Modal con animación */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          relative w-full max-w-md rounded-2xl 
          bg-white dark:bg-neutral-900
          shadow-2xl dark:shadow-black/50
          transition-all duration-300 ease-out
          ${open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
          }
        `}
      >
        {/* Botón de cerrar */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="
            absolute right-4 top-4 z-10
            text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200
            transition-all duration-200 hover:rotate-90 active:scale-75
            disabled:opacity-50 disabled:pointer-events-none
          "
        >
          <X size={18} />
        </button>

        <div className="p-6">
          {/* Título con animación */}
          <h2
            className={`
              text-lg font-semibold text-neutral-900 dark:text-white pr-8
              animate-in fade-in slide-in-from-top-4 duration-500
            `}
          >
            {title}
          </h2>

          {/* Descripción con animación */}
          {description && (
            <p
              className={`
                text-sm text-neutral-600 dark:text-neutral-400 mt-2
                animate-in fade-in slide-in-from-top-4 duration-500 delay-100
              `}
            >
              {description}
            </p>
          )}

          {/* Advertencia sutil si la acción es eliminar */}
          {isDestructive && (
            <div
              className={`
                flex items-center gap-2 mt-4 p-3 rounded-xl
                bg-rose-50 dark:bg-rose-950/30
                text-rose-600 dark:text-rose-400 text-xs
                animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150
              `}
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>Esta acción no se puede deshacer.</span>
            </div>
          )}

          {/* Botones con animación */}
          <div
            className={`
              flex justify-end gap-3 mt-6
              animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200
            `}
          >
            <button
              onClick={onCancel}
              disabled={loading}
              className="
                px-4 py-2 rounded-xl text-sm font-medium
                bg-neutral-100 dark:bg-neutral-800
                text-neutral-700 dark:text-neutral-300
                hover:bg-neutral-200 dark:hover:bg-neutral-700
                transition-all duration-200 hover:scale-[1.02] active:scale-95
                disabled:opacity-50 disabled:hover:scale-100
              "
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium text-white
                shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02]
                active:scale-95 disabled:opacity-50 disabled:hover:scale-100
                flex items-center gap-2
                ${isDestructive 
                  ? "bg-gradient-to-r from-rose-600 to-rose-500 shadow-rose-600/20 dark:shadow-rose-600/40" 
                  : "bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-indigo-600/20 dark:shadow-indigo-600/40"
                }
              `}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>{isDestructive ? "Eliminando..." : "Procesando..."}</span>
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