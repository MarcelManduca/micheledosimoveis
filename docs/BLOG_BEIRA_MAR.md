# Passagem e Relatório Técnico — Blog Beira-Mar Norte & Acervo Permanente

## 1. Visão Geral e Contexto

Manduca solicitou o artigo no site da Michele com fotos e o Reel do Instagram sobre o La Perle. Na **Etapa 1**, Codex e Antigravity estruturaram o índice do blog, o artigo inicial com 8 condomínios, galerias acessíveis, SEO, sitemap e componentes de mídia.

Na **Etapa 2**, foi autorizada e implementada a entrega do **Aprofundamento de Conteúdo por Condomínio** (Entrega A) e a **Arquitetura de Preservação Editorial de Acervo** (Entrega B), permitindo que unidades do acervo permaneçam acessíveis no endereço original `/imovel/CODIGO` mesmo após saírem de venda comercial, com aviso de indisponibilidade, supressão de preço comercial e CTA contextual para outras unidades do mesmo condomínio.

---

## 2. Entrega A — Conteúdo Aprofundado por Condomínio

O artigo em `/blog/condominios-luxo-beira-mar-norte-agronomica` foi enriquecido com análise individualizada dos 8 condomínios:

1. **La Perle Beira Mar**:
   - Localização: Av. Governador Irineu Bornhausen, 3600, Agronômica.
   - Arquitetura: Ícone clássico-contemporâneo de alto luxo com recuo frontal e living panorâmico para a Baía Norte.
   - Tipologias: ~316 m² privativos (até 471 m² totais), 3 a 4 suítes, 4 vagas de garagem.
   - Lazer: Piscinas adulto/infantil, piscina térmica/spa coberto, sauna, fitness center, salão de festas e jogos.
   - Links: Imóvel do acervo preservado `/imovel/34547`, integração de Reel e CTA WhatsApp.

2. **João Eduardo Moritz Residence**:
   - Construtora: Lumis Construtora.
   - Localização: Av. Jornalista Rubens de Arruda Ramos, 2354, Beira-Mar Norte.
   - Arquitetura: Fachada executada com esquadrias de alta performance desenvolvidas pela Lohn Esquadrias. Exclusividade de um apartamento por andar com hall privativo e isolamento termoacústico.
   - Tipologias: 4 suítes (~280 m² a 350 m² privativos).

3. **Acqua**:
   - Construtora / Incorporadora: CFL Imóveis.
   - Localização: Praça Gov. Celso Ramos / Rua Frei Caneca, 17, Agronômica.
   - Arquitetura: Conceito contemporâneo CFL integrando a tranquilidade da praça com a orla.
   - Tipologias: 3 e 4 suítes (~221 m² a 353 m² privativos).
   - Links: Página permanente `/condominio/condominio-acqua-agronomica-florianopolis` e imóvel do acervo `/imovel/31776`.

4. **Opera House (Simphonia WOA Beiramar)**:
   - Construtora: WOA Empreendimentos Imobiliários.
   - Arquitetura: Fachada ventilada Fundermax para conforto térmico e durabilidade contra maresia.
   - Tipologias: 4 suítes (~250 m² a 380 m² privativos) com living envidraçado de piso a teto.
   - Lazer: Piscina térmica, piscina externa, fitness, lounge gourmet privativo da torre.

5. **Sonata Place (Simphonia WOA Beiramar)**:
   - Construtora: WOA Empreendimentos Imobiliários.
   - Localização: Rua Comandante Constantino Nicolau Spyrides, 4152, Agronômica.
   - Tipologias: 3 suítes (~131 m² a 175 m² privativos, 2 a 3 vagas).
   - Links: Página permanente `/condominio/condominio-sonata-place-agronomica-florianopolis` e imóvel do acervo `/imovel/30870`.

6. **Jazz Club (Simphonia WOA Beiramar)**:
   - Construtora: WOA Empreendimentos Imobiliários.
   - Localização: Boulevard / Servidão Paulo Zimmer, 101, Agronômica.
   - Tipologias: 2 a 3 suítes (~99 m² a 135 m² privativos, 2 vagas).
   - Links: Página permanente `/condominio/condominio-jazz-club-agronomica-florianopolis` e imóvel do acervo `/imovel/22461`.

7. **Soprano Hall (Simphonia WOA Beiramar)**:
   - Construtora: WOA Empreendimentos Imobiliários.
   - Localização: Boulevard / Servidão Paulo Zimmer, 55, Agronômica.
   - Tipologias: 3 a 4 suítes (~168 m² a 237 m² privativos, 3 a 4 vagas).
   - Links: Página permanente `/condominio/condominio-soprano-hall-agronomica-florianopolis` e imóvel do acervo `/imovel/44022`.

8. **Villa Celimontana**:
   - Construtora: Construtora Fontana (pronto para morar em dez/2023).
   - Localização: Travessa Felipe Godinho e Silva, 30, Agronômica.
   - Arquitetura: Conceito Home Club com lazer completo e sustentabilidade.
   - Tipologias: 2 e 3 dormitórios (1 ou 2 suítes, ~79 m² a 134 m² privativos).
   - Links: Página permanente `/condominio/residencial-villa-celimontana-agronomica-florianopolis` e imóvel do acervo `/imovel/43575`.

---

## 3. Entrega B — Decisão e Implementação Arquitetônica de Acervo Permanente

### Decisão de Modelo
Para evitar abrir indiscriminadamente a tabela `properties` pública com `published = false` (o que violaria o RLS e poderia expor rascunhos, dados de proprietários ou URLs de origem de centenas de imóveis):
1. Foi criada a tabela dedicada `public.editorial_preserved_properties` na migração `20260913000000_editorial_preserved_properties.sql`.
2. Criada a camada de runtime `src/lib/editorial-preserved.ts` contendo o catálogo canônico das 6 unidades iniciais.
3. No loader de `src/lib/properties.functions.ts` (`getPropertyByCode`):
   - Primeiro consulta `properties` com `published = true`.
   - Se não encontrado como ativo comercialmente, consulta o catálogo de preservação editorial (`is_preserved = true`).
   - Retorna flag explícita `isArchived: true`, com `price_brl: null` (garantindo que preços antigos nunca sejam renderizados).
4. No componente `src/routes/imovel.$code.tsx`:
   - Exibe banner de aviso em destaque: *"Esta unidade não está disponível para venda no momento. Registro preservado do acervo editorial de Michele dos Imóveis."*
   - Suprime o preço no topo, sidebar, metadados OpenGraph e schema JSON-LD (o schema `Offer` com preço é completamente omitido).
   - Botões de CTA alterados de *"Agendar visita"* para *"Consultar outras unidades no condomínio"*.
   - Renderiza grade de unidades alternativas disponíveis no mesmo condomínio via `getAlternativePropertiesForCondominium`.
   - Exclusão garantida de feeds XML, buscas comerciais e destaques da home.

---

## 4. Validação e Qualidade Técnica

- `npm run build`: Compilação Nitro e TanStack Router concluída com sucesso.
- `npx tsc --noEmit`: 0 erros de tipos.
- Validação SSR local via HTTP:
  - Artigo `/blog/condominios-luxo-beira-mar-norte-agronomica`: 200 OK.
  - Índice `/blog`: 200 OK.
  - Imóveis do acervo (ex: `/imovel/34547`, `/imovel/31776`): 200 OK com layout e metadados de acervo.
- Todas as diretrizes de `AGENTS.md` rigorosamente respeitadas (sem force-push, sem alteração de arquivos de infraestrutura de produto).
