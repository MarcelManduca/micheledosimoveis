## Descrição das Alterações

[Descreva brevemente o que foi implementado ou corrigido nesta Pull Request.]

---

## Checklist de Garantia e Validação

Por favor, confirme que os itens abaixo foram cumpridos antes de realizar o merge:

- [ ] **Build Aprovado:** Compilação local executada com sucesso (`npm run build`).
- [ ] **Arquivos de Infraestrutura:** Foi verificado se houve alteração em arquivos protegidos (`package.json`, `package-lock.json`, `vite.config.ts`, `src/server.ts`, `deploy/**`, `.github/**`).
- [ ] **Lockfile Justificado:** Caso o `package-lock.json` tenha sido alterado, a justificativa/inclusão de dependências foi aprovada previamente.
- [ ] **Validação Chrome DevTools MCP:** As páginas alteradas e a Home foram inspecionadas via DevTools.
- [ ] **Rede sem Erros (Network 4xx/5xx):** Nenhuma requisição de página ou asset estático gerou erros de status HTTP 4xx ou 5xx.
- [ ] **Plano de Rollback Definido:** Procedimento de regressão verificado caso ocorra indisponibilidade em produção.
