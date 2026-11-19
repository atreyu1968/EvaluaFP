# EvalúaFP Local 1.1.5.1 beta — Importación integral de programaciones

## Qué se ha corregido

Anteriormente la opción **«Ya tengo una programación»** guardaba el original y ofrecía analizar únicamente los RA y CE. Ahora, al subir el documento, se abre una **revisión de todos los apartados recuperables** de PDF, DOCX, TXT y Markdown, sin enviar el documento a una IA.

- Reconocimiento de epígrafes del marco normativo, justificación, contexto, centro, alumnado, entorno socioproductivo, datos identificativos, competencias y cualificaciones, objetivos, contenidos, actividades de aprendizaje, metodología, interdisciplinariedad, diversidad, recursos, actividades complementarias y extraescolares, evaluación, sesiones, calificación, promoción, asistencia, recuperación, pruebas extraordinarias y FEOE.
- Recuperación estrictamente documental del docente y centro cuando figuran claramente en la portada.
- Recuperación **tentativa** de las horas anuales y semanales mencionadas en el archivo (no se supone vigencia normativa) y reconocimiento de las unidades, sus títulos y evaluación cuando figuran en una tabla identificable. Los periodos y las horas no inequívocos no se inventan.
- Identificación documental de los CE señalados para la FEOE, sin alterar notas, ponderaciones ni requisitos de formación en empresa.
- Vista previa editable: cada campo dispone de una casilla para incorporar o no su contenido; los campos ya cumplimentados están **desmarcados por defecto**. El texto original queda almacenado.
- Conservación de **todos los apartados** detectados, incluidos los que no encuentran correspondencia estructurada, con título y número de página cuando procede. Se incluyen como anexo de procedencia en las exportaciones DOCX, PDF y Markdown.
- Los RA y CE se siguen verificando y confirmando por separado. El documento importado **no se considera oficial por sí solo**.

## Funcionamiento docente

1. Abrir «Preparar módulo» → «Ya tengo una programación».
2. Seleccionar un PDF/DOCX/TXT/MD y pulsar «Guardar documento».
3. Revisar la vista previa de apartados, elegir campos y corregir el texto propuesto.
4. Confirmar, si corresponde, horas que consten explícitamente en el documento y, en su caso, horas de cada unidad antes de crearla; la aplicación nunca inventará duraciones.
5. Opcionalmente, aceptar los CE que el archivo identifica para la FEOE; comprobar que se corresponden con el currículo confirmado.
6. Pulsar «Guardar los apartados seleccionados».
7. Revisar aparte los RA y CE y comprobar la normativa vigente de su comunidad autónoma.
8. Editar los otros apartados importados desde el último paso del asistente y exportar el borrador.

## Ejemplo real de comprobación

Con el documento de 54 páginas **«26 - PNG - 1CFGS - ISAIAS.pdf»** utilizado como referencia, se detectaron **32 apartados**, **28 campos recuperados o asociados a apartados** y **siete unidades** con su evaluación. Aparecen como propuesta las **202 horas totales y 6 semanales** que constan en el documento, así como los CE **RA4.g, RA4.h y RA5.b** identificados en FEOE. Estas son lecturas del documento, no una comprobación de vigencia legal.

El borrador generado desde la importación de prueba produjo un PDF de 79 páginas y un DOCX válido. Este resultado contiene anexo íntegro de los apartados originales, por lo que puede tener más páginas que el documento aportado. La página de origen se mantiene en el anexo.

## Integridad y privacidad

- Ningún dato académico, clave o documento importado se envía al proveedor de IA durante **esta extracción local**.
- El archivo original se conserva con su SHA-256.
- No se sobrescriben campos existentes sin selección docente explícita.
- El sistema no deduce fechas oficiales, horas de unidades ni porcentajes no escritos.
- El borrador exportado no acredita aprobación institucional ni validez de la normativa citada por el documento.
- La extracción de RA/CE sigue siendo un proceso independiente, expresamente revisable.

## Limitaciones que siguen pendientes

La identificación de encabezados depende de la calidad del texto. Un PDF escaneado sin OCR, tablas desordenadas o documentos de estructura muy diferente pueden necesitar corrección manual. El módulo de **generación jurídica y contrastación autonómica en tiempo real** y el **autorrelleno con IA de textos pedagógicos** no quedan terminados por este parche; deben verificarse por separado antes de presentarlos como operativos. La versión Windows portátil debe recompilarse y probarse en Windows; el ZIP entregado contiene fuentes, no el EXE.

### Revisión posterior: compatibilidad con Word de estilos numerados

La importación DOCX distingue títulos definidos con el estilo **Heading/Título**, incluso si usan números al inicio o no están escritos en mayúsculas. Conserva el orden de los párrafos y el contenido de las tablas de Word. Los apartados no reconocidos se mantienen íntegros en la transcripción original, a la espera de clasificación o edición docente. La extracción no utiliza IA ni valida automáticamente los contenidos importados. Un DOCX no proporciona la paginación impresa fiable durante esta extracción: la referencia a página 1 equivale a la secuencia del documento, no a un folio concreto.

**Prueba real con programación de referencia PDF (54 páginas):** 32 apartados recuperados, 28 campos, 7 unidades detectadas y 202 horas totales / 6 semanales **extraídas del documento, aún sin validar contra normativa**. Los 3 CE de FEOE encontrados deben confirmarse con el plan de formación en empresa.

**Prueba adicional con programación DOCX:** los encabezados de Word y las tablas quedan preservados como texto estructurado para su revisión; no se realiza una homologación automática de las unidades ni de las ponderaciones.

**Precaución:** esta modificación no incorpora un motor de OCR para PDFs de imágenes; si la programación escaneada no ofrece texto seleccionable, hay que realizar reconocimiento de texto antes de importarla. Tampoco es todavía una nueva compilación portátil para Windows.
