# EvalúaFP 1.2.6 beta — Seguimiento de cambios normativos del BOE por módulo

**Fecha:** 20 de noviembre de 2026. **Entrega:** código fuente y pruebas. No incluye ejecutables recompilados.

## Función incorporada

El asistente de preparación del módulo dispone de una sección **«Vigilancia de cambios publicados en el BOE»**. Se puede introducir un identificador oficial `BOE-A-AAAA-NNN`, o recuperar un identificador presente en la fuente curricular del borrador o en una versión archivada de la disposición del mismo módulo.

La primera consulta registra **una referencia inicial** de los metadatos de la API de legislación consolidada del BOE; las consultas posteriores contrastan título, fecha de publicación, fecha de última actualización, estado informado y referencias a disposiciones modificadoras. Si hay diferencias, conserva el antes/después y deja una **alerta pendiente de revisión docente**. La alerta no desaparece por volver a consultar la misma versión: el docente debe examinar el resultado y registrar una conclusión. El acuse no aprueba ni modifica el currículo.

### Ámbito y seguridad

- Los registros se aíslan por **módulo local + administración educativa + curso académico + código oficial del módulo**; no se reutilizan entre años ni entre comunidades.
- Solo se consulta la API pública oficial del **BOE** mediante `boe_discovery.inspect_boe_id`, a partir de un identificador validado. No se transmiten nombres del alumnado, documentos, notas, textos de programación ni contraseñas.
- Se exige confirmación del profesor antes de la primera comprobación o cada nueva comprobación. La detección de cambios exige además una anotación expresa para marcar la alerta como revisada.
- No hay consultas automáticas al iniciar la aplicación, tareas programadas, rastreo masivo ni ejecución de contenido externo.
- Si la API falla o no devuelve análisis jurídico suficientemente identificable, no se modifica la referencia previa y se muestra el error.
- Las tablas nuevas se añaden mediante migración SQLite no destructiva. No se modifican las tablas de RA, CE, ponderaciones, programaciones ni calificaciones.

### Límites que no se deben confundir

**Cambio de metadatos ≠ cambio confirmado del currículo aplicable.** Una misma disposición estatal puede no ser la norma curricular efectiva en la comunidad, el régimen o el curso. El BOE no sustituye los boletines autonómicos, las resoluciones de calendario ni las correcciones publicadas en ellos. **«Sin cambios observados» tampoco equivale a «norma vigente»**. La API puede ofrecer un análisis parcial y la aplicación solo compara los datos que recibe; no descarga ni compara el texto articulado completo de las disposiciones. La función no es un sistema jurídico de seguimiento exhaustivo.

## Uso docente

1. Abrir **Preparar mi módulo** y guardar el código oficial de cuatro cifras del módulo.
2. Acceder al apartado de revisión curricular, donde aparece **Vigilancia de cambios publicados en el BOE**.
3. Introducir o seleccionar un identificador BOE del currículo o de una modificación relacionada; abrir previamente la norma para contrastar su correspondencia.
4. Pulsar **Consultar cambios** y confirmar. La primera consulta crea la referencia; las siguientes detectan diferencias observables.
5. Si aparece una alerta, abrir el BOE, revisar el alcance de la modificación y, si procede, contrastar el currículo autonómico. Utilizar **Registrar revisión docente** y escribir una conclusión. Actualizar RA/CE u otros elementos únicamente a través de los procedimientos separados de revisión y confirmación.

## API local

| Método | Ruta | Resultado |
|---|---|---|
| GET | `/api/national/boe-monitor?module_id=...` | Fuentes asociadas al ámbito actual, alertas e historial reciente |
| POST | `/api/national/boe-monitor/check` | Comprueba un `boe_id` después de `teacher_confirmed: true`; guarda solo metadatos y diferencias |
| POST | `/api/national/boe-monitor/ack` | Registra la revisión de una alerta pendiente con nota de 12–1000 caracteres y confirmación |

La API local conserva la autenticación de sesión de EvalúaFP; no expone endpoints públicos anónimos.

## Pruebas y distribución

Se añaden pruebas para la primera referencia, consultas repetidas, nueva modificación, alerta persistente, acuse docente, fallos de metadatos, rechazo de suplantación de URL y separación territorial. Incluye prueba HTTP autenticada con SQLite aislado y API BOE simulada. La prueba unitaria **aislada** del nuevo módulo ha superado cuatro casos en el entorno de desarrollo; la batería completa debe ejecutarse en CI y en los equipos de destino antes de distribuir ejecutables.

**Continúa pendiente:** control de modificaciones de boletines autonómicos, mantenimiento de un catálogo nacional completo y versionado de títulos/módulos/currículos, calendarios oficiales de todos los cursos y territorios y pruebas de OCR y ejecutables portátiles nativos.