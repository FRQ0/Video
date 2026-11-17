#!/usr/bin/env bash
# Instalador do estúdio de vídeo (macOS ou Linux Debian/Ubuntu).
# Como rodar:  bash instalar/mac-linux.sh        (ou com --extras para instalar o Blender)
# Nada aqui é pago. Tudo vem do gerenciador de pacotes oficial (Homebrew / apt) e do npm/PyPI.
set -euo pipefail
cd "$(dirname "$0")/.."
EXTRAS="${1:-}"

if [[ "$(uname)" == "Darwin" ]]; then
  command -v brew >/dev/null || { echo "Instale o Homebrew primeiro: https://brew.sh"; exit 1; }
  brew install node ffmpeg python@3.12 git
  [[ "$EXTRAS" == "--extras" ]] && brew install --cask blender
else
  sudo apt-get update
  sudo apt-get install -y ffmpeg python3 python3-venv python3-pip git curl
  if ! command -v node >/dev/null || [[ "$(node -v | cut -c2- | cut -d. -f1)" -lt 20 ]]; then
    sudo apt-get install -y nodejs npm
  fi
  [[ "$EXTRAS" == "--extras" ]] && sudo apt-get install -y blender
fi

# Estúdio (versões travadas no package-lock.json)
(cd estudio && npm ci && npx playwright install --with-deps chromium)

# Ferramentas Python num ambiente isolado
python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r instalar/requirements.txt

echo
echo "Pronto! Teste com:  cd estudio && node render.mjs exemplo"
