# EvalúaFP 1.1.8 beta — Motor territorial y calendarios por curso

## Objetivo de esta entrega

Iniciar la adaptación nacional sin presentar como oficiales calendarios, horas ni referencias normativas que no correspondan a la administración educativa y al curso concreto. Se mantienen las funcionalidades de programación, IA asistida, evaluación RA/CE y documento independiente FEOE de 1.1.7.1.

## Mejoras implantadas

1. **Ámbitos educativos (19):** 17 comunidades autónomas más Ceuta y Melilla, con códigos normalizados y variantes de denominación. La ficha del módulo conserva la selección en SQLite mediante migración incremental y sin borrar calificaciones.
2. **Calendario vinculado a territorio y curso:** la selección de un curso no utiliza nunca de forma implícita el calendario del curso anterior o de otra comunidad. El motor tiene, en esta beta, una ficha de referencia para Canarias 2026-2027 corregida por el BOC; para otros territorios/cursos exige datos del centro o su calendario oficial.
3. **Periodos no lectivos separados:** vacaciones, festivos autonómicos, insulares/provinciales y fechas del municipio/centro. La aplicación permite introducir y editar todos ellos y marca qué ha de verificarse.
4. **Cambio de territorio seguro:** al cambiar el ámbito se desasocian el calendario anterior, sus fechas festivas, referencias curriculares específicas y la confirmación de horas heredadas. Las decisiones pedagógicas propias se mantienen, con advertencias de revisión.
5. **Ficha curricular identificable:** códigos oficiales del ciclo y módulo, URL/fuente del currículo aplicable, régimen de formación en empresa y aceptación docente de los datos curriculares; información exportable al Word/PDF.
6. **Temporalización coherente:** el cálculo de días lectivos y horas disponibles utiliza el calendario introducido para el curso y ámbito; no incluye fiestas ni fuentes canarias en el Gantt/documentos de otro territorio.
7. **Exportación territorialmente correcta:** Word, PDF y programa FEOE independiente recuperan la región y fuente curricular asignadas; el modelo de Canarias no se ofrece como propio de otra administración.
8. **API local:** `/api/territories` y `/api/territories/calendar` permiten recuperar la lista de ámbitos y la ficha de calendario concreta por curso.

## Límites, expresamente NO resueltos en esta fase

- **No hay aún una base oficial completa** de los módulos, currículos, horas semanales y normativa para todos los ciclos y años de las 17 comunidades autónomas, Ceuta y Melilla. Para centros fuera de la cobertura parcial, el docente aportará la fuente y las horas oficiales.
- **No hay calendario escolar oficial precargado** para todos los territorios, cursos, centros y modalidades. La ficha 2026-2027 de Canarias es una referencia inicial y siempre puede requerir modificaciones de centro, localidad, modalidad, evaluación y régimen.
- No se han compilado ni realizado pruebas gráficas reales de los ejecutables portátiles Windows, macOS ni Linux; estas pruebas son de código y navegador con respuestas simuladas, complementadas por un ensayo real de HTTP y SQLite.
- La IA no sustituye la revisión normativa ni la aprobación departamental; el dato no confirmado debe etiquetarse como pendiente.

## Comprobación técnica

Pruebas de regresión `python -m unittest discover -s tests -q`, verificación JavaScript `node --check web/app.js`, recorrido de Chromium con API simulada, y prueba extremo a extremo del servidor HTTP local con SQLite y exportación de DOCX/PDF/Markdown y FEOE independiente. No se altera ni recalcula por el cambio territorial ninguna calificación validada.

## Referencias oficiales para la ficha canaria de ejemplo 2026-2027

- Calendario escolar original: https://www.gobiernodecanarias.org/boc/2026/061/1025.html
- Corrección oficial (vacaciones de Navidad del **23/12/2026 al 08/01/2027**, ambos inclusive): https://www.gobiernodecanarias.org/boc/2026/075/1240.html

**El calendario laboral autonómico no equivale por sí solo al calendario escolar**; las fiestas locales, las adaptaciones de modalidad y los días propios del centro requieren confirmación adicional.

## Cómo actualizar

1. Realice una copia de seguridad de la carpeta de datos de EvalúaFP y del ejecutable anterior.
2. Para instalar desde cero la beta use el ZIP de **fuentes completas**. Si ya dispone del código 1.1.7.1 y no de una versión más antigua, puede descomprimir el **parche** sobre esa carpeta, respetando los nombres relativos de sus archivos.
3. En Windows, ejecute `CREAR_VERSION_PENDRIVE.bat` desde el proyecto. Si alguna prueba falla, no sustituya el EXE de trabajo.
4. Compruebe en una base de pruebas un módulo de Canarias y otro de cualquier otra comunidad. Verifique la carga horaria, el año académico, la fuente del calendario, los festivos y la exportación.
