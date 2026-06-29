#!/usr/bin/env bash
# Atualiza o site na VPS após um novo commit chegar no GitHub
# (vindo do Lovable ou de qualquer outro editor).
#
# Uso: bash deploy/update.sh

set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> git pull"
git pull --ff-only

if command -v bun >/dev/null 2>&1; then
  echo "==> bun install"
  bun install
  echo "==> bun run build"
  bun run build
else
  echo "==> npm install"
  npm install
  echo "==> npm run build"
  npm run build
fi

echo "==> pm2 reload"
pm2 reload michele-imoveis

echo "Deploy concluído."
