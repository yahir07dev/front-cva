import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generarPDFNomina = (fecha: string, registros: any[]) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // 'l' para Horizontal (paisaje)
  const formatMoney = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

  // 1. Encabezado
  doc.setFontSize(18);
  doc.text('REPORTE GENERAL DE NÓMINA', 14, 20);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Fecha de Pago: ${new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', { dateStyle: 'full' })}`, 14, 28);
  doc.text(`Periodo: Semanal`, 14, 34);

  // 2. Tabla de Datos
  const tableRows = registros.map(r => [
    `${r.empleados.nombre} ${r.empleados.apellidos}`,
    r.empleados.areas?.nombre || 'General',
    formatMoney(r.sueldo_base),
    formatMoney(r.total_percepciones), // Sueldo Calculado
    formatMoney(r.descuento_prestamo),
    formatMoney(r.descuento_anticipo),
    formatMoney(r.descuento_tarjeta),
    formatMoney(r.pago_neto)
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['Empleado', 'Área', 'Sueldo Base', 'Generado', 'Préstamo', 'Anticipo', 'Tarjeta', 'Neto Efectivo']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      7: { fontStyle: 'bold', fillColor: [240, 255, 240] } // Resaltar columna Neto
    },
    foot: [[
      'TOTALES', '', '', '', 
      formatMoney(registros.reduce((s, r) => s + Number(r.descuento_prestamo), 0)),
      formatMoney(registros.reduce((s, r) => s + Number(r.descuento_anticipo), 0)),
      formatMoney(registros.reduce((s, r) => s + Number(r.descuento_tarjeta), 0)),
      formatMoney(registros.reduce((s, r) => s + Number(r.pago_neto), 0))
    ]],
    footStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold' }
  });

  // 3. Guardar
  doc.save(`Nomina_${fecha}.pdf`);
};