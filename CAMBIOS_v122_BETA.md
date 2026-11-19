# EvalúaFP Local 1.2.2 beta — Historial curricular con comparación de RA y CE

**Fecha:** 19 de noviembre de 2026. **Estado:** beta de fuentes, no ejecutable compilado ni homologación normativa.

## Objetivo

Conservar versiones documentales de una disposición curricular y detectar qué resultados de aprendizaje (RA) y criterios de evaluación (CE) han cambiado. Se trata de una función **no destructiva**: en ningún caso se modifican los RA y CE en uso, los instrumentos, los pesos, las notas ni las programaciones existentes al archivar una versión.

## Cambios incorporados

| Función | Comportamiento y garantías |
|---|---|
| Historial de disposiciones | Al previsualizar un documento identificado como **norma oficial**, el docente puede archivarlo con enlace HTTPS, título de la disposición y confirmación explícita de revisión |
| Aislamiento | Las referencias quedan vinculadas a un **módulo, código oficial de cuatro cifras, administración educativa y curso académico** |
| Comprobación de identidad | Antes de guardar, el servidor vuelve a leer el PDF, DOCX, TXT o MD original, comprueba que incluye el nombre y el código del módulo, y exige RA/CE completos y estructurados |
| Trazabilidad | Guarda SHA-256 del documento y de su contenido curricular, enunciados de RA y CE, páginas/párrafos y fecha de registro; el archivo original no se incorpora a este historial |
| Duplicados | Detecta cuando se intenta archivar dos veces exactamente el mismo documento |
| Detección de diferencias | Compara dos versiones mostrando RA y CE nuevos, eliminados o cuyo enunciado ha cambiado; ignora cambios meramente tipográficos o de paginación |
| Pantalla de revisión | Tabla con el historial y comparación lado a lado del texto anterior y nuevo |
| Catálogo incremental | Endpoint de lectura que muestra los módulos que ya tienen fuentes revisadas en una instalación concreta y en el ámbito elegido |
| Migración SQLite | Añade la tabla `curriculum_source_snapshots` e índice de búsqueda sin sobrescribir datos previos |

## Cómo utilizarlo

1. Cree un módulo o seleccione uno existente; confirme su comunidad autónoma, curso académico y el **código oficial del módulo** en el primer paso de la programación.
2. Acceda a «Preparar mi módulo», y abra la sección **Extracción contrastable de RA y CE (sin IA)**.
3. Seleccione **Disposición curricular oficial** y adjunte PDF, DOCX, TXT o MD. Pulse «Previsualizar RA y CE sin modificar datos».
4. Examine el cuadro de RA, CE y localización del texto. Introduzca la URL HTTPS y la descripción de la disposición, y marque que la ha contrastado.
5. Pulse «Archivar esta versión de RA/CE». No se aplica automáticamente al currículo de uso.
6. Cuando disponga de otro texto o modificación, repita el proceso y utilice «Comparar con anterior». Cada diferencia mostrará su código, tipo y enunciados anterior/nuevo.

## Protección y límites

- **No se afirma que una norma esté vigente** por aparecer en la biblioteca. La confirmación indica que el docente ha revisado el documento; la aplicabilidad al módulo, curso y administración debe verificarse en las fuentes oficiales.
- El historial **no actualiza automáticamente** criterios, evaluaciones ni calificaciones. La modificación de un CE que ya tenga evidencias debe seguir un proceso de revisión pedagógica específico.
- El catálogo es **local e incremental**, formado solo con documentos aportados por docentes. **No es aún el catálogo nacional completo** de todos los ciclos y módulos oficiales ni permite sincronizar currículos de las 19 administraciones de forma automática.
- El calendario lectivo de todas las comunidades y cursos, OCR incorporado a los ejecutables y descarga automática de disposiciones autonómicas siguen pendientes.
- El documento original se procesa temporalmente: en SQLite se guardan sus enunciados estructurados, metadatos y la huella SHA-256, **no el fichero PDF original**. Si un documento contiene datos personales, no debe importarse a un historial normativo.

## API local (protegida por la sesión de EvalúaFP)

| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/curriculum/history?module_id=N` | Historial del mismo módulo, curso y territorio |
| GET | `/api/curriculum/history-compare?module_id=N&old=A&new=B` | Diferencias entre dos versiones del mismo ámbito |
| GET | `/api/curriculum/catalog?region=...&academic_year=...&q=...` | Índice incremental de módulos con fuentes archivadas |
| POST (multipart) | `/api/curriculum/history/store` | Revalida el documento original y lo archiva tras confirmación docente |

## Pruebas y aceptación

- **201 pruebas automatizadas superadas**: 191 de la versión 1.2.1, ocho del nuevo motor y dos de sus rutas HTTP.
- Validación de sintaxis JavaScript con `node --check web/app.js` y compilación Python con `compileall`.
- Recorrido en Chromium del asistente con una **API HTTP y SQLite reales mediante puente de pruebas**, debido a que el navegador del entorno bloquea la conexión a localhost. Se archivaron dos versiones y se visualizó una diferencia de RA2.b, sin excepciones JavaScript.
- Queda pendiente recompilar y probar los nuevos ejecutables portátiles en Windows, Linux y macOS, así como realizar pruebas de vigencia normativa con conectividad real.

## Actualización

Haga una copia de seguridad de la base de datos, los documentos originales y los ejecutables. Extraiga las **fuentes completas** en una carpeta distinta, o aplique el parche **solo sobre las fuentes de 1.2.1**. Reconstruya el portátil de Windows desde `CREAR_VERSION_PENDRIVE.bat` y pruebe con una base de datos de ensayo antes de sustituir la versión de trabajo.
