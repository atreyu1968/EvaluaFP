#!/usr/bin/env python3
"""Construye un paquete ejecutable portátil en Linux x64 o macOS Intel/ARM64."""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import platform
import re
import shutil
import subprocess
import sys
import tarfile

ROOT = Path(__file__).resolve().parents[1]
VERSION = re.search(r'^APP_VERSION\s*=\s*["\']([^"\']+)', (ROOT/'app.py').read_text(encoding='utf-8'), re.MULTILINE).group(1)


def run(*args):
    print('+', ' '.join(map(str, args)), flush=True)
    subprocess.run(list(map(str, args)), cwd=ROOT, check=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--test', action='store_true')
    options = parser.parse_args()
    system = 'macos' if sys.platform == 'darwin' else 'linux' if sys.platform.startswith('linux') else None
    if system is None:
        raise SystemExit('Solo se admite Linux o macOS.')
    machine = platform.machine().lower()
    arch = 'x64' if machine in ('x86_64', 'amd64') else 'arm64' if machine in ('arm64', 'aarch64') else None
    if arch is None or (system == 'linux' and arch != 'x64'):
        raise SystemExit('Arquitectura no soportada: '+machine)
    if options.test:
        run(sys.executable, '-m', 'unittest', 'discover', '-s', 'tests', '-q')

    name = 'EvaluaFP_Portatil'
    package = f'{name}_{VERSION}_{system}_{arch}'
    command = [sys.executable, '-m', 'PyInstaller', '--noconfirm', '--clean', '--onedir',
               '--name', name, '--distpath', str(ROOT/'dist'/'build_unix'),
               '--workpath', str(ROOT/'build'/'unix'), '--specpath', str(ROOT/'build'/'unix'),
               '--add-data', f'{ROOT/"web"}{os.pathsep}web',
               '--add-data', f'{ROOT/"assets"}{os.pathsep}assets',
               '--hidden-import', 'webview']
    if system == 'macos':
        command += ['--windowed', '--osx-bundle-identifier', 'org.evaluafp.local',
                    '--hidden-import', 'webview.platforms.cocoa']
    else:
        command += ['--hidden-import', 'webview.platforms.qt',
                    '--hidden-import', 'PyQt6.QtWebEngineWidgets',
                    '--hidden-import', 'PyQt6.QtWebEngineCore',
                    '--hidden-import', 'PyQt6.QtWebChannel']
    command.append(str(ROOT/'app.py'))
    run(*command)

    staging = ROOT/'dist'/package
    if staging.exists():
        shutil.rmtree(staging)
    staging.mkdir(parents=True)
    if system == 'macos':
        built = ROOT/'dist'/'build_unix'/f'{name}.app'
        if not built.is_dir():
            raise RuntimeError('PyInstaller no generó el paquete .app.')
        shutil.copytree(built, staging/built.name, symlinks=True)
        binary = staging/built.name/'Contents'/'MacOS'/name
        launcher = '#!/bin/sh\nset -eu\nBASE="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"\nexport EVALUAFP_PORTABLE_HOME="$BASE"\nexport EVALUAFP_PORTABLE=1\nexec "$BASE/EvaluaFP_Portatil.app/Contents/MacOS/EvaluaFP_Portatil" "$@"\n'
        launchfile = staging/'INICIAR_EVALUAFP.command'
    else:
        built = ROOT/'dist'/'build_unix'/name
        if not built.is_dir():
            raise RuntimeError('PyInstaller no generó la carpeta Linux.')
        shutil.copytree(built, staging/name, symlinks=True)
        binary = staging/name/name
        launcher = '#!/bin/sh\nset -eu\nBASE="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"\nexport EVALUAFP_PORTABLE_HOME="$BASE"\nexport EVALUAFP_PORTABLE=1\nexec "$BASE/EvaluaFP_Portatil/EvaluaFP_Portatil" "$@"\n'
        launchfile = staging/'INICIAR_EVALUAFP.sh'
    launchfile.write_text(launcher, encoding='utf-8')
    launchfile.chmod(0o755)
    if not binary.is_file():
        raise RuntimeError(f'No está el ejecutable: {binary}')

    (staging/'EvaluaFP.portable.json').write_text(json.dumps({
        'mode': 'portable', 'data_dir': 'EvaluaFP_Datos', 'backup_dir': 'EvaluaFP_Copias'
    }, indent=2), encoding='utf-8')
    (staging/'EvaluaFP_Datos').mkdir()
    (staging/'EvaluaFP_Copias').mkdir()
    shutil.copy2(ROOT/'docs'/'PORTABLE_LINUX_MAC.md', staging/'LEEME_LINUX_MAC.md')

    # Verificación del EXE real, sin sesión gráfica: SQLite, interfaz, PDF y Excel.
    env = os.environ.copy()
    env['EVALUAFP_PORTABLE_HOME'] = str(staging)
    env['EVALUAFP_PORTABLE'] = '1'
    subprocess.run([str(binary), '--selftest'], env=env, check=True, timeout=210)

    archive = ROOT/'dist'/(package+('.zip' if system=='macos' else '.tar.gz'))
    if system == 'macos':
        run('ditto', '-c', '-k', '--sequesterRsrc', '--keepParent', staging, archive)
    else:
        with tarfile.open(archive, 'w:gz') as stream:
            stream.add(staging, arcname=staging.name)
    print('PAQUETE PORTABLE COMPLETADO:', archive, flush=True)


if __name__=='__main__':
    main()
