# Instalador do estúdio de vídeo (Windows 10/11).
# Como rodar: clique com o botão direito no menu Iniciar > "Terminal" e cole:
#   Set-ExecutionPolicy -Scope Process Bypass; .\instalar\windows.ps1
# Use -Extras para também instalar Blender. Nada aqui é pago.
param([switch]$Extras)
$ErrorActionPreference = "Stop"

function Instalar($id) {
  Write-Host "==> $id" -ForegroundColor Cyan
  # winget baixa sempre da fonte oficial de cada programa
  winget install --id $id -e --source winget --accept-package-agreements --accept-source-agreements --silent
}

# 1. Programas base (fontes oficiais via winget)
Instalar "OpenJS.NodeJS.LTS"    # Node.js: roda o estúdio
Instalar "Gyan.FFmpeg"          # FFmpeg: monta o MP4
Instalar "Python.Python.3.12"   # Python: legendas, voz e downloads
Instalar "Git.Git"              # Git: baixar/atualizar este projeto
if ($Extras) { Instalar "BlenderFoundation.Blender" }

# Atualiza o PATH desta janela sem precisar reabrir
$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")

# 2. Estúdio (three.js + GSAP + Playwright), versões travadas no package-lock.json
Push-Location "$PSScriptRoot\..\estudio"
npm ci
npx playwright install chromium
Pop-Location

# 3. Ferramentas Python num ambiente isolado (não mexe no Python do sistema)
$venv = "$PSScriptRoot\..\.venv"
py -3.12 -m venv $venv
& "$venv\Scripts\python.exe" -m pip install --upgrade pip
& "$venv\Scripts\python.exe" -m pip install -r "$PSScriptRoot\requirements.txt"

Write-Host ""
Write-Host "Pronto! Teste com:" -ForegroundColor Green
Write-Host "  cd estudio; node render.mjs exemplo"
