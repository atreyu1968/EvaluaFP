# EvalúaFP 1.2.8 beta — Lectura asistida de resoluciones de calendario escolar

**Fecha:** 20 de noviembre de 2026. **Tipo:** ampliación del código fuente beta, sin nuevos ejecutables compilados.

## Qué se ha implementado

1. **Leer documentos de calendario en PDF, DOCX, TXT y Markdown** desde el asistente «Preparar mi módulo → Temporalización y FEOE», con un límite de 15 MB, 80 páginas PDF y OCR opcional de hasta ocho páginas cuando el equipo disponga de Tesseract y el idioma español.
2. **Proponer únicamente fechas escritas de forma expresa en el archivo**, como inicio y final de clases, vacaciones de Navidad/Semana Santa, días festivos y otros días no lectivos. Cada resultado muestra el fragmento textual y su página, párrafo o fila.
3. **Comprobar el contexto antes de habilitar la incorporación**: la vista previa exige menciones textuales al territorio, al curso académico elegido y a Formación Profesional/FP. Cuando falta alguno, conserva la lectura informativa y bloquea la carga de propuestas.
4. **Detectar conflictos**: dos fechas diferentes de inicio o fin, o vacaciones de idéntico tipo pero intervalos contradictorios, se excluyen de la propuesta; los errores se comunican al docente.
5. **Selección explícita** de campos en la interfaz y pregunta de confirmación antes de incorporarlos **únicamente al borrador en memoria**. Se desmarca siempre la confirmación previa del calendario. No se cambian RA, CE, calificaciones, instrumentos, FEOE ni horas.
6. **No se sube el archivo a terceros** ni se solicita ninguna API de IA para esta función. La lectura se efectúa en el servicio local de EvalúaFP. La ruta no guarda originales ni altera SQLite.

## Ruta nueva

`POST /api/national/calendar-document-preview` (multipart, autenticación local): campos `module_id`, `region`, `academic_year`, `document`, `allow_ocr`. Se verifica que territorio y curso coincidan con los del módulo guardado antes de leer el archivo.

La respuesta presenta `scope_ok`, `scope`, `candidates`, `warnings`, `sha256`, `ocr_used`, `requires_teacher_confirmation` y `no_changes_saved`. Las propuestas no son fechas «oficialmente aprobadas» por EvalúaFP; son información literalmente localizada, sujeta a revisión.

## Uso por el profesorado

1. Abra un módulo ya creado y el paso «Temporalización y formación en empresa (FEOE)».
2. Localice la resolución oficial de FP Grado D de su comunidad y curso. Compruebe posibles correcciones y anexos posteriores.
3. Abra «Leer calendario escolar desde PDF, Word o texto», seleccione el archivo y pulse **Extraer fechas y mostrar fuentes**.
4. Revise los fragmentos y las advertencias. Marque solo las fechas y periodos comprobados, confirme su correspondencia y pulse **Cargar solo las fechas marcadas como borrador**.
5. Revise el municipio, festivos locales y de centro, fechas de evaluación, horario y FEOE. Introduzca URL y título de la fuente, guarde el borrador y posteriormente confirme o versione el calendario.

## Seguridad, límites y tareas pendientes

- El lector es **conservador**: un día sin año explícito no se inventa ni se completa. La ausencia de una fecha reconocida no significa que no figure en el documento.
- Los calendarios PDF en tabla, con columnas de fechas sin etiquetas, textos escaneados sin OCR y resoluciones que distribuyen la información en varias páginas pueden requerir extracción manual.
- Reconocer una referencia a «FP» en una disposición conjunta **no garantiza por sí solo** que todos los periodos de dicha disposición se apliquen a Grado D. La revisión del docente sigue siendo obligatoria.
- La herramienta **no acredita vigencia normativa**, ni recopila automáticamente las 19 resoluciones completas, ni incorpora festivos municipales sin contrastar.
- Quedan pendientes la comprobación de documentos reales representativos de los 19 ámbitos educativos y la validación de ejecutables en Windows, Linux y macOS.

## Verificación

Tests aislados para extracción TXT/DOCX/PDF, fechas sin año, conflictos, curso y territorio, documentos no válidos y autenticación HTTP con SQLite real; pruebas generales de regresión de EvalúaFP y comprobación de JavaScript en el flujo de CI.