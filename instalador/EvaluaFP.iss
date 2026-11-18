#define MyAppName "EvaluaFP"
#define MyAppVersion "1.0.2"
#define MyAppPublisher "Francisco Javier Gonzalez Rolo"
#define MyAppExeName "EvaluaFP.exe"
[Setup]
AppId={{D33CB996-5E58-4FC0-92B4-4F3208A07F83}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={localappdata}\Programs\EvaluaFP
DefaultGroupName=EvaluaFP
OutputDir=..\dist
OutputBaseFilename=Instalar_EvaluaFP
Compression=lzma2
SolidCompression=yes
PrivilegesRequired=lowest
WizardStyle=modern
SetupIconFile=..\assets\EvaluaFP.ico
UninstallDisplayIcon={app}\{#MyAppExeName}
CloseApplications=yes
DisableProgramGroupPage=yes
[Files]
Source: "..\dist\EvaluaFP.exe"; DestDir: "{app}"; Flags: ignoreversion
[Icons]
Name: "{group}\EvaluaFP"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\EvaluaFP"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
[Tasks]
Name: "desktopicon"; Description: "Crear acceso directo en el escritorio"; GroupDescription: "Accesos directos:"
[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Iniciar EvaluaFP"; Flags: nowait postinstall skipifsilent
