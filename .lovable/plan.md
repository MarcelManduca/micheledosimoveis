# Plano de Implementação

## 1. Filtros de pesquisa na Home (acima de Imóveis em destaque)

Barra de filtros com:
- **Tipo**: Apartamento, Cobertura, Casa, Terreno, Comercial
- **Bairro**: select com a lista das 18 regiões já cadastradas
- **Dormitórios**: 1, 2, 3, 4+
- **Faixa de preço**: até 1M, 1–3M, 3–5M, 5–10M, 10M+
- Botão **Buscar**

Ao submeter → navega para `/buscar?tipo=...&bairro=...&dorms=...&preco=...`

## 2. Nova rota `/buscar` (página de pesquisa)

- Lê filtros via `validateSearch` (zod + fallback)
- Loader consulta `properties` (publicado=true) com filtros aplicados via server fn pública
- Grid de cards de imóveis com mesma estética dos destaques (sem ChromaGrid)
- Reaplica a barra de filtros no topo para refinar
- `errorComponent` e `notFoundComponent`
- SEO: title/description dinâmicos por filtro

## 3. Destaques gerenciáveis no Admin

A coluna `featured boolean` já existe em `properties`. Vou:
- Adicionar toggle "Destacar na home" em cada card da lista de imóveis em `/admin`
- Server fn `toggleFeatured` protegida (`requireSupabaseAuth` + `has_role admin`)
- Home passa a buscar apenas `featured=true` para a seção "Imóveis em destaque"

## 4. Seção "Lançamentos" na Home

Mesmo fluxo de importação por link da Gralha, com uma flag separada:
- Migration: adicionar coluna `is_launch boolean default false` em `properties`
- Admin: campo "Marcar como lançamento" no formulário de importação + toggle na listagem
- Home: nova seção "Lançamentos imobiliários" abaixo de destaques, listando `is_launch=true`
- Usa o mesmo componente visual de card (grid simples, sem ChromaGrid no mobile)

## 5. Mover "Anuncie seu imóvel" para página dedicada

- Criar rota `/anuncie` com todo o conteúdo atual da seção (copy, benefícios, Off Market, CTAs WhatsApp)
- Remover a seção da home
- Substituir por **dois CTAs compactos** na home:
  - Banner "Quer vender seu imóvel? Conheça nossa curadoria de alto padrão" → `/anuncie`
  - Link no menu superior "Anuncie" passa a apontar para `/anuncie` (já existe, só ajustar destino)
- SEO próprio em `/anuncie` (head com title, description, OG)

## Detalhes técnicos

**Arquivos novos:**
- `src/routes/buscar.tsx` — página de busca com `validateSearch`
- `src/routes/anuncie.tsx` — página dedicada
- `src/components/PropertyFilters.tsx` — barra de filtros reutilizável (home + busca)
- `src/components/PropertyCard.tsx` — card extraído para reuso
- `src/lib/properties.functions.ts` — server fns `searchProperties`, `getFeatured`, `getLaunches`, `toggleFeatured`, `toggleLaunch`

**Migration:**
- `ALTER TABLE properties ADD COLUMN is_launch boolean NOT NULL DEFAULT false;`
- Index parcial em `featured` e `is_launch` para listagens rápidas

**Arquivos alterados:**
- `src/routes/index.tsx` — adicionar filtros no topo dos destaques, nova seção Lançamentos, remover seção Anuncie e colocar CTA banner, ajustar link "Anuncie" do menu para `/anuncie`
- `src/routes/admin.tsx` — toggles Destaque/Lançamento na listagem + campo "Lançamento" no import
- `src/lib/gralha-scraper.server.ts` — aceitar flag `isLaunch` no import (sem mudança de scraping)
- Atualizar `sitemap[.]xml.ts` para incluir `/anuncie` e `/buscar`

**Comportamento da Home após mudanças:**
1. Hero
2. Filtros de pesquisa
3. Imóveis em destaque (featured=true)
4. Lançamentos (is_launch=true)
5. Regiões
6. CTA banner "Anuncie seu imóvel" → /anuncie
7. Sobre
8. Footer

Confirma para eu seguir?