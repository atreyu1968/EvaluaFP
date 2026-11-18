# Distribuciones portátiles Linux y macOS

Se generan con GitHub Actions desde el código fuente del repositorio, utilizando el sistema operativo de destino (no compilación cruzada).

## Linux x64

Descargue el archivo `EvaluaFP_Portatil_*_linux_x64.tar.gz` del artefacto y extráigalo íntegro. Ejecute `./INICIAR_EVALUAFP.sh` dentro de la carpeta extraída. Necesita un escritorio Linux y bibliotecas gráficas Qt/X11; no necesita Python instalado. Algunas unidades USB montadas con `noexec` no permiten ejecutar binarios; copie la carpeta a una ubicación que lo permita. La compilación usa Ubuntu 22.04; pruebe su distribución concreta.

## Mac Intel y Apple Silicon

Descargue la variante adecuada (macos_x64 o macos_arm64), descomprima todo el ZIP y utilice `INICIAR_EVALUAFP.command` o abra `EvaluaFP_Portatil.app`. Conserve las carpetas `EvaluaFP_Datos` y `EvaluaFP_Copias` junto al paquete `.app`, nunca dentro de él. La aplicación no va firmada ni notarizada: macOS puede impedir la apertura inicial. Para distribución masiva se recomienda firma y notarización; no desactive Gatekeeper globalmente.

## Datos y privacidad

La base SQLite, los documentos y las copias residen en carpetas portátiles relativas, pero **no están cifrados automáticamente**: utilice una memoria cifrada. La clave API se guarda cifrada y se desbloquea con contraseña maestra. No extraiga el dispositivo durante el uso.

El comando `--selftest` comprueba que el ejecutable integra SQLite, la interfaz HTML y bibliotecas. No equivale a verificar el funcionamiento gráfico real ni la API de IA.
