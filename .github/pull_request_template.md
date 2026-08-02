## Descrição da Pull Request

**Categoria da Mudança:**
- [ ] **A) Funcional:** Interface (UI), páginas, componentes, estilos ou regras de negócio.
- [ ] **B) Dados:** Schemas do banco, migrations, políticas RLS, rotinas de importação ou Supabase.
- [ ] **C) Infraestrutura:** Dependências, `package.json`, `vite.config.ts`, `src/server.ts`, workflows CI/CD ou Hostinger.

[Descreva brevemente o que foi implementado ou corrigido nesta PR.]

---

## Checklist de Promoção para Produção (`production`)

Por favor, confirme que os itens abaixo foram cumpridos antes de aprovar e realizar o merge para a branch `production`:

- [ ] **Arquivos Protegidos:** Confirmado que a PR não altera arquivos de infraestrutura protegidos a menos que a categoria seja C.
- [ ] **Dependências e Lockfile:** `package.json` e `package-lock.json` foram revisados e justificadas eventuais alterações.
- [ ] **Migrations de Dados:** Qualquer alteração de dados (Categoria B) possui scripts de migration retrocompatíveis descritos.
- [ ] **Build Aprovado:** Compilação local executada com sucesso (`npm run build`).
- [ ] **CI Passou:** O workflow `Verify Production Contract` no GitHub Actions concluiu com sucesso.
- [ ] **Chrome DevTools MCP Validado:** As rotas afetadas e a Home foram inspecionadas via DevTools.
- [ ] **Console sem Erros:** Nenhum novo erro de JavaScript foi emitido no console do navegador.
- [ ] **Rede Limpa (Network):** Nenhuma requisição de página ou asset estático gerou erros HTTP 4xx ou 5xx inesperados.
- [ ] **Plano de Rollback:** Procedimento de regressão definido e testado em caso de falha pós-deploy.
- [ ] **Aprovação de Promoção:** Mudanças da branch `main` aprovadas para promoção na branch `production`.
