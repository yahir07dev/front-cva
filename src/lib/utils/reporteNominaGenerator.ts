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
  const tableRows = registros.map(r => {
    // Formato para Préstamo: ej. -$500 (1/4)
    let prestamoStr = '- $0.00';
    if (Number(r.descuento_prestamo) > 0) {
      // Verificamos si viene la info de los pagos, si no, solo ponemos el monto
      if (r.prestamo_numero_pagos !== undefined) {
        // Le sumamos 1 a los realizados, porque este es el pago que se le está cobrando AHORA
        const pagoActual = (r.prestamo_pagos_realizados || 0) + 1;
        prestamoStr = `- ${formatMoney(r.descuento_prestamo)} (${pagoActual}/${r.prestamo_numero_pagos})`;
      } else {
        prestamoStr = `- ${formatMoney(r.descuento_prestamo)}`;
      }
    }

    // Formato para Anticipo: ej. -$300 (1/1)
    let anticipoStr = '- $0.00';
    if (Number(r.descuento_anticipo) > 0) {
      anticipoStr = `- ${formatMoney(r.descuento_anticipo)} (1/1)`;
    }

    // Quitamos "Área" y mapeamos los valores
    return [
      r.empleados ? `${r.empleados.nombre} ${r.empleados.apellidos}` : r.nombre_completo,
      formatMoney(r.sueldo_base),
      formatMoney(r.total_percepciones || r.sueldo_calculado),
      prestamoStr,
      anticipoStr,
      formatMoney(r.descuento_tarjeta),
      formatMoney(r.pago_neto)
    ];
  });

  autoTable(doc, {
    startY: 45,
    // Quitamos Área de la cabecera
    head: [['Empleado', 'Sueldo Base', 'Generado', 'Préstamo', 'Anticipo', 'Tarjeta', 'Neto Efectivo']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
    // Alineamos los números a la derecha para que parezca reporte contable real
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right', textColor: [200, 80, 0] }, // Color sutil naranja
      4: { halign: 'right', textColor: [200, 0, 0] },  // Color sutil rojo
      5: { halign: 'right', textColor: [0, 80, 200] }, // Color sutil azul
      6: { halign: 'right', fontStyle: 'bold', fillColor: [240, 255, 240] } // El Neto ahora es índice 6
    },
    foot: [[
      'TOTALES', '', '', 
      formatMoney(registros.reduce((s, r) => s + Number(r.descuento_prestamo), 0)),
      formatMoney(registros.reduce((s, r) => s + Number(r.descuento_anticipo), 0)),
      formatMoney(registros.reduce((s, r) => s + Number(r.descuento_tarjeta), 0)),
      formatMoney(registros.reduce((s, r) => s + Number(r.pago_neto), 0))
    ]],
    footStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'right' }
  });

  // 3. Guardar
  doc.save(`Nomina_${fecha}.pdf`);
};