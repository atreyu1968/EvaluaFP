@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title EvaluaFP - Preparar y compilar EXE
echo.
echo ========================================================
echo  EVALUAFP 1.0.1 - CREAR EXE PARA WINDOWS
 echo ========================================================
echo.
echo [1/4] Detectando/instalando Python y dependencias...
call "%~dp0PREPARAR_ENTORNO.bat" build
if errorlevel 1 goto :error
set "PYTHON=%~dp0.venv\Scripts\python.exe"
echo.
echo [2/4] Comprobando el programa con las pruebas automatizadas...
"%PYTHON%" -m unittest discover -s tests -v
if errorlevel 1 goto :error
echo.
echo [3/4] Generando el ejecutable sin dependencia de Python externo...
"%PYTHON%" -m PyInstaller --noconfirm --clean --onefile --windowed --name "EvaluaFP" --icon "assets\EvaluaFP.ico" --add-data "web;web" --collect-all fitz --collect-all PIL --collect-all docx --collect-all keyring --collect-all webview --collect-all reportlab --collect-all cryptography --collect-all xlsxwriter --hidden-import xlwt --hidden-import webview.platforms.winforms --hidden-import desktop_caption app.py
if errorlevel 1 goto :error
if not exist "dist\EvaluaFP.exe" (
  echo ERROR: PyInstaller no ha dejado el ejecutable en dist\EvaluaFP.exe.
  echo Compruebe si Windows Defender lo ha puesto en cuarentena.
  goto :error
)
echo.
echo [4/4] Probando que el ejecutable abre sus componentes y SQLite...
echo Ejecutable: "%~dp0dist\EvaluaFP.exe"
if not exist "%~dp0dist\EvaluaFP.exe" (
  echo ERROR: El ejecutable ha desaparecido de dist antes de la prueba.
  echo Revise el historial de proteccion de Windows Defender.
  goto :error
)
"%~dp0dist\EvaluaFP.exe" --selftest
if errorlevel 1 (
  echo ERROR: La prueba interna del EXE no ha terminado correctamente.
  echo Revise el registro_aplicacion.log en la carpeta de datos de EvaluaFP.
  goto :error
)
echo Verificacion del EXE completada.
echo [4/4] Comprobando el archivo generado...
for %%I in ("dist\EvaluaFP.exe") do echo %%~fI - %%~zI bytes
if not exist "dist\EvaluaFP.exe" (
  echo ERROR: PyInstaller no ha dejado el ejecutable en dist\EvaluaFP.exe.
  echo Compruebe si Windows Defender lo ha puesto en cuarentena.
  goto :error
)
echo.
echo EXITO: dist\EvaluaFP.exe
echo Este archivo incorpora Python y las bibliotecas necesarias.
echo Compruebe su apertura real en Windows; debe mostrar ventana propia.
if /i "%~1"=="/auto" exit /b 0
pause
exit /b 0
:error
echo.
echo ERROR: Compilacion detenida. Consulte el mensaje anterior.
echo Registro: %LOCALAPPDATA%\EvaluaFP\logs\preparacion_windows.log
if /i "%~1"=="/auto" exit /b 1
pause
exit /b 1
