// Lectura y normalización de libros Excel.
const XLSX = require('xlsx');
function parseExcel(buffer) {
  try {
    const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const hojas = wb.SheetNames.map(nombre => ({ nombre, datos: XLSX.utils.sheet_to_json(wb.Sheets[nombre], { defval: '' }) }));
    const datos = hojas.flatMap(h => h.datos.map(f => ({ ...f, __hoja: h.nombre })));
    if (!datos.length) throw new Error('El Excel no contiene filas de datos');
    return { hojas: hojas.map(h => h.nombre), datos, encabezados: Object.keys(datos[0]) };
  } catch (e) { throw new Error(`No se pudo leer el Excel: ${e.message}`); }
}
module.exports = { parseExcel };
