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

Para continuar automáticamente después del login cuando la aplicación está desplegada, descarga el repositorio, abre `chrome://extensions`, activa el modo desarrollador y carga la carpeta `extension-chrome`. En los detalles de la extensión activa “Permitir acceso a URLs de archivo”. La extensión no captura credenciales; espera a que aparezca el dashboard autenticado.

## Despliegue en Vercel

Vercel sirve el frontend y expone el backend mediante `/api`. Configura `JWT_SECRET` y `GROQ_API_KEY` en las variables de entorno del proyecto. La automatización Playwright de DIAN requiere una ventana visible y, por tanto, debe ejecutarse localmente; Vercel puede alojar la carga, análisis y generación de Excel, pero no puede abrir una ventana en el computador del usuario.
