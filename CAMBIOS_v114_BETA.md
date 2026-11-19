# EvalúaFP 1.1.4 beta — Gantt legible, tablas y dos decimales

## Motivo de la corrección

La escala semanal del PDF 1.1.3 se mostraba como una serie de números sin indicar si eran semanas, días, meses u horas. La interfaz web empleaba solo fechas de inicio de semana sin aclarar la escala. Además, las cifras de horas y ponderaciones se mostraban sin un criterio decimal uniforme.

## Cambios aplicados

- **Gantt en pantalla**: encabezado superior por mes y año y encabezado inferior con fecha de inicio/fin de semana natural; columnas a la izquierda para unidad, horas y evaluación. Una leyenda explica las barras de color y que su longitud representa un intervalo, no horas semanales.
- **Resumen de temporalización**: dos tablas, una de magnitudes y otra de horas disponibles y programadas en cada evaluación. Horas y porcentajes con **dos decimales** en formato español; la cantidad de CE sigue siendo entera.
- **Documento PDF**: Gantt en **una página horizontal A3** con encabezado de meses/años y fechas `dd/mm` completas en cada semana. Incluye resumen de horas, periodos de empresa y leyenda. El resto de páginas conserva tamaño A4 vertical.
- **Documento Word**: Gantt en una sección **A4 apaisada**, agrupado por meses y años `MM/AAAA`, con horas por unidad y leyenda explicativa. El gráfico mensual ya no se divide entre páginas.
- **Tablas estructuradas** para RA/CE, unidades, temporalización, formación en empresa, instrumentos y actividades en los documentos PDF y Word.
- **Dos decimales solo al mostrar**: no se altera el cálculo interno, los valores guardados en SQLite ni la política de ponderaciones de la programación.

## Limitaciones

Los datos del calendario deben contrastarse con el horario real y los festivos del centro; los documentos generados siguen siendo **borradores**. No se incluyen ejecutables recompilados; los archivos deben aplicarse a las **fuentes de la versión 1.1.3** y recompilarse.

## Pruebas

`python -m unittest discover -s tests -v`

`node --check web/app.js`

Las pruebas de regresión revisan la orientación del Gantt, los nombres de meses, los rangos de fechas, el formato decimal y la exportación a Word. Se han renderizado PDF y DOCX para comprobar visualmente la integridad del encabezado.
