# EvalúaFP 1.1.1-beta — Hotfix de navegación

Se resolvió el bloqueo persistente al entrar en «Preparar módulo»: faltaba la llamada del enrutador `page()` a `viewPrepare()`. El resto del módulo de programación ya existía, pero no llegaba a ejecutarse desde el menú.

- Añadida la llamada faltante y un control de rutas desconocidas con mensaje visible.
- Mantenidas las tres vías: importar programación, crear borrador y configurar solo la evaluación.
- No se modifica SQLite, RA, CE, ponderaciones, alumnado ni calificaciones.
- La aplicación de escritorio debe recompilarse, ya que PyInstaller incorpora los recursos web.
- Pruebas Python y comprobación de interfaz con navegador automatizado, en datos aislados.
