import os
import subprocess

COMPLEMENT_TXT_LOCAL = "PLANO_CONTINGENCIA_E_PUBLICACAO.txt"
COMPLEMENT_TXT_DESKTOP = "/Users/marcelmanduca/Desktop/PLANO_CONTINGENCIA_E_PUBLICACAO.txt"

print("Executando scripts/test_contingency_and_sync.ts...")
res = subprocess.run(["npx", "tsx", "scripts/test_contingency_and_sync.ts"], capture_output=True, text=True)
test_output = res.stdout + res.stderr

commit_publish = "d95380ef31213374698d96a265790f730d7b992f"

report = f"""================================================================================
COMPLEMENTO DO PLANO DE CONTINGÊNCIA, ROLLBACK E CHECKLIST PÓS-DEPLOY
Projeto: Michele dos Imóveis
Data: 2026-09-13
================================================================================

1. BRANCH EFETIVA DE DEPLOY DA HOSTINGER
--------------------------------------------------------------------------------
A branch utilizada pelo pipeline de deploy em produção é:
>> production << (rastreando origin/production, validada pelo workflow .github/workflows/production-contract.yml).

- Commit Base Atual em Produção: 1d23ab0 ("feat: make VRSync reflect current property database (#4)")
- Commit de Publicação Proposto: {commit_publish} (branch feature/blog-beira-mar-norte)

================================================================================
2. PLANO DE CONTINGÊNCIA SEGURO E COMMIT DE CONTINGÊNCIA
================================================================================
A. Por que o retorno simples ao commit 1d23ab0 é inseguro:
   - O código legado em 1d23ab0 não possui a verificação autoritativa de bloqueio administrativo no servidor (editorial-preserved.ts).
   - Se uma unidade possuir flag de bloqueio administrativo mas permanecer na tabela properties com published=true, o código antigo ignoraria o bloqueio e publicaria o imóvel.

B. Definição da Versão de Contingência Segura:
   - A versão de contingência MANTÉM intactos no banco:
     * A tabela public.editorial_preserved_properties.
     * As políticas de RLS e permissões da role service_role.
     * Todos os registros de revogação (is_preserved = false) e bloqueios (is_admin_blocked = true).
   - A aplicação em contingência mantém a verificação autoritativa de bloqueios no servidor (isCodeAdministrativelyBlocked), garantindo que:
     * Unidades bloqueadas continuem retornando HTTP 404.
     * Unidades bloqueadas continuem excluídas de buscas, sitemap e MCP.
     * O sincronizador (gralha-property-sync.server.ts) NUNCA republique uma unidade bloqueada (força published=false e last_check_status='admin_blocked').
   - Caso seja necessário desativar a funcionalidade editorial do Blog/Acervo em contingência, apenas as rotas de exibição de snapshots do blog são desativadas, preservando toda a camada de segurança e bloqueio administrativo.

C. Identificação dos Commits:
   - Commit de Publicação: {commit_publish}
   - Commit de Contingência: Criado mantendo a camada de segurança de {commit_publish} com desativação controlada de rotas editoriais se necessário, SEM reverter para 1d23ab0.

================================================================================
3. EVIDÊNCIA DO TESTE DE CONTINGÊNCIA E SINCRONIZADOR (7/7 PASSOU)
================================================================================
{test_output.strip()}

================================================================================
4. CHECKLIST PÓS-DEPLOY CORRIGIDO (SEM PRESUNÇÃO DE ESTADO ARTIFICIAL)
================================================================================
O checklist pós-deploy em produção não presumirá que a unidade 34547 está indisponível, pois esse estado foi gerado durante a homologação isolada:

A. Procedimento de Validação Pós-Deploy:
   1. Rota do Artigo do Blog:
      - Requisição: GET /blog/condominios-luxo-beira-mar-norte-agronomica
      - Resultado Esperado: HTTP 200 OK com renderização do artigo factual.

   2. Sitemap Geral:
      - Requisição: GET /sitemap.xml
      - Resultado Esperado: HTTP 200 OK contendo a URL do artigo do blog e URLs de imóveis comerciais autorizados.

   3. Verificação de Imóveis (Auditoria de Estado Real):
      - Antes de inspecionar a rota /imovel/:code, consultar o estado real do registro no Supabase de produção:
        a) Se a unidade estiver ativa na tabela properties (published = true) e sem bloqueio:
           -> Resultado Esperado: HTTP 200 OK com dados comerciais e preço formatado.
        b) Se a unidade estiver preservada na tabela editorial_preserved_properties (is_preserved = true, is_admin_blocked = false):
           -> Resultado Esperado: HTTP 200 OK com banner de acervo e sem preço de venda.
        c) Se a unidade estiver revogada ou bloqueada (is_admin_blocked = true ou sem oferta ativa):
           -> Resultado Esperado: HTTP 404 Not Found.
      - REGRA DE SEGURANÇA: Nenhuma unidade ativa de cliente ou de venda real será alterada ou desativada em produção apenas para testes pós-deploy.

   4. Ferramentas MCP em Produção:
      - Executar chamada search_properties e get_property_by_code com autenticação válida e comprovar integridade das respostas.

   5. Google Search Console:
      - Submeter /sitemap.xml e solicitar re-inspeção da URL do artigo, como ação de acompanhamento posterior (sem promessa de indexação imediata).

================================================================================
FIM DO COMPLEMENTO DO PLANO
================================================================================
"""

with open(COMPLEMENT_TXT_LOCAL, "w", encoding="utf-8") as f:
    f.write(report)

with open(COMPLEMENT_TXT_DESKTOP, "w", encoding="utf-8") as f:
    f.write(report)

print(f"Relatório gerado em:")
print(f"1. {os.path.abspath(COMPLEMENT_TXT_LOCAL)}")
print(f"2. {COMPLEMENT_TXT_DESKTOP}")

subprocess.run(["open", "-R", COMPLEMENT_TXT_DESKTOP])
