@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title EvaluaFP - Version autonoma para memoria USB
set "DESTINO=%~dp0dist\EvaluaFP_Portatil"
echo.
echo ====================================================
echo    EVALUAFP - CREAR EJECUTABLE PORTATIL PARA USB
 echo ====================================================
echo.
call "%~dp0crear_exe_windows.bat" /auto
if errorlevel 1 goto :error
if not exist "dist\EvaluaFP.exe" goto :error
if not exist "%DESTINO%" mkdir "%DESTINO%"
copy /y "dist\EvaluaFP.exe" "%DESTINO%\EvaluaFP_Portatil.exe" >nul
if errorlevel 1 goto :error
copy /y "%~dp0IMPORTAR_DATOS_DEL_PC.bat" "%DESTINO%\IMPORTAR_DATOS_DEL_PC.bat" >nul
if not exist "%DESTINO%\EvaluaFP.portable.json" (
  >"%DESTINO%\EvaluaFP.portable.json" echo {"mode":"portable","data_dir":"EvaluaFP_Datos","backup_dir":"EvaluaFP_Copias"}
)
if not exist "%DESTINO%\EvaluaFP_Datos" mkdir "%DESTINO%\EvaluaFP_Datos"
if not exist "%DESTINO%\EvaluaFP_Copias" mkdir "%DESTINO%\EvaluaFP_Copias"
echo.
echo VERSION PORTATIL PREPARADA EN:
echo %DESTINO%
echo.
echo Copie TODA esta carpeta al pendrive. La ruta de la unidad puede cambiar.
echo La clave API solo se guarda cifrada y necesita contrasena al iniciar.
echo No retire el USB mientras la aplicacion se encuentre abierta.
pause
exit /b 0
:error
echo ERROR: No se ha podido preparar el paquete portatil. Compruebe la compilacion.
pause
exit /b 1
