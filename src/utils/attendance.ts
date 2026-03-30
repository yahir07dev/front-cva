// utils/attendance.ts

export const evaluarPuntualidad = (
  fechaEntrada: Date | null,
): "A tiempo" | "Tolerancia" | "Retardo" | "Sin registro" => {
  if (!fechaEntrada) return "Sin registro";

  const horas = fechaEntrada.getHours();
  let turnoHora = 7;
  if (horas >= 8 && horas <= 10) turnoHora = 9;
  if (horas >= 11 && horas <= 13) turnoHora = 12;
  if (horas >= 15 && horas <= 17) turnoHora = 16;

  const horaTurno = new Date(fechaEntrada);
  horaTurno.setHours(turnoHora, 0, 0, 0);

  const diferenciaMinutos =
    (fechaEntrada.getTime() - horaTurno.getTime()) / 60000;

  if (diferenciaMinutos <= 0) return "A tiempo";
  if (diferenciaMinutos > 0 && diferenciaMinutos < 6) return "Tolerancia";
  return "Retardo";
};

// Nueva lógica: Evaluar si se excedió de los 45 minutos de comida
export const evaluarComida = (
  entrada: Date | null,
  salida: Date | null,
): "En límite" | "Excedido" | "En curso" => {
  // Al poner esto, TypeScript descarta el valor "null" para el resto de la función
  if (!entrada || !salida) {
    return "En curso";
  }

  // A partir de aquí, TS sabe al 100% que entrada y salida son objetos Date válidos
  const diferenciaMs = salida.getTime() - entrada.getTime();
  const minutos = diferenciaMs / (1000 * 60);

  return minutos > 45 ? "Excedido" : "En límite";
};

// Nueva lógica: Formateo dinámico según el tipo
export const calcularLapso = (
  entrada: Date | null,
  salida: Date | null,
  tipo: "asistencia" | "comida",
): string => {
  // Misma validación estricta aquí
  if (!entrada || !salida) {
    return "--";
  }

  const diferenciaMs = salida.getTime() - entrada.getTime();

  if (tipo === "asistencia") {
    const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
    const minutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${horas}h ${minutos}m`;
  } else {
    const minutos = Math.floor(diferenciaMs / (1000 * 60));
    const segundos = Math.floor((diferenciaMs % (1000 * 60)) / 1000);
    return `${minutos}m ${segundos}s`;
  }
};
