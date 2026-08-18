# Descritivo Técnico da Arquitetura — Runtime Independente do Supabase

Este documento descreve detalhadamente a infraestrutura e a arquitetura do projeto **Michele dos Imóveis** operando com o novo runtime independente do Supabase.

---

## 1. Banco de Dados
* **Provedor:** PostgreSQL hospedado de forma dedicada e independente no Supabase (Project Ref: `ganaogythtxdflbqddgb`).
* **Estrutura e Tabelas:** O banco possui 9 tabelas de negócio principais importadas na íntegra (`properties`, `property_photos`, `condominiums`, `developers`, `developments`, `development_properties`, `development_suggestion_dismissals`, `vrsync_feeds` e `condo_import_staging`).
* **Integridade de Dados (Cutover):** O banco de dados foi sincronizado com o delta final de produção (concluído na Etapa 6B), mantendo paridade absoluta (3.150 imóveis, 89.133 fotos de imóveis e 3 feeds).
* **Automações Internas (Triggers):** Triggers PostgreSQL ativos e habilitados diretamente no banco de dados (`properties_set_updated_at` e `trg_vrsync_feeds_updated_at`), os quais gerenciam a atualização automática de timestamps nas operações de mutação e sincronização.

---

## 2. Autenticação
* **Provedor:** Supabase Auth (GoTrue).
* **Controle de Acesso (RLS & Roles):** Políticas RLS (Row Level Security) ativas na maioria das tabelas. O acesso administrativo é delimitado a contas cadastradas com a role `admin` no banco de dados (por exemplo, `micheledosimoveis@gmail.com`). 
* **Persistência de Sessão:** Gerenciada nativamente pelo cliente do Supabase utilizando cookies e `localStorage` no browser (via `@supabase/ssr` e `@supabase/supabase-js`), provendo renovação transparente de tokens JWT (refresh tokens) tanto no carregamento do SSR (servidor) quanto na navegação SPA (client-side).

---

## 3. Storage
* **Provedor:** Supabase Storage.
* **Buckets e Acesso:** Armazenamento central de ativos de mídia estruturado em buckets no Supabase.
* **Políticas de Segurança:** O acesso de leitura aos assets de mídia pública é irrestrito (público), enquanto operações de escrita (upload), deleção e modificação de imagens são protegidas por políticas RLS robustas que exigem autenticação ativa e privilégios da role `admin`.

---

## 4. APIs
* **API de Banco de Dados (Postgrest):** Endpoints REST do Supabase (`https://ganaogythtxdflbqddgb.supabase.co/rest/v1/`) são consumidos de maneira otimizada diretamente pelo client-side para leituras de imóveis, otimizando o carregamento SPA.
* **Server Functions (API Backend):** Operações confidenciais, processamento de XMLs, importadores dinâmicos de dados e scrapers de portais são executados sob o wrapper seguro do TanStack Start e Nitro API Engine no backend do servidor da aplicação Hostinger. Isso evita qualquer exposição de credenciais de serviço no frontend.

---

## 5. Edge Functions
* **Estado Atual:** Não utilizadas / Inexistentes no repositório.
* **Estratégia de Arquitetura:** Todas as rotinas que poderiam ser implementadas via Edge Functions foram centralizadas nas server functions e endpoints de API internos executados na própria VPS Node da Hostinger. Isso reduz o overhead de manutenção externa de infraestrutura de nuvem distribuída e elimina latência residual e cold starts.

---

## 6. Execução SSR
* **Framework:** TanStack Start (React 19 + Vinxi + Nitro).
* **Mecanismo de Renderização:** O build de produção é gerado com o preset `node-server` do Nitro e executado em Node.js (versão >= 22). 
* **Serviço de Páginas e Assets:** O processo Node do servidor escuta em porta dedicada da VPS Hostinger, interceptando requisições, executando o ciclo SSR do React para renderizar HTML estático completo (injetando dados coletados do Supabase em tempo real) e servindo arquivos estáticos CSS/JS a partir do diretório `.output/public/assets`.

---

## 7. Domínio
* **Domínios Oficiais:** `micheledosimoveis.com.br` e subdomínio `www.micheledosimoveis.com.br`.
* **Indexação & SEO:** Todas as rotas geram automaticamente tags `<link rel="canonical">` apontando de forma unívoca para as rotas correspondentes sob o domínio principal criptografado `https://micheledosimoveis.com.br`. Isso anula o risco de penalidades por conteúdo duplicado no Google e consolida a relevância técnica de SEO.

---

## 8. DNS
* **Servidores e Zonas:** DNS configurado e propagado a partir do painel hPanel da Hostinger.
* **Registros de Apontamento:** Registros tipo `A` apontando as zonas raiz e subdomínio principal diretamente para o IP público da VPS Hostinger que executa o servidor SSR.
* **Criptografia SSL:** Os certificados SSL/TLS da Michele dos Imóveis são obtidos e renovados de forma segura e automatizada via Let's Encrypt (Certbot) ou integrados no proxy web (Nginx/LiteSpeed) configurado no servidor Hostinger.

---

## 9. Deploy
* **Fluxo de CI/CD:** Branch `production`. Ao fazer push de código ou realizar o merge da PR de homologação na branch `production`, o hPanel da Hostinger detecta a atualização, inicia o build (`npm run build`) e substitui o diretório `.output/` de maneira atômica e sem downtime.
* **Ponto de Entrada de Processo:** Arquivo `.output/server/index.mjs` gerenciado por PM2 (processo `michele-imoveis`) ou pelo gerenciador de processos Node do LiteSpeed.
* **Fallback de SSH (`deploy/update.sh`):** Em caso de falha na integração git, o runbook `update.sh` é executado via terminal, realizando git sync, limpeza de caches, compilação de assets, verificação de paridade estática de arquivos de compilação CSS/JS e restart seguro do processo PM2 com healthcheck ativo.

---

## 10. Armazenamento de Secrets
* **Isolamento de Credenciais:** Nenhuma chave secreta administrativa (`SUPABASE_SECRET_KEY` ou `SYNC_WEBHOOK_SECRET`) é persistida no repositório de controle de versão (Git) ou exportada no bundle do cliente.
* **Declaração Local:** Arquivos `.env` e `.env.*` estão catalogados no arquivo `.gitignore` para proteção estrita do workspace local.
* **Injeção em Produção:** As variáveis de ambiente de produção (públicas e privadas) são cadastradas de forma criptografada e segura no painel Hostinger, e fornecidas como variáveis de runtime (`process.env`) diretamente para o processo Node executor.
