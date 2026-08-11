// Cliente para el análisis contable con Groq.
async function analyzeExcel(encabezados, muestra) {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('your_')) return { formato_detectado: 'Análisis local (configure Groq)', columnas_mapeadas: encabezados.filter(x => x !== '__hoja').map(origen => ({ origen, destino: origen, categoria: 'Sin clasificar' })), observaciones: 'Configure GROQ_API_KEY para activar el análisis con IA.' };
  const system = `Eres un experto contable colombiano especializado en información exógena de la DIAN. Se te entregará una muestra de datos de un Excel de exógena. Identifica el formato, mapea cada columna y devuelve únicamente JSON con formato_detectado, columnas_mapeadas (origen, destino, categoria) y observaciones.`;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, body: JSON.stringify({ model: 'llama3-70b-8192', temperature: 0.1, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, { role: 'user', content: JSON.stringify({ encabezados, muestra }) }] }) });
  if (!response.ok) throw new Error(`Groq respondió ${response.status}`);
  const data = await response.json(); return JSON.parse(data.choices[0].message.content);
}
module.exports = { analyzeExcel };
