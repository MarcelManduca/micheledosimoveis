import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, MessageCircle } from "lucide-react";
import { SiteFooter } from "@/components/home/SiteFooter";
import { ArticleGallery } from "@/components/blog/ArticleGallery";
import { InstagramReel } from "@/components/blog/InstagramReel";
import { ARTICLE_PATH, CONDOMINIUM_MEDIA, LA_PERLE_REEL_URL } from "@/lib/blog/beira-mar-media";
import { SITE, buildWhatsAppUrl } from "@/lib/site-config";
import hero from "@/assets/hero-beiramar-1280.webp";
import heroSmall from "@/assets/hero-beiramar-720.webp";
import portrait from "@/assets/michele-portrait-800.webp";

const TITLE = "Condomínios de luxo na Beira-Mar Norte e Agronômica";
const DESCRIPTION =
  "Conheça La Perle, Acqua, Simphonia WOA, João Eduardo Moritz e Villa Celimontana. Fotos e critérios para escolher seu apartamento em Florianópolis.";
const CANONICAL = new URL(ARTICLE_PATH, SITE.publishedUrl).href;
const FAQ = [
  {
    q: "Quais condomínios conhecer na Beira-Mar Norte e Agronômica?",
    a: "Esta seleção apresenta La Perle Beira Mar, João Eduardo Moritz Residence, Acqua, Villa Celimontana e os quatro condomínios do Simphonia WOA Beiramar: Opera House, Sonata Place, Jazz Club e Soprano Hall. São propostas diferentes de localização, arquitetura e moradia, sem ordem de classificação.",
  },
  {
    q: "Quais condomínios fazem parte do Simphonia WOA Beiramar?",
    a: "Opera House, Sonata Place, Jazz Club e Soprano Hall. Identifique o condomínio e a posição da unidade ao comparar apartamentos; não presuma que plantas, vista e instalações sejam iguais nos quatro edifícios.",
  },
  {
    q: "Qual empreendimento da CFL está nesta seleção?",
    a: "O Acqua, na região da Praça Governador Celso Ramos, na Agronômica. O acervo do site identifica unidades com endereço na Rua Frei Caneca; confira o acesso específico ao agendar sua visita.",
  },
  {
    q: "O Villa Celimontana fica na Avenida Beira-Mar Norte?",
    a: "Não. A Fontana informa o endereço na Travessa Felipe Godinho e Silva, esquina com a Rua Sidnei Nocetti, na Agronômica. É um condomínio no bairro, próximo da região da orla.",
  },
  {
    q: "Todo apartamento na região tem vista para o mar?",
    a: "Não. A vista precisa ser conferida em cada unidade, considerando andar, orientação, posição no edifício e construções no entorno. Estar perto da orla não significa estar de frente para o mar.",
  },
];
const SECTIONS = [
  {
    id: "la-perle",
    name: "La Perle Beira Mar",
    brand: "Beira-Mar Norte · Agronômica",
    text: "O La Perle ocupa um endereço na Avenida Governador Irineu Bornhausen. No acervo da Michele, há unidades com 316 m² privativos: uma referência concreta para quem procura ambientes amplos e uma relação próxima com a paisagem da baía. Essa metragem descreve os imóveis consultados, não todas as tipologias do edifício.",
    detail:
      "Na visita, compare a distribuição das áreas sociais, a posição dos dormitórios e as reformas realizadas. Uma fotografia apresenta a experiência de uma unidade; conservação, equipamentos e acabamentos precisam ser verificados no apartamento que você pretende comprar.",
  },
  {
    id: "joao-eduardo-moritz",
    name: "João Eduardo Moritz Residence",
    brand: "Lumis · Beira-Mar Norte",
    text: "O João Eduardo Moritz Residence é um empreendimento da Lumis na Beira-Mar Norte. A fachada e a proposta arquitetônica estão registradas no portfólio da Lohn Esquadrias, participante do projeto. É um nome a conhecer para quem inclui arquitetura e integração visual com o entorno nos critérios de escolha.",
    detail:
      "Observe como as aberturas se relacionam com a paisagem e como a planta organiza os ambientes. Em imóveis já construídos, a visita permite avaliar conservação, iluminação e conforto dos espaços que serão usados no dia a dia.",
  },
  {
    id: "acqua",
    name: "Acqua",
    brand: "CFL · Agronômica",
    text: "O Acqua representa a CFL neste roteiro. A incorporadora o situa na região da Praça Governador Celso Ramos, na Agronômica. No catálogo da Michele, o endereço de uma das unidades aparece na Rua Frei Caneca: duas referências úteis para compreender o entorno e confirmar o acesso durante a visita.",
    detail:
      "Avalie a orientação do apartamento em relação à praça e à orla, a posição dos dormitórios e a integração dos ambientes. Vale percorrer também as ruas próximas, observando os trajetos que fariam parte da sua rotina.",
  },
  {
    id: "opera-house",
    name: "Opera House",
    brand: "WOA · Simphonia WOA Beiramar",
    text: "O Opera House integra o conjunto Simphonia WOA Beiramar. Sua identidade deve ser considerada individualmente ao procurar imóveis: o nome do complexo ajuda a localizar o empreendimento, mas a escolha depende do condomínio e da unidade.",
    detail:
      "Confirme a posição do apartamento no conjunto, a orientação das áreas sociais e as instalações de uso dos moradores. Não transfira automaticamente para o Opera House características anunciadas para outro condomínio do Simphonia.",
  },
  {
    id: "sonata-place",
    name: "Sonata Place",
    brand: "WOA · Simphonia WOA Beiramar",
    text: "O Sonata Place é outro dos quatro condomínios do Simphonia. No acervo do site, há imóveis identificados com endereço na Rua Comandante Constantino Nicolau Spyrides. A referência ajuda a diferenciar o acesso do edifício dentro da região da Beira-Mar Norte.",
    detail:
      "Para comparar as opções, observe a área privativa, a configuração dos dormitórios, a circulação e as vagas vinculadas ao apartamento. Confira a vista em cada ambiente, sem se limitar à imagem principal do anúncio.",
  },
  {
    id: "jazz-club",
    name: "Jazz Club",
    brand: "WOA · Simphonia WOA Beiramar",
    text: "O Jazz Club faz parte do Simphonia WOA Beiramar e aparece no catálogo da Michele com referência ao Boulevard Paulo Zimmer. O conjunto é documentado pela Fundermax, fornecedora de materiais aplicados nas fachadas dos quatro edifícios.",
    detail:
      "Ao visitar uma unidade, compare os espaços privativos e as áreas comuns efetivamente disponíveis nesse condomínio. Tamanho da sacada, integração dos ambientes e posição no edifício são pontos que podem mudar a experiência de morar.",
  },
  {
    id: "soprano-hall",
    name: "Soprano Hall",
    brand: "WOA · Simphonia WOA Beiramar",
    text: "O Soprano Hall completa os quatro nomes do Simphonia. As unidades identificadas no site também fazem referência ao Boulevard Paulo Zimmer, na Agronômica. Conhecer os acessos ajuda a entender a implantação do conjunto para além das fotografias da orla.",
    detail:
      "Privacidade, orientação e funcionalidade devem guiar a comparação. Durante a visita, observe a distância entre edifícios, as aberturas dos ambientes e o percurso entre garagem, elevador e apartamento.",
  },
  {
    id: "villa-celimontana",
    name: "Villa Celimontana",
    brand: "Fontana · Agronômica",
    text: "O Villa Celimontana fica na Travessa Felipe Godinho e Silva, esquina com a Rua Sidnei Nocetti. A Fontana anunciou o residencial como pronto para morar em dezembro de 2023. Seu endereço é uma alternativa dentro da Agronômica, distinta dos edifícios diretamente na avenida.",
    detail:
      "A ficha oficial apresenta apartamentos de dois ou três dormitórios e estrutura com piscinas, academia e espaços de convivência e lazer infantil. É uma proposta para incluir na busca quando as atividades dentro do condomínio têm peso na decisão da família.",
  },
] as const;

export const Route = createFileRoute("/blog/condominios-luxo-beira-mar-norte-agronomica")({
  head: () => ({
    meta: [
      { title: `${TITLE} | Michele dos Imóveis` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: CANONICAL },
      { property: "og:locale", content: "pt_BR" },
      {
        property: "og:image",
        content: new URL("/michele-dos-imoveis-og.png", SITE.publishedUrl).href,
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              "@id": `${CANONICAL}#article`,
              headline: TITLE,
              description: DESCRIPTION,
              inLanguage: "pt-BR",
              mainEntityOfPage: CANONICAL,
              publisher: { "@type": "Organization", name: SITE.brandName, url: SITE.publishedUrl },
              image: new URL("/blog/beira-mar-norte/la-perle.webp", SITE.publishedUrl).href,
              about: SECTIONS.map((s) => ({ "@type": "Thing", name: s.name })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Início", item: SITE.publishedUrl },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Blog",
                  item: new URL("/blog", SITE.publishedUrl).href,
                },
                { "@type": "ListItem", position: 3, name: TITLE, item: CANONICAL },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQ.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }),
      },
    ],
  }),
  component: BeiraMarArticle,
});

function BeiraMarArticle() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-10">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" /> Blog
          </Link>
          <Link to="/" className="font-display text-lg">
            Michele dos Imóveis
          </Link>
        </div>
      </header>
      <main>
        <section className="relative isolate overflow-hidden bg-foreground text-background">
          <img
            src={hero}
            srcSet={`${heroSmall} 720w, ${hero} 1280w`}
            sizes="100vw"
            alt="Paisagem da Beira-Mar Norte em Florianópolis"
            width="1280"
            height="853"
            fetchPriority="high"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
          <div className="mx-auto max-w-7xl px-5 pb-16 pt-24 sm:px-10 sm:pb-24 sm:pt-36">
            <p className="text-xs uppercase tracking-[0.24em] text-white/85">
              Florianópolis · Arquitetura & endereços
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-4xl leading-[1.08] tracking-tight sm:text-6xl">
              {TITLE}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              Uma seleção de edifícios já construídos, diferentes formas de morar e o que observar
              antes de escolher seu apartamento.
            </p>
            <p className="mt-8 text-sm text-white/75">Michele dos Imóveis · Guia de condomínios</p>
          </div>
        </section>
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 sm:px-10 lg:grid-cols-[230px_minmax(0,1fr)] lg:py-20">
          <aside>
            <nav aria-label="Neste artigo" className="lg:sticky lg:top-8">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Neste artigo
              </p>
              <ol className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
                {SECTIONS.map((s, i) => (
                  <li key={s.id}>
                    <a className="inline-flex gap-3 hover:underline" href={`#${s.id}`}>
                      <span className="text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.name}
                    </a>
                  </li>
                ))}
              </ol>
              <a href="#comparar" className="mt-5 block text-sm underline underline-offset-4">
                O que comparar
              </a>
              <a href="#perguntas" className="mt-3 block text-sm underline underline-offset-4">
                Perguntas frequentes
              </a>
            </nav>
          </aside>
          <article className="min-w-0 max-w-3xl leading-relaxed">
            <p className="text-xl leading-relaxed">
              La Perle, João Eduardo Moritz, Acqua, Simphonia WOA e Villa Celimontana representam
              diferentes propostas de moradia na Beira-Mar Norte e na Agronômica.
            </p>
            <p className="mt-5 text-muted-foreground">
              Este guia reúne oito condomínios, sem ordem de classificação. A seleção combina
              endereços junto à orla e opções nas ruas do bairro. Para escolher, vale olhar além do
              nome: planta, posição da unidade, conservação e rotina fazem diferença.
            </p>
            <div className="my-8 rounded-2xl bg-secondary/60 p-6">
              <h2 className="font-display text-2xl">Frente para a orla ou próximo da Beira-Mar?</h2>
              <p className="mt-3 text-muted-foreground">
                São situações distintas. Estar na região não garante vista para o mar. Andar,
                orientação, posição no edifício e construções ao redor precisam ser considerados em
                cada apartamento.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <Link
                  to="/imoveis/$slug"
                  params={{ slug: "beira-mar-norte" }}
                  className="underline underline-offset-4"
                >
                  Conheça a Beira-Mar Norte
                </Link>
                <Link
                  to="/imoveis/$slug"
                  params={{ slug: "agronomica" }}
                  className="underline underline-offset-4"
                >
                  Conheça a Agronômica
                </Link>
              </div>
            </div>
            {SECTIONS.map((section, i) => {
              const media =
                section.id in CONDOMINIUM_MEDIA
                  ? CONDOMINIUM_MEDIA[section.id as keyof typeof CONDOMINIUM_MEDIA]
                  : null;
              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-8 border-t border-border py-10"
                >
                  <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")} · {section.brand}
                  </p>
                  <h2 className="mt-3 font-display text-3xl sm:text-4xl">{section.name}</h2>
                  <p className="mt-5">{section.text}</p>
                  {media && (
                    <ArticleGallery name={section.name} code={media.code} photos={media.photos} />
                  )}
                  <p className="mt-5 text-muted-foreground">{section.detail}</p>
                  {section.id === "la-perle" && <InstagramReel url={LA_PERLE_REEL_URL} />}
                  <a
                    href={buildWhatsAppUrl(
                      `Olá Michele! Li seu guia da Beira-Mar Norte e gostaria de conhecer as opções no ${section.name}.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
                  >
                    Consultar opções com Michele <ArrowUpRight className="h-4 w-4" />
                  </a>
                </section>
              );
            })}
            <section id="comparar" className="scroll-mt-8 border-t border-border py-10">
              <h2 className="font-display text-3xl">O que comparar antes de escolher</h2>
              <div className="mt-6 overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">
                    Critérios para comparar apartamentos na Beira-Mar Norte e Agronômica
                  </caption>
                  <thead className="bg-secondary">
                    <tr>
                      <th scope="col" className="p-4">
                        Critério
                      </th>
                      <th scope="col" className="p-4">
                        O que observar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Localização", "Endereço, acesso e deslocamentos da sua rotina."],
                      ["Vista e orientação", "Ambientes com vista, andar e obstáculos existentes."],
                      ["Planta", "Área privativa, circulação, dormitórios e espaços de trabalho."],
                      ["Conservação", "Reformas, esquadrias, instalações e manutenção."],
                      [
                        "Condomínio",
                        "Áreas comuns, conservação, regras de uso e despesas informadas.",
                      ],
                      ["Garagem", "Vagas vinculadas à unidade, dimensões e manobra."],
                    ].map(([a, b]) => (
                      <tr key={a} className="border-t border-border">
                        <th scope="row" className="p-4 font-medium">
                          {a}
                        </th>
                        <td className="p-4 text-muted-foreground">{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section id="perguntas" className="scroll-mt-8 py-8">
              <h2 className="font-display text-3xl">Perguntas frequentes</h2>
              <div className="mt-6 divide-y divide-border">
                {FAQ.map((f) => (
                  <details key={f.q} className="py-5">
                    <summary className="cursor-pointer font-medium">{f.q}</summary>
                    <p className="mt-3 text-muted-foreground">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
            <section className="my-8 rounded-2xl bg-foreground p-6 text-background sm:p-8">
              <div className="flex items-center gap-4">
                <img
                  src={portrait}
                  alt="Michele Prietsch"
                  width="80"
                  height="80"
                  loading="lazy"
                  className="h-20 w-20 rounded-full object-cover"
                />
                <div>
                  <p className="font-display text-2xl">Sua próxima visita começa aqui.</p>
                  <p className="mt-1 text-sm text-background/70">Michele Prietsch · {SITE.creci}</p>
                </div>
              </div>
              <p className="mt-5 text-background/85">
                Conte quais condomínios você deseja conhecer, a área que procura e suas prioridades.
                Michele pode ajudar a identificar unidades disponíveis e organizar as visitas.
              </p>
              <a
                href={buildWhatsAppUrl(
                  "Olá Michele! Li o artigo sobre os condomínios da Beira-Mar Norte e Agronômica e gostaria de uma seleção de apartamentos.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-background px-5 py-3 text-sm font-medium text-foreground"
              >
                <MessageCircle className="h-4 w-4" />
                Falar com Michele
              </a>
            </section>
            <aside className="border-t border-border pt-6 text-sm text-muted-foreground">
              <p>
                Informações sobre projetos: portfólios da Lumis/Lohn, Fundermax, CFL e Fontana.
                Fotografias: acervo de imóveis já apresentado neste site. As características de cada
                unidade e a disponibilidade devem ser confirmadas no atendimento.
              </p>
              <Link
                to="/guia-imoveis-alto-padrao-florianopolis"
                className="mt-4 inline-block underline underline-offset-4"
              >
                Leia também: guia de imóveis de alto padrão em Florianópolis
              </Link>
            </aside>
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
