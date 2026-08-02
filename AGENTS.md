<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Diretrizes Gerais de Desenvolvimento e Agentes de IA

1. **Separação de Mudanças:** Mudanças funcionais de produto não podem alterar arquivos de infraestrutura ou configuração (`package.json`, `package-lock.json`, `vite.config.ts`, `src/server.ts`, diretórios `deploy/**` ou `.github/**`).
2. **Gestão de Dependências:** Não atualizar dependências automaticamente sem solicitação explícita e justificativa.
3. **Mudanças de Infraestrutura:** Qualquer alteração em scripts de build, presets ou infraestrutura exige solicitação, aprovação e commit separados das tarefas de frontend/funcionalidades.
4. **Preservação de Histórico Git:** Nunca realizar `force push`, `rebase`, `amend` ou `squash` em commits já enviados ao repositório.
5. **Validação de Produção:** Sempre validar a compilação local e inspecionar a entrega em produção com o Chrome DevTools MCP (garantindo ausência de erros 4xx/5xx na rede) antes de considerar a tarefa concluída.
