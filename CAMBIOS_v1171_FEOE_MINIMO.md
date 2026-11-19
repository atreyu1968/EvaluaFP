# EvalúaFP 1.1.7.1 beta — Programa formativo mínimo FEOE independiente

## Nueva funcionalidad

En **Preparar mi módulo → Crear mi programación → 5. Unidades y empresa** se incorpora «Programa formativo mínimo en empresa», con un documento descargable **separado** en DOCX y PDF. También hay accesos en el último paso de revisión.

1. **Preparar propuesta mínima:** sin conexión a un proveedor externo. Selecciona CE reales y confirmados, de forma orientativa según transferibilidad, facilidad y presencia de tareas comunes en diferentes organizaciones. Si el docente ha elegido previamente CE en la matriz FEOE, conserva su selección.
2. **Mejorar propuesta con IA:** con clave configurada y autorización expresa, la IA puede elegir entre los CE oficiales confirmados (si aún no hay una selección docente) y proponer una tarea sencilla, una evidencia observable y apoyos graduados para cada criterio. Se rechaza cualquier código CE inventado, duplicado, omitido o distinto del ya confirmado por el docente.
3. **Revisar y modificar:** la matriz muestra el enunciado del criterio, tarea, evidencia y apoyo, todos editables salvo el código curricular.
4. **Guardar programa FEOE revisado:** registra la selección y las tareas en el borrador SQLite local, sin modificar RA, CE, ponderaciones ni calificaciones del módulo.
5. **Descargar independientemente:** Word editable, PDF y, por API, Markdown. Incluye datos del módulo, campos de alumno/empresa/tutores **pendientes de asignar**, criterios oficiales, tareas propuestas, evidencias y seguimiento.

## Criterios de seguridad pedagógica

Una misma tarea orientativa **no sirve necesariamente en cualquier empresa**, y las capacidades del alumnado pueden requerir apoyos diferenciados. El programa usa lenguaje llano pero no convierte una observación genérica en acreditación de un CE técnico. Identifica criterios potencialmente especializados y exige adaptar las actividades a la empresa real, al plan de formación y a las necesidades del alumnado, sin rebajar las exigencias curriculares. El centro y la empresa deben concretar las tareas y acordar el plan individual. La valoración de la empresa informa la evaluación; la responsabilidad docente no se transfiere automáticamente.

**El 10–20 % de CE es una preferencia orientativa del asistente, no una exigencia normativa general**. El porcentaje real de CE seleccionados aparece con dos decimales, y la aplicación no lo confunde con las condiciones aplicables a RA, horas y modalidad dual en el conjunto del ciclo.

Referencias para verificar el plan de formación aplicable en Canarias:
- https://www.gobiernodecanarias.org/boc/archivo/2025/176/pda/3174.html
- https://www.boe.es/buscar/act.php?id=BOE-A-2023-16889

## Pruebas y límites

- 142 pruebas automatizadas superadas, incluidas rutas HTTP reales DOCX/PDF, selección de CE, conservación de ediciones docentes, validación de propuestas IA y escenarios de CE especializados.
- Recorrido del asistente en Chromium con API simulada: propuesta, edición, aceptación y guardado.
- DOCX y PDF generados y renderizados para verificación visual. En Word las filas no se dividen entre páginas.
- No se han compilado nuevos ejecutables portátiles Windows/macOS/Linux. Requieren compilación y prueba en el sistema de destino.
- No hay clave de IA real en estas pruebas: la integración con IA externa se ha verificado mediante respuestas simuladas y validaciones locales. Si no se configura la IA, funciona la propuesta local, que **no es un resultado de IA**.
- El documento es un borrador de trabajo. **No sustituye el modelo oficial ni el convenio**, ni acredita que un CE se haya alcanzado.
