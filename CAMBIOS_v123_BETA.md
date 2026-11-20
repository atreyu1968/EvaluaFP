# EvalúaFP 1.2.3 beta — Catálogo de títulos y módulos por comunidad y curso

**Fecha:** 20 de noviembre de 2026. **Estado:** beta de fuentes Python y web; todavía no constituye un catálogo oficial nacional exhaustivo.

## Objetivo del incremento

Poder crear un módulo desde una ficha de título/módulo previamente revisada por un docente, conservando su fuente y **sin confundir las distribuciones horarias o los desarrollos curriculares de distintas comunidades autónomas o cursos escolares**.

La funcionalidad trabaja en los 19 ámbitos educativos (17 comunidades autónomas, Ceuta y Melilla). No presume implantación de un título en un centro ni que una norma conserve vigencia después del curso revisado.

## Funciones nuevas

| Función | Resultado | Precaución |
|---|---|---|
| Catálogo local de títulos y módulos | Se pueden importar varias fichas desde CSV o una tabla pegada de Excel/Calc | Su contenido procede de documentos contrastados por el docente, **no de una descarga nacional automática** |
| Identificación inequívoca | Registra código del título, nombre del ciclo, grado, familia, código de módulo y nombre del módulo | Se rechazan códigos o campos incompletos y títulos contradichos dentro del mismo lote |
| Ámbito y curso | Cada ficha se guarda con su administración educativa y curso académico | Nunca se aplica sin validación a otro territorio o curso |
| Vista previa | Presenta un resumen de las fichas antes de escribir SQLite | La vista previa no modifica ninguna tabla curricular ni calificación |
| Trazabilidad | Guarda URL HTTPS, título de la disposición, huella SHA-256 y fecha de revisión | El docente debe comprobar la vigencia real de la fuente |
| Versiones contradictorias | Se rechazan importaciones que modificarían fichas previamente confirmadas | Una actualización expresa se archiva en `fp_catalog_revisions` |
| Creación guiada de módulo | La búsqueda permite seleccionar una ficha y rellenar ciclo y módulo | El servidor comprueba código, comunidad y curso antes de crear; solo traspasa identificación y procedencia |
| Protege RA/CE y notas | No importa ni repondera RA/CE, exámenes, calificaciones, horarios o FEOE | Se requiere una comprobación independiente de esos elementos |
| Fuentes ministeriales | Enlaces al Catálogo Modular y Catálogo Nacional de Ofertas de TodoFP | Son puntos de acceso a las fuentes, no certificación de las filas |

## Cómo utilizarlo

1. Acceda a **Preparar mi módulo → Nuevo módulo**, seleccione el territorio y el curso académico.
2. En **Catálogo de títulos y módulos**, busque por código, ciclo, familia o módulo. Si existe una ficha del mismo ámbito y curso, pulse **Utilizar módulo**.
3. Si no existe, consulte en TodoFP o en el boletín oficial la norma aplicable y prepare seis columnas:

```csv
Código título;Ciclo;Grado;Familia;Código módulo;Módulo
DEMO001;Ciclo de ejemplo;Superior;Familia profesional de ejemplo;9999;Módulo de ejemplo
```

   Los códigos `DEMO001` y `9999` son **ficticios y solo ilustran el formato**.
4. Pegue las filas, obtenga una vista previa e indique URL y título de la disposición. Confirme que corresponden a ese ciclo, territorio y curso.
5. Guarde las filas, búsquelas y seleccione el módulo. El código y la procedencia aparecerán en el borrador con el currículo **sin confirmar**.
6. Incorpore después RA/CE desde su disposición oficial y verifique por separado horas, calendarios y condiciones de formación en empresa.

## Nuevas rutas locales

| Método | Ruta | Alcance |
|---|---|---|
| GET | `/api/national/catalog?region=...&academic_year=...&q=...` | Búsqueda por ámbito y curso de fichas locales |
| POST | `/api/national/catalog/preview` | Valida una tabla sin persistir |
| POST | `/api/national/catalog/import` | Guarda un lote tras confirmación y fuente explícitas |
| POST | `/api/modules` con `catalog_entry_id` opcional | Crea un módulo desde una ficha que coincida exactamente |

## Comprobaciones realizadas

- **209 pruebas automatizadas superadas**, incluidas pruebas nuevas para las 19 administraciones, actualización de fichas, aislamiento por curso, datos contradictorios y rutas HTTP con SQLite real.
- `node --check web/app.js` y `python -m compileall`: sin errores de sintaxis.
- Chromium: importación de una tabla, consulta y creación de un módulo con la API/SQLite reales a través de un puente de localhost en el entorno de pruebas.
- **No se han compilado ni probado ejecutables nuevos** de Windows, Linux o macOS.

## Trabajo todavía pendiente

1. Poblar y mantener automáticamente el **catálogo oficial completo de títulos y módulos** de Grados D y E, incluyendo sustituciones y nuevas disposiciones.
2. Vincular de modo verificable el código del título con la norma del currículo aplicable **por comunidad, curso y modalidad**.
3. Completar los **calendarios escolares oficiales** y sus correcciones y festivos por territorio, curso y centro.
4. Verificar actualizaciones normativas en línea y generar comparaciones con el historial sin asumir que la ausencia de resultados equivale a vigencia.
5. Incorporar el OCR a las compilaciones y ejecutar pruebas nativas de los tres sistemas operativos.

## Referencias de partida

- TodoFP, Registros y Catálogos: https://todofp.es/catalogos-registros-sistema-fp.html
- TodoFP, Catálogos y folletos descargables: https://www.todofp.es/que-estudiar/material-descargable.html
- BOE, Real Decreto 69/2025 (instrumentos del sistema): https://www.boe.es/eli/es/rd/2025/02/04/69

**Advertencia:** el nombre “catálogo nacional” describe su alcance territorial y su finalidad de crecer hacia una cobertura nacional. La presente beta mantiene una biblioteca local revisada por docentes; no declara una cobertura oficial del 100 %.
