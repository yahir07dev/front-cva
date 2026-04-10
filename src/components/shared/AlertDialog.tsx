"use client";

import { AlertTriangle } from "lucide-react";

interface AlertDialogProps {
  open: boolean;
  title: string;
  description?: string;
  buttonText?: string;
  onClose: () => void;
}

export default function AlertDialog({
  open,
  title,
  description,
  buttonText = "Aceptar",
  onClose,
}: AlertDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Caja del Modal */}
      <div className="w-full max-w-sm rounded-[2rem] bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-2xl shadow-black/10 dark:shadow-black/40 border border-neutral-100 dark:border-neutral-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="flex flex-col items-center text-center">
          
          {/* Contenedor del Icono Modernizado */}
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-4 ring-rose-50/50 dark:ring-rose-500/5">
            <AlertTriangle className="h-8 w-8" strokeWidth={2} />
          </div>

          {/* Título */}
          <h2 className="text-xl font-black mb-2 text-neutral-900 dark:text-white tracking-tight">
            {title}
          </h2>

          {/* Descripción */}
          {description && (
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed px-2">
              {description}
            </p>
          )}

          {/* Botón de Acción */}
          <button
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 text-white font-bold hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 shadow-lg shadow-rose-500/25 dark:shadow-rose-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 active:scale-[0.97]"
          >
            {buttonText}
          </button>

        </div>
      </div>
    </div>
  );
}