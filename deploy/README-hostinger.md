# Runbook — Deploy Nativo Lovable → GitHub → Hostinger

## 1. Configuração Oficial de Produção (Hostinger)

Painel Hostinger (Web App Node.js):

* **Branch de Produção:** `production`
* **Framework Predefinido:** Nitro
* **Versão do Node.js:** `22.x`
* **Diretório Raiz (Root):** `./`
* **Gerenciador de Pacotes:** npm
* **Comando de Build:** `npm run build`
* **Diretório de Saída:** `.output`
* **Arquivo de Entrada (Entry File):** `server/index.mjs`
* **Variável de Ambiente:** `NITRO_PRESET=node-server`

---

## 2. Causa Final do Incidente e Prevenção de Perda de Variáveis

### Causa Raiz Auditada:
Ao alterar a integração do GitHub no painel da Hostinger da branch `main` para a branch `production`, a plataforma recriou o ambiente de implantação e as variáveis de ambiente previamente cadastradas não foram preservadas (apenas a `NITRO_PRESET` permaneceu). A ausência das variáveis do Supabase causou falha na execução do SSR/backend, embora a compilação do build e dos estáticos estivesse 100% correta.

### Variáveis de Ambiente Obrigatórias (Nomes):
* `VITE_SUPABASE_URL`
* `SUPABASE_URL`
* `VITE_SUPABASE_PUBLISHABLE_KEY`
* `SUPABASE_PUBLISHABLE_KEY`
* `NITRO_PRESET`

### Checklist Obrigatório Antes de Alterar Branch, Repositório ou Integração na Hostinger:
- [ ] **Inventariar:** Listar todas as variáveis de ambiente ativas no painel da Hostinger.
- [ ] **Backup Seguro:** Fazer backup seguro dos valores das variáveis fora do repositório.
- [ ] **Alterar Integração:** Modificar a branch (`production`), repositório ou integração no hPanel.
- [ ] **Restaurar e Conferir:** Cadastrar novamente e conferir os valores de todas as variáveis no hPanel.
- [ ] **Implantar:** Executar o deploy no painel.
- [ ] **Validar Produção:** Testar a aplicação em produção via Chrome DevTools MCP.

> 🔒 **Regra de Segurança de Segredos:** Valores secretos (senhas, chaves privadas, tokens, cookies e chaves de API sensíveis) **nunca devem ser commitados no repositório, registrados em arquivos de documentação ou enviados em chats**.

---

## 3. Garantias do Repositório

* `package.json` → `"build": "vite build"` (sem scripts pós-build).
* `vite.config.ts` → `nitro: { preset: process.env.NITRO_PRESET ?? "node-server" }`.  
  O preset `node-server` gera `.output/server/index.mjs` + `.output/public` e **serve os estáticos de `/assets/*` no próprio processo Node.js**.
* `src/server.ts` → Wrapper de erro SSR + cabeçalhos de cache. Quem serve arquivos estáticos de disco é o preset `node-server`.

---

## 4. Verificação Local do Build de Produção

```bash
npm ci --legacy-peer-deps
NITRO_PRESET=node-server npm run build
node scripts/verify-production-contract.mjs
```

Deve confirmar a existência de `.output/server/index.mjs` e arquivos `.css`/`.js` em `.output/public/assets`.

---

## 5. Fallback Opcional por SSH (`deploy/update.sh`)

Mantido como plano B de emergência (`git reset` + build + verificação de assets + `pm2 reload`). O fluxo oficial de produção é a implantação via branch `production` na Hostinger.
