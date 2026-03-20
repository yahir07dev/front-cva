// Ahora este archivo es puramente para definiciones de TypeScript.
// Toda la lógica de negocio pesada se movió a src/actions/nomina/generarActions.ts

export interface RenglonNomina {
  empleado_id: number;
  nombre_completo: string;
  foto_perfil_url?: string | null;
  sueldo_base: number;
  sueldo_calculado: number;
  recibe_pago_tarjeta: boolean;
  monto_tarjeta_defecto: number;
  prestamo_activo_id: number | null;
  prestamo_pagos_realizados?: number; 
  prestamo_numero_pagos?: number;     
  descuento_prestamo: number;
  descuento_anticipo: number;
  descuento_tarjeta: number;
  pago_neto: number;
}