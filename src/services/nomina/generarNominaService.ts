export interface RenglonNomina {
  empleado_id: number;
  nombre_completo: string;
  foto_perfil_url?: string | null;
  sueldo_base: number;
  sueldo_calculado: number;
  bonos: number;             // 🚀 NUEVO: Dinero Extra (viajes, apoyos)
  recibe_pago_tarjeta: boolean;
  monto_tarjeta_defecto: number;
  prestamo_activo_id: number | null;
  prestamo_pagos_realizados?: number; 
  prestamo_numero_pagos?: number;     
  descuento_prestamo: number;
  otros_descuentos: number;  // 🚀 NUEVO: Reemplaza anticipo (Daños, errores)
  descuento_tarjeta: number;
  pago_neto: number;
  deuda_generada?: number;   // 🚀 NUEVO: Escudo Antinóminas negativas
}