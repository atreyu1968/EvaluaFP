# EvalúaFP 1.2.5 beta — Buscador nacional de títulos en TodoFP

**Fecha:** 20 de noviembre de 2026. **Tipo:** actualización de fuentes y pruebas (no contiene EXE recompilado).

## Qué se ha desarrollado

Se ha reducido la necesidad de conocer la URL exacta de cada ciclo. El asistente ahora busca un título por su nombre en **cuatro índices oficiales de TodoFP** (Grado Básico, Medio, Superior y cursos de especialización), muestra la ficha candidata, permite abrirla y reutiliza el explorador existente para localizar los módulos y enlaces curriculares autonómicos.

| Nueva función | Alcance real | Protección |
|---|---|---|
| Búsqueda nacional por grado y nombre | Consulta un índice de TodoFP por solicitud, sin rastreo masivo | Solo HTTPS y rutas de fichas de títulos bajo el dominio oficial; respuesta limitada en tiempo/tamaño |
| Resultados del índice | Muestra denominación, grado y URL de título | **No genera código oficial del título si el índice no lo facilita** |
| Abrir ficha del título | Usa el lector existente de módulos, RD estatal y enlaces a currículo autonómico | Si el título o módulo no coincide con el de la programación, se advierte y no se incorpora como validado |
| Crear módulo | Permite elegir el nombre de un módulo desde la ficha del título | Códigos no publicados, RA, CE, horas y calendario siguen pendientes de validación docente |
| Cambio de ámbito o curso | Descarta búsquedas antiguas | No conserva referencias curriculares de otra comunidad ni de otro curso |

## Pasos de uso

1. **Preparar mi módulo → crear módulo → Catálogo**.
2. Seleccionar comunidad autónoma/ciudad y curso académico, el grado y un nombre aproximado (por ejemplo, «Administración y Finanzas»).
3. Pulsar **Buscar títulos en TodoFP**. Se consulta el índice oficial del grado seleccionado.
4. Pulsar **Examinar módulos y fuentes** para abrir la ficha individual. Revisar la lista de módulos que la ficha publique y los enlaces a normas de la administración autonómica.
5. Seleccionar un módulo y confirmar posteriormente sus códigos oficiales, horas, RA, CE y calendario escolar en las disposiciones que correspondan al curso.

También se puede utilizar en la preparación de una programación existente. Para un título no recuperado, se conserva la opción de pegar manualmente la URL de TodoFP.

## Fuentes estatales consultadas

- Grado Básico: https://www.todofp.es/que-estudiar/grados-d/fp-grado-basico.html
- Grado Medio: https://www.todofp.es/que-estudiar/grados-d/grado-medio.html
- Grado Superior: https://www.todofp.es/que-estudiar/grados-d/grado-superior.html
- Cursos de especialización: https://www.todofp.es/que-estudiar/grados-e/curso-especializacion.html

La aplicación consulta el portal público de TodoFP **solo al pulsar el botón**, sin transmitir datos personales, documentos docentes ni claves a dicho portal. Los índices pueden modificar su estructura HTML, por lo que una ficha no encontrada no significa que el título no exista.

## Pruebas

- Batería de regresión: **236 pruebas automatizadas superadas**.
- Tests de los cuatro grados, búsqueda tolerante a tildes, aislamiento de los 19 territorios, autenticación HTTP, URL seguras, duplicados y rechazo de redirecciones inesperadas.
- Prueba de Chromium con servicio simulado: búsqueda de título, consulta de ficha, selección de módulo, invalidación por cambio de región, sin errores JavaScript.
- Sintaxis verificada de Python y JavaScript. Integridad de fuentes y paquetes ZIP comprobada.

**No se ha podido ejecutar una petición en vivo desde la máquina de pruebas hacia TodoFP**; el acceso directo a Internet estaba restringido. La conectividad real de la instalación Windows/macOS/Linux deberá ensayarse antes de declarar terminada esta fase.

## Limitaciones que siguen pendientes

1. Catálogo descargado y versionado **completo** de códigos de títulos y módulos, con datos vigentes por curso y comunidad.
2. Validación automática de cada currículo autonómico y de sus modificaciones normativas.
3. Calendarios lectivos oficiales por territorio, municipio/centro, modalidad y curso, incluyendo correcciones.
4. OCR empaquetado y verificado en los tres sistemas portátiles.
5. Pruebas reales de conectividad, ejecución y actualización de datos en Windows, Linux y macOS.

Esta beta **no afirma** que el ciclo esté implantado en la comunidad ni que el código, las horas o el calendario estén verificados por el simple hecho de encontrarlo en el índice nacional.
