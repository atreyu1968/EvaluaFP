# EvalúaFP 1.1.0-beta — Cambios funcionales

## Experiencia de usuario

- Inicio reorganizado por tareas docentes, en vez de indicadores técnicos.
- Nueva opción «Preparar módulo» con tres vías: importar una programación existente, crear un borrador y configurar únicamente la evaluación.
- Revisión de RA y CE propuestos mediante formularios normales, sin requerir la edición directa de JSON.
- Asistente de seis etapas para preparar borradores de programación didáctica con distribución de CE por unidades y trimestres.
- Formulario de exámenes simplificado (título, tipo, número de preguntas y selección de RA/CE); mantiene las opciones avanzadas existentes.
- La ventana introductoria obligatoria de 10 segundos deja de interrumpir la apertura.
- En el menú principal, las funciones avanzadas quedan en un apartado desplegable.

## Persistencia y documentos

- Migración SQLite aditiva `programming_drafts` (no altera RA, CE, pesos ni notas).
- Validación de campos, secuencia y relación entre CE/unidades; advertencias claras para revisión docente.
- Exportación real de borrador a Word (.docx), PDF y Markdown, siempre marcada como BORRADOR sin aprobación institucional.
- API local: `GET /api/programming-builder/{id}`; `POST /api/programming-builder/save`; `GET /api/programming-builder/{id}/export.{docx,pdf,md}`.

## Estado de calidad

- 84 pruebas automatizadas superadas en Python 3.13 (incluidas las nuevas de exportación, persistencia, seguridad local e integridad de porcentajes).
- Comprobación de sintaxis JavaScript con `node --check`.
- **Versión beta**: falta prueba visual integral en cada sistema operativo, prueba de accesibilidad con docentes y compilación final de portables actualizados.
