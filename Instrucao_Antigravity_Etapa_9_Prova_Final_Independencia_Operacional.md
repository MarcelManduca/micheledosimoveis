# Etapa 9 — Prova Final de Independência Operacional do Lovable

## Contexto

Etapas concluídas e aprovadas:
- Etapas 2A a 5C: Migração de schemas, importação de dados iniciais, configuração de roles de admin e homologação local.
- Etapa 6A e 6B: Captura de delta e aplicação no Supabase independente, atingindo paridade de dados absoluta.
- Etapa 7A e 7B: Preparação e Cutover completo em produção (Hostinger).
- Etapa 8: Ativação dos cron jobs no novo Supabase e execução do primeiro sync dinâmico em background.

Novo Supabase (Produção Independente):
- Project Ref: `ganaogythtxdflbqddgb`
- URL: `https://ganaogythtxdflbqddgb.supabase.co`

Este documento formaliza as instruções para realizar a **Prova Final de Independência Operacional**, garantindo que a aplicação em produção sob a branch `production` está totalmente isolada do Lovable Cloud e do banco de dados legado (`ppndlwatmyiexpqskdxg`).

---

## Objetivos da Etapa 9

1. **Garantir a Paridade de Código e Reconciliação:** Certificar que as branches local e origin da `production` estão 100% em sincronia e reconciliadas de forma linear e limpa.
2. **Auditoria de Conexões e Tráfego em Tempo Real:** Provar via gravação de tráfego de rede no browser que a aplicação rodando no domínio de produção não faz nenhuma chamada ativa para o projeto do Supabase antigo (`ppndlwatmyiexpqskdxg`).
3. **Auditoria de Segurança de Variáveis:** Confirmar a ausência absoluta de segredos (`SUPABASE_SECRET_KEY` ou `SYNC_WEBHOOK_SECRET`) no bundle compilado do lado do cliente (browser).
4. **Validação Operacional Independente:** Testar e registrar fluxos cruciais da aplicação (carregamento inicial, filtros de pesquisa, rotas de bairro, login administrativo, painel administrativo, logout).
5. **Emissão de Laudo Técnico:** Gerar o `Relatorio_Etapa_9_Prova_Final_Independencia.md` detalhando as métricas e logs coletados.

---

## Passo 1 — Verificação Git e Build

Executar comandos para comprovar conformidade:
```bash
git status
git branch --show-current
git log -3 --oneline
```
Confirmar que o build de produção é gerado localmente sem erros:
```bash
npm run build
```

---

## Passo 2 — Inventário de Variáveis de Runtime em Produção

Listar e certificar que as variáveis de ambiente necessárias estão injetadas sem vazar dados no código:
- `VITE_SUPABASE_URL` -> apontando para `https://ganaogythtxdflbqddgb.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` -> chave pública correta
- `SUPABASE_URL` -> `https://ganaogythtxdflbqddgb.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY` -> chave pública correta
- `SUPABASE_SECRET_KEY` -> chave privada do novo Supabase (somente server-side)
- `SYNC_WEBHOOK_SECRET` -> segredo exclusivo do webhook de sincronização
- `NITRO_PRESET` -> `node-server`

---

## Passo 3 — Auditoria de Rede Ativa via Browser (Chrome DevTools MCP)

1. Abrir o live site em produção: `https://micheledosimoveis.com.br/`
2. Ativar captura de tráfego de rede (Network Log).
3. Executar as seguintes interações:
   - Carregar a home page.
   - Navegar até a página de busca (`/buscar`) e aplicar um filtro de bairro (ex. "Jurerê Internacional").
   - Acessar os detalhes de um imóvel (ex. `/imovel/27641`).
   - Ir para a página de login administrativo (`/auth`) e verificar o fluxo.
   - Acessar a rota administrativa `/admin` e checar se carrega o painel.
4. Exportar o tráfego HTTP capturado.
5. Inspecionar o log de requisições para certificar que:
   - Nenhuma imagem ou asset é carregado de `ppndlwatmyiexpqskdxg.supabase.co` ou `lovable.app`.
   - Nenhuma chamada REST API ou chamada RPC aponta para o projeto antigo.
   - O tráfego aponta exclusivamente para o domínio próprio e o novo Supabase `ganaogythtxdflbqddgb.supabase.co`.

---

## Passo 4 — Auditoria de Cron Jobs de Sync

1. Confirmar que os jobs agendados no novo banco de dados (`sync-properties-morning` e `sync-properties-evening`) estão ativos e apontando para o endpoint da Hostinger.
2. Certificar que o legado está com os cron jobs desativados (`active = false` para os jobs 2 e 3).

---

## Critério de Aprovação da Etapa 9

A etapa será considerada **APROVADA** se e somente se:
- Não houver nenhuma referência ao Supabase antigo nos logs de rede do browser ao interagir com a aplicação viva.
- Os segredos estiverem totalmente protegidos contra vazamentos no frontend.
- O build de produção concluir com sucesso e estiver reconciliado no Git.
- O relatório técnico final contiver logs e evidências explícitas e transparentes para auditoria.
