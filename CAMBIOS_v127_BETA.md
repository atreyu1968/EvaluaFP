# EvalúaFP 1.2.7 beta — Historial de calendarios escolares por territorio, curso y centro

**Fecha:** 20 de noviembre de 2026. **Tipo:** mejora funcional de la aplicación local. **Distribución:** código fuente beta; requiere compilar y comprobar los ejecutables de cada sistema.

## Objetivo

Evitar que el docente pierda la versión anterior de un calendario al revisar su programación y facilitar la consulta de las administraciones educativas **sin inventar fechas ni declarar vigentes fuentes no contrastadas**.

## Desarrollo incorporado

- Índice de consulta territorial de los **19 ámbitos educativos** de España: 17 comunidades autónomas, Ceuta y Melilla. Cada ámbito dispone de un enlace de entrada a su administración educativa. En los cursos con referencias localizadas se presentan también enlaces directos, como la resolución y corrección del calendario canario de 2026-2027 y la página oficial de calendario de Madrid.
- Campo **Enlaces de correcciones o modificaciones** separado de la resolución principal, con hasta ocho URL HTTPS y sin consultas automáticas a direcciones arbitrarias.
- **Historial de versiones inmutable**, guardado por territorio, curso académico, nombre del centro, municipio, isla y etapa de referencia (FP Grado D). Cada nueva revisión conserva las fechas, periodos no lectivos, días festivos, días del centro, fuentes, fecha de revisión y SHA-256 del conjunto. Repetir una ficha idéntica no genera versiones redundantes.
- **Comparación documental entre versiones** de inicio, final, evaluaciones, vacaciones, festivos, días de centro, procedencia y correcciones. No se presume que la última versión sea jurídicamente vigente.
- **Carga segura de versiones anteriores** como propuesta editable; se desmarca la confirmación docente y no se alteran horas semanales, instrumentos, unidades, criterios, FEOE ni calificaciones.
- **Control de curso académico**: se rechaza archivar fechas fuera del intervalo 1 de septiembre del primer año a 31 de agosto del siguiente. No se trasladan calendarios de otros años o territorios.
- Se conserva la tabla preexistente de calendarios de centro (`national_center_calendars`) para compatibilidad. Los **nuevos guardados** se versionan en `national_calendar_revisions`; no se inventan historiales para registros anteriores.

## Uso

1. Abrir **Preparar mi módulo → Crear programación → Temporalización**.
2. Confirmar comunidad y curso; indicar el **centro y el municipio** en el asistente, además de la isla si procede.
3. Consultar los enlaces a la administración educativa del territorio. Abrir la disposición concreta y comprobar si aplica a ese nivel de FP, centro, modalidad y curso.
4. Introducir fecha de inicio, fin, evaluaciones, vacaciones, festivos y días del centro. Añadir la **URL principal y su descripción** y, cuando existan, los enlaces a correcciones.
5. Marcar la confirmación solo tras comprobarlos y pulsar **Guardar calendario verificado**. La aplicación conservará una versión archivada. Al modificar fechas y guardar otra revisión, aparecerá la comparación.
6. Utilizar **Comparar** para detectar diferencias o **Cargar como propuesta** para recuperar un calendario previo y contrastarlo de nuevo antes de aprobarlo.

## API local

- `GET /api/national/calendar/versions?module_id=N`: lista las versiones permitidas para el mismo territorio, curso, centro, municipio e isla; devuelve además los enlaces de consulta del territorio.
- `GET /api/national/calendar/compare?module_id=N&old=A&new=B`: compara solo versiones del mismo ámbito estricto; rechaza lecturas de otro centro o curso.
- `POST /api/national/save-calendar`: ruta existente; ahora archiva una versión después de la confirmación, dentro de la misma transacción SQLite. La respuesta incluye número de revisión, cambios y señal de duplicado.

La API local sigue exigiendo la sesión/token de la aplicación. No transmite información de alumnado a portales educativos.

## Límites y pendientes

1. **No se han importado automáticamente los 19 calendarios oficiales de 2026-2027.** Se proporciona un directorio de consulta de 19 territorios; la cobertura de fechas estructuradas sigue siendo parcial. Se mantienen las fechas de Canarias previamente cargadas, sujetas a confirmación local.
2. Todavía no existe lector oficial universal de resoluciones y correcciones de boletines autonómicos, ni verificador automático de su vigencia.
3. Los festivos municipales y los días de libre disposición del centro deben contrastarse con su fuente y calendario de ese curso. No es suficiente el calendario laboral.
4. Los calendarios de FP semipresencial, virtual, intensiva y otras adaptaciones pueden diferir y requieren validación específica.
5. Los tests no sustituyen ensayos con documentos oficiales reales y ejecutables nativos en Windows, macOS y Linux.

## Fuentes consultadas para los enlaces oficiales

- Canarias: https://www.gobiernodecanarias.org/educacion/web/centros/calendario_escolar/
- Canarias, resolución 2026: https://www.gobiernodecanarias.org/boc/2026/061/1025.html
- Canarias, corrección: https://www.gobiernodecanarias.org/boc/2026/075/1240.html
- Comunidad de Madrid: https://www.comunidad.madrid/educacion/calendario-escolar
- Dirección Provincial de Ceuta: https://www.educacionfpydeportes.gob.es/contenidos/ba/ceuta-melilla/ceuta/portada.html