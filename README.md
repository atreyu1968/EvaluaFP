# EvalúaFP Local

**Aplicación local para la creación, corrección asistida y evaluación de instrumentos de Formación Profesional, organizada por resultados de aprendizaje (RA) y criterios de evaluación (CE).**

**Versión del código:** 1.0.6 · **Desarrollador:** Francisco Javier González Rolo · **Sistema principal:** Windows 10/11 (x64) · **Base de datos:** SQLite · **Interfaz:** HTML/CSS/JavaScript con ventana WebView2.

> **Estado:** proyecto en desarrollo. La ejecución automatizada de 72 pruebas ha concluido correctamente en el entorno de desarrollo; la compilación, la ventana gráfica y el instalador deben verificarse en Windows antes de distribuir la aplicación. La calificación definitiva requiere validación docente.


## Novedades v1.0.6 — Ponderaciones automáticas y web de presentación

### Criterios equivalentes cuando la programación no indica pesos

**Regla por defecto establecida para EvalúaFP:** todos los criterios de evaluación (CE) tendrán la **misma ponderación global en el módulo**, salvo que la programación didáctica establezca expresamente otra distribución. Cada resultado de aprendizaje (RA) obtiene un peso proporcional a la cantidad de criterios que contiene.

- **Peso global de un CE:** `100 / número total de CE del módulo`.
- **Peso de un RA:** `100 × número de CE de ese RA / número total de CE del módulo`.
- **Peso de cada CE dentro de su RA:** `100 / número de CE de ese RA`.

**Ejemplo:** un módulo tiene RA1 con 3 CE y RA2 con 5 CE (8 CE en total). Cada CE representa **12,50 %** del módulo; RA1 pesa **37,50 %** y RA2 pesa **62,50 %**. Dentro de RA1, los CE pesan aproximadamente 33,33 % cada uno; dentro de RA2, 20 % cada uno. Los redondeos se ajustan en centésimas para que cada conjunto cierre exactamente en 100 %.

Al **confirmar una extracción curricular**, al **añadir RA o CE manualmente** y al **consultar normativa oficial**, la aplicación completa únicamente las ponderaciones que no estén expresamente establecidas. La información se guarda con una marca de origen en la tabla SQLite `weight_origins`:

| Origen | Significado | ¿Se recalcula al cambiar los CE? |
|---|---|---|
| `default` | Propuesta automática de EvalúaFP | Sí |
| `programming` | Peso expresamente recogido en la programación confirmada | No |
| `manual` | Peso editado y confirmado por el docente | No |
| `existing` | Valor anterior a la incorporación del registro de procedencia | No, por precaución |

En **Programaciones y CE**, junto a cada peso aparece su procedencia. Para sustituir un peso por otro, utilice **Editar RA** o **Editar CE**; si deja el campo en blanco, ese elemento vuelve al cálculo automático. Las decisiones manuales se conservan aunque posteriormente se vuelva a importar una programación.

Si solo algunos porcentajes son expresos, EvalúaFP distribuye el **porcentaje restante** entre los elementos sin ponderar, proporcionalmente al número de criterios en los RA y por partes iguales en los CE del mismo RA. Si los valores expresos ya superan el 100 %, **no los sobrescribe ni los normaliza silenciosamente**: la evaluación mostrará una advertencia. Un RA sin CE permanece sin ponderación definitiva.

> **La formación en empresa se trata por separado.** Esta regla de distribución curricular **no establece automáticamente un porcentaje de FE** ni convierte una programación incongruente (por ejemplo, cinco RA del 20 % y un 25 % adicional de empresa) en una distribución válida. El docente debe validar la política de evaluación y, cuando corresponda, formalizar su corrección.

### Landing de presentación gratuita

Se incorpora una web estática, adaptable a móviles, en [`docs/index.html`](docs/index.html). Sus recursos se incluyen en `docs/assets/`: estilos, interacción, icono y **capturas de la interfaz real** de EvalúaFP con un grupo ficticio etiquetado como demostración. La web presenta el flujo de evaluación, la corrección multipágina, el cuaderno RA/CE, el modo USB y una calculadora ilustrativa de los pesos automáticos.

- **Visualización local:** abra `docs/index.html` en un navegador; no precisa ejecutar el servidor de EvalúaFP.
- **Publicación gratuita:** en el repositorio, configure **Settings → Pages → Deploy from a branch → main /docs** (cuando la opción esté disponible). GitHub Pages no se activa únicamente con añadir los archivos; es necesaria la configuración del repositorio.
- **Descarga:** la web enlaza al ZIP del código fuente público, que requiere compilación para obtener un `.exe`. No se anuncia un instalador Windows ya verificado.
- **Costes:** la aplicación se promociona sin coste de licencia de uso, pero el proveedor de IA que elija el docente puede cobrar por consumo. No se incluye ni se presupone una clave API gratuita.

### Alcance de esta actualización

- Migración **no destructiva** de SQLite para registrar procedencia de pesos; al abrir una base existente se completan los pesos NULL sin alterar los porcentajes expresos.
- Reequilibrado automático únicamente de criterios y resultados marcados como automáticos.
- Se conservan los datos antiguos con pesos expresos sin modificar.
- Se han ejecutado **72 pruebas automatizadas** del proyecto; el ejecutable y el instalador de Windows requieren aún validación real.

## Novedades v1.0.5 — Exámenes manuales y consulta curricular oficial

### Vinculación autónoma de preguntas manuales a RA y CE

En **Exámenes y rúbricas → Crear un examen manual**:

1. El docente redacta las preguntas en el editor JSON con `kind`, `prompt`, `points`, `ideal_answer` y `rubric`. **No es necesario indicar el criterio de antemano**.
2. Pulse **«Analizar preguntas y proponer RA/CE con IA»** y autorice el envío de los enunciados y los RA/CE confirmados (no se envían datos del alumnado).
3. La IA compara lo realmente evaluado en cada pregunta con los CE del catálogo curricular y propone hasta cuatro CE con **peso porcentual sobre esa pregunta**, confianza y justificación. No inventa identificadores.
4. Revise la propuesta en pantalla y edite el JSON cuando sea necesario. Una pregunta sin correspondencia inequívoca queda pendiente para asignación docente.
5. Marque la confirmación de revisión curricular y guarde el examen. Las asociaciones se conservan en `exam_question_criteria` de SQLite, sin borrar las relaciones antiguas.

**Ejemplo de dos CE para una pregunta de 10 puntos:**

```json
{
  "kind": "problema",
  "prompt": "Enunciado completo del supuesto contable...",
  "points": 10,
  "ideal_answer": "Solución desarrollada...",
  "rubric": [{"criterion": "Procedimiento", "weight_pct": 100}],
  "criteria_allocations": [
    {"criterion_id": 21, "weight_pct": 60, "rationale": "Procedimiento contable"},
    {"criterion_id": 22, "weight_pct": 40, "rationale": "Registro de operaciones"}
  ]
}
```

Los `criterion_id` del ejemplo son ilustrativos: deben corresponder a los identificadores que devuelve **tu propia base SQLite**. Las ponderaciones de esta asignación distribuyen los **puntos de una pregunta**; no son las ponderaciones oficiales de los RA o CE en la programación. En el libro de notas, una pregunta de 10 puntos calificada con 8 reparte 4,8 y 3,2 puntos entre los dos CE del ejemplo, sin duplicar la puntuación.

### Consulta oficial cuando faltan RA o CE

En **Programaciones y CE → Consultar RA/CE en el BOE** puede indicar un identificador `BOE-A-AAAA-NNN`. Para **Técnica Contable (0441)**, se propone el Real Decreto 1631/2009 (`BOE-A-2009-19148`). La aplicación descarga únicamente de `www.boe.es`, extrae los apartados identificados por número y letra y muestra **fuente y fecha de consulta**. Requiere Internet; si no es posible identificar el bloque curricular de forma fiable, no se importa nada.

Las propuestas normativas **no se incorporan sin confirmación docente**, no completan automáticamente las ponderaciones y no sustituyen la comprobación de la normativa autonómica de Canarias ni la vigencia de la disposición. Los pesos de RA y CE ya configurados se preservan si la norma no recoge otros valores.

Si en un examen manual no existen CE confirmados o una pregunta queda sin correspondencia, aparece un acceso para consultar el BOE, conservando el borrador del examen. Para títulos distintos de Técnica Contable hay que introducir el identificador oficial correcto.

### Actualización y seguridad

- Crear previamente copia de la base SQLite y documentos originales; después sustituir los archivos fuente y **recompilar el EXE**.
- Una migración no destructiva añade `exam_question_criteria` a SQLite y recupera con peso 100 % los CE de preguntas antiguas.
- Las asociaciones múltiples afectan a la agregación de puntos por CE y a la incorporación de notas validadas en la evaluación del módulo.
- La API de IA, la consulta del BOE y la confirmación de la asignación se realizan por separado. El docente sigue siendo responsable de la evaluación.
- Las **65 pruebas automatizadas** se han superado en el entorno local. La compilación en Windows y la consulta en directo al BOE requieren comprobación en el equipo de destino.

## Funcionalidades

- **Programaciones de FP:** registro de módulos, RA, CE, unidades, trimestres y ponderaciones; importación y revisión asistida de documentos didácticos.
- **Materiales didácticos:** asociación de PDF, DOCX, TXT y Markdown con una programación; generación de preguntas basada en contenido disponible y referencias a los pasajes usados. Los PDF escaneados sin texto extraíble precisan OCR previo.
- **Exámenes:** tipo test, desarrollo y problemas prácticos; dificultad baja/media/alta; varios modelos (A–F); banco de al menos tres preguntas por cada una solicitada, controlando repeticiones internas.
- **PDF de examen:** encabezado con centro, módulo, RA/CE, datos del alumno, duración y modelo; PDF del alumnado separado de solucionario, rúbricas y resultados.
- **Entregas:** importación de PDF e imágenes multipágina; carga masiva por ZIP con código del alumno y orden de páginas. Reconocimiento de continuaciones entre páginas y revisión de transcripciones ambiguas.
- **Corrección asistida por IA:** proveedores OpenAI o compatibles configurables; propuestas por pregunta con rúbrica y justificación, siempre sujetas a revisión y cierre docente.
- **Evaluación del módulo:** instrumentos internos, notas manuales o importadas, relación de evidencias con CE y RA, ponderaciones, seguimiento por unidad y trimestre, recuperaciones, cierres e informes individuales PDF.
- **Additio:** exportación del alumnado, hojas para configuración curricular RA/CE, relaciones y ponderaciones, y calificaciones **consolidadas por RA y CE**, no por prueba.
- **Modo portátil USB:** configuración de carpetas relativas al ejecutable y copias; SQLite y documentos originales en el dispositivo; claves API cifradas que requieren contraseña para desbloqueo.

## Estructura del repositorio

```text
app.py                       Servidor local e inicio de la aplicación
web/                         Interfaz HTML, CSS y JavaScript
manual_alignment.py          Clasificación de preguntas manuales en CE
curriculum_official.py        Consulta segura y extracción curricular del BOE
assets/                      Icono y recursos gráficos
ia.py                        Conexión con proveedores de IA
logic.py                     Exámenes, entregas y lógica de negocio
materiales.py                Procesamiento de fuentes documentales
database.py                  Persistencia SQLite
evaluacion.py                Evaluación curricular por RA y CE
exportaciones.py             Excel, CSV y soporte para Additio
exam_pdf.py / eval_pdf.py    Exámenes, solucionarios e informes PDF
storage_config.py            Carpetas y almacenamiento portátil
scripts/                     Preparación, pruebas, compilación e instalador
instalador/                  Proyecto de Inno Setup
tests/                       Pruebas automatizadas
ejemplos/                    Ejemplos sin datos personales
docs/                        Documentación complementaria e historial
```

## Inicio en Windows desde el código fuente

1. Descarga o clona este repositorio y extrae su contenido en una carpeta con permisos de escritura.
2. Ejecuta `INICIAR_EVALUAFP.bat`. La primera ejecución necesita Internet para preparar Python y dependencias.
3. La aplicación se abrirá en su ventana propia (en equipos compatibles con Edge WebView2).
4. Como alternativa, ejecuta `iniciar_navegador_windows.bat` para utilizar la interfaz mediante el navegador y el servicio local.

### Compilar el ejecutable y el instalador

| Archivo | Uso |
|---|---|
| `PREPARAR_ENTORNO.bat` | Prepara Python gestionado y bibliotecas sin depender de una instalación previa. |
| `crear_exe_windows.bat` | Ejecuta las pruebas, empaqueta con PyInstaller y valida `dist/EvaluaFP.exe`. |
| `crear_instalador_windows.bat` | Usa el EXE y compila `dist/Instalar_EvaluaFP.exe` mediante Inno Setup 6/7. |
| `CREAR_VERSION_PENDRIVE.bat` | Crea `dist/EvaluaFP_Portatil/` para copiar toda esa carpeta al USB. |
| `DIAGNOSTICO_WINDOWS.bat` | Genera información útil para investigar problemas de instalación. |

No es necesario Inno Setup para generar el EXE portátil. Si falla Inno Setup, el ejecutable previamente compilado puede seguir utilizándose.

Para ejecutar las pruebas en un entorno Python ya preparado:

```powershell
python -m pip install -r requirements.txt
python -m unittest discover -s tests -v
```

Para compilar se requieren además las dependencias de `requirements-build.txt`. Véase [Instalación y distribución](docs/INSTALACION.md).

## Uso desde pendrive

Ejecuta `CREAR_VERSION_PENDRIVE.bat` en Windows y copia **la carpeta completa** `dist/EvaluaFP_Portatil/` al dispositivo, no solamente su ejecutable. La configuración de ejemplo `ejemplos/EvaluaFP.portable.json` describe las rutas relativas, que no dependen de la letra de unidad.

```text
EvaluaFP_Portatil/
  EvaluaFP_Portatil.exe
  EvaluaFP.portable.json
  EvaluaFP_Datos/       # SQLite, originales, configuración cifrada
  EvaluaFP_Copias/      # Copias de seguridad
```

El cifrado de una clave API no equivale a cifrar las calificaciones o documentos de alumnado. Utiliza una unidad USB cifrada, no desconectes el dispositivo mientras la aplicación está abierta y conserva copias fuera del pendrive.

## RA/CE, instrumentos y Additio

Las **evidencias** (pruebas, portfolios, prácticas, trabajos, observación, evaluación en empresa) se almacenan con su origen y valoración. El sistema calcula la calificación consolidada de cada **CE** y, a partir de ellos, la de cada **RA**, unidad, trimestre y módulo según los pesos configurados. **Cuando no hay ponderaciones expresas se aplica la regla automática igualitaria por CE y proporcional por número de CE para cada RA**, según se detalla al comienzo del README.

Desde **Evaluación del módulo → Resultados**, la exportación para Additio separa:

1. Archivos para configurar RA y CE, sus códigos, descripciones y relaciones.
2. Hojas de ponderaciones y correspondencias curriculares.
3. Matrices Excel/CSV/TSV de **notas por RA y CE** y alumnado.
4. Exportación interna de evidencias e informes para su trazabilidad.

No se garantiza una sincronización automática con Additio. Verifica el asistente de importación disponible en tu cuenta y las columnas antes de traspasar calificaciones. Las notas definitivas se exportan únicamente cuando hay cierre docente vigente. La programación de Técnica Contable utilizada como ejemplo incluía cinco RA de 20 % más FE del 25 %: el total 125 % se considera incoherente y debe ser validado por el docente antes del cierre.

## Seguridad y protección de datos

- **No subas a GitHub** ficheros SQLite reales, exámenes de estudiantes, copias de seguridad, claves API ni las carpetas `EvaluaFP_Datos` y `EvaluaFP_Copias`. El archivo `.gitignore` ayuda, pero no sustituye una revisión manual.
- La API se almacena cifrada con contraseña maestra y no mediante hash irreversible: la aplicación debe poder recuperarla para consultar el proveedor seleccionado.
- Los documentos enviados a servicios externos de IA pueden contener datos personales; revisa las condiciones del proveedor y las obligaciones de protección de datos del centro.
- Una valoración automática **no sustituye la validación y responsabilidad del profesorado**.
- Un repositorio público no implica que los datos del centro deban publicarse. Más información en [Seguridad](SECURITY.md).

## Documentación

- [Landing pública de EvalúaFP](docs/index.html) · interfaz real y datos ficticios

- [Guía de instalación y distribución](docs/INSTALACION.md)
- [Arquitectura y almacenamiento](docs/ARQUITECTURA.md)
- [Seguridad y tratamiento de datos](SECURITY.md)
- [Historial detallado de versiones](docs/HISTORIAL_DE_VERSIONES.md)

## Autoría y derechos

**Desarrollador: Francisco Javier González Rolo.** El código se publica aquí para su consulta y desarrollo. No se incluye una licencia de código abierto porque no se ha establecido expresamente una; para permitir reutilización por terceros, deberá añadirse una licencia elegida por el titular. Los derechos sobre recursos didácticos, exámenes y documentos de terceros corresponden a sus respectivos titulares.

## Corrección 1.0.3 — archivos con tildes al importar programaciones

En la versión 1.0.2, la subida de archivos con nombres como
`Programación Didáctica — Técnica Contable 2026_2027.docx`
podía devolver `expected string or bytes-like object, got 'Header'`.
Se ha corregido el analizador MIME de `multipart/form-data` para procesar
encabezados y parámetros Unicode (UTF-8 y RFC 2231). Afecta a la subida de
programaciones, materiales didácticos y exámenes. El cambio no modifica
la estructura SQLite ni exige borrar datos; requiere recompilar el EXE.

Para aplicar el parche sobre el código 1.0.2, sustituye `app.py`,
`web/index.html` y añade `tests/test_multipart_unicode.py`. Después ejecuta
`crear_exe_windows.bat` o `CREAR_VERSION_PENDRIVE.bat`.

## Apoyar el proyecto

EvalúaFP es gratuita. Si deseas colaborar con su mantenimiento y documentación, puedes realizar una [aportación voluntaria por PayPal](https://www.paypal.com/donate/?hosted_button_id=VX6XGDBJS39W6). No es obligatorio para acceder a ninguna función. El uso de API externas de IA puede tener costes independientes.
