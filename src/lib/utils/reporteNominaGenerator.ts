import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generarPDFNomina = (fecha: string, registros: any[]) => {
  const doc = new jsPDF('l', 'mm', 'a4');
  const formatMoney = (n: number) => new Intl.NumberFormat('es-MX', { 
    style: 'currency', 
    currency: 'MXN' 
  }).format(n || 0);

  // 1. SEPARACIÓN Y ORDENAMIENTO (De mayor a menor SUELDO BASE)
  const registrosTarjeta = registros
    .filter(r => r.recibe_pago_tarjeta)
    .sort((a, b) => (b.sueldo_base || 0) - (a.sueldo_base || 0));

  const registrosEfectivo = registros
    .filter(r => !r.recibe_pago_tarjeta)
    .sort((a, b) => (b.sueldo_base || 0) - (a.sueldo_base || 0));

  // 2. ENCABEZADO PRINCIPAL (Negro Neutral)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0); 
  doc.text('Comercial V.A.', 14, 15);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text('REPORTE DE NÓMINA SEPARADO POR MÉTODO DE PAGO', 14, 21);
  
  const fechaFormateada = new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  }).toUpperCase();
  doc.text(`FECHA DE PAGO: ${fechaFormateada}`, 14, 26);

  // --- FUNCIÓN AUXILIAR PARA MAPEAR FILAS ---
  const mapearFilas = (lista: any[]) => lista.map(r => {
    const pagoActual = (r.prestamo_pagos_realizados || 0) + 1;
    const fraccion = (Number(r.descuento_prestamo) > 0 && r.prestamo_numero_pagos) 
      ? `(${pagoActual}/${r.prestamo_numero_pagos})` 
      : "";

    const textoSombra = fraccion ? `${formatMoney(r.descuento_prestamo)}      ` : formatMoney(r.descuento_prestamo);

    return [
      r.nombre_completo || `${r.empleados?.nombre} ${r.empleados?.apellidos}`,
      formatMoney(r.sueldo_base),
      formatMoney(r.descuento_tarjeta),
      formatMoney(r.bonos || 0),           
      textoSombra,                         
      formatMoney(r.otros_descuentos || 0),
      formatMoney(r.pago_neto),
      fraccion,             
      r.descuento_prestamo  
    ];
  });

  // --- CONFIGURACIÓN DE TABLA ---
  const tableConfig: any = {
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2, valign: 'middle' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },          // Nombre
      1: { halign: 'right', cellWidth: 22 },            // Sueldo Base
      2: { halign: 'right', textColor: [0, 80, 180], cellWidth: 22 }, // Tarjeta
      3: { halign: 'right', textColor: [0, 100, 0], cellWidth: 50 },  // Extra (Concepto) - 50mm
      4: { halign: 'right', cellWidth: 28 },            // Préstamo
      5: { halign: 'right', textColor: [180, 0, 0], cellWidth: 50 },  // 🚀 DESCUENTO (Motivo) - Ampliado a 50mm
      6: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245] } // Neto
    }
  };

  // 3. TABLA 1: PAGOS POR TARJETA
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('I. PERSONAL CON PAGO POR TARJETA', 14, 34);

  const bodyTarjeta = mapearFilas(registrosTarjeta);
  autoTable(doc, {
    ...tableConfig,
    startY: 37,
    head: [['EMPLEADO', 'SUELDO BASE', 'DEP. TARJETA', 'EXTRA (CONCEPTO)', 'PRÉSTAMO', 'DESCUENTO (MOTIVO)', 'NETO A PAGAR']],
    body: bodyTarjeta.map(r => r.slice(0, 7)),
    willDrawCell: (data) => {
      if (data.column.index === 4 && data.cell.section === 'body' && bodyTarjeta[data.row.index][7]) {
        data.cell.text = []; 
      }
    },
    didDrawCell: (data) => {
      if (data.column.index === 4 && data.cell.section === 'body') {
        const fraccion = bodyTarjeta[data.row.index][7];
        const montoStr = formatMoney(bodyTarjeta[data.row.index][8]); 

        if (fraccion) {
          doc.setFontSize(8);
          const anchoMonto = doc.getTextWidth(montoStr);
          doc.setFontSize(5);
          const anchoFraccion = doc.getTextWidth(fraccion);
          const xFinCelda = data.cell.x + data.cell.width - 2; 
          const xInicioMonto = xFinCelda - anchoFraccion - anchoMonto - 0.5;

          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);
          doc.text(montoStr, xInicioMonto, data.cell.y + (data.cell.height / 2) + 1);
          doc.setFontSize(5);
          doc.setTextColor(180, 0, 0); 
          doc.text(fraccion, xInicioMonto + anchoMonto + 0.5, data.cell.y + (data.cell.height / 2) - 1.2);
          doc.setTextColor(0, 0, 0); 
        }
      }
    },
    foot: [[
      'SUBTOTAL TARJETA', 
      formatMoney(registrosTarjeta.reduce((s, r) => s + Number(r.sueldo_base), 0)),
      formatMoney(registrosTarjeta.reduce((s, r) => s + Number(r.descuento_tarjeta), 0)),
      formatMoney(registrosTarjeta.reduce((s, r) => s + (r.bonos || 0), 0)),
      formatMoney(registrosTarjeta.reduce((s, r) => s + Number(r.descuento_prestamo), 0)),
      formatMoney(registrosTarjeta.reduce((s, r) => s + (r.otros_descuentos || 0), 0)),
      formatMoney(registrosTarjeta.reduce((s, r) => s + Number(r.pago_neto), 0))
    ]],
    footStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'right' }
  });

  // 4. TABLA 2: PAGOS EN EFECTIVO
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text('II. PERSONAL CON PAGO EN EFECTIVO', 14, finalY);

  const bodyEfectivo = mapearFilas(registrosEfectivo);
  autoTable(doc, {
    ...tableConfig,
    startY: finalY + 3,
    head: [['EMPLEADO', 'SUELDO BASE', 'DEP. TARJETA', 'EXTRA (CONCEPTO)', 'PRÉSTAMO', 'DESCUENTO (MOTIVO)', 'NETO A PAGAR']],
    body: bodyEfectivo.map(r => r.slice(0, 7)),
    willDrawCell: (data) => {
      if (data.column.index === 4 && data.cell.section === 'body' && bodyEfectivo[data.row.index][7]) {
        data.cell.text = []; 
      }
    },
    didDrawCell: (data) => {
      if (data.column.index === 4 && data.cell.section === 'body') {
        const fraccion = bodyEfectivo[data.row.index][7];
        const montoStr = formatMoney(bodyEfectivo[data.row.index][8]);

        if (fraccion) {
          doc.setFontSize(8);
          const anchoMonto = doc.getTextWidth(montoStr);
          doc.setFontSize(5);
          const anchoFraccion = doc.getTextWidth(fraccion);
          const xFinCelda = data.cell.x + data.cell.width - 2;
          const xInicioMonto = xFinCelda - anchoFraccion - anchoMonto - 0.5;

          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);
          doc.text(montoStr, xInicioMonto, data.cell.y + (data.cell.height / 2) + 1);
          doc.setFontSize(5);
          doc.setTextColor(180, 0, 0); 
          doc.text(fraccion, xInicioMonto + anchoMonto + 0.5, data.cell.y + (data.cell.height / 2) - 1.2);
          doc.setTextColor(0, 0, 0); 
        }
      }
    },
    foot: [[
      'SUBTOTAL EFECTIVO', 
      formatMoney(registrosEfectivo.reduce((s, r) => s + Number(r.sueldo_base), 0)),
      formatMoney(registrosEfectivo.reduce((s, r) => s + Number(r.descuento_tarjeta), 0)),
      formatMoney(registrosEfectivo.reduce((s, r) => s + (r.bonos || 0), 0)),
      formatMoney(registrosEfectivo.reduce((s, r) => s + Number(r.descuento_prestamo), 0)),
      formatMoney(registrosEfectivo.reduce((s, r) => s + (r.otros_descuentos || 0), 0)),
      formatMoney(registrosEfectivo.reduce((s, r) => s + Number(r.pago_neto), 0))
    ]],
    footStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'right' }
  });

  // 5. TOTAL GENERAL FINAL
  finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFillColor(0, 0, 0);
  doc.rect(170, finalY, 112, 12, 'F');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL GENERAL DE NÓMINA:', 175, finalY + 7.5);
  doc.text(formatMoney(registros.reduce((s, r) => s + Number(r.pago_neto), 0)), 280, finalY + 7.5, { align: 'right' });

  // Paginación
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pageCount} - Comercial V.A.`, 280, 205, { align: 'right' });
  }

  doc.save(`Nomina_Consolidada_${fecha}.pdf`);
};