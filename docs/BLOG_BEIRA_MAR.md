# Passagem para Antigravity — blog Beira-Mar Norte

## Objetivo e divisão de trabalho

Manduca solicitou o artigo no site da Michele com fotos e o Reel do Instagram sobre o La Perle. Depois orientou usar Antigravity nas atividades mais adequadas ao ambiente local, evitando trabalho duplicado entre IAs.

Codex preparou conteúdo, rotas, galerias, SEO e verificações iniciais. Antigravity deve concluir a integração do Reel, QA visual e entrega no fluxo existente. Não há conexão direta entre os dois ambientes nesta sessão; este arquivo é a passagem explícita. Não afirmar que o Antigravity foi executado automaticamente.

## Implementado

- `/blog`: índice editorial.
- `/blog/condominios-luxo-beira-mar-norte-agronomica`: oito condomínios, sumário com âncoras, seis blocos fotográficos (sete fotos), comparação, FAQ e WhatsApp contextualizado.
- Galeria com controles acessíveis para as duas fotos do La Perle.
- Componente InstagramReel com validação de permalink HTTPS, host exato e caminho /reel/; carregamento somente por clique e link de fallback.
- SEO: título, descrição, canonical, Open Graph, BlogPosting, BreadcrumbList e FAQPage coerente com o texto visível. Nenhuma promessa de rich result.
- Link no rodapé e URLs no sitemap.
- Sete imagens WebP hospedadas no próprio projeto, menos de 1 MB no total. Hero e retrato já existentes no acervo.

## Fonte das fotos

Extraídas do feed público do próprio site `https://micheledosimoveis.com.br/vrsync.xml`, com associação exata pelo campo Complement do condomínio. Não usar buscas por proximidade no texto para atribuir imagens: o catálogo também menciona condomínios vizinhos em anúncios de outros imóveis.

| Condomínio | Código | IDs originais de imagem |
|---|---|---|
| La Perle | 34547 | 76259817, 76259822 |
| Acqua | 31776 | 76290817 |
| Sonata Place | 30870 | 76298292 |
| Jazz Club | 22461 | 76437835 |
| Soprano Hall | 44022 | 76523057 |
| Villa Celimontana | 43575 | 76509248 |

As fotos retratam imóveis do acervo; não há promessa estática de disponibilidade. Nenhuma foto foi inventada. Duas imagens inicialmente candidatas do La Perle foram descartadas por apresentarem marca de terceiro. A seleção final foi inspecionada em prancha visual. Conferir visualmente em resolução completa antes de publicar.

João Eduardo Moritz e Opera House ficaram sem fotos específicas: não preencher com imagens de outros prédios. É possível acrescentar material próprio identificado ou fotos oficiais autorizadas.

## Pendência do Reel

O perfil é @micheledosimoveis, confirmado no site e em site-config.ts. As buscas públicas não localizaram o permalink específico do La Perle. Manduca precisa fornecer o link ou o vídeo original.

1. Confirmar que o vídeo mostra o La Perle e pertence ao perfil da Michele.
2. Inserir o permalink real em `LA_PERLE_REEL_URL` no arquivo `src/lib/blog/beira-mar-media.ts`.
3. Testar incorporação em desktop e mobile. O componente fica oculto enquanto a URL for null. Não usar um Reel de outra corretora, nem publicar um placeholder que prometa vídeo funcional.
4. Se o Instagram bloquear o embed, manter o link direto de fallback. Se houver arquivo original fornecido, preferir vídeo local/armazenamento autorizado com poster e controles; não raspar o vídeo privado.
5. Só adicionar VideoObject com nome, miniatura, datas e URLs reais verificadas. Sem transcrição fictícia.

## Conteúdo e regras do usuário

- Não inserir links, citações, referências ou créditos para imobiliárias concorrentes. A página usa imagens locais e links de navegação internos, WhatsApp da Michele e, quando configurado, seu Instagram.
- Não classificar como ranking de valorização ou melhores condomínios. Não generalizar vista, área ou equipamentos de uma unidade para todo o prédio.
- Não atribuir construtora ou ano de entrega ao La Perle sem confirmação.
- Acqua: há duas referências de localização: institucional CFL cita Praça Gov. Celso Ramos; catálogo identifica Rua Frei Caneca. O texto distingue as referências e solicita confirmação do acesso na visita.
- Os quatro condomínios WOA pertencem ao Simphonia; equipamentos e plantas não foram equiparados entre eles.
- Fontana confirma Villa Celimontana pronto para morar em dezembro de 2023. Não inferir que esta foi a data exata do habite-se.
- Não atribuir revisão pessoal à Michele sem revisão real.

Fontes técnicas da apuração: case João Eduardo Moritz em lohnesquadrias.com.br/cases/residencial-joao-eduardo-moritz/; Simphonia em fundermax.us/projects/simphonia-woa-beiramar/; institucional cfl.com.br; publicação Fontana blog.estilofontana.com.br/villa-celimontana-residencial-perfeicao-em-florianopolis/ e ficha de plantas oficial. Estas notas administrativas não são renderizadas na página.

## Validação realizada e limitações

- `npm run build`: passou.
- Respostas HTTP locais: /blog e artigo 200; uma única H1, canonical e JSON-LD presentes no HTML SSR. Foto Acqua servida localmente com 200.
- `npx tsc --noEmit`: erros em arquivos preexistentes relativos a `error: unknown` nas rotas gerais. Nenhum erro apontado nos novos arquivos do blog. Não houve correção fora de escopo.
- Instalação padrão `npm ci` falhou por incompatibilidade existente de peer de zod e versão de @lovable.dev/vite-tanstack-config divergente entre manifest e lockfile. A instalação local para validação usou `npm install --legacy-peer-deps --ignore-scripts --no-package-lock --no-audit --no-fund`, sem editar manifest ou lockfile. Isso não substitui a validação do pipeline de produção.
- routeTree.gen.ts foi regenerado pelo build, não editado manualmente; o gerador atual também reordenou entradas. Comparar especialmente rotas especiais antes de integrar.

## Próximos passos para Antigravity

1. Ler AGENTS.md e trazer a branch sem sobrescrever mudanças locais ou reescrever histórico.
2. Revisar diff, validar rotas especiais e iniciar preview no ambiente local. Fazer QA em 375px e 1440px, âncoras, controles da galeria, navegação, imagens e CTAs.
3. Configurar e testar o Reel após receber o link.
4. Conferir conteúdo com Michele e fotos em resolução completa; acrescentar fotos próprias dos dois edifícios sem mídia se disponíveis.
5. Revisar SEO no HTML SSR e sitemap. Inserir datas reais apenas no momento apropriado; não gerar data de publicação fictícia.
6. Não modificar infraestrutura/dependências dentro desta tarefa. Resolver bloqueios de pipeline em tarefa separada conforme AGENTS.md.
7. Apresentar preview concreto antes de solicitar aprovação de publicação. Depois de autorizada a publicação, usar o fluxo de deploy já existente, conferir produção com Chrome DevTools MCP e erros 4xx/5xx conforme AGENTS.md.

## Estado de entrega

Branch de implementação; sem merge e sem deploy. O artigo não foi publicado em produção. Reel pendente de permalink e QA visual de navegador pendente.
