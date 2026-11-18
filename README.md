# EvalúaFP Local

**Aplicación local para la creación, corrección asistida y evaluación de instrumentos de Formación Profesional, organizada por resultados de aprendizaje (RA) y criterios de evaluación (CE).**

**Versión del código:** 1.0.4 · **Desarrollador:** Francisco Javier González Rolo · **Sistema principal:** Windows 10/11 (x64) · **Base de datos:** SQLite · **Interfaz:** HTML/CSS/JavaScript con ventana WebView2.

> **Estado:** proyecto en desarrollo. La ejecución automatizada de 43 pruebas ha concluido correctamente en el entorno de desarrollo; la compilación, la ventana gráfica y el instalador deben verificarse en Windows antes de distribuir la aplicación. La calificación definitiva requiere validación docente.

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

Las **evidencias** (pruebas, portfolios, prácticas, trabajos, observación, evaluación en empresa) se almacenan con su origen y valoración. El sistema calcula la calificación consolidada de cada **CE** y, a partir de ellos, la de cada **RA**, unidad, trimestre y módulo según los pesos configurados.

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


## Versión 1.0.4 — Rendimiento y verificación de RA/CE

- Banco mínimo triple en lotes multcriterio (hasta 8 preguntas test, 6 de desarrollo o 4 problemas): menos solicitudes secuenciales, ponderaciones y tipos preservados, sin duplicados entre modelos.
- Los fragmentos de material se envían una sola vez por lote y se verifican las citas.
- Indicador de tiempo transcurrido en la pantalla; no es un porcentaje ficticio del proveedor.
- Propuestas curriculares contrastadas contra el texto literal original: los CE sin enunciados completos verificables se descartan y se señalan. Se muestra cobertura RA/CE.
- Se respeta el orden de párrafos y tablas de los DOCX.
- La programación de Técnica Contable aportada contiene referencias RA1–RA5 pero no todos los enunciados completos de CE, asigna código 0299 en lugar de 0441 (RD 1631/2009), contiene RA204 y ponderaciones aparentemente incompatibles (125 %). Requiere revisión docente y, en su caso, completar currículo oficial.
- Sin migración SQLite. Recompila el ejecutable tras actualizar el código. Las pruebas locales son 55; falta verificar la mejora con DeepSeek real y la compilación Windows.

Referencia normativa: https://www.boe.es/eli/es/rd/2009/10/30/1631
