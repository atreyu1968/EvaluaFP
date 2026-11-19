# Prototipo 1.2.1 — Extractor y comparador de RA/CE

**Estado: complemento independiente, aún NO integrado en la interfaz ni en SQLite.**

Este incremento forma parte del trabajo hacia EvalúaFP 1.2.1. No constituye una versión completa ni reemplaza los fuentes de la beta 1.2.0. La rama pública `main` consultada antes de publicar este complemento correspondía a una versión más antigua (1.0.6). Para evitar regresiones, se propone conservarlo en una **rama y revisión independiente** hasta disponer de los fuentes completos de la última beta.

## Funciones

- Lectura en local de programaciones y textos curriculares en PDF, Word, TXT y Markdown.
- Extracción por bloques explícitos de **resultados de aprendizaje** y **criterios de evaluación**, con procedencia por página, párrafo o línea.
- Identificación del código oficial y del nombre del módulo; cuando el documento contiene más de un módulo, la consulta normativa se limita al encabezado del módulo seleccionado.
- Validaciones de RA consecutivos, CE consecutivos, criterios duplicados e identificadores contradictorios.
- Cálculo orientativo de pesos: **todos los CE con igual ponderación global**; cada RA obtiene un peso proporcional a los CE asociados y el reparto cierra en 100,00 %.
- Comparación de RA y CE propuestos con una lista existente, incluidas diferencias de redacción, elementos nuevos y faltantes, **sin sobrescribir nada**.

## Uso desde Python

```python
from curriculum_review import preview, propose_equal_weights, compare

propuesta = preview(
    'mi_programacion.pdf',
    module_name='Proceso integral de la actividad comercial',
    module_code='0650',
    document_kind='programacion',  # o 'norma_oficial'
)
pesos = propose_equal_weights(propuesta)
diferencias = compare(propuesta, existing_outcomes=[])
```

La salida de `preview()` tiene el estado `pendiente_revision_docente`: **no acredita por sí sola la vigencia de una disposición**. Tampoco modifica tablas de RA/CE ni las calificaciones del alumnado. Para la integración será imprescindible que cualquier aplicación de cambios requiera confirmación expresa, preserve pesos docentes, tenga historial auditable y detecte criterios ya vinculados a evidencias o pruebas.

## Requisitos y pruebas

```bash
python -m pip install pymupdf python-docx
python -m unittest discover -s tests -v
```

Se incluyen 12 pruebas sintéticas, sin nombres ni datos del alumnado. También se verificó manualmente con una programación PDF proporcionada en la conversación que el motor identificaba 7 RA y 60 CE, manteniendo referencias a las páginas. **Ese PDF no se incluye en la rama pública**.

## Integración pendiente

1. Comparar primero con el esquema de la última beta **1.2.0** (no con el `main` antiguo).
2. Incorporar una API de previsualización autenticada, sin escrituras automáticas.
3. Construir una cuadrícula de revisión donde se vean RA, CE, fuente, diferencias y ponderaciones propuestas.
4. Aplicar únicamente las decisiones confirmadas por el docente, sin sobrescribir registros con evidencias o calificaciones, conservando el histórico.
5. Ejecutar la batería completa de regresión de la última beta y pruebas con documentos de varios ciclos y comunidades autónomas.

## Protección de datos

El módulo no efectúa solicitudes a Internet ni IA. Los documentos se procesan en memoria para extraer texto; para el uso docente deben conservarse en un almacenamiento local seguro. No suba a GitHub programaciones de centros con información personal, expedientes, bases SQLite ni claves API.
