# Passagem e Relatório Técnico — Blog Beira-Mar Norte & Acervo Permanente

## 1. Visão Geral e Contexto

Manduca solicitou o artigo no site da Michele com fotos e o vídeo Short do La Perle. Na **Etapa 1**, Codex e Antigravity estruturaram o índice do blog, o artigo inicial com 8 condomínios, galerias acessíveis, SEO, sitemap e componentes de mídia.

Na **Etapa 2**, foi autorizada e implementada a entrega do **Aprofundamento de Conteúdo por Condomínio** (Entrega A) e a **Arquitetura de Preservação Editorial de Acervo** (Entrega B), permitindo que unidades do acervo permaneçam acessíveis no endereço original `/imovel/CODIGO` mesmo após saírem de venda comercial, com aviso de indisponibilidade, supressão de preço comercial e CTA contextual para outras unidades do mesmo condomínio.

---

## 2. Entrega A — Conteúdo Aprofundado e Fontes por Condomínio

O artigo em `/blog/condominios-luxo-beira-mar-norte-agronomica` foi enriquecido com análise individualizada dos 8 condomínios. Todas as informações derivam de fontes primárias das construtoras, fabricantes técnicos e do catálogo documental de Michele dos Imóveis:

1. **La Perle Beira Mar**:
   - Localização: Av. Governador Irineu Bornhausen, 3600, Agronômica.
   - Arquitetura: Ícone clássico-contemporâneo de alto padrão com recuo frontal e living panorâmico para a Baía Norte.
   - Tipologias: ~316 m² privativos (até 471 m² totais), 3 a 4 suítes, 4 vagas de garagem (conforme unidades verificadas no acervo do catálogo).
   - Lazer: Piscinas adulto/infantil, piscina térmica/spa coberto, sauna, fitness center, salão de festas e jogos.
   - Links: Imóvel do acervo `/imovel/34547`, integração de vídeo YouTube Short (`IHZm4uwTuds`) e CTA WhatsApp.
   - Fontes: Convenção de condomínio, registro de incorporação e catálogo verificado.

2. **João Eduardo Moritz Residence**:
   - Construtora: Lumis Construtora.
   - Localização: Av. Jornalista Rubens de Arruda Ramos, 2354, Beira-Mar Norte.
   - Arquitetura: Fachada executada com esquadrias de alta performance desenvolvidas pela Lohn Esquadrias. Exclusividade de um apartamento por andar com hall privativo e isolamento termoacústico.
   - Tipologias: 4 suítes (~280 m² a 350 m² privativos).
   - Fontes: Lumis Construtora e memorial descritivo da Lohn Esquadrias.

3. **Acqua**:
   - Construtora / Incorporadora: CFL Imóveis.
   - Localização: Praça Gov. Celso Ramos / Rua Frei Caneca, 17, Agronômica.
   - Arquitetura: Conceito contemporâneo CFL integrando a tranquilidade da praça com a orla.
   - Tipologias: 3 e 4 suítes (~221 m² a 353 m² privativos).
   - Links: Página permanente `/condominio/condominio-acqua-agronomica-florianopolis` e imóvel do acervo `/imovel/31776`.
   - Fontes: Memorial de vendas CFL e catálogo verificado.

4. **Opera House (Simphonia WOA Beiramar)**:
   - Construtora: WOA Empreendimentos Imobiliários.
   - Arquitetura: Fachada ventilada Fundermax para conforto térmico e maior durabilidade em ambiente litorâneo.
   - Tipologias: 4 suítes (~250 m² a 380 m² privativos) com living envidraçado de piso a teto.
   - Lazer: Piscina térmica, piscina externa, fitness, lounge gourmet privativo da torre.
   - Fontes: WOA Empreendimentos e Fundermax Architectural Panels.

5. **Sonata Place (Simphonia WOA Beiramar)**:
   - Construtora: WOA Empreendimentos Imobiliários.
   - Localização: Rua Comandante Constantino Nicolau Spyrides, 4152, Agronômica.
   - Tipologias: 3 suítes (~131 m² a 175 m² privativos, 2 a 3 vagas).
   - Links: Página permanente `/condominio/condominio-sonata-place-agronomica-florianopolis` e imóvel do acervo `/imovel/30870`.
   - Fontes: WOA Empreendimentos.

6. **Jazz Club (Simphonia WOA Beiramar)**:
   - Construtora: WOA Empreendimentos Imobiliários.
   - Localização: Boulevard / Servidão Paulo Zimmer, 101, Agronômica.
   - Tipologias: 2 a 3 suítes (~99 m² a 135 m² privativos, 2 vagas).
   - Links: Página permanente `/condominio/condominio-jazz-club-agronomica-florianopolis` e imóvel do acervo `/imovel/22461`.
   - Fontes: WOA Empreendimentos.

7. **Soprano Hall (Simphonia WOA Beiramar)**:
   - Construtora: WOA Empreendimentos Imobiliários.
   - Localização: Boulevard / Servidão Paulo Zimmer, 55, Agronômica.
   - Tipologias: 3 a 4 suítes (~168 m² a 237 m² privativos, 3 a 4 vagas).
   - Links: Página permanente `/condominio/condominio-soprano-hall-agronomica-florianopolis` e imóvel do acervo `/imovel/44022`.
   - Fontes: WOA Empreendimentos.

8. **Villa Celimontana**:
   - Construtora: Construtora Fontana (comunicado de pronto para morar em dez/2023).
   - Localização: Travessa Felipe Godinho e Silva, 30 (esq. Rua Sidnei Nocetti), Agronômica.
   - Arquitetura: Conceito Home Club com lazer completo e sustentabilidade.
   - Tipologias: 2 e 3 dormitórios (1 ou 2 suítes, ~79 m² a 134 m² privativos).
   - Links: Página permanente `/condominio/residencial-villa-celimontana-agronomica-florianopolis` e imóvel do acervo `/imovel/43575`.
   - Fontes: Construtora Fontana e materiais institucionais do empreendimento.

---

## 3. Entrega B — Arquitetura de Preservação Editorial de Acervo

### Decisão de Modelo e RLS Persistente
Para evitar abrir indiscriminadamente a tabela `properties` pública com `published = false` (o que violaria o RLS e poderia expor rascunhos, dados de proprietários ou URLs de origem):
1. **Tabela Dedicada no Supabase:** `public.editorial_preserved_properties` criada na migração `20260913000000_editorial_preserved_properties.sql`.
2. **Política RLS Autorizada:** `USING (is_preserved = true AND is_admin_blocked = false)`.
3. **Resolução Persistente Autorizada (`resolveEditorialPreservedSnapshot`):**
   - O banco de dados é a fonte de verdade persistente.
   - Se o registro estiver marcado como `is_preserved = false` ou `is_admin_blocked = true`, o PostgreSQL via RLS retorna `data = null`.
   - O resolvedor identifica que a consulta ao banco ocorreu com sucesso e retorna `null` (HTTP 404), **JAMAIS recorrendo ao catálogo semente para ressuscitar uma unidade revogada**.
   - O catálogo semente estático (`EDITORIAL_PRESERVED_CATALOG`) opera exclusivamente durante a fase transitória de pré-migração (erro `42P01 - relation does not exist`) ou como semente de carga.

---

## 4. Procedimento de Retirada de Mídia Controlada pelo Site

Caso um proprietário ou a administração solicite a retirada de fotos ou referências de uma unidade:
1. **No Banco de Dados / Runtime:**
   - Atualizar `is_admin_blocked = true` (ou `is_preserved = false`) no registro em `editorial_preserved_properties`.
   - Isso bloqueia imediatamente `getPropertyByCode` (404), ferramentas MCP, buscas e `sitemap.xml`.
2. **Nos Arquivos Estáticos Controlados:**
   - Remover ou substituir o arquivo de imagem correspondente em `/public/blog/beira-mar-norte/`.
   - Remover referências em `CONDOMINIUM_MEDIA` em `src/lib/blog/beira-mar-media.ts`.
3. **Nos Caches e Servidores:**
   - Realizar o purge de cache no painel da Hostinger / Cloudflare CDN para a URL estática.
   - *Nota de conformidade:* A retirada no site extingue a entrega pelo domínio oficial, mas não tem poder retroativo sobre cópias já armazenadas em caches de terceiros (ex: Google Imagens ou scrapers externos).
