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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* Animación de entrada suave */}
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          {/* Contenedor del Icono de Lucide */}
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            {/* Se usa el componente AlertTriangle de lucide-react */}
            <AlertTriangle className="h-7 w-7" strokeWidth={1.5} />
          </div>

          <h2 className="text-xl font-bold mb-2 text-gray-950">{title}</h2>

          {description && (
            <p className="text-base text-gray-600 mb-6 leading-relaxed">
              {description}
            </p>
          )}

          {/* Botón de ancho completo */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 active:scale-[0.98]"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
