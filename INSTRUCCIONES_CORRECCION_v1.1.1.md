# EvalúaFP 1.1.1 beta · Corrección de «Preparar módulo»

## Diagnóstico

En la beta 1.1.0, el controlador JavaScript `page(name)` activaba el indicador `Cargando…`, pero no contemplaba el caso `name === 'preparar'`. Al pulsar el menú, la función `viewPrepare()` existía y funcionaba, pero nunca llegaba a ejecutarse.

La corrección invoca expresamente `viewPrepare()` y detecta las páginas no reconocidas para mostrar un mensaje de error en lugar de un cargador permanente.

## Cómo actualizar Windows portátil

1. Cierre completamente EvalúaFP y haga una copia de seguridad de `EvaluaFP_Datos/`, `EvaluaFP_Copias/` y su archivo SQLite.
2. Si dispone del código fuente **1.1.0-beta**, extraiga `EvaluaFP_v1.1.1_PARCHE_NAVEGACION.zip` encima de su carpeta de proyecto, reemplazando los archivos repetidos. Si no conserva las fuentes, utilice el ZIP completo corregido.
3. Abra `CREAR_VERSION_PENDRIVE.bat` desde esa carpeta de **fuentes** (no desde la carpeta del ejecutable). El script prepara el entorno y compila.
4. Espere a que las pruebas finalicen y a que el compilador confirme un archivo nuevo en `dist/EvaluaFP_Portatil/EvaluaFP_Portatil.exe`.
5. Ejecute primero una prueba con una carpeta de datos nueva. Después, y con EvalúaFP cerrado, traslade de forma controlada su configuración y sus datos a la versión nueva. Nunca sobrescriba bases SQLite abiertas.

**Si solo tiene un .exe portátil 1.1.0-beta:** no puede cambiar el archivo `app.js` incorporado en el ejecutable. Es necesario generar un ejecutable nuevo o descargar una compilación actualizada cuando esté disponible.

## Validación realizada

- 86 pruebas automatizadas Python: correctas.
- `node --check web/app.js`: correcto.
- Recorrido visual automatizado mediante Chromium y API HTTP local: inicio → preparar módulo → alta de módulo → elección de vía → currículo → importación → asistente de 6 pasos → guardado y exportación Markdown.
- No se han utilizado documentos reales ni datos personales durante las pruebas.

La aplicación conserva las tablas SQLite y registros anteriores. No se modifica ninguna puntuación ni ponderación curricular.
