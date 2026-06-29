# Michele dos Imóveis

Site institucional e plataforma de captação da corretora **Michele Prietsch** —
imóveis de alto padrão em Florianópolis, com foco em Beira-Mar Norte, Centro,
praias do Norte e Sul da Ilha.

Stack: **TanStack Start (React 19 + Vite 7)**, **Tailwind v4**, **Lovable Cloud
(Supabase)** para banco, autenticação e funções server-side.

---

## Fluxos de publicação disponíveis

Este projeto suporta **dois caminhos de publicação independentes**. Você pode
usar um, o outro, ou os dois ao mesmo tempo — eles não se excluem.

```
            ┌────────────────────────┐
            │        Lovable         │  (desenvolvimento + preview)
            └────────────┬───────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
   Cenário A: Publicar      Cenário B: Sincronizar com
   direto pelo Lovable      GitHub e publicar em
   (.lovable.app ou         hospedagem própria
    domínio conectado          (VPS, Vercel, Netlify,
    no Lovable)                Cloudflare, etc.) com
                               domínio próprio
```

O **GitHub** funciona como ponte técnica e backup versionado: tudo que é
editado no Lovable é enviado para o repositório, e a hospedagem própria
sempre puxa do GitHub — nunca do Lovable diretamente.

---

### Cenário A — Publicar pelo Lovable

**Quando usar**
- Para colocar o site no ar rapidamente sem configurar servidor próprio.
- Para validar mudanças com clientes em um link estável (`.lovable.app`).
- Quando você quer que o Lovable cuide de SSL, CDN e deploy automaticamente.

**Como publicar**
1. Abra o projeto no Lovable.
2. Clique em **Publish** (canto superior direito no desktop, ou no menu
   inferior no mobile, dentro do modo Preview).
3. Confirme a publicação. O site sobe em `https://<slug>.lovable.app`.
4. Para atualizar depois de novas edições, basta clicar em **Update** no
   mesmo diálogo de publicação.

**Vantagens**
- Zero configuração de infraestrutura.
- SSL automático.
- Preview e produção integrados no mesmo fluxo de edição.
- Deploy de funções server-side (TanStack `createServerFn`) já incluído.

**Limitações**
- O site fica em domínio `.lovable.app` por padrão.
- O ambiente de execução é o runtime do Lovable (Cloudflare Workers).
- A escala e os limites seguem o plano contratado no Lovable.

**Domínio próprio no Lovable**
Em **Project Settings → Project → Domains** (ou no diálogo de Publish em
**Add custom domain**), conecte seu domínio. O Lovable orienta os registros
DNS (A `185.158.133.1` para raiz e `www`, mais um TXT `_lovable` para
verificação) e provisiona SSL automaticamente. Detalhes:
<https://docs.lovable.dev/features/custom-domain>.

---

### Cenário B — Publicar por hospedagem própria via GitHub

**Quando usar**
- Quando você quer **controle total** do servidor, custos e escala.
- Quando precisa rodar em uma VPS própria, Vercel, Netlify, Cloudflare Pages,
  Railway, Render, Fly.io, etc.
- Quando o domínio precisa apontar para infraestrutura sua, sem depender do
  Lovable como serviço de produção.
- Para ter backup independente e histórico Git completo.

#### 1. Conectar Lovable ↔ GitHub (apenas uma vez)

No Lovable: menu **+** (canto inferior esquerdo do chat) → **GitHub** →
**Connect project** → autorize o app oficial do Lovable no GitHub e crie o
repositório.

A partir daí o sync é **bidirecional e automático**: qualquer alteração feita
no Lovable é enviada para o GitHub, e qualquer commit empurrado para o GitHub
volta para o Lovable.

#### 2. Clonar o projeto na sua máquina ou na hospedagem

```bash
git clone https://github.com/<seu-usuario>/<seu-repo>.git
cd <seu-repo>
```

#### 3. Instalar dependências

O projeto usa **Bun** por padrão (mais rápido), mas funciona com npm/pnpm.

```bash
bun install
# ou
npm install
```

#### 4. Variáveis de ambiente

Crie um arquivo `.env` na raiz com as chaves do backend (mesmas que o Lovable
usa). As variáveis públicas usadas pelo cliente:

```
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<sua-publishable-key>
VITE_SUPABASE_PROJECT_ID=<seu-project-id>
```

> Nunca commite `.env`. Os valores ficam disponíveis no painel da Lovable Cloud
> em **Backend → Settings**.

#### 5. Gerar build de produção

```bash
bun run build
# ou
npm run build
```

A saída fica em `.output/` (formato Nitro). Como este é um app **SSR
(TanStack Start)**, o deploy precisa de um runtime JavaScript — **não é um
site 100% estático**.

#### 6. Subir para uma hospedagem

**Opção 6a — Cloudflare Workers / Pages** (recomendado, mesmo runtime do Lovable)

```bash
bunx wrangler deploy
```

**Opção 6b — Vercel** (zero-config)

Conecte o repositório no painel da Vercel, o framework é detectado
automaticamente.

**Opção 6c — Netlify**

Conecte o repositório; o adapter Nitro gera as funções automaticamente.

**Opção 6d — VPS própria (Ubuntu/Debian com Node 20+)**

```bash
# Na VPS
git clone https://github.com/<seu-usuario>/<seu-repo>.git
cd <seu-repo>
npm install
npm run build

# Roda o servidor SSR (Nitro/Node)
node .output/server/index.mjs

# Mantenha vivo com PM2
npm install -g pm2
pm2 start .output/server/index.mjs --name michele-imoveis
pm2 save && pm2 startup
```

Coloque um **Nginx** na frente como reverse proxy na porta 80/443:

```nginx
server {
    listen 80;
    server_name micheledosimoveis.com.br www.micheledosimoveis.com.br;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 7. Configurar domínio próprio

No registrador (Registro.br, GoDaddy, Cloudflare, etc.), aponte:

- Registro **A** `@` → IP do seu servidor (ou o IP da plataforma escolhida).
- Registro **A** `www` → mesmo IP (ou CNAME para o domínio raiz).

Em Vercel/Netlify/Cloudflare basta adicionar o domínio no painel; eles dão
os registros corretos.

#### 8. Ativar SSL/HTTPS

- **Vercel / Netlify / Cloudflare Pages / Workers**: SSL automático.
- **VPS própria com Nginx**: use **Certbot** (Let's Encrypt):

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d micheledosimoveis.com.br -d www.micheledosimoveis.com.br
```

Renova sozinho via cron.

#### 9. Atualizar o site após novas alterações no Lovable

Depois de editar no Lovable, o commit já chega ao GitHub. Na hospedagem:

```bash
cd <seu-repo>
git pull
bun install   # só se dependências mudaram
bun run build
pm2 restart michele-imoveis   # ou redeploy automático na plataforma
```

Se usar Vercel/Netlify/Cloudflare com auto-deploy, **o push do Lovable para
o GitHub já dispara o deploy** — nenhum comando manual é necessário.

---

## Cenário B.1 — Hospedagem específica na Hostinger

A Hostinger oferece **dois caminhos** que rodam este projeto. Escolha
conforme o plano contratado:

| Caminho | Plano Hostinger | Esforço | Quando usar |
|---|---|---|---|
| **A — Web App Node.js** (hPanel → Sites → Adicionar Site) | Business / Cloud Startup+ / qualquer plano com suporte a Node.js apps | Baixo (sem SSH) | Padrão recomendado. Hostinger gerencia processo, SSL e domínio. |
| **B — VPS KVM** (acesso root + Nginx + PM2) | VPS KVM 1/2/4/8 | Médio (configuração manual) | Quando precisar de controle total, cron próprio, múltiplos serviços. |

> Hospedagem **Compartilhada / Premium** *sem* a opção "Web App Node.js" no
> menu **não roda** este projeto (é só PHP + estático). Se não enxergar a
> opção, faça upgrade para Business / Cloud ou siga o caminho VPS.

---

## Caminho A — Web App Node.js no hPanel da Hostinger

Este é o fluxo que aparece em **hPanel → Sites → Adicionar Site → Web App
Node.js**. A Hostinger usa Phusion Passenger por trás e roda o `npm start`
do projeto (já configurado para `node .output/server/index.mjs`).

### 1. Criar o app no hPanel
1. **hPanel → Sites → Adicionar Site**.
2. Escolha **Web App Node.js**.
3. Preencha:
   - **Domínio**: `micheledosimoveis.com.br` (ou subdomínio de teste).
   - **Versão do Node.js**: **20.x** (mínimo exigido pelo projeto).
   - **Diretório do app**: deixe o padrão (ex.: `/home/<usuario>/htdocs/<dominio>`).
   - **Arquivo de inicialização / Startup file**: `.output/server/index.mjs`.
   - **Comando de start (se solicitado)**: `npm start`.
4. Conclua a criação — o painel cria a estrutura e um app vazio.

### 2. Conectar ao GitHub (Git Deploy)
No card do site recém-criado: **Gerenciar → Git** (ou "Auto Deploy").

- **Repositório**: `https://github.com/<seu-usuario>/<seu-repo>.git`
- **Branch**: `main`
- **Diretório de destino**: o mesmo do app.
- **Auto-deploy**: ative para puxar a cada push.

> Como o Lovable faz push automático no GitHub a cada edição, **toda
> publicação no Lovable dispara um redeploy na Hostinger**.

### 3. Variáveis de ambiente
No painel do app: **Gerenciar → Variáveis de ambiente** (ou "Environment
Variables"). Adicione, no mínimo:

```
NODE_ENV=production
PORT=3000
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<sua-publishable-key>
VITE_SUPABASE_PROJECT_ID=<seu-project-id>
SUPABASE_URL=https://<seu-projeto>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<sua-publishable-key>
SUPABASE_PROJECT_ID=<seu-project-id>
SYNC_WEBHOOK_SECRET=<openssl rand -hex 32>
```

> A Hostinger ignora qualquer `.env` versionado por segurança — sempre
> configure as chaves **no painel**, não no repositório.

### 4. Comandos de build
No painel do app: **Gerenciar → Build / Hooks** (ou "Post-deploy commands").
Configure nesta ordem (executam após cada `git pull`):

```bash
npm install
npm run build
```

Se o painel permitir Bun, prefira `bun install && bun run build`
(2–3x mais rápido). O `npm start` (já no `package.json`) é o que a
Hostinger executa para subir o processo.

### 5. Domínio e SSL
1. **hPanel → Domínios** → aponte `A @` e `A www` para o IP indicado pela
   Hostinger no card do site (ou use os nameservers `ns1/ns2.dns-parking.com`
   se o domínio for gerenciado pela própria Hostinger).
2. No card do site: **SSL** → **Ativar SSL gratuito (Let's Encrypt)** →
   forçar HTTPS.

### 6. Verificar
- Logs do app: **Gerenciar → Logs** (stdout do `node`).
- Reiniciar manualmente: **Gerenciar → Reiniciar app**.
- Testar URL: `https://micheledosimoveis.com.br` deve responder com o site.

### 7. Cron diário de sincronização (opcional)
**hPanel → Avançado → Tarefas Cron** → adicionar:

```
0 6 * * * curl -fsS -X POST -H "x-sync-secret: SEU_SEGREDO" \
  https://micheledosimoveis.com.br/api/public/hooks/sync-properties \
  > /dev/null 2>&1
```

### Fluxo completo (caminho A)

```text
Lovable (edita) ─► GitHub (push automático) ─► Hostinger Web App Node.js
                                                  │
                                                  ├─ git pull
                                                  ├─ npm install
                                                  ├─ npm run build
                                                  └─ restart app (npm start)
                                                  
                                              Site no ar em
                                              https://micheledosimoveis.com.br
```

Sem SSH, sem PM2, sem Nginx — tudo gerenciado pela Hostinger.

---

## Caminho B — VPS KVM (controle total)

Use quando o plano contratado **não** oferece "Web App Node.js" ou quando
você quer customizar Nginx, processos múltiplos, cron próprio, etc.

### Tabela rápida de planos

| Plano Hostinger | Roda este projeto? | Por quê |
|---|---|---|
| **VPS (KVM 1/2/4/8)** | ✅ Sim | Acesso root, Node 20, PM2, Nginx, Certbot. |
| **Cloud Hosting** | ✅ Sim (via Web App Node.js — caminho A) | Painel gerencia o processo Node. |
| **Business / Premium** com "Web App Node.js" | ✅ Sim (caminho A) | Sem SSH, painel cuida do deploy. |
| **Compartilhada antiga** (só PHP) | ❌ Não | Não roda servidor Node persistente. |

> Se contratou apenas compartilhada antiga, faça **upgrade para Business**
> (a partir do KVM 1 com 1 vCPU / 4 GB já roda confortavelmente).

### Passo a passo na VPS Hostinger (KVM, Ubuntu 22.04+)

#### 1. Provisionar a VPS no hPanel
1. hPanel → **VPS** → escolha um plano KVM.
2. Sistema operacional: **Ubuntu 22.04 (ou 24.04) limpo** — *não* use template
   "Node.js" da Hostinger, que vem com versões antigas.
3. Defina senha root e anote o **IP público** da VPS.

#### 2. Apontar o domínio para a VPS
No hPanel → **Domínios** → DNS Zone Editor do seu domínio:

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| A | `@` | IP da VPS | 3600 |
| A | `www` | IP da VPS | 3600 |

Se o domínio está em outro registrador, faça o mesmo lá. Aguarde a
propagação (alguns minutos a poucas horas).

#### 3. Conectar via SSH
```bash
ssh root@<IP-da-VPS>
```

#### 4. Rodar o setup automatizado
Já incluímos um script idempotente que instala Node 20, Bun, PM2, Nginx,
clona o repositório, gera o build e sobe o processo:

```bash
# Na VPS, como root:
apt-get update && apt-get install -y git
git clone https://github.com/<seu-usuario>/<seu-repo>.git /var/www/michele-imoveis
cd /var/www/michele-imoveis

# Edita o .env antes de subir
cp .env.example .env
nano .env   # cole as chaves reais do backend (VITE_SUPABASE_*, SUPABASE_*, SYNC_WEBHOOK_SECRET)

# Roda o setup
REPO_URL="https://github.com/<seu-usuario>/<seu-repo>.git" \
APP_DIR="/var/www/michele-imoveis" \
DOMAIN="micheledosimoveis.com.br" \
bash deploy/hostinger-setup.sh
```

O script faz:
- Instala Node 20 LTS, Bun, PM2, Nginx, UFW.
- `bun install && bun run build`.
- `pm2 start ecosystem.config.cjs` + `pm2 save` + arranque automático no boot.
- Configura Nginx como reverse proxy (`deploy/nginx-hostinger.conf`).
- Libera firewall para SSH + HTTP/HTTPS.

#### 5. Ativar SSL/HTTPS (Let's Encrypt)
```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d micheledosimoveis.com.br -d www.micheledosimoveis.com.br
```
Renovação automática já vem agendada via `systemctl list-timers | grep certbot`.

#### 6. Atualizar após novo commit no GitHub
```bash
cd /var/www/michele-imoveis
bash deploy/update.sh
```

O script faz `git pull → bun install → bun run build → pm2 reload`. Você
também pode automatizar isso com um **webhook do GitHub** + endpoint próprio,
ou simplesmente rodar manualmente quando o Lovable publicar novas versões.

#### 7. Cron de sincronização diária (opcional)
Para manter o status dos imóveis em dia (verifica se a Gralha ainda
publica cada anúncio), agende um POST para o endpoint público:

```bash
# /etc/cron.d/michele-sync
0 6 * * * root curl -fsS -X POST \
  -H "x-sync-secret: $SYNC_WEBHOOK_SECRET" \
  https://micheledosimoveis.com.br/api/public/hooks/sync-properties \
  >/var/log/michele-sync.log 2>&1
```

(Defina `SYNC_WEBHOOK_SECRET` em `/etc/environment` ou inline no cron.)

### Arquivos de deploy versionados neste repo

| Arquivo | Função |
|---|---|
| `.env.example` | Modelo de variáveis de ambiente para a VPS. |
| `ecosystem.config.cjs` | Configuração PM2 (processo Node SSR). |
| `deploy/hostinger-setup.sh` | Setup completo da VPS (idempotente). |
| `deploy/nginx-hostinger.conf` | Reverse proxy + cache de assets. |
| `deploy/update.sh` | Pull + build + reload após cada novo commit. |

### Checklist final Hostinger

- [ ] Plano **VPS KVM** contratado (não compartilhado).
- [ ] DNS A `@` e `www` apontando para o IP da VPS (propagado).
- [ ] `.env` preenchido na VPS com chaves reais do backend.
- [ ] `pm2 status` mostra `michele-imoveis` como **online**.
- [ ] `nginx -t` retorna `syntax is ok`.
- [ ] Certbot emitiu certificado e HTTPS responde 200.
- [ ] Site abre em `https://micheledosimoveis.com.br` e `https://www.…`.
- [ ] `bash deploy/update.sh` roda sem erro após um `git pull`.

---

## Rotina recomendada de atualização

1. **Editar** o projeto no Lovable.
2. **Testar** visualmente no preview do Lovable.
3. **Sincronizar** automaticamente com o GitHub (o Lovable faz isso ao salvar).
4. **Confirmar** no GitHub que o commit chegou (`git log` ou aba "Commits").
5. Na **hospedagem própria**, puxar a nova versão: `git pull`.
6. Rodar o **build de produção**: `bun run build`.
7. **Publicar** o resultado (`.output/`) — reiniciando o processo Node, ou
   deixando o deploy automático da plataforma cuidar.
8. **Validar** no domínio próprio: SSL ativo, páginas carregando, imagens,
   formulários, integrações (WhatsApp, scraping da Gralha, mapas Leaflet) e
   SEO (sitemap, robots, OG tags) funcionando.

> ⚠️ **Não edite arquivos diretamente na hospedagem de produção.**
> Toda alteração deve ser feita no Lovable (ou em outro editor commitando no
> GitHub) e só então propagada para a hospedagem. Editar direto no servidor
> causa perda de alterações no próximo `git pull`, conflito de versões e
> dificulta manutenção futura.

---

## Resumo executivo

| Item | Status |
|------|--------|
| Publicável pelo Lovable | ✅ Sim, botão **Publish** no editor. |
| Sincronizado com GitHub | ✅ Sim, sync bidirecional automático após conectar. |
| Puxar do GitHub para hospedagem própria | ✅ `git clone` + `git pull`. |
| Instalar dependências | `bun install` (ou `npm install`). |
| Gerar build de produção | `bun run build` → saída em `.output/`. |
| Rodar em produção | `node .output/server/index.mjs` (VPS) ou deploy automático em Vercel/Netlify/Cloudflare. |
| Atualizar após edição no Lovable | `git pull && bun install && bun run build && pm2 restart` (ou auto-deploy). |
| Evitar perda de alterações | Nunca editar direto no servidor de produção; sempre via Lovable → GitHub → hospedagem. |

### Diferenças entre publicar pelo Lovable e pela hospedagem própria

|  | **Lovable** | **Hospedagem própria (Hostinger VPS)** |
|--|--|--|
| Configuração inicial | Zero | VPS + DNS + SSL (script `deploy/hostinger-setup.sh`) |
| Domínio próprio | Suportado (DNS apontando para Lovable) | Total controle do DNS no hPanel |
| Custo | Plano Lovable | Plano VPS KVM Hostinger |
| Atualização | 1 clique em "Update" | `bash deploy/update.sh` (pull + build + reload) |
| Runtime | Cloudflare Workers (gerenciado) | Node 20 + PM2 + Nginx |
| Backup do código | GitHub (se conectado) | GitHub + snapshot da VPS |
| Dependência operacional | Depende do Lovable estar no ar | Independente |
| Ideal para | Iteração rápida, MVP, validação | Produção definitiva, escala, controle |

O Lovable **não é dependência obrigatória de produção**. Ele é o ambiente
de desenvolvimento e uma opção de publicação. O GitHub garante portabilidade,
versionamento, backup e deploy externo.
