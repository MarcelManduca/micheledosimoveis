#!/usr/bin/env bash
# Setup inicial da VPS Hostinger (Ubuntu 22.04+).
# Rode como root (ou com sudo): bash deploy/hostinger-setup.sh

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/<seu-usuario>/<seu-repo>.git}"
APP_DIR="${APP_DIR:-/var/www/michele-imoveis}"
DOMAIN="${DOMAIN:-micheledosimoveis.com.br}"

echo "==> Atualizando pacotes"
apt-get update -y
apt-get install -y curl git nginx ufw

echo "==> Instalando Node 20 LTS"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "==> Instalando Bun e PM2"
command -v bun >/dev/null 2>&1 || curl -fsSL https://bun.sh/install | bash
npm install -g pm2

echo "==> Clonando repositório em $APP_DIR"
mkdir -p "$(dirname "$APP_DIR")"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

echo "==> Lembrete: crie o arquivo .env baseado em .env.example"
[ -f .env ] || cp .env.example .env

echo "==> Instalando dependências e gerando build"
~/.bun/bin/bun install || npm install
~/.bun/bin/bun run build || npm run build

echo "==> Subindo processo com PM2"
pm2 start ecosystem.config.cjs --env production || pm2 reload ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root | tail -n 1 | bash || true

echo "==> Configurando Nginx"
cp deploy/nginx-hostinger.conf /etc/nginx/sites-available/micheledosimoveis.conf
ln -sf /etc/nginx/sites-available/micheledosimoveis.conf /etc/nginx/sites-enabled/micheledosimoveis.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> Firewall (libera SSH + HTTP/HTTPS)"
ufw allow OpenSSH || true
ufw allow 'Nginx Full' || true
yes | ufw enable || true

echo
echo "============================================================"
echo "Setup concluído."
echo "Próximos passos:"
echo "  1. Aponte $DOMAIN (A) para o IP desta VPS."
echo "  2. Rode: certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "  3. Edite $APP_DIR/.env com as chaves reais e reinicie:"
echo "     pm2 reload michele-imoveis"
echo "============================================================"
