# EvalúaFP Local 1.1.6 beta — Generador inteligente de programaciones

## Qué incorpora esta actualización

Se ha completado el flujo de *Crear mi programación* con un **borrador inicial de los 27 apartados pedagógicos**, basado en las denominaciones, ciclo, curso y RA/CE ya confirmados. La generación inicial es **local y funciona sin API de IA**. Las propuestas se distinguen de los datos normativos y de las decisiones del docente y quedan editables.

Al pulsar «Desarrollar todos los apartados con IA», la app solicita autorización y envía al proveedor elegido **solo los datos académicos generales del módulo y RA/CE**. La respuesta solo sustituye campos vacíos o propuestas locales todavía no modificadas. Las decisiones docentes se conservan. El docente puede también pulsar «Mejorar redacción con IA» en cada campo: verá el original y la propuesta para **aceptar o descartar**. Es necesaria una clave API configurada y desbloqueada en Ajustes.

**Contenido de los 27 apartados:** justificación, identificación, punto de partida, centro, alumnado (sin datos personales), entorno, marco normativo, objetivos, competencias, cualificaciones, contenidos, situaciones de aprendizaje, metodología, interdisciplinariedad, inclusión/DUA, recursos, evaluación, instrumentos, calificación, sesiones de evaluación, recuperación, extraordinaria, promoción, asistencia, FEOE, actividades complementarias/extraescolares y observaciones.

## Normativa, horas y calendario

- Recomendaciones normativas estatales y de Canarias mediante enlaces oficiales identificados. **No se certifica la vigencia/consolidación de la norma automáticamente**; el docente debe contrastarla.
- Consulta de **ficha horaria de referencia** para módulos reconocidos de **CFGM Gestión Administrativa y CFGS Administración y Finanzas en Canarias**, basada en el anexo de distribución horaria de 2024. Ejemplo: Técnica Contable (0441): 96 horas totales, 3 horas semanales. Proceso integral de la actividad comercial (0650): 202 horas totales, 6 semanales. En ambos casos se advierte de que las modificaciones posteriores requieren contraste.
- Para otros ciclos o comunidades **no se asigna una cifra supuesta**. Las horas se introducen o verifican expresamente y quedan registradas junto a su procedencia.
- El calendario base incorpora los periodos conocidos de **Canarias 2026-2027**; los festivos municipales, días de libre disposición y horario real de lunes a viernes son revisables. No se aplica el calendario de Canarias a otra comunidad.
- La propuesta de una unidad por RA usa las horas totales consignadas y la proporción de CE, **sin fabricar horas**. Busca una distribución entre evaluaciones que reduzca desbordamientos, pero si es imposible encajar las horas en el horario indicado **avisa con un déficit explícito**.
- Matriz editada de RA/CE y pesos: modo automático por número de CE o manual con validación de todos los criterios, 100,00 % de RA y 100,00 % de CE dentro de cada RA; bloqueo con calificaciones finales cerradas.
- Selección FEOE y actividades complementarias/extraescolares. El 10–20 % de CE para FEOE es un criterio orientativo del proyecto y **no equivale a la comprobación legal de distribución de RA del ciclo**. No añade pesos a las notas.

## Documentos

La exportación a DOCX y PDF incorpora portada, índice, apartados pedagógicos individuales, tablas de RA/CE/unidades/recursos y una página de Gantt temporal. Exportación a Markdown como alternativa. Las horas y porcentajes se presentan con 2 decimales; el cálculo interno mantiene la precisión. Todos los documentos quedan identificados como **BORRADOR pendiente de aprobación del centro**.

## Instalación y compilación en Windows

1. Cierre EvalúaFP y haga una **copia de seguridad** de su almacenamiento local/USB.
2. Extraiga el ZIP **completo** en una carpeta nueva; no mezcle los archivos con los de otra versión.
3. Ejecute `CREAR_VERSION_PENDRIVE.bat` desde la carpeta que contiene `app.py` y `web`.
4. El archivo compilado, si PyInstaller termina correctamente en su Windows, estará en `dist\EvaluaFP_Portatil\EvaluaFP_Portatil.exe`. Traslade **toda la carpeta** `EvaluaFP_Portatil`, preservando los datos del pendrive anterior.
5. Antes de usar calificaciones reales, pruebe una programación ficticia y confirme que aparecen las horas reales, los CE y la programación exportada.

La nueva versión es **código fuente beta**, no binarios ya compilados, firmados o instalados. No se ha probado PyInstaller en un equipo físico Windows durante esta entrega.

## Pruebas y limitaciones

- 131 pruebas `unittest` de componentes, ponderaciones, IA autorizada y editor de programación. Validación JavaScript con Node.
- Recorrido de navegador Chromium con llamadas API **simuladas**: formularios, mejoras IA, protección de texto docente, temporalización, unidades y cambios entre pasos.
- Prueba adicional HTTP **real**, aislada con SQLite: creación de módulo, 27 borradores, referencia de horas, consentimiento IA y guardado.
- Exportaciones de ejemplo PDF y Word generadas y **renderizadas** para revisión visual.

**Límites conocidos:** (a) el catálogo de horas de Canarias no abarca todas las familias/ciclos; (b) no existe todavía consulta en vivo general al BOC/BOE y al calendario escolar de cada comunidad; (c) los textos base local son propuestas y necesitan personalización; (d) la IA externa no puede verificarse sin clave y proveedor real, por lo que en pruebas se usan respuestas simuladas; (e) no hay OCR de programaciones escaneadas sin capa de texto; (f) las sesiones/horas y la FEOE requieren aprobación del docente y plan de formación del centro.
