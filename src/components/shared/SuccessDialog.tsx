"use client";

import { BadgeCheck } from "lucide-react";

interface SuccessDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  buttonText?: string;
  onClose: () => void;
}

export default function SuccessDialog({
  open,
  title = "Guardado con éxito",
  description = "Los cambios se guardaron correctamente.",
  buttonText = "Aceptar",
  onClose,
}: SuccessDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg text-center">
        {/* Ícono */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <BadgeCheck className="h-8 w-8 text-green-600" />
        </div>

        <h2 className="text-lg font-semibold text-black mb-1">{title}</h2>

        <p className="text-sm text-gray-600 mb-6">{description}</p>

        <button
          onClick={onClose}
          className="w-full rounded bg-green-700  px-4 py-2 text-white hover:bg-green-900"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
