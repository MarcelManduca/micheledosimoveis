# Metodologia Oficial de Desenvolvimento e Deploy (Michele dos Imóveis)

## 1. Veredito do Incidente e Aprendizados

Durante a evolução do projeto, identificou-se um problema em que arquivos estáticos em `/assets/*` (como CSS e JS com hashes do Vite) retornavam erro **HTTP 404** em produção no ambiente da Hostinger.

### Causa Raiz Auditada:
1. **Configuração do Nitro:** O preset correto para execução no Phusion Passenger (Node.js 22) é o `node-server` (`NITRO_PRESET=node-server`). Presets de Cloudflare Module omitiam a funcionalidade `serveStatic` nativa do Node.js.
2. **Contrato do Servidor Web (LiteSpeed):** O servidor LiteSpeed da Hostinger espera que o build produza `.output/server/index.mjs` para rotas dinâmicas (SSR) e `.output/public/assets` para arquivos estáticos.
3. **Resolução:** A arquitetura padrão do projeto mantém o contrato oficial do Nitro sem workarounds ou scripts que alterem diretamente o sistema de arquivos da hospedagem.

---

## 2. Contrato de Produção Hostinger

* **Framework:** TanStack Start + React 19 + Nitro 3
* **Runtime:** Node.js 22 + Phusion Passenger (LiteSpeed)
* **Preset do Nitro:** `node-server` (`NITRO_PRESET=node-server`)
* **Comando de Build:** `npm run build` (`vite build`)
* **Pasta de Saída (Output):** `.output`
* **Ponto de Entrada (Entry File):** `server/index.mjs`

---

## 3. Método de Evolução em 8 Passos

Todas as alterações no repositório devem seguir rigorosamente este fluxo de trabalho:

1. **Especificar:** Definir claramente os requisitos e o escopo da tarefa antes de alterar qualquer arquivo.
2. **Isolar:** Separar alterações funcionais de produto (frontend/recursos) de alterações de infraestrutura (build/scripts/pacotes).
3. **Implementar:** Escrever código modular mantendo a arquitetura original.
4. **Validar Localmente:** Executar o build e testar a compilação localmente (`npm run build`).
5. **Revisar:** Verificar `git diff` e garantir que nenhum arquivo protegido foi modificado acidentalmente.
6. **Publicar:** Realizar o commit e enviar as alterações para a branch `main` no GitHub.
7. **Validar Produção:** Acompanhar a conclusão do deploy na Hostinger e inspecionar a aba Network do Chrome DevTools MCP garantindo status HTTP 200 nas páginas e assets estáticos.
8. **Documentar:** Atualizar registros de alterações e walkthroughs quando aplicável.

---

## 4. Lista de Arquivos Protegidos

Os seguintes arquivos são considerados **núcleo de infraestrutura** e não podem ser alterados em tarefas de desenvolvimento de funcionalidades:

* `package.json`
* `package-lock.json`
* `vite.config.ts`
* `src/server.ts`
* `deploy/**`
* `.github/**`

*Nota:* Alterações nesses arquivos requerem solicitação explícita, aprovação prévia e commit isolado.

---

## 5. Prompt-Base para Agentes de IA

Ao solicitar novas tarefas a agentes de IA (como Antigravity ou Lovable), utilize a seguinte estrutura de prompt:

```text
[CONTEXTO E ESCOPO DA TAREFA]
Por favor, implemente [descrever funcionalidade].

REGRAS DE SEGURANÇA E ARQUITETURA:
1. Siga a metodologia declarada em docs/AI-SITE-METHOD.md.
2. Não altere arquivos de infraestrutura (package.json, package-lock.json, vite.config.ts, src/server.ts, deploy/**, .github/**).
3. Não atualize dependências nem modifique presets do Nitro/Vite.
4. Valide a compilação local com 'npm run build' antes de concluir.
5. Não faça force push, rebase ou altere histórico Git publicado.
```

---

## 6. Checklist de Validação de Produção

Antes de finalizar qualquer entrega de deploy, valide:

- [ ] O build gerou `.output/server/index.mjs` com sucesso.
- [ ] O build gerou `.output/public/assets/` contendo arquivos `.css` e `.js`.
- [ ] A página principal (Home) responde `HTTP 200`.
- [ ] As páginas internas (`/imoveis`, `/condominios`, `/buscar`) respondem `HTTP 200`.
- [ ] Os assets CSS e JS referenciados no HTML carregam com `HTTP 200` e os devidos `Content-Type` (`text/css` e `application/javascript`).
- [ ] Ausência total de erros 4xx/5xx no console e na aba Network do navegador.

---

## 7. Procedimentos de Rollback

Caso ocorra regressão ou indisponibilidade em produção:

1. **Reversão via Git:** Restaurar a branch `main` no GitHub para o commit estável anterior (`git revert` ou checkout de commit validado).
2. **Re-deploy Hostinger:** Disparar a reconstrução do projeto via painel da Hostinger ou webhook da API.
3. **Validação de Emergência:** Confirmar que a Home e as páginas principais retornam HTTP 200 após o rollback.
