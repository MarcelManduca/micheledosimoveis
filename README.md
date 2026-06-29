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

|  | **Lovable** | **Hospedagem própria** |
|--|--|--|
| Configuração inicial | Zero | Servidor + DNS + SSL |
| Domínio próprio | Suportado (DNS apontando para Lovable) | Total controle do DNS |
| Custo | Plano Lovable | Custo do servidor escolhido |
| Atualização | 1 clique em "Update" | `git pull` + build + restart |
| Runtime | Cloudflare Workers (gerenciado) | À sua escolha (Node, Workers, etc.) |
| Backup do código | GitHub (se conectado) | GitHub + sua própria infra |
| Dependência operacional | Depende do Lovable estar no ar | Independente |
| Ideal para | Iteração rápida, MVP, validação | Produção definitiva, escala, controle |

O Lovable **não é dependência obrigatória de produção**. Ele é o ambiente
de desenvolvimento e uma opção de publicação. O GitHub garante portabilidade,
versionamento, backup e deploy externo.
