import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Building2, ExternalLink, HelpCircle, MapPin, MessageCircle } from "lucide-react";
import { SiteFooter } from "@/components/home/SiteFooter";
import { ArticleGallery } from "@/components/blog/ArticleGallery";
import { YouTubeShort } from "@/components/blog/YouTubeShort";
import { ARTICLE_PATH, CONDOMINIUM_MEDIA, LA_PERLE_YOUTUBE_ID } from "@/lib/blog/beira-mar-media";
import { SITE, buildWhatsAppUrl } from "@/lib/site-config";
import hero from "@/assets/hero-beiramar-1280.webp";
import heroSmall from "@/assets/hero-beiramar-720.webp";
import portrait from "@/assets/michele-portrait-800.webp";

const TITLE = "Condomínios de luxo na Beira-Mar Norte e Agronômica: Guia Completo";
const DESCRIPTION =
  "Análise detalhada de 8 condomínios emblemáticos: La Perle, João Eduardo Moritz, Acqua, Simphonia WOA e Villa Celimontana. Arquitetura, tipologias, áreas de lazer e acervo de imóveis.";
const CANONICAL = new URL(ARTICLE_PATH, SITE.publishedUrl).href;

interface CondominiumSection {
  id: string;
  name: string;
  developer: string;
  location: string;
  architecture: string;
  typologies: string;
  amenities: string;
  coastRelation: string;
  editorialProfile: string;
  faqs: { q: string; a: string }[];
}

const SECTIONS: readonly CondominiumSection[] = [
  {
    id: "la-perle",
    name: "La Perle Beira Mar",
    developer: "Empreendimento Consolidado",
    location: "Avenida Governador Irineu Bornhausen, 3600 · Agronômica (Beira-Mar Norte)",
    architecture:
      "O La Perle é um dos marcos residenciais de altíssimo padrão mais reconhecidos da orla da Agronômica na Beira-Mar Norte. Com volumetria marcante e recuo em relação à avenida, o projeto prioriza a integração visual com a Baía Norte através de esquadrias panorâmicas e sacada social. O edifício conta com hall privativo por prumada.",
    typologies:
      "As plantas do edifício são conhecidas pela generosidade de espaço. No acervo histórico consultado pela imobiliária, consta unidade com 316 m² de área privativa, configurada com 3 suítes e 4 vagas de garagem, além de living integrado e sacada com churrasqueira voltada diretamente para o mar.",
    amenities:
      "A estrutura de lazer e segurança do condomínio dispõe de piscinas externa e aquecida, sauna, fitness center, salão de festas, salão de jogos, playground e portaria 24 horas.",
    coastRelation:
      "Localização direta em frente ao mar (frente baía). As unidades dos andares intermediários e altos desfrutam de vista aberta para a baía, com acesso viário prático ao Centro e ao Norte da Ilha.",
    editorialProfile:
      "Perfil para famílias que priorizam áreas privativas amplas em endereço consolidado à beira-mar, com estrutura condominial completa.",
    faqs: [
      {
        q: "Qual a metragem dos apartamentos no La Perle Beira Mar?",
        a: "A unidade catalogada no acervo possui cerca de 316 m² privativos, configurada com 3 suítes e 4 vagas de garagem.",
      },
      {
        q: "O condomínio La Perle possui piscina aquecida?",
        a: "Sim, além da piscina externa, o La Perle conta com spa e piscina térmica coberta, além de saunas e fitness center.",
      },
    ],
  },
  {
    id: "joao-eduardo-moritz",
    name: "João Eduardo Moritz Residence",
    developer: "Lumis Construtora",
    location: "Avenida Jornalista Rubens de Arruda Ramos, 2354 · Beira-Mar Norte",
    architecture:
      "Projetado pela Lumis Construtora, o João Eduardo Moritz Residence opera no conceito de um apartamento por andar com hall privativo. A fachada foi executada com sistemas de esquadrias de alta performance desenvolvidos pela Lohn Esquadrias para atenuação acústica e conforto térmico.",
    typologies:
      "Apartamentos de 4 suítes em torre exclusiva de um apartamento por andar. As plantas privilegiam living integrado com vista frontal da orla da Beira-Mar Norte e vagas de garagem.",
    amenities:
      "O condomínio oferece espaço gourmet, salão de festas, piscina aquecida, fitness center e portaria 24 horas com controle de acesso.",
    coastRelation:
      "Localização na Avenida Jornalista Rubens de Arruda Ramos, de frente para a baía, permitindo contemplar a orla e o calçadão da Beira-Mar Norte.",
    editorialProfile:
      "Voltado para compradores que priorizam privacidade residencial (uma unidade por andar) e engenharia de esquadrias qualificada na orla.",
    faqs: [
      {
        q: "Quem é a construtora responsável pelo João Eduardo Moritz?",
        a: "O residencial foi desenvolvido e construído pela Lumis Construtora, com projeto de esquadrias e fachadas documentado pela Lohn Esquadrias.",
      },
      {
        q: "Quantos apartamentos há por andar no João Eduardo Moritz?",
        a: "O empreendimento possui apenas um apartamento por andar, garantindo exclusividade, hall social privativo e circulação de ar cruzada.",
      },
    ],
  },
  {
    id: "acqua",
    name: "Acqua",
    developer: "CFL Imóveis",
    location: "Praça Governador Celso Ramos / Rua Frei Caneca, 17 · Agronômica",
    architecture:
      "Desenvolvido pela CFL, o Acqua é uma referência de padrão construtivo que une arquitetura contemporânea ao paisagismo da Praça Governador Celso Ramos.",
    typologies:
      "Apartamentos de 3 e 4 suítes, com registros no acervo de unidades com cerca de 221 m² privativos (planta de 4 suítes e 4 vagas no acervo da unidade 31776) e varanda gourmet integrada.",
    amenities:
      "Área de lazer com piscina de raia e deck, academia, spa com sauna, salão de festas com lounge gourmet, brinquedoteca, playground e portaria 24 horas.",
    coastRelation:
      "Localizado a poucos passos da orla, na Praça Celso Ramos. Combina a proximidade da Beira-Mar com a tranquilidade de rua arborizada.",
    editorialProfile:
      "Para quem busca a assinatura CFL e deseja morar próximo à Beira-Mar com a atmosfera verde da Praça Celso Ramos.",
    faqs: [
      {
        q: "Qual o endereço do condomínio Acqua?",
        a: "O empreendimento situa-se na região da Praça Governador Celso Ramos, com acessos e cadastros pelo logradouro da Rua Frei Caneca, 17, na Agronômica.",
      },
      {
        q: "Quais as metragens registradas no Acqua da CFL?",
        a: "As plantas tipo catalogadas apresentam cerca de 221 m² privativos (4 suítes), existindo também unidades diferenciadas e coberturas no empreendimento.",
      },
    ],
  },
  {
    id: "opera-house",
    name: "Opera House",
    developer: "WOA Empreendimentos Imobiliários",
    location: "Simphonia WOA Beiramar · Agronômica / Beira-Mar Norte",
    architecture:
      "Torre de grande porte do complexo Simphonia WOA Beiramar. O edifício emprega fachada ventilada com painéis Fundermax, proporcionando eficiência energética, conforto térmico e proteção contra intempéries litorâneas.",
    typologies:
      "Apartamentos de 4 suítes com áreas privativas amplas de grande porte, projetados com aberturas envidraçadas no living social e sacada com churrasqueira voltada para a baía.",
    amenities:
      "Infraestrutura de lazer privativa para a torre: piscina térmica coberta, piscina externa, academia, salão de festas com espaço gourmet e portaria 24 horas.",
    coastRelation:
      "Posicionamento frontal voltado para a baía, garantindo vista da orla e acesso à ciclovia da Beira-Mar Norte.",
    editorialProfile:
      "Projetado para famílias que buscam a solidez construtiva da WOA em apartamentos de 4 suítes de grande porte.",
    faqs: [
      {
        q: "O que é o complexo Simphonia WOA Beiramar?",
        a: "É um complexo da WOA composto por quatro edifícios independentes (Opera House, Sonata Place, Jazz Club e Soprano Hall), cada um com torre, acessos e lazer privativos.",
      },
      {
        q: "Qual o diferencial tecnológico da fachada do Opera House?",
        a: "O uso de fachada ventilada com placas Fundermax, proporcionando isolamento termoacústico e durabilidade na orla.",
      },
    ],
  },
  {
    id: "sonata-place",
    name: "Sonata Place",
    developer: "WOA Empreendimentos Imobiliários",
    location: "Rua Comandante Constantino Nicolau Spyrides, 4152 · Agronômica",
    architecture:
      "Torre independente do Simphonia WOA Beiramar com identidade arquitetônica contemporânea e acesso pela Rua Comandante Constantino Nicolau Spyrides.",
    typologies:
      "Plantas de 3 suítes com 131 m² privativos (unidade 30870 no acervo), living social integrado, sacada com churrasqueira e vagas de garagem.",
    amenities:
      "Piscina adulto e infantil com deck, salão de festas gourmet equipado, espaço fitness, playground e portaria 24 horas.",
    coastRelation:
      "Localizado junto à Rua Constantino Nicolau Spyrides, a poucos metros da orla, permitindo acesso prático ao calçadão.",
    editorialProfile:
      "Ideal para famílias que buscam a localização da Beira-Mar com plantas de 3 suítes funcionais.",
    faqs: [
      {
        q: "Quantas suítes têm os apartamentos no Sonata Place?",
        a: "A unidade catalogada no acervo conta com 3 suítes, lavabo social e sacada com churrasqueira.",
      },
      {
        q: "Onde fica o acesso ao Sonata Place?",
        a: "O acesso se dá pela Rua Comandante Constantino Nicolau Spyrides, 4152, facilitando o fluxo de entrada e saída sem o tráfego direto da avenida.",
      },
    ],
  },
  {
    id: "jazz-club",
    name: "Jazz Club",
    developer: "WOA Empreendimentos Imobiliários",
    location: "Boulevard / Servidão Paulo Zimmer, 101 · Agronômica",
    architecture:
      "O Jazz Club integra o conjunto Simphonia WOA com projeto contemporâneo e fachada ventilada.",
    typologies:
      "Unidades de 3 suítes com 107 m² privativos (unidade 22461 no acervo), com layout integrando living e sacada com churrasqueira.",
    amenities:
      "Piscina aquecida, fitness center, lounge gourmet, bicicletário e portaria 24 horas.",
    coastRelation:
      "Situado na Servidão Paulo Zimmer, a poucos passos da Beira-Mar Norte, em alameda arborizada.",
    editorialProfile:
      "Indicado para quem busca um residencial moderno com plantas de 3 suítes na Agronômica.",
    faqs: [
      {
        q: "Qual a metragem da unidade catalogada no Jazz Club?",
        a: "A unidade do acervo possui 107 m² privativos, configurada com 3 suítes e 2 vagas de garagem.",
      },
      {
        q: "O Jazz Club possui área de lazer compartilhada com outros prédios?",
        a: "Não. Embora integre o complexo Simphonia, o Jazz Club possui portaria, piscina, academia e salão de festas privativos de sua torre.",
      },
    ],
  },
  {
    id: "soprano-hall",
    name: "Soprano Hall",
    developer: "WOA Empreendimentos Imobiliários",
    location: "Boulevard / Servidão Paulo Zimmer, 55 · Agronômica",
    architecture:
      "Torre do complexo WOA com fachada ventilada Fundermax e varandas amplas voltadas para a orla da Agronômica.",
    typologies:
      "Apartamentos com 168 m² de área privativa (unidade 44022 no acervo), 3 suítes, living amplo, sacada com churrasqueira e vagas de garagem.",
    amenities:
      "Piscina com deck, salão de festas climatizado, espaço fitness, playground e portaria 24 horas.",
    coastRelation:
      "Posicionado na Servidão Paulo Zimmer com vista para a orla da Agronômica e acesso rápido à Beira-Mar.",
    editorialProfile:
      "Voltado para famílias que necessitam de 3 suítes com metragens generosas e lazer privativo.",
    faqs: [
      {
        q: "Qual a configuração da planta do Soprano Hall no acervo?",
        a: "A unidade catalogada possui 168 m² privativos, configurada com 3 suítes, ampla sacada com churrasqueira e 3 vagas de garagem.",
      },
      {
        q: "Quais os itens de lazer do Soprano Hall?",
        a: "Conta com piscina com deck, salão de festas, academia e playground infantil com portaria 24 horas.",
      },
    ],
  },
  {
    id: "villa-celimontana",
    name: "Villa Celimontana",
    developer: "Construtora Fontana",
    location: "Travessa Felipe Godinho e Silva, 30 (esq. Rua Sidnei Nocetti) · Agronômica",
    architecture:
      "Comunicado como pronto para morar pela Construtora Fontana em dezembro de 2023, o Residencial Villa Celimontana traz para a Agronômica a proposta de um home club residencial.",
    typologies:
      "Apartamentos com opções de 2 dormitórios (1 suíte, ~79 m² privativos no acervo da unidade 43575), sacada com churrasqueira e vaga de garagem.",
    amenities:
      "Complexo de lazer 'Home Club': piscinas adulto e infantil, bar da piscina, academia, espaço gourmet, salão de festas, brinquedoteca, playground, pet place e portaria 24 horas.",
    coastRelation:
      "Localizado no interior do bairro Agronômica, em ponto residencial a cerca de 3 minutos de carro da orla da Beira-Mar Norte.",
    editorialProfile:
      "Para famílias que valorizam infraestrutura completa de lazer e desejam residir em condomínio recente na Agronômica.",
    faqs: [
      {
        q: "Quando foi concluído o Villa Celimontana?",
        a: "O residencial foi comunicado como pronto para morar pela Construtora Fontana em dezembro de 2023.",
      },
      {
        q: "O Villa Celimontana fica de frente para o mar?",
        a: "Não. Fica situado na Travessa Felipe Godinho e Silva, no interior da Agronômica, próximo aos serviços do bairro.",
      },
    ],
  },
] as const;

const GENERAL_FAQS = [
  {
    q: "Quais condomínios conhecer na Beira-Mar Norte e Agronômica?",
    a: "Esta seleção apresenta La Perle Beira Mar, João Eduardo Moritz Residence, Acqua, Villa Celimontana e os quatro condomínios do Simphonia WOA Beiramar: Opera House, Sonata Place, Jazz Club e Soprano Hall. São propostas diferentes de localização, arquitetura e moradia, sem ordem de classificação.",
  },
  {
    q: "Quais condomínios fazem parte do Simphonia WOA Beiramar?",
    a: "Opera House, Sonata Place, Jazz Club e Soprano Hall. Cada edifício possui torre, acessos e áreas de lazer próprias; não presuma que plantas, vista e instalações sejam iguais nos quatro edifícios.",
  },
  {
    q: "Qual empreendimento da CFL está nesta seleção?",
    a: "O Acqua, na região nobre da Praça Governador Celso Ramos, na Agronômica. O acervo do site identifica unidades com endereço no logradouro da Rua Frei Caneca, 17.",
  },
  {
    q: "O Villa Celimontana fica na Avenida Beira-Mar Norte?",
    a: "Não. A Fontana informa o endereço na Travessa Felipe Godinho e Silva, esquina com a Rua Sidnei Nocetti, na Agronômica. É um condomínio no bairro, próximo da região da orla.",
  },
  {
    q: "Todo apartamento na região tem vista para o mar?",
    a: "Não. A vista precisa ser conferida em cada unidade, considerando andar, orientação solar, posição no edifício e construções no entorno. Estar no bairro não significa estar de frente para o mar.",
  },
  {
    q: "O que acontece quando uma unidade do acervo é vendida ou despublicada?",
    a: "A página do imóvel (/imovel/CODIGO) permanece preservada como registro histórico e editorial com aviso de indisponibilidade, supressão de preço comercial e direcionamento para outras unidades disponíveis no mesmo condomínio.",
  },
];

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
              mainEntity: [
                ...GENERAL_FAQS,
                ...SECTIONS.flatMap((s) => s.faqs),
              ].map((f) => ({
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
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar ao Blog
          </Link>
          <Link to="/" className="font-display text-lg">
            Michele dos Imóveis
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden bg-foreground text-background">
          <img
            src={hero}
            srcSet={`${heroSmall} 720w, ${hero} 1280w`}
            sizes="100vw"
            alt="Vista panorâmica da Beira-Mar Norte em Florianópolis"
            width="1280"
            height="853"
            fetchPriority="high"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/95 via-black/65 to-black/35" />
          <div className="mx-auto max-w-7xl px-5 pb-16 pt-24 sm:px-10 sm:pb-24 sm:pt-36">
            <p className="text-xs uppercase tracking-[0.24em] text-white/85">
              Florianópolis · Arquitetura & Endereços Nobres
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-4xl leading-[1.08] tracking-tight sm:text-6xl">
              Condomínios de luxo na Beira-Mar Norte e Agronômica
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              Análise de 8 edifícios emblemáticos: arquitetura, tipologias, diferenciais construtivos,
              lazer e acervo de imóveis catalogados.
            </p>
            <p className="mt-8 text-sm text-white/75">Michele dos Imóveis · Guia Editorial de Alto Padrão</p>
          </div>
        </section>

        {/* Layout Grid: Sticky Summary + Content */}
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 sm:px-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:py-20">
          <aside>
            <nav aria-label="Neste artigo" className="lg:sticky lg:top-8 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Condomínios
                </p>
                <ol className="mt-4 grid gap-2.5 text-sm sm:grid-cols-2 lg:grid-cols-1">
                  {SECTIONS.map((s, i) => (
                    <li key={s.id}>
                      <a className="inline-flex gap-2.5 hover:underline text-foreground/80 hover:text-foreground" href={`#${s.id}`}>
                        <span className="text-muted-foreground font-mono">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {s.name}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="pt-4 border-t border-border space-y-2">
                <a href="#comparar" className="block text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground">
                  Tabela comparativa
                </a>
                <a href="#perguntas" className="block text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground">
                  Perguntas frequentes
                </a>
              </div>
            </nav>
          </aside>

          <article className="min-w-0 max-w-3xl leading-relaxed">
            <p className="text-xl leading-relaxed font-light">
              A Avenida Beira-Mar Norte e o bairro Agronômica concentram alguns dos endereços mais valorizados e
              desejados do Sul do Brasil. No entanto, cada condomínio possui uma vocação única de planta, privacidade,
              acesso e convivência.
            </p>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Este guia reúne oito residenciais consolidados. A seleção abrange empreendimentos com vista mar frontal e
              opções nas alamedas internas do bairro. Para decidir com segurança, confira abaixo os detalhes arquitetônicos,
              a relação com a orla e o acervo de imóveis catalogados.
            </p>

            {/* Context Card: Orla vs Bairro */}
            <div className="my-8 rounded-2xl bg-secondary/50 border border-border p-6">
              <h2 className="font-display text-2xl">Frente para a orla ou nas ruas da Agronômica?</h2>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                Estar na região não garante vista frontal permanente para o mar. A orientação solar, o andar, o recuo do
                edifício e as construções do entorno variam em cada apartamento. Edifícios nas alamedas do bairro
                oferecem tranquilidade acústica com acesso em poucos passos ao calçadão.
              </p>
              <div className="mt-5 flex flex-wrap gap-4 text-sm">
                <Link
                  to="/imoveis/$slug"
                  params={{ slug: "beira-mar-norte" }}
                  className="inline-flex items-center gap-1.5 underline underline-offset-4 font-medium"
                >
                  <MapPin className="h-4 w-4" /> Imóveis na Beira-Mar Norte
                </Link>
                <Link
                  to="/imoveis/$slug"
                  params={{ slug: "agronomica" }}
                  className="inline-flex items-center gap-1.5 underline underline-offset-4 font-medium"
                >
                  <MapPin className="h-4 w-4" /> Imóveis na Agronômica
                </Link>
              </div>
            </div>

            {/* 8 Condominium Sections */}
            {SECTIONS.map((section, i) => {
              const media =
                section.id in CONDOMINIUM_MEDIA
                  ? CONDOMINIUM_MEDIA[section.id as keyof typeof CONDOMINIUM_MEDIA]
                  : null;
              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-8 border-t border-border py-12"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-mono">
                      {String(i + 1).padStart(2, "0")} · {section.developer}
                    </p>
                    <span className="text-xs text-muted-foreground">{section.location.split("·")[1]?.trim()}</span>
                  </div>

                  <h2 className="mt-3 font-display text-3xl sm:text-4xl tracking-tight">{section.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {section.location}
                  </p>

                  {/* Architecture & Concept */}
                  <div className="mt-6 space-y-4 text-foreground/90">
                    <p>{section.architecture}</p>
                  </div>

                  {/* Photos Gallery */}
                  {media && (
                    <ArticleGallery name={section.name} code={media.code} photos={media.photos} />
                  )}

                  {/* Typologies, Amenities & Context */}
                  <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
                    <p>
                      <strong className="text-foreground font-medium">Plantas e Tipologias: </strong>
                      {section.typologies}
                    </p>
                    <p>
                      <strong className="text-foreground font-medium">Estrutura de Lazer e Segurança: </strong>
                      {section.amenities}
                    </p>
                    <p>
                      <strong className="text-foreground font-medium">Relação com a Orla e Acessos: </strong>
                      {section.coastRelation}
                    </p>
                    <p>
                      <strong className="text-foreground font-medium">Perfil Editorial de Uso: </strong>
                      {section.editorialProfile}
                    </p>
                  </div>

                  {/* Section-specific FAQs */}
                  {section.faqs.length > 0 && (
                    <div className="mt-6 rounded-xl bg-secondary/30 p-4 border border-border/60 text-sm space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <HelpCircle className="h-3.5 w-3.5" /> Dúvidas frequentes sobre {section.name}
                      </div>
                      {section.faqs.map((faq) => (
                        <div key={faq.q} className="space-y-1">
                          <p className="font-medium text-foreground">{faq.q}</p>
                          <p className="text-muted-foreground">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Video integration for La Perle */}
                  {section.id === "la-perle" && <YouTubeShort videoId={LA_PERLE_YOUTUBE_ID} title="La Perle em vídeo" />}

                  {/* Action links */}
                  <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                    {media && media.condoSlug && (
                      <Link
                        to="/condominio/$slug"
                        params={{ slug: media.condoSlug }}
                        className="inline-flex items-center gap-1.5 font-medium underline underline-offset-4 text-foreground hover:opacity-80"
                      >
                        <Building2 className="h-4 w-4" /> Página do Condomínio {section.name}
                      </Link>
                    )}

                    {media && (
                      <Link
                        to="/imovel/$code"
                        params={{ code: media.code }}
                        className="inline-flex items-center gap-1.5 font-medium underline underline-offset-4 text-muted-foreground hover:text-foreground"
                      >
                        Ver imóvel do acervo ({media.code}) <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    )}

                    <a
                      href={buildWhatsAppUrl(
                        `Olá Michele! Li seu guia da Beira-Mar Norte e gostaria de conhecer as opções no ${section.name}.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400 hover:underline underline-offset-4"
                    >
                      <MessageCircle className="h-4 w-4" /> Consultar opções com Michele
                    </a>
                  </div>
                </section>
              );
            })}

            {/* Comparison Table */}
            <section id="comparar" className="scroll-mt-8 border-t border-border py-12">
              <h2 className="font-display text-3xl">O que comparar antes de escolher</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Critérios essenciais para avaliar apartamentos de alto padrão na Beira-Mar Norte e Agronômica:
              </p>
              <div className="mt-6 overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">
                    Critérios para comparar apartamentos na Beira-Mar Norte e Agronômica
                  </caption>
                  <thead className="bg-secondary">
                    <tr>
                      <th scope="col" className="p-4 font-semibold">
                        Critério
                      </th>
                      <th scope="col" className="p-4 font-semibold">
                        O que observar na visita
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Localização e Acesso", "Endereço exato, facilidade de entrada/saída nos horários de pico e proximidade de serviços."],
                      ["Vista e Orientação Solar", "Quais cômodos possuem vista perene para a baía, incidência de sol da manhã ou da tarde e ruído da avenida."],
                      ["Planta e Espaço Privativo", "Área privativa real, quantidade de suítes, circulação entre área íntima e social, e espaço de home office."],
                      ["Conservação e Reformas", "Qualidade das esquadrias, climatização, estado das instalações elétricas/hidráulicas e reformas efetuadas."],
                      ["Estrutura do Condomínio", "Equipamentos de lazer efetivamente disponíveis, conservação das áreas comuns, segurança armada e despesas mensais."],
                      ["Garagem e Manobra", "Vagas livres ou travadas, largura para SUVs grandes, facilidade de manobra e tomada para carregamento elétrico."],
                    ].map(([a, b]) => (
                      <tr key={a} className="border-t border-border">
                        <th scope="row" className="p-4 font-medium text-foreground">
                          {a}
                        </th>
                        <td className="p-4 text-muted-foreground">{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* General FAQs */}
            <section id="perguntas" className="scroll-mt-8 py-8 border-t border-border">
              <h2 className="font-display text-3xl">Perguntas frequentes</h2>
              <div className="mt-6 divide-y divide-border">
                {GENERAL_FAQS.map((f) => (
                  <details key={f.q} className="py-5 group">
                    <summary className="cursor-pointer font-medium text-foreground flex justify-between items-center list-none">
                      <span>{f.q}</span>
                      <span className="text-muted-foreground text-xs group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>

            {/* Curated Consultation Banner */}
            <section className="my-8 rounded-2xl bg-foreground p-6 text-background sm:p-8">
              <div className="flex items-center gap-4">
                <img
                  src={portrait}
                  alt="Michele Prietsch"
                  width="80"
                  height="80"
                  loading="lazy"
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-background/20"
                />
                <div>
                  <p className="font-display text-2xl">Sua próxima visita começa aqui.</p>
                  <p className="mt-1 text-sm text-background/70">Michele Prietsch · {SITE.creci}</p>
                </div>
              </div>
              <p className="mt-5 text-background/85 leading-relaxed text-sm sm:text-base">
                Conte quais condomínios você deseja conhecer, a metragem ideal e suas prioridades de moradia.
                Michele realiza atendimento consultivo de oportunidades na Beira-Mar Norte e Agronômica.
              </p>
              <a
                href={buildWhatsAppUrl(
                  "Olá Michele! Li o guia dos condomínios da Beira-Mar Norte e Agronômica e gostaria de uma consultoria personalizada para encontrar meu imóvel.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-background/90 transition"
              >
                <MessageCircle className="h-4 w-4" />
                Falar diretamente com Michele
              </a>
            </section>

            <aside className="border-t border-border pt-6 text-xs text-muted-foreground space-y-2">
              <p>
                Fontes técnicas e documentais: registros cadastrais históricos do acervo interno da imobiliária e documentação técnica pública das construtoras e fabricantes (Lumis, CFL, WOA, Construtora Fontana, Fundermax, Lohn Esquadrias). As características específicas de cada unidade e a disponibilidade devem ser confirmadas no atendimento.
              </p>
              <p>
                <Link
                  to="/guia-imoveis-alto-padrao-florianopolis"
                  className="inline-block underline underline-offset-4 font-medium"
                >
                  Leia também: Guia completo de imóveis de alto padrão em Florianópolis
                </Link>
              </p>
            </aside>
          </article>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
