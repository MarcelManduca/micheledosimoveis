# Runbook — Deploy nativo Lovable → GitHub → Hostinger

## Contrato de build (o único caminho oficial)

Painel Hostinger (Web App Node.js):

- configuração predefinida: **Nitro**
- branch: `main`
- Node: 22.x
- gerenciador: npm
- comando de build: `npm run build`
- diretório de saída: `.output`
- arquivo de entrada: `server/index.mjs`

Basta clicar em **Salvar e reimplantar**. Sem SSH, sem PM2 manual, sem cópia de
arquivos por operador.

O que garante isso no repositório:

- `package.json` → `"build": "vite build"` (sem postbuild).
- `vite.config.ts` → `nitro: { preset: process.env.NITRO_PRESET ?? "node-server" }`.
  O preset `node-server` gera `.output/server/index.mjs` + `.output/public` e
  **serve os estáticos de `/assets/*` no próprio processo Node**. Se o painel
  definir `NITRO_PRESET`, esse valor tem precedência. Dentro do build da Lovable
  o bloco é ignorado (a plataforma força Cloudflare e saída em `dist/`).
- `src/server.ts` é apenas o wrapper de erro SSR + cache headers (baseline). Ele
  **não** serve arquivos de disco — quem faz isso é o preset `node-server`.

### Causa do incidente "site sem CSS"

> O build efetivo na Hostinger passou a resolver para um preset incompatível com
> o runtime Node. A correção fixa explicitamente `node-server`, removendo a
> dependência da resolução implícita de preset e garantindo `.output/server` +
> `.output/public` no mesmo artefato.

Nota histórica: houve baseline funcional **sem** configuração explícita de preset;
o problema surgiu quando a resolução implícita mudou de destino. Fixar o preset
elimina essa dependência.


### Verificação local do mesmo build

```bash
rm -rf .output dist node_modules/.cache
npm ci
npm run build
node .output/server/index.mjs   # PORT/HOST conforme o proxy
```

Deve existir `.output/server/index.mjs` e arquivos `.css`/`.js` em
`.output/public/assets`. Testado: `/`, `/assets/*.css`, `/assets/*.js`,
`/sitemap.xml` e `/vrsync.xml` respondem 200; `/lancamentos` responde 404
(vertical desativada por feature flag).

## Fallback opcional por SSH (`deploy/update.sh`)

Mantido apenas como plano B de emergência (git reset + build + verificação de
assets + pm2 reload). **Não faz parte do fluxo normal** — o deploy oficial é o
botão do painel.

## /vrsync.xml em 503

O feed é gerado sob demanda com milhares de imóveis; 503/504 é timeout de proxy.
`deploy/nginx-hostinger.conf` usa `proxy_read_timeout 300s` e `proxy_buffering off`
para `^/vrsync.*\.xml$`. No LiteSpeed, ajustar `Connection Timeout` e o timeout do
external app para 300s.
