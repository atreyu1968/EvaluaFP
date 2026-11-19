# EvalúaFP 1.2.1 beta — Revisión contrastable de RA/CE

## Actualización sobre 1.2.0

Se ha integrado en la aplicación el módulo `curriculum_review.py`, anteriormente publicado como prototipo experimental, y se ha añadido un formulario de **previsualización curricular sin IA** dentro de «Preparar mi módulo». Se conservan las funcionalidades de la versión 1.2.0 (normativa estatal, anexos PDF/DOCX, calendarios y FEOE), así como las pantallas de evaluación y exportación.

| Función | Comportamiento | Límite |
|---|---|---|
| Lectura PDF, Word, TXT y Markdown | Localiza bloques de RA y CE identificables, sin completar criterios por conjeturas | Los documentos escaneados sin texto requieren OCR previo |
| Identificación del módulo | Exige nombre y código oficial de 4 cifras | Si el código del borrador no coincide, rechaza el documento |
| Procedencia | Identifica página (PDF), párrafo/fila (Word) o línea (texto), y SHA-256 | No comprueba automáticamente la vigencia normativa |
| Validación de estructura | Detecta RA faltantes, CE repetidos, enunciados demasiado breves, múltiples bloques y secuencias incompletas | Un documento mal estructurado puede requerir adaptación manual |
| Comparación con la base de datos | Señala RA y CE nuevos, distintos o no representados | **No modifica** los existentes ni sus calificaciones |
| Propuesta de ponderaciones | Todos los CE reciben peso global uniforme, con ajuste a 2 decimales; los RA según cantidad de CE | Es solo propuesta, no afecta a ponderaciones docentes |
| Protección de las notas | La ruta de previsualización solo lee SQLite y procesa temporalmente el archivo | No ofrece importación directa de datos previamente calificados |

## Cómo utilizar

1. Cree o seleccione un módulo de cualquier comunidad autónoma. Verifique su **nombre exacto y el código curricular**.
2. En «Preparar mi módulo», elija **Crear mi programación**, **Importar una programación** o la opción de incorporación de currículo antes de disponer de CE.
3. Abra **Extracción contrastable de RA y CE (sin IA)** y elija documento (programación o norma curricular).
4. Adjunte el archivo y pulse **Previsualizar RA y CE sin modificar datos**.
5. Revise la relación RA/CE, su procedencia, las diferencias y los pesos orientativos. Si ya existen criterios, la aplicación **bloquea cualquier sustitución automática**.
6. Para registrar o modificar RA/CE después de la revisión, use las herramientas curriculares existentes; esta beta no habilita aún una aceptación transaccional asistida del resultado.

## Pruebas y validación

- 176 pruebas originales de 1.2.0, 12 pruebas del motor independiente y 3 pruebas HTTP de integración, **191 pruebas automatizadas superadas**.
- Validación de sintaxis `node --check web/app.js`, y compilación del código Python.
- Comprobada la protección de pesos manuales y criterios existentes en SQLite real temporal.
- La compilación nativa de Windows, Linux y macOS y la consulta real del BOE requieren pruebas posteriores; **el ZIP suministrado son fuentes, no ejecutables nuevos**.

## Seguridad y publicación

Los textos y documentos curriculares no se envían a servicios externos en esta función. Se procesan en una carpeta temporal, se descartan después de generar la vista previa y no se incluyen en GitHub. No publique bases de datos SQLite, claves API ni documentación personal del alumnado. La fuente normativa, el curso y la comunidad deben verificarse siempre por el docente.

### Corrección de pruebas multiplataforma

Las pruebas de rutas portátiles comparan rutas canónicas resueltas para admitir en Windows los alias de nombre corto 8.3 (`RUNNER~1`) frente a su ruta larga, sin modificar la ubicación efectiva ni los datos de los usuarios. Esta corrección se comprobó tras detectar fallos en GitHub Actions de Windows.