#!/usr/bin/env bash
# Deploy/atualização do site na VPS Hostinger.
#
# Sequência garantida:
#   git sync -> limpeza -> install -> build -> VERIFICAÇÃO dos assets -> publicação
#   dos estáticos no docroot (se houver) -> pm2 reload -> healthcheck.
#
# O script FALHA ANTES de recarregar o processo se `.output/public/assets`
# não existir ou estiver vazio — foi exatamente esse caso que colocou o site
# no ar sem CSS/JS (todos os assets em 404).
#
# Uso na VPS:
#   bash deploy/update.sh
#
# Variáveis opcionais:
#   APP_DIR         diretório do repositório           (default: raiz deste repo)
#   BRANCH          branch de produção                 (default: main)
#   STATIC_DOCROOT  docroot servido pelo LiteSpeed/Apache para /assets
#                   (ex: /home/USER/domains/micheledosimoveis.com.br/public_html)
#                   Se definido, `.output/public/` é espelhado para lá.
#   PM2_APP         nome do processo pm2               (default: michele-imoveis)
#   HEALTH_URL      URL local para healthcheck         (default: http://127.0.0.1:3000/)

set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
BRANCH="${BRANCH:-main}"
PM2_APP="${PM2_APP:-michele-imoveis}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/}"
STATIC_DOCROOT="${STATIC_DOCROOT:-}"

cd "$APP_DIR"

log() { printf '\n==> %s\n' "$*"; }
fail() { printf '\nERRO: %s\n' "$*" >&2; exit 1; }

# ---------------------------------------------------------------- 1. git sync
log "Sincronizando com origin/$BRANCH"
git fetch origin --prune
git reset --hard "origin/$BRANCH"
git clean -fd -e .env -e node_modules
echo "Commit: $(git rev-parse --short HEAD) — $(git log -1 --pretty=%s)"

# ---------------------------------------------------------------- 2. limpeza
log "Limpando build anterior e caches"
rm -rf .output
rm -rf node_modules/.cache
rm -rf .vinxi .nitro .tanstack 2>/dev/null || true

# --------------------------------------------------------- 3. install + build
if command -v bun >/dev/null 2>&1; then
  PKG_INSTALL=(bun install --frozen-lockfile)
  PKG_BUILD=(bun run build)
elif [ -x "$HOME/.bun/bin/bun" ]; then
  export PATH="$HOME/.bun/bin:$PATH"
  PKG_INSTALL=(bun install --frozen-lockfile)
  PKG_BUILD=(bun run build)
else
  PKG_INSTALL=(npm ci)
  PKG_BUILD=(npm run build)
fi

log "Instalando dependências: ${PKG_INSTALL[*]}"
"${PKG_INSTALL[@]}"

log "Build: ${PKG_BUILD[*]}"
"${PKG_BUILD[@]}"

# ------------------------------------------------------------ 4. verificações
log "Verificando artefatos do build"
test -f .output/server/index.mjs || fail "Build sem servidor: .output/server/index.mjs ausente."
test -d .output/public/assets    || fail "Build sem estáticos: .output/public/assets ausente."

ASSET_COUNT="$(find .output/public/assets -type f | wc -l | tr -d ' ')"
[ "$ASSET_COUNT" -gt 0 ] || fail "Diretório .output/public/assets está vazio."

CSS_COUNT="$(find .output/public/assets -type f -name '*.css' | wc -l | tr -d ' ')"
JS_COUNT="$(find .output/public/assets -type f -name '*.js' | wc -l | tr -d ' ')"
[ "$CSS_COUNT" -gt 0 ] || fail "Nenhum arquivo .css em .output/public/assets."
[ "$JS_COUNT"  -gt 0 ] || fail "Nenhum arquivo .js em .output/public/assets."
echo "OK: $ASSET_COUNT arquivos ($CSS_COUNT css / $JS_COUNT js)."

# ------------------------------------------- 5. publicar estáticos no docroot
if [ -n "$STATIC_DOCROOT" ]; then
  log "Publicando estáticos em $STATIC_DOCROOT"
  [ -d "$STATIC_DOCROOT" ] || fail "STATIC_DOCROOT não existe: $STATIC_DOCROOT"
  mkdir -p "$STATIC_DOCROOT/assets"
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete .output/public/assets/ "$STATIC_DOCROOT/assets/"
    rsync -a --exclude 'assets/' .output/public/ "$STATIC_DOCROOT/"
  else
    rm -rf "$STATIC_DOCROOT/assets"
    cp -a .output/public/assets "$STATIC_DOCROOT/assets"
    cp -a .output/public/. "$STATIC_DOCROOT/"
  fi
  PUBLISHED="$(find "$STATIC_DOCROOT/assets" -type f | wc -l | tr -d ' ')"
  [ "$PUBLISHED" -eq "$ASSET_COUNT" ] || fail "Cópia incompleta: $PUBLISHED/$ASSET_COUNT arquivos no docroot."
  echo "OK: $PUBLISHED arquivos publicados no docroot."

  # LiteSpeed guarda cache negativo (404) dos assets — força a expiração.
  if command -v /usr/local/lsws/bin/lswsctrl >/dev/null 2>&1; then
    /usr/local/lsws/bin/lswsctrl restart || true
  fi
  touch "$STATIC_DOCROOT/.htaccess" 2>/dev/null || true
else
  echo "STATIC_DOCROOT não definido — assets servidos pelo processo Node (proxy)."
fi

# -------------------------------------------------------------- 6. pm2 reload
log "Recarregando processo $PM2_APP"
if pm2 describe "$PM2_APP" >/dev/null 2>&1; then
  pm2 reload "$PM2_APP" --update-env
else
  pm2 start ecosystem.config.cjs --env production
fi
pm2 save >/dev/null 2>&1 || true

# -------------------------------------------------------------- 7. healthcheck
log "Healthcheck em $HEALTH_URL"
HEALTH_OK=0
for _ in $(seq 1 30); do
  CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$HEALTH_URL" || true)"
  if [ "$CODE" = "200" ]; then HEALTH_OK=1; break; fi
  sleep 2
done
[ "$HEALTH_OK" = "1" ] || { pm2 logs "$PM2_APP" --lines 40 --nostream || true; fail "App não respondeu 200 em $HEALTH_URL"; }

# Confere que um asset real do build responde 200 (evita repetir o incidente).
CSS_FILE="$(cd .output/public && find assets -type f -name '*.css' | head -n 1)"
if [ -n "$CSS_FILE" ]; then
  ASSET_CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "${HEALTH_URL%/}/$CSS_FILE" || true)"
  echo "Asset $CSS_FILE -> HTTP $ASSET_CODE"
  [ "$ASSET_CODE" = "200" ] || fail "Asset do build não está sendo servido (HTTP $ASSET_CODE)."
fi

# /vrsync.xml é pesado; só avisa, não bloqueia o deploy.
VR_CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 120 "${HEALTH_URL%/}/vrsync.xml" || true)"
echo "/vrsync.xml -> HTTP $VR_CODE (esperado 200; 503/000 indica timeout do proxy)"

log "Deploy concluído com sucesso."
