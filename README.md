# Michele dos Imóveis

Site institucional e plataforma de captação imobiliária da corretora **Michele Prietsch** — imóveis de alto padrão em Florianópolis (Beira-Mar Norte, Centro, praias do Norte e Sul da Ilha).

## Visão Geral do Produto e Stack

* **Framework Principal:** TanStack Start (React 19 + Nitro 3)
* **Estilização:** Tailwind CSS v4
* **Backend e Banco de Dados:** Lovable Cloud (Supabase) para banco, autenticação, armazenamento e funções server-side
* **Ambiente de Produção Oficial:** Hostinger (Node.js 22 + Phusion Passenger / LiteSpeed)
* **Fonte da Verdade:** Repositório GitHub na branch `main` (`MarcelManduca/micheledosimoveis`)

---

## Estrutura de Publicação e Infraestrutura

A branch `main` do GitHub é a **única fonte da verdade** para o ambiente de produção na Hostinger.

* **Deploy de Produção:** Automatizado via integração com o GitHub na Hostinger (`npm run build`).
* **Preset do Nitro:** `node-server` (`NITRO_PRESET=node-server`).
* **Contrato de Saída:** `.output/server/index.mjs` (SSR) e `.output/public/assets` (estáticos).

---

## Documentação Técnica e Metodologia

Para diretrizes completas de desenvolvimento, contratos de infraestrutura e procedimentos de deploy/validação, consulte os documentos oficiais:

* **[Metodologia de Desenvolvimento e Deploy](docs/AI-SITE-METHOD.md):** Regras de desenvolvimento, arquivos protegidos, ciclo de 8 passos e procedimentos de teste.
* **[Guia de Infraestrutura Hostinger](deploy/README-hostinger.md):** Detalhes da arquitetura de produção e hospedagem.
* **[Diretrizes de Agentes de IA](AGENTS.md):** Regras de governança para agentes automatizados.
