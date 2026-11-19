# EvalúaFP Local 1.2.0 beta — Consulta del BOE y lectura de anexos horarios

**Fecha de desarrollo:** 19 de noviembre de 2026. **Estado:** beta de código fuente, pendiente de validación en ejecutables portátiles.

## Finalidad

Reducir el trabajo manual necesario para identificar normas estatales relacionadas con un ciclo formativo y para copiar las tablas de distribución horaria de documentos oficiales, sin presentar como verificados datos que la aplicación no puede comprobar por sí sola.

| Función | Comportamiento | Límite y protección |
|---|---|---|
| Buscar normas del ciclo en el BOE | Petición HTTPS a la API oficial de legislación consolidada con el nombre del ciclo; lista de posibles disposiciones con identificador y enlace | Solo **candidatas**. El buscador no cubre todos los BOE ni la normativa educativa autonómica. Requiere Internet. |
| Examinar una norma | Consulta los metadatos y el análisis jurídico, cuando existen, para ofrecer referencias y modificaciones publicadas | El análisis automatizado no acredita vigencia ni aplicabilidad al módulo; el texto consolidado es informativo. |
| Añadir norma al borrador | Conserva una referencia legible en el apartado de normativa como **pendiente de revisión** | No cambia RA, CE, horas, ponderaciones ni estado de aprobación. |
| Previsualizar anexo horario PDF o DOCX | Lee localmente tablas con **Código, Módulo, Horas totales, Horas semanales** y muestra las filas | No importa ni confirma automáticamente; rechaza cifras incompletas o contradictorias. |
| OCR opcional | Intenta reconocer un PDF escaneado mediante PyMuPDF y Tesseract cuando este último está instalado y tiene idioma español | Hasta ocho páginas escaneadas por documento en esta versión; Tesseract no se suministra dentro de los portátiles. Un PDF difícil puede requerir conversión externa. |
| Importar tabla del ciclo | Permite confirmar la fuente, revisar la tabla y guardarla en la biblioteca local del mismo territorio, curso y ciclo | Nueva protección: exige que la tabla contenga al menos el **módulo seleccionado** antes de escribir cualquier fila. |
| Corregir referencia territorial | Los mensajes de la consulta estatal mencionan a la administración educativa competente, no a Canarias de manera indiscriminada | Las horas oficiales y calendarios no se trasladan de otro territorio o curso. |

## Flujo recomendado para el docente

1. Seleccione territorio, curso académico, ciclo y módulo, e introduzca el código oficial cuando esté disponible.
2. En el paso **Normativa y objetivos**, utilice **Buscar normas del ciclo en el BOE** o introduzca el identificador `BOE-A-AAAA-NNN` conocido.
3. Examine título, fecha, actualizaciones y enlace de la norma; revise la regulación curricular de la comunidad autónoma, además de la estatal.
4. Incorpore una referencia al borrador como **pendiente de revisión**, no como acreditación automática.
5. En **Unidades, temporalización y FEOE**, importe el PDF o Word que contenga una tabla horaria oficial, o copie las filas desde Excel/Calc.
6. Compruebe la correspondencia del ciclo y módulo, la norma, las horas totales y semanales y el curso de aplicación. Confirme antes de importar al registro local.
7. En el horario semanal, indique los días y sesiones reales, vacaciones y festivos del calendario del **curso seleccionado**, no de un curso anterior. Después revise el Gantt y los avisos de disponibilidad.

## Fuentes y límites normativos

- API pública del BOE: https://www.boe.es/datosabiertos/api/api.php?lang=es
- FAQ de legislación consolidada: https://www.boe.es/datosabiertos/faq/consolidada.php
- Directorio de las administraciones educativas de FP: https://www.todofp.es/sobre-fp/webs-fp-ccaa.html

El BOE es una **fuente estatal**. La aplicación no determina de forma concluyente el desarrollo curricular autonómico vigente, la distribución horaria del módulo ni el calendario lectivo de todos los territorios. La búsqueda y la revisión legal automatizada **no constituyen asesoramiento jurídico**.

## Pruebas realizadas

- Pruebas unitarias del descubrimiento del BOE con respuestas simuladas, incluido rechazo de identificadores incorrectos y redirecciones no oficiales.
- Pruebas de lectura de tablas PDF y DOCX, y de rechazo de códigos duplicados o datos incompatibles.
- Pruebas de seguridad: sin aceptación explícita, sin coincidencia con el módulo o sin fuente válida no se incorporan horas al repositorio local.
- Pruebas HTTP reales del nuevo servicio con SQLite temporal; el servidor local responde por la ruta autenticada.
- Prueba de interfaz en Chromium con **API simulada**; el acceso directo al servidor local del navegador de pruebas estaba restringido.
- Batería completa de regresión, cuya cifra definitiva se documenta en el registro de la entrega.

**Prueba pendiente:** consulta auténtica desde el ejecutable a la API del BOE, con conexión a Internet, y compilación y aceptación en Windows, Linux y macOS.

## Instalación

Haga copia de seguridad de SQLite y los documentos originales. Extraiga las **fuentes completas** en una nueva carpeta o aplique el parche **solo sobre fuentes de la versión 1.1.9**. En Windows ejecute `CREAR_VERSION_PENDRIVE.bat`. El código fuente no modifica automáticamente un EXE ya compilado.
