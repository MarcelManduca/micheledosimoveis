# Michele dos Imóveis

Site institucional e plataforma de captação imobiliária da corretora **Michele Prietsch** — imóveis de alto padrão em Florianópolis (Beira-Mar Norte, Centro, praias do Norte e Sul da Ilha).

## Visão Geral do Produto e Stack

* **Framework Principal:** TanStack Start (React 19 + Nitro 3)
* **Estilização:** Tailwind CSS v4
* **Backend e Banco de Dados:** Supabase para banco, autenticação, armazenamento e funções server-side
* **Ambiente de Produção Oficial:** Hostinger (Node.js 22 + Phusion Passenger / LiteSpeed)
* **Branch de Integração:** `main`
* **Branch de Produção (Hostinger):** `production`

---

## Estrutura de Publicação e Arquitetura de Branches

Para garantir a estabilidade do site ao vivo e manter um fluxo seguro de entregas:

* **Branch `main` (Integração):** Branch principal de integração contínua e desenvolvimento.
* **Branch `production` (Produção Hostinger):** A Hostinger compila e publica exclusivamente a partir da branch `production`. A Hostinger **não deve acompanhar a branch `main`**.
* **Fluxo de Promoção:** As alterações da `main` são promovidas para a `production` através de Pull Requests, após aprovação do CI e validação no Chrome DevTools MCP.
* **Histórico Git Protegido:** Nunca realizar `force push`, `rebase`, `amend` ou `squash` em commits já publicados.

---

## Documentação Técnica e Metodologia

Para diretrizes completas de desenvolvimento, classificação de solicitações, regras de dados e procedimentos de release, consulte:

* **[Metodologia de Desenvolvimento e Deploy](docs/AI-SITE-METHOD.md):** Arquitetura de branches, classificação de tarefas (Funcional, Dados, Infraestrutura), contrato do Nitro e fluxo de release.
* **[Guia de Infraestrutura Hostinger](deploy/README-hostinger.md):** Detalhes da hospedagem Hostinger e configurações de produção.
* **[Diretrizes de Agentes de IA](AGENTS.md):** Regras de governança para desenvolvimento assistido por IA.
