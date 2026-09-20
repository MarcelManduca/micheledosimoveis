# Homologação em Ambiente Isolado

Este diretório contém a suíte de validação e a infraestrutura de testes para homologação local da aplicação em ambiente 100% isolado (sem requisições ou alterações em produção).

---

## 1. Estrutura dos Arquivos

- `supabase_bootstrap.sql`: Criação das roles padrão (`anon`, `authenticated`, `service_role`, `authenticator`), schema `auth`, `auth.users`, `auth.uid()`.
- `postgrest.conf`: Configuração do servidor PostgREST apontando para a base de homologação e conectando através da role `authenticator`.
- `supabase-local-proxy.mjs`: Proxy transparente que preserva cabeçalhos `Authorization` e encaminha rotas `/rest/v1/*` para o PostgREST.
- `test-homolog-suite.mjs`: Bateria automatizada de testes HTTP contra o servidor Nitro SSR e a camada REST/RLS.
- `test-mcp-real-handlers.ts`: Testes unitários diretos nos handlers das ferramentas MCP utilizando fixtures locais.

---

## 2. Como Reproduzir a Homologação Local

### Passo 1: Preparar o Banco de Dados Local
```bash
# Criar banco isolado
createdb michele_homolog_isolated

# Aplicar o bootstrap de compatibilidade
psql -d michele_homolog_isolated -f tests/homologation/supabase_bootstrap.sql

# Aplicar as 24 migrations do projeto
for f in $(ls -v supabase/migrations/*.sql); do
  psql -d michele_homolog_isolated -f "$f"
done
```

### Passo 2: Iniciar os Serviços Locais
```bash
# Iniciar PostgREST
PGRST_DB_URI="postgres://authenticator@127.0.0.1:5432/michele_homolog_isolated" \
PGRST_JWT_SECRET="local-homolog-secret-key-at-least-32-chars-long-isolated-test" \
postgrest tests/homologation/postgrest.conf &

# Iniciar o Proxy Transparente
node tests/homologation/supabase-local-proxy.mjs &
```

### Passo 3: Compilar e Executar o Servidor Nitro
```bash
npm run build

PORT=3030 \
SUPABASE_URL="http://127.0.0.1:3001" \
SUPABASE_SECRET_KEY="<LOCAL_SERVICE_ROLE_JWT>" \
SUPABASE_PUBLISHABLE_KEY="<LOCAL_ANON_JWT>" \
node .output/server/index.mjs &
```

### Passo 4: Executar os Testes
```bash
# Executar a bateria integrada de homologação
LOCAL_ANON_JWT="<LOCAL_ANON_JWT>" \
LOCAL_SERVICE_JWT="<LOCAL_SERVICE_ROLE_JWT>" \
node tests/homologation/test-homolog-suite.mjs

# Executar os testes unitários de handlers MCP
npx tsx tests/homologation/test-mcp-real-handlers.ts
```
