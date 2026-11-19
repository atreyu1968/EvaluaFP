
## Actualización 1.1.2-beta — Auditoría de bloqueo y navegación

Se han añadido límites a las consultas de la API local, cancelación de lecturas obsoletas, recuperación de errores con reintento y avisos visibles en acciones y cambios de selección. Se han corregido la generación de códigos de unidades didácticas tras eliminaciones intermedias y la detección del estado de los botones de materiales.

**Pruebas:** 92 pruebas Python superadas y recorridos de Chromium con API simulada, incluidos fallos de servidor, navegación simultánea y seis pasos del asistente. Consulta el informe técnico en [`docs/INFORME_AUDITORIA_1.1.2.md`](docs/INFORME_AUDITORIA_1.1.2.md).

La versión se distribuye como **fuentes revisadas**; no sustituye las aplicaciones portátiles compiladas anteriormente. Debe recompilarse en el sistema de destino.


Para actualizar, aplicar el parche a las fuentes 1.1.1 y ejecutar `python -m unittest discover -s tests -q` antes de recompilar.
