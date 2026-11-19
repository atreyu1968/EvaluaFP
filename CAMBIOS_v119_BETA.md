# EvalúaFP Local 1.1.9 beta — Fuentes nacionales y biblioteca curricular verificada

## Finalidad

Ampliar la versión 1.1.8 para que el asistente no dependa únicamente de una ficha canaria: ofrece vías oficiales de consulta a las **17 comunidades autónomas y Ceuta/Melilla** y permite guardar, con referencia y curso académico, las horas y calendarios ya contrastados por el profesorado.

## Funciones incorporadas

| Componente | Comportamiento | Garantía / precaución |
|---|---|---|
| Directorio nacional | Accesos a 19 portales de FP, directorio ministerial, BOE y páginas TodoFP de dos ciclos incorporados | Los enlaces son vías de búsqueda, **no demuestran la vigencia de una disposición** |
| Biblioteca de horas | Guarda las horas anuales y semanales con URL, título de la disposición y fecha de revisión | Solo se reutiliza en **misma comunidad, curso, ciclo y módulo**; sigue pendiente de confirmación para la nueva programación |
| Importación horaria por ciclo | Copiar columnas desde Excel, Calc o CSV (`Código;Módulo;Horas totales;Horas semanales`); visualizar tabla y confirmar en bloque | No se envían datos a Internet ni se sobrescriben fichas existentes por defecto |
| IA para interpretar anexos | El docente pega un fragmento del boletín y autoriza expresamente el envío; IA propone dos cifras y una cita literal | La cita debe aparecer en el texto y contener el código y los valores; **no cambia SQLite antes de revisión** |
| Calendarios del centro | Guardar fechas, evaluaciones, vacaciones y festivos con su fuente | Solo mismo **centro, comunidad y curso**; no transporta horas, unidades o FEOE |
| Asistente | Consultar fuentes y reutilizar datos en pasos 2 y 5 | Las horas y calendarios no se dan por aprobados automáticamente |
| Compatibilidad | Migración SQLite aditiva de dos tablas locales | No borra módulos, evidencias ni notas docentes |
| Vigencia de datos heredados | El catálogo parcial de Canarias de 2024 sigue identificado como referencia histórica | Para cursos posteriores a 2026-2027 no se precargan automáticamente esas horas antiguas |
| Formato | Tablas con horas en dos decimales y denominación de las unidades | Los cálculos siguen usando su precisión interna |

## Cómo utilizar desde la interfaz

1. Cree el módulo e indique **comunidad autónoma, curso, ciclo y código oficial**.
2. En **Preparar mi módulo → Crear mi programación → 2. Normativa y objetivos**, abra el directorio de enlaces oficiales del territorio y contraste la norma vigente.
3. En el paso **5. Temporalización y FEOE**, introduzca horas totales y semanales desde la disposición, o importe toda la tabla del ciclo en formato CSV/Excel copiado.
4. Antes de pulsar **Guardar fichas**, compruebe el título y la URL de la norma y marque la validación docente.
5. Si dispone de una tabla con texto difícil de extraer, pegue un fragmento y use **Interpretar extracto con IA**. No se acepta una propuesta sin cita literal verificable; la aprobación de la fuente sigue siendo docente.
6. Si el calendario escolar del centro se ha comprobado, guárdelo junto a la URL de la resolución; podrá recuperarlo para otros grupos del **mismo centro y curso**.
7. Finalice unidades, instrumentos, FEOE y exportaciones desde el asistente habitual.

## Requisitos y límites

- Esta versión **no descarga, interpreta ni certifica automáticamente todas las leyes y anexos de las 19 administraciones educativas**. El usuario debe abrir la fuente y confirmar el dato, o proporcionar un extracto/tabla. Para la mayor parte de los módulos no existe aún un catálogo de horas oficiales preinstalado.
- Las fuentes oficiales en línea requieren conexión a Internet cuando el usuario las abre. La base y los documentos continúan almacenados localmente, y la IA requiere clave propia y consentimiento expreso.
- El validador comprueba correspondencias y consistencia de cifras, pero **no puede garantizar por sí mismo la vigencia de cada norma** ni la idoneidad administrativa de una distribución horaria.
- Solo se ha probado el código en el entorno de desarrollo; **no se incluyen ejecutables recompilados para Windows, Linux o macOS** ni se afirma una prueba nativa de interfaz en esos sistemas.

## Validación de esta entrega

- `PYTHONUTF8=1 python -m unittest discover -s tests -q`: **161 pruebas superadas**.
- `node --check web/app.js`: sintaxis válida.
- Prueba del servidor HTTP y SQLite reales para un módulo de Madrid.
- Recorrido en Chromium del asistente con un puente de API hacia HTTP real, incluidas previsualización de CSV e importación: sin errores JavaScript. La navegación directa a `localhost` estaba bloqueada por el navegador de pruebas de este entorno.
- Pruebas negativas: no se propagan horas a otro año/comunidad/ciclo/módulo ni calendarios a otro centro; la IA no puede guardar datos ficticios ni citas inventadas.

## Fuentes de entrada

- Directorio de webs educativas de FP por CC. AA. (TodoFP): https://www.todofp.es/sobre-fp/webs-fp-ccaa.html
- Currículos de Gestión Administrativa (TodoFP): https://www.todofp.es/que-estudiar/familias-profesionales/administracion-gestion/gestion-administrativa/curriculos-ccaa.html
- Currículos de Administración y Finanzas (TodoFP): https://www.todofp.es/que-estudiar/familias-profesionales/administracion-gestion/administracion-finanzas/curriculos-ccaa.html
- Agencia Estatal BOE, datos abiertos: https://www.boe.es/datosabiertos/api/api.php?lang=es

## Actualización desde 1.1.8

Haga una copia de seguridad de los datos y los originales. Descomprima **fuentes completas** en una carpeta limpia o aplique el **parche** sobre las fuentes 1.1.8. En Windows ejecute `CREAR_VERSION_PENDRIVE.bat`; los EXE anteriores mantienen los componentes incrustados de su versión. Conserve el ejecutable anterior hasta comprobar el nuevo con datos ficticios y una programación real.
