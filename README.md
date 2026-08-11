# Aplicación Exógena DIAN

Aplicación web para cargar Excel de información exógena, previsualizarlo, proponer un mapeo con Groq y generar un libro personalizado.

## Instalación

1. Instala Node.js 18+.
2. Ejecuta `npm install`.
3. Edita `.env` y coloca tu `GROQ_API_KEY` (se obtiene gratis en https://console.groq.com).
4. Ejecuta `npm start` y abre http://localhost:3000.

Usuario inicial: `admin` / `admin123`.

El backend protege todas las operaciones con JWT. Si no hay clave Groq, la aplicación genera un mapeo local conservando los nombres de columnas, para permitir probar el flujo completo.

La descarga asistida abre un navegador visible; las credenciales y CAPTCHA se introducen manualmente y no se almacenan. El Excel descargado queda en `descargas/`.
