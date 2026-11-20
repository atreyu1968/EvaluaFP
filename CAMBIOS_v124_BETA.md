# EvalúaFP 1.2.4 beta — Explorador oficial de ciclos y currículos autonómicos TodoFP

**Fecha:** 20 de noviembre de 2026. **Estado:** código fuente beta; la consulta en vivo requiere acceso a Internet.

## Novedades terminadas

Se incorpora un explorador que permite **introducir la URL oficial de un ciclo o de su página de currículos autonómicos de TodoFP** y obtener una propuesta de consulta, diferenciando rigurosamente los datos informativos de la normativa aplicable.

- Extrae el nombre del título, nivel identificable, relación de módulos de su sección «Plan de formación» y los códigos que **estén realmente presentes en la ficha**. Cuando falta el código no se inventa.
- Localiza el enlace estatal al Real Decreto del título, si existe, y la página específica «Currículos CCAA» del ciclo.
- Enumera los documentos publicados para **la comunidad autónoma elegida** (currículo, modificaciones y otras referencias), sin mezclar enlaces con otro territorio.
- Reconoce los **19 ámbitos educativos** de la aplicación, aunque TodoFP no publique un currículo enlazado para todos. Si una comunidad carece de referencia, lo indica y exige consulta manual.
- Comprueba que la ficha corresponde al ciclo y al módulo actuales del docente antes de permitir incorporar las referencias al borrador.
- Permite utilizar **solo los nombres** como ayuda al crear un módulo nuevo, sin convertirlos en códigos curriculares confirmados.
- Permite añadir los enlaces localizados como **referencias pendientes de revisión**. No confirma la aplicación de la norma ni sustituye RA/CE, horas, calendario o calificaciones.
- Conserva el formulario de creación al consultar TodoFP, sin perder comunidad, curso, ciclo, nombre o grupo.
- Al cambiar comunidad o año elimina los resultados de consulta anterior y los enlaces que corresponderían a otro territorio.

## Uso en la aplicación

1. En «Preparar módulo → Nuevo módulo» o en «Editar RA, CE y pesos → Nuevo módulo», seleccione comunidad y curso e introduzca el enlace a la ficha del título de TodoFP.
2. Pulse «Consultar fuentes del territorio y curso» para ver los módulos publicados y las referencias enlazadas por TodoFP.
3. Si va a crear un módulo, puede pulsar «Utilizar nombre»; revise después el código oficial y los datos curriculares del territorio.
4. Si ya está elaborando el borrador, consulte los enlaces oficiales del módulo. Puede incorporarlos al apartado de normativa **sin confirmar automáticamente** el currículo.
5. Compruebe en el boletín de la comunidad el texto vigente, sus modificaciones y el calendario del curso. Los resultados extraídos siguen sujetos a revisión docente.

**Ejemplo real de ficha de título:**

- https://www.todofp.es/que-estudiar/familias-profesionales/administracion-gestion/administracion-finanzas.html
- https://www.todofp.es/que-estudiar/familias-profesionales/administracion-gestion/administracion-finanzas/curriculos-ccaa.html

La ficha estatal puede referirse a un plan de implantación de años anteriores. EvalúaFP **no infiere a partir de ella la distribución horaria del año seleccionado**. TodoFP tampoco prueba por sí solo que cada ciclo se imparta en cada centro.

## Seguridad y límites técnicos

- La conexión de consulta solo admite URLs HTTPS de páginas HTML de ciclos del dominio exacto `todofp.es` o `www.todofp.es`. Controla las redirecciones, elimina esquemas inseguros y aplica límites de tiempo y respuesta.
- No se envían datos personales ni programas del alumno. La petición contiene solo el enlace de consulta y el ciclo/territorio/año elegidos.
- Las referencias externas del directorio pueden apuntar a boletines autonómicos diferentes. EvalúaFP **muestra el enlace, pero no ejecuta ni descarga automáticamente documentos de dominios desconocidos**.
- Para funcionar en Windows/macOS/Linux portable no se han añadido dependencias de terceros nuevas: el análisis de HTML utiliza `html.parser` de Python.
- Las pruebas automatizadas usan páginas de ejemplo reproducibles. **En esta sesión no ha sido posible establecer conexión HTTP directa desde Python con TodoFP por falta de acceso a Internet**. La consulta viva en cada equipo debe someterse a prueba con el portal real.
- Los campos del nuevo explorador **no constituyen un catálogo completo de títulos y módulos con códigos oficiales**, ni una comprobación automática de vigencia, horas, RA/CE o calendario.

## Pruebas

- Regresiones del catálogo territorial, programación, evaluación y documentos existentes.
- Pruebas de URL y redirecciones seguras, lectura de ficha de ciclo, identificación de módulos, identificación de enlaces de modificaciones y aislamiento de Canarias, Madrid y los otros ámbitos.
- Pruebas HTTP reales del servidor de EvalúaFP con respuestas de TodoFP simuladas; verificación de que la consulta no inserta módulos ni altera SQLite.
- Recorrido en Chromium de selección de comunidad, consulta de ficha, selección orientativa de módulo e invalidación de resultados al cambiar el territorio.
- Prueba de compilación sintáctica Python y JavaScript.

## Pendiente para completar el producto nacional

1. Conexión y validación real de la estructura de páginas TodoFP en las diferentes familias, con detección de cambios de estructura.
2. Descarga incremental y validación de **todos los códigos oficiales** de títulos y módulos, sin inferencias, distinguiendo título estatal, currículo autonómico, modalidad y curso.
3. Calendario escolar oficial por comunidad y año, con festivos locales y de centro, fuentes fechadas y correcciones.
4. OCR integrado en ejecutables portátiles y verificado en Windows, Linux y macOS.
5. Comprobación automatizada de disposiciones curriculares modificadas, con revisión por parte del docente.

**No se han compilado nuevos ejecutables en esta fase.** Se entregan fuentes completas y parche sobre 1.2.3.
