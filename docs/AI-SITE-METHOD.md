# Metodologia Oficial de Desenvolvimento e Deploy (Michele dos Imóveis)

## 1. Arquitetura de Branches e Promoção para Produção

Para impedir que alterações intermediárias ou rascunhos do Lovable cheguem diretamente ao ambiente ao vivo, estabelecemos o isolamento estrito entre integração e produção:

* **`main` (Integração & Lovable):** Branch de integração contínua conectada ao Lovable. Toda edição realizada no editor Lovable sincroniza diretamente com a branch `main`.
* **`production` (Produção Hostinger):** Branch exclusiva implantada pelo ambiente da Hostinger. A Hostinger **não deve acompanhar a branch `main`**.
* **Promoção Controlada:** Nenhuma alteração é publicada em produção sem passar pelo fluxo de validação e ser promovida da branch `main` para a `production` via Pull Request.
* **Preservação de Histórico:** É estritamente proibido realizar `force push`, `rebase`, `amend` ou `squash` em commits já publicados.

---

## 2. Classificação Obrigatória das Solicitações

Todas as tarefas e requisições devem ser classificadas em uma das 3 categorias abaixo:

* **A) Funcional:** Interface do usuário (UI), páginas, componentes React, estilização Tailwind e regras de negócio.
* **B) Dados:** Schemas do banco de dados, migrations, políticas RLS, rotinas de importação e configurações do Supabase.
* **C) Infraestrutura:** Gerenciamento de dependências, `package.json`, `package-lock.json`, `vite.config.ts`, `src/server.ts`, presets do Nitro, scripts de servidor, workflows do GitHub Actions e Hostinger.

### Regra de Isolamento de Categoria:
Uma tarefa classificada como **Funcional (A)** não pode incluir alterações nas categorias **Dados (B)** ou **Infraestrutura (C)** sem autorização prévia e explícita do usuário. Se uma alteração de categoria for identificada durante a execução, o agente deve **interromper o trabalho e informar o usuário imediatamente**.

---

## 3. Fluxo de Release e Promoção para Produção

Todas as versões enviadas ao ambiente de produção devem cumprir a sequência:

```text
main (desenvolvimento / Lovable)
  └──► CI Aprovado (GitHub Actions: production-contract.yml)
        └──► Revisão de Diff de Código
              └──► Validação de Preview via Chrome DevTools MCP
                    └──► PR de main para production
                          └──► Merge da PR
                                └──► Deploy Automático Hostinger (branch production)
                                      └──► Validação em Produção (HTTP 200, sem 4xx/5xx)
```

---

## 4. Regras Especiais para Alterações de Dados (Categoria B)

Ao realizar modificações no banco de dados ou Supabase:

1. **Migrations Separadas:** Scripts de migration devem sempre ser enviados em commits e PRs isolados de mudanças de interface.
2. **Retrocompatibilidade (*Backward Compatibility*):** Alterações de dados devem ser mantidas retrocompatíveis com a versão de código em execução.
3. **Descontinuação Gradual:** Nunca excluir colunas ou tabelas no mesmo release que remove seu uso no frontend/backend. A remoção deve ser realizada em uma etapa posterior.
4. **Segurança RLS:** Políticas RLS (Row Level Security) devem ser auditadas a cada mudança de schema.
5. **Chaves Privadas:** Nenhuma chave administrativa (`service_role`) pode ser exposta no código do frontend ou enviada ao cliente.
6. **Feature Flags:** Módulos de dados inéditos devem ser protegidos por *Feature Flags* quando aplicável.

---

## 5. Veredito do Incidente e Causa Raiz Auditada

### Causa Final do Incidente:
Ao alterar a integração do GitHub no painel da Hostinger da branch `main` para a branch `production`, o ambiente de implantação foi recriado pela plataforma e as variáveis de ambiente previamente cadastradas não foram preservadas (apenas a `NITRO_PRESET` permaneceu). A ausência das variáveis do Supabase causou a falha no tempo de execução do SSR/backend, embora o processo de build e a geração dos assets estáticos tivessem ocorrido com sucesso.

### Variáveis de Ambiente Obrigatórias (Apenas os Nomes):
* `VITE_SUPABASE_URL`
* `SUPABASE_URL`
* `VITE_SUPABASE_PUBLISHABLE_KEY`
* `SUPABASE_PUBLISHABLE_KEY`
* `NITRO_PRESET`

### Checklist Obrigatório Antes de Alterar Branch, Repositório ou Integração na Hostinger:
- [ ] **Inventariar:** Listar todas as variáveis de ambiente cadastradas no painel da Hostinger.
- [ ] **Backup:** Fazer backup seguro dos valores das variáveis fora do repositório.
- [ ] **Alterar Integração:** Modificar a branch, repositório ou integração no painel da Hostinger.
- [ ] **Restaurar e Conferir:** Cadastrar novamente e conferir todas as variáveis no painel.
- [ ] **Implantar:** Executar a implantação (deploy).
- [ ] **Validar Produção:** Validar o funcionamento completo da aplicação e rotas em produção via Chrome DevTools MCP.

> 🔒 **Regra de Segurança de Segredos:** Valores secretos (senhas, chaves privadas, tokens, cookies e chaves de API sensíveis) **nunca devem ser commitados no repositório, registrados em arquivos de documentação ou enviados em chats**.

---

## 6. Configuração Final da Produção (Hostinger)

* **Branch de Produção:** `production`
* **Framework Predefinido:** Nitro
* **Versão do Node.js:** `22.x`
* **Diretório Raiz (Root):** `./`
* **Comando de Build:** `npm run build`
* **Diretório de Saída (Output):** `.output`
* **Ponto de Entrada (Entry File):** `server/index.mjs`
* **Variável de Ambiente:** `NITRO_PRESET=node-server`

---

## 7. Lista de Arquivos Protegidos

Os seguintes arquivos pertencem à categoria de Infraestrutura e não podem ser modificados em tarefas Funcionais:

* `package.json`
* `package-lock.json`
* `vite.config.ts`
* `src/server.ts`
* `deploy/**`
* `.github/**`

---

## 8. Prompt-Base para Agentes de IA

Ao solicitar novas tarefas a agentes de IA (Antigravity ou Lovable), utilize:

```text
[CONTEXTO E ESCOPO DA TAREFA - Categoria: A (Funcional) | B (Dados) | C (Infraestrutura)]
Por favor, implemente [descrever funcionalidade].

REGRAS DE SEGURANÇA E ARQUITETURA:
1. Siga a metodologia declarada em docs/AI-SITE-METHOD.md.
2. Não altere arquivos de infraestrutura protegidos a menos que a categoria seja C.
3. Não modifique schemas de dados a menos que a categoria seja B.
4. Valide a compilação local com 'npm run build' antes de concluir.
5. Não faça force push, rebase ou altere histórico Git publicado.
```

---

## 9. Checklist de Validação de Produção

Antes de aprovar a PR para a branch `production`, valide:

- [ ] O CI no GitHub Actions foi aprovado com sucesso.
- [ ] O build gerou `.output/server/index.mjs` e `.output/public/assets/`.
- [ ] A página principal e rotas internas respondem `HTTP 200`.
- [ ] Os assets CSS e JS carregam com `HTTP 200` e `Content-Type` correto.
- [ ] Ausência total de erros 4xx/5xx no console e na aba Network.

---

## 10. Procedimento de Rollback

Em caso de falha após o deploy da branch `production`:

1. **Reversão na branch `production`:** Realizar o `git revert` do commit de merge da PR em `production`.
2. **Redeploy Hostinger:** A Hostinger reconstruirá a versão anterior estável a partir da branch `production`.
3. **Validação de Emergência:** Confirmar o retorno do status HTTP 200 nas páginas principais.
