# Instrução de Execução — Auditoria e Homologação de Independência Operacional

## Contexto
Este documento formaliza as instruções para validação da independência operacional e integridade de runtime da branch `release/vendor-neutral-seo-20260920` em ambiente isolado antes da integração com a branch `production`.

---

## 1. Diretrizes de Execução e Segurança
1. **Preservação de Produção:** Nenhuma alteração, migration ou escrita pode ser executada contra o banco de dados de produção durante os testes locais.
2. **Separação de Privilégios (RLS):** Consultas anônimas devem rodar sob a role `anon` (`NOBYPASSRLS`, `NOSUPERUSER`), respeitando todas as políticas de segurança.
3. **Neutralidade de Vendor:** O repositório e os scripts de auditoria devem receber configurações de domínios proibidos via variáveis de ambiente externas, sem hardcode de credenciais.

---

## 2. Roteiro de Homologação em Ambiente Isolado
1. **Compilação e Verificação:**
   - Executar `npm run build` e validar a compilação do servidor Nitro (`.output/server/index.mjs`).
2. **Ambiente de Banco Local:**
   - Inicializar PostgreSQL local com `supabase_bootstrap.sql`.
   - Aplicar as 24 migrations do projeto em `supabase/migrations/` usando `psql -v ON_ERROR_STOP=1`.
   - Inserir fixtures sintéticas (imóvel ativo, indisponível/preservado, não publicado e bloqueado).
3. **Serviço REST e Proxy:**
   - Iniciar PostgREST conectado via role `authenticator`.
   - Iniciar `supabase-local-proxy.mjs` para roteamento compatível com o cliente SDK.
4. **Execução da Bateria de Testes:**
   - Executar `node tests/homologation/test-homolog-suite.mjs`.
   - Validar:
     - `/imovel/31776`: HTTP 200, aviso de indisponibilidade, CTA editorial, preço nulo.
     - `/imovel/BLOCKED-ADMIN-999`: HTTP 404, componente "Imóvel não encontrado", ausência de dados comerciais.
     - Endpoints MCP: Status 200, exclusão de não publicados/bloqueados, sem erros técnicos.
     - Rejeição de tokens inválidos com HTTP 401.

---

## 3. Critérios de Aceite para Pull Request
- Build concluído com sucesso.
- 100% dos testes de homologação local aprovados.
- Ausência de segredos ou credenciais locais no histórico Git.
- Relatório técnico atualizado e documentação de limitações técnicas.
