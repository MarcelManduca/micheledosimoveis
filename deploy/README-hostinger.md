# Runbook — Deploy Hostinger (Lovable → GitHub → VPS)

Arquitetura mantida: o Lovable publica no GitHub, a VPS Hostinger puxa `origin/main`,
faz o build e serve via PM2 (+ Nginx/LiteSpeed na frente).

## Deploy padrão

```bash
cd /var/www/michele-imoveis
bash deploy/update.sh
```

Se o LiteSpeed/Apache serve os estáticos direto do docroot (em vez de proxy para o Node),
informe o caminho para que o script espelhe `.output/public` lá:

```bash
STATIC_DOCROOT=/home/USER/domains/micheledosimoveis.com.br/public_html bash deploy/update.sh
```

## O que o script garante

1. `git fetch` + `git reset --hard origin/main` (sem merge sujo na VPS).
2. Remove `.output` e `node_modules/.cache` antes de buildar.
3. `bun install --frozen-lockfile` + `bun run build` (fallback `npm ci`).
4. **Falha o deploy antes do reload** se faltar `.output/server/index.mjs`,
   se `.output/public/assets` não existir, estiver vazio ou sem `.css`/`.js`.
5. Copia os estáticos para o docroot e confere a contagem de arquivos.
6. `pm2 reload` (ou `pm2 start` se o processo não existir).
7. Healthcheck: `/` deve responder 200 **e** um arquivo real de `/assets/*.css`
   deve responder 200. `/vrsync.xml` é apenas reportado.

## Incidente "site sem CSS" (404 em /assets)

Causa: o HTML SSR novo foi publicado, mas os arquivos de `.output/public/assets`
nunca chegaram ao diretório servido pelo web server — os hashes referenciados no HTML
não existiam em disco e o LiteSpeed devolvia 404 (com cache negativo).

Correção manual, se preciso:

```bash
cd /var/www/michele-imoveis
ls -la .output/public/assets | head          # os arquivos existem?
find .output/public/assets -type f | wc -l
# se estiver servindo por docroot:
rsync -a --delete .output/public/assets/ "$STATIC_DOCROOT/assets/"
# purge do cache LiteSpeed:
/usr/local/lsws/bin/lswsctrl restart
pm2 reload michele-imoveis
```

Validação final (deve retornar 200 em todos):

```bash
curl -sI https://www.micheledosimoveis.com.br/ | head -1
CSS=$(curl -s https://www.micheledosimoveis.com.br/ | grep -o '/assets/[^"]*\.css' | head -1)
curl -sI "https://www.micheledosimoveis.com.br$CSS" | head -1
```

## /vrsync.xml em 503

O feed é gerado sob demanda com milhares de imóveis. O 503/504 vem do timeout do
proxy, não do app. `deploy/nginx-hostinger.conf` já define `proxy_read_timeout 300s`
e `proxy_buffering off` para `^/vrsync.*\.xml$`. Após alterar:

```bash
nginx -t && systemctl reload nginx
```

No LiteSpeed, aumentar equivalentes: `Connection Timeout` e o timeout do
external app / proxy context para 300s.
