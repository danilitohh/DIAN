// Construcción del libro final con datos, resumen y bitácora.
const XLSX = require('xlsx');
function buildExcel(datos, mapeo, formato, observaciones) {
  try {
    const rows = datos.map(row => Object.fromEntries(mapeo.map(m => [m.destino || m.origen, row[m.origen] ?? ''])));
    const resumen = {}; mapeo.forEach(m => { if (!resumen[m.categoria]) resumen[m.categoria] = 0; rows.forEach(r => { const n = Number(r[m.destino]); if (!Number.isNaN(n)) resumen[m.categoria] += n; }); });
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Datos trasladados'); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(Object.entries(resumen).map(([concepto, total]) => ({ formato, concepto, total }))), 'Resumen'); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Formato', formato], ['Observaciones', observaciones], ['Filas procesadas', datos.length]]), 'Log');
    wb.Sheets['Datos trasladados']['!cols'] = Object.keys(rows[0] || {}).map(() => ({ wch: 24 }));
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  } catch (e) { throw new Error(`No se pudo generar el Excel: ${e.message}`); }
}
module.exports = { buildExcel };
