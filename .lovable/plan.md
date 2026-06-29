# Plano de SEO Técnico — Michele dos Imóveis

Objetivo: maximizar indexação no Google e CTR nas SERPs, cobrindo meta tags, hierarquia de headers, dados estruturados, sitemap/robots, performance e estratégia programática por bairro.

## 1. Auditoria — o que já está bom

- `__root.tsx` com title, description, OG, Twitter, geo tags, viewport e og:image.
- `/` , `/anuncie`, `/buscar`, `/privacidade` têm `head()` próprios com title/description.
- `sitemap.xml` dinâmico inclui imóveis publicados via Supabase.
- `robots.txt` bloqueia `/admin`, `/auth`, `/api/` e referencia o sitemap.
- JSON-LD `RealEstateAgent` já presente na home (verificado em turnos anteriores).

## 2. Lacunas a corrigir

1. **Canonical ausente** em `/` (existe), `/buscar`, `/imovel/:code`, `/privacidade` — só `/anuncie` e `/` têm. Sem canonical leaf, Google pode escolher URL errada quando há parâmetros (`/buscar?bairro=…`).
2. **`og:url` por rota** ausente em vários leaves.
3. **`/imovel/:code` sem JSON-LD** `Product` + `RealEstateListing` (preço, imagens, localização, agent). Hoje é o tipo de página com maior potencial de rich result.
4. **`/buscar` indexa variações com query string** — risco de conteúdo duplicado. Precisa canonical fixo + `noindex` quando há filtros.
5. **Sitemap não inclui `/privacidade`** e não emite `<image:image>` por imóvel (perde Google Images).
6. **Sem BreadcrumbList JSON-LD** nos imóveis (`Início > Buscar > Bairro > Título`).
7. **Sem `FAQPage` em `/anuncie`** (queries informacionais "como vender imóvel alto padrão Florianópolis").
8. **Hierarquia H1/H2 ok**, mas o cartão CTA da home usa `h1` duplicado em alguns componentes ChromaGrid; padronizar 1 H1 por página.
9. **Sem páginas programáticas por bairro** — perde long-tail ("apartamento Jurerê Internacional", "cobertura Beira Mar Norte").
10. **Sem `hreflang pt-BR`** explícito e sem `<link rel="alternate">` para o domínio canônico.
11. **`robots.txt` permite crawl de `/buscar?…`** — adicionar `Disallow: /buscar?` e `Disallow: /*?utm_*`.
12. **Imagens sem `alt` descritivo** em alguns componentes; LCP do hero pode usar `fetchpriority="high"`.

## 3. Entregáveis (implementação)

### 3.1 Meta tags por rota
- Adicionar `<link rel="canonical">` + `og:url` self-referencing em `/buscar`, `/imovel/:code`, `/privacidade`.
- Em `/buscar`, quando houver search params, emitir `<meta name="robots" content="noindex,follow">` e canonical apontando para `/buscar` limpo.
- Em `/imovel/:code`: `og:type=product`, `product:price:amount`, `product:price:currency=BRL`, `og:image` = `cover_image`.
- Padronizar título com fórmula: `{Título} — {Bairro}, Florianópolis | Michele dos Imóveis`.
- Description automática: `{quartos} quartos · {area}m² · R$ {price} — {bairro}, Florianópolis. Atendimento Michele Prietsch.`

### 3.2 Estrutura de headers
- Garantir 1 `<h1>` por página (hero).
- Cards e seções como `<h2>`/`<h3>`. Auditar `ChromaGridProperties` para usar `<h3>` (não `<h1>`).
- Adicionar `<nav aria-label="Breadcrumb">` visível nos imóveis e em `/buscar`.

### 3.3 Dados estruturados (JSON-LD)
- **Sitewide** (`__root.tsx`): `RealEstateAgent` + `WebSite` com `SearchAction` (sitelinks searchbox).
- **`/imovel/:code`**: combinar `Product` + `Residence`/`Apartment` com `offers`, `geo`, `image[]`, `numberOfRooms`, `floorSize`.
- **`/imovel/:code`**: `BreadcrumbList`.
- **`/anuncie`**: `FAQPage` (4–6 perguntas reais sobre venda de alto padrão).
- **`/buscar`**: `CollectionPage` + `ItemList` dos resultados.

### 3.4 Sitemap & robots
- Incluir `/privacidade` (priority 0.3, changefreq yearly).
- Adicionar namespace `xmlns:image` no sitemap e `<image:image><image:loc>` para `cover_image` de cada imóvel.
- Dividir em índice quando passar de 200 URLs (`sitemap-index.xml` → `sitemap-pages.xml`, `sitemap-imoveis.xml`).
- `robots.txt`:
  ```
  Disallow: /buscar?
  Disallow: /*?utm_*
  Disallow: /*?fbclid=
  ```

### 3.5 Performance para Core Web Vitals (sinal de ranking)
- Hero `<img fetchpriority="high" decoding="async">` (já existe preload — confirmar).
- `loading="lazy"` em todas imagens abaixo da fold (já aplicado nos cards; revisar Dome/About).
- `width`/`height` explícitos em toda `<img>` para evitar CLS.
- Preconnect a `fonts.googleapis.com`, `fonts.gstatic.com`, R2 do Supabase de imagens.

### 3.6 SEO programático por bairro (long-tail)
- Criar rota dinâmica `/imoveis/$bairro` com slug (jurere-internacional, beira-mar-norte, lagoa-da-conceicao, campeche, praia-brava, cacupe, centro, …) listando imóveis filtrados.
- Cada página: H1 "Imóveis de alto padrão em {Bairro} — Florianópolis", copy específica (300+ palavras), lista de imóveis, FAQ por bairro, JSON-LD `Place` + `ItemList`.
- Linkar internamente a partir da grade "Regiões de atuação" e do footer.
- Incluir todas no sitemap.

### 3.7 Indexação e monitoramento
- Validar `https://micheledosimoveis.lovable.app` no Google Search Console via meta-tag (fluxo do conector).
- Submeter `sitemap.xml`.
- Solicitar inspeção URL das páginas-chave após deploy.

## 4. Ordem de execução sugerida

1. Correções de canonical/og:url/headers em todas rotas existentes (rápido, alto impacto).
2. JSON-LD `Product`+`BreadcrumbList` em `/imovel/:code` + sitemap com `image:image`.
3. `noindex` condicional em `/buscar` com filtros, robots.txt atualizado.
4. `FAQPage` em `/anuncie` e `WebSite/SearchAction` no root.
5. Rotas programáticas por bairro (`/imoveis/$slug`) + sitemap atualizado.
6. Verificação no Search Console e pedido de indexação.

## 5. Detalhes técnicos

Stack: TanStack Start, `head()` por rota em `createFileRoute`, server route `sitemap[.]xml.ts`. JSON-LD vai em `head().scripts` com `type: "application/ld+json"`. Canonical via `links` apenas em leaves (root concatena). `noindex` condicional usa `loaderDeps` com search params + `head({ search })`.

Quer que eu execute as etapas 1–4 agora (alto impacto, sem mudança visual) e deixe a etapa 5 (páginas por bairro) para um próximo turno?
