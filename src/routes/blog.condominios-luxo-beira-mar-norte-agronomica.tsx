import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Building2, ExternalLink, HelpCircle, MapPin, MessageCircle } from "lucide-react";
import { SiteFooter } from "@/components/home/SiteFooter";
import { ArticleGallery } from "@/components/blog/ArticleGallery";
import { InstagramReel } from "@/components/blog/InstagramReel";
import { ARTICLE_PATH, CONDOMINIUM_MEDIA, LA_PERLE_REEL_URL } from "@/lib/blog/beira-mar-media";
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
      "O La Perle é um dos marcos residenciais de altíssimo padrão mais reconhecidos da orla da Agronômica na Beira-Mar Norte. Com volumetria imponente e recuo generoso em relação à avenida, o projeto prioriza a integração visual com a Baía Norte através de amplas esquadrias panorâmicas e pé-direito amplo nas áreas sociais. O edifício conta com hall social privativo por prumada, garantindo discrição absoluta aos moradores.",
    typologies:
      "As plantas do edifício são conhecidas pela generosidade de espaço. No acervo consultado pela Michele dos Imóveis, constam unidades com 316 m² de área privativa (e até 471 m² de área total), configuradas com 3 ou 4 suítes e 4 vagas de garagem. As áreas sociais incluem living para múltiplos ambientes, sala de jantar formal e ampla sacada envidraçada com churrasqueira voltada diretamente para o mar.",
    amenities:
      "A estrutura de lazer e segurança é completa: piscina externa adulto e infantil com solarium, piscina aquecida / spa coberto, sauna seca e úmida, academia de musculação e aeróbicos totalmente equipada, salão de festas decorado, salão de jogos, playground infantil, guarita blindada com monitoramento 24h e vagas demarcadas para visitantes.",
    coastRelation:
      "Localização direta em frente ao mar (frente baía). As unidades dos andares intermediários e altos desfrutam de vista aberta e indevassável da baía e do pôr do sol, enquanto os acessos viários facilitam tanto o deslocamento para o Centro quanto para o Norte da Ilha.",
    editorialProfile:
      "Ideal para famílias que priorizam áreas privativas amplas em um endereço consolidado de prestígio, com a conveniência de estar à beira-mar com serviços e segurança de alto padrão.",
    faqs: [
      {
        q: "Qual a metragem dos apartamentos no La Perle Beira Mar?",
        a: "As unidades catalogadas possuem cerca de 316 m² privativos, com 3 ou 4 suítes e 4 vagas de garagem, proporcionando ambientes sociais amplos voltados para a baía.",
      },
      {
        q: "O condomínio La Perle possui piscina aquecida?",
        a: "Sim, além da piscina externa com deck, o La Perle conta com spa e piscina térmica coberta, além de saunas e fitness center completo.",
      },
    ],
  },
  {
    id: "joao-eduardo-moritz",
    name: "João Eduardo Moritz Residence",
    developer: "Lumis Construtora",
    location: "Avenida Jornalista Rubens de Arruda Ramos, 2354 · Beira-Mar Norte",
    architecture:
      "Projetado pela Lumis Construtora, o João Eduardo Moritz Residence destaca-se pelo rigor arquitetônico contemporâneo. A fachada foi executada com sistemas de esquadrias de alta performance desenvolvidos pela Lohn Esquadrias, garantindo elevado isolamento acústico contra o fluxo da avenida e máxima estanqueidade. O edifício opera no conceito de uma unidade exclusiva por andar, com hall social independente e aberturas em 360 graus.",
    typologies:
      "Apartamentos exclusivos de 4 suítes, com metragens privativas que variam em torno de 280 m² a 350 m². As plantas privilegiam living integrado com vista panorâmica frontal da baía, suíte máster com closet e hidromassagem, dependência completa de serviço e até 4 vagas de garagem com depósito individual.",
    amenities:
      "O condomínio oferece espaço gourmet climatizado, salão de festas finamente mobiliado, piscina aquecida, fitness center com equipamentos de primeira linha, controle de acesso biométrico e portaria 24 horas com clausura de segurança.",
    coastRelation:
      "Frente mar absoluta no trecho mais nobre da Avenida Beira-Mar Norte, permitindo contemplar o calçadão, a ciclovia e toda a extensão da baía.",
    editorialProfile:
      "Voltado para compradores que exigem máxima privacidade (uma unidade por andar), projeto assinado por construtora de referência e engenharia de esquadrias de ponta.",
    faqs: [
      {
        q: "Quem é a construtora responsável pelo João Eduardo Moritz?",
        a: "O residencial foi desenvolvido e construído pela Lumis Construtora, com projeto de esquadrias e fachadas documentado pela Lohn Esquadrias.",
      },
      {
        q: "Quantos apartamentos há por andar no João Eduardo Moritz?",
        a: "O empreendimento possui apenas um apartamento por andar, garantindo exclusividade, hall social privativo e circulação de ar cruzada em todas as faces.",
      },
    ],
  },
  {
    id: "acqua",
    name: "Acqua",
    developer: "CFL Imóveis",
    location: "Praça Governador Celso Ramos / Rua Frei Caneca, 17 · Agronômica",
    architecture:
      "Desenvolvido pela CFL, o Acqua é uma referência de sofisticação que une o paisagismo requintado à tranquilidade da Praça Governador Celso Ramos. Sua arquitetura equilibra painéis de vidro e acabamentos nobres, com acessos concebidos para harmonizar a rotina do morador com o refúgio arborizado do entorno.",
    typologies:
      "Apartamentos de 3 e 4 suítes, com plantas privativas entre 220 m² e 353 m² (com áreas totais que superam 400 m² nas coberturas e unidades diferenciadas). Os imóveis dispõem de varanda gourmet integrada, suíte máster generosa e 3 a 4 vagas de garagem.",
    amenities:
      "Parque aquático com piscina de raia e deck molhado, academia profissional, spa com sauna e sala de massagem, salão de festas com lounge gourmet, brinquedoteca, playground, gerador próprio para áreas comuns e portaria blindada com monitoramento perimetral.",
    coastRelation:
      "Localizado a poucos passos da orla, no coração da Praça Celso Ramos. Combina a proximidade imediata da Beira-Mar com a tranquilidade de uma rua arborizada e preservada.",
    editorialProfile:
      "Ideal para quem busca a assinatura CFL de acabamento e deseja morar próximo à Beira-Mar, mas com a atmosfera mais acolhedora e verde da Praça Celso Ramos.",
    faqs: [
      {
        q: "Qual o endereço do condomínio Acqua?",
        a: "O empreendimento situa-se na região nobre da Praça Governador Celso Ramos, com acesso principal e cadastros pelo logradouro da Rua Frei Caneca, 17, na Agronômica.",
      },
      {
        q: "Quais as metragens disponíveis no Acqua da CFL?",
        a: "As plantas tipo apresentam cerca de 221 m² privativos (4 suítes), existindo também unidades diferenciadas e coberturas que ultrapassam 350 m² privativos.",
      },
    ],
  },
  {
    id: "opera-house",
    name: "Opera House",
    developer: "WOA Empreendimentos Imobiliários",
    location: "Simphonia WOA Beiramar · Agronômica / Beira-Mar Norte",
    architecture:
      "O Opera House é uma das joias do complexo Simphonia WOA Beiramar. O edifício emprega o renomado sistema de fachadas ventiladas Fundermax, proporcionando eficiência energética, conforto térmico e conservação estética permanente. As áreas comuns contam com projeto luminotécnico e decoração de alto padrão.",
    typologies:
      "Apartamentos de 4 suítes com áreas privativas entre 250 m² e 380 m², desenhados com amplas aberturas envidraçadas no living social, sacada com churrasqueira a carvão e área íntima reservada com isolamento acústico.",
    amenities:
      "Infraestrutura de lazer privativa para a torre: piscina térmica coberta, piscina externa adulto/infantil, academia de ginástica completa, salão de festas com espaço gourmet, brinquedoteca e segurança integrada 24h.",
    coastRelation:
      "Posicionamento frontal voltado para a baía, garantindo vista panorâmica da orla e fácil acesso à ciclovia da Beira-Mar Norte.",
    editorialProfile:
      "Projetado para famílias que buscam a solidez construtiva da WOA e desejam apartamentos de 4 suítes de grande porte com vista mar perene.",
    faqs: [
      {
        q: "O que é o complexo Simphonia WOA Beiramar?",
        a: "É um masterplan da WOA composto por quatro edifícios independentes (Opera House, Sonata Place, Jazz Club e Soprano Hall), cada um com sua própria torre, acessos e lazer privativo.",
      },
      {
        q: "Qual o diferencial tecnológico da fachada do Opera House?",
        a: "O uso de fachada ventilada com placas Fundermax, que melhora o isolamento térmico e acústico e preserva a beleza do edifício sem desgaste pela maresia.",
      },
    ],
  },
  {
    id: "sonata-place",
    name: "Sonata Place",
    developer: "WOA Empreendimentos Imobiliários",
    location: "Rua Comandante Constantino Nicolau Spyrides, 4152 · Agronômica",
    architecture:
      "Torre independente do Simphonia WOA Beiramar com identidade arquitetônica moderna e atemporal. Projetada com esquadrias termoacústicas, persianas automatizadas e acabamentos refinados em mármore e porcelanato nas áreas sociais comuns.",
    typologies:
      "Plantas equilibradas de 3 suítes com áreas privativas que variam de 131 m² a 175 m². Dispõe de living para dois ambientes, varanda com churrasqueira e 2 a 3 vagas de garagem com infraestrutura para recarga de veículo elétrico.",
    amenities:
      "Piscina adulto e infantil com deck ensolarado, salão de festas gourmet totalmente equipado e climatizado, espaço fitness, playground infantil e guarita com controle de acesso rigoroso.",
    coastRelation:
      "Localizado junto à Rua Constantino Nicolau Spyrides, a menos de 50 metros da orla, permitindo acesso imediato ao calçadão da Beira-Mar.",
    editorialProfile:
      "Excelente para casais e famílias que buscam a qualidade de vida da Beira-Mar com plantas de 3 suítes funcionais e custos condominiais equilibrados.",
    faqs: [
      {
        q: "Quantas suítes têm os apartamentos no Sonata Place?",
        a: "A maioria das unidades conta com 3 suítes completas, lavabo social e sacada gourmet com churrasqueira a carvão.",
      },
      {
        q: "Onde fica o acesso ao Sonata Place?",
        a: "O acesso se dá pela Rua Comandante Constantino Nicolau Spyrides, 4152, facilitando o fluxo de entrada e saída sem o tráfego direto da avenida principal.",
      },
    ],
  },
  {
    id: "jazz-club",
    name: "Jazz Club",
    developer: "WOA Empreendimentos Imobiliários",
    location: "Boulevard / Servidão Paulo Zimmer, 101 · Agronômica",
    architecture:
      "O Jazz Club compõe o Simphonia WOA trazendo um conceito de luxo dinâmico e contemporâneo. Com projeto de interiores sofisticado no hall de entrada e acabamentos externos duráveis em fachada ventilada, destaca-se pela fluidez de seus espaços.",
    typologies:
      "Unidades de 2 e 3 suítes com metragens privativas entre 99 m² e 135 m². O layout integra cozinha, living e sacada com churrasqueira, otimizando o uso social e a luminosidade natural.",
    amenities:
      "Piscina aquecida, fitness center moderno, lounge bar com espaço gourmet para confraternizações, bicicletário, área de convivência externa e sistema de monitoramento eletrônico 24h.",
    coastRelation:
      "Situado no Boulevard Paulo Zimmer, a passos da Beira-Mar Norte, em uma alameda tranquila com paisagismo planejado.",
    editorialProfile:
      "Muito procurado por executivos, jovens casais ou investidores que buscam um produto premium com plantas inteligentes de 2 a 3 suítes na região central da ilha.",
    faqs: [
      {
        q: "Qual a faixa de metragem das unidades no Jazz Club?",
        a: "Os apartamentos variam entre 99 m² e 135 m² privativos, com 2 a 3 suítes e 2 vagas de garagem.",
      },
      {
        q: "O Jazz Club possui área de lazer compartilhada com outros prédios?",
        a: "Não. Embora integre o conjunto Simphonia, o Jazz Club possui guarita, piscina, academia e salão de festas 100% exclusivos para seus condôminos.",
      },
    ],
  },
  {
    id: "soprano-hall",
    name: "Soprano Hall",
    developer: "WOA Empreendimentos Imobiliários",
    location: "Boulevard / Servidão Paulo Zimmer, 55 · Agronômica",
    architecture:
      "O Soprano Hall completa o quarteto WOA com foco em residências familiares espaçosas. Sua torre imponente utiliza revestimentos tecnológicos de fachada ventilada Fundermax e amplas varandas que valorizam a incidência de luz natural e a ventilação.",
    typologies:
      "Apartamentos de 3 e 4 suítes com metragens privativas entre 168 m² e 237 m². As unidades destacam-se por living amplo em 3 ambientes, lavabo, dependência ou área de serviço estendida e 3 a 4 vagas de garagem.",
    amenities:
      "Piscina com raia e deck molhado, salão de festas amplo com cozinha de apoio, espaço fitness com equipamentos de alta tecnologia, playground, pet place e portaria 24 horas.",
    coastRelation:
      "Posicionado no Boulevard Paulo Zimmer com vista para a orla da Agronômica e acesso rápido tanto à Beira-Mar quanto às vias internas do bairro.",
    editorialProfile:
      "Voltado para famílias que necessitam de 3 ou 4 suítes com áreas privativas generosas e lazer refinado em ambiente estritamente residencial.",
    faqs: [
      {
        q: "Qual a configuração das plantas do Soprano Hall?",
        a: "O edifício oferece plantas de 3 e 4 suítes (168 m² a 237 m² privativos), com ampla sacada com churrasqueira e até 4 vagas de garagem.",
      },
      {
        q: "Quais os diferenciais de lazer do Soprano Hall?",
        a: "Conta com piscina com deck molhado, salão de festas decorado, academia moderna e playground infantil com segurança 24h.",
      },
    ],
  },
  {
    id: "villa-celimontana",
    name: "Villa Celimontana",
    developer: "Construtora Fontana",
    location: "Travessa Felipe Godinho e Silva, 30 (esq. Rua Sidnei Nocetti) · Agronômica",
    architecture:
      "Entregue pronto para morar pela Construtora Fontana em dezembro de 2023, o Residencial Villa Celimontana traz para a Agronômica a proposta de um resort urbano de alto padrão. Sua arquitetura contemporânea integra acabamentos de qualidade, hall com pé-direito duplo e áreas de lazer setorizadas.",
    typologies:
      "Apartamentos de 2 e 3 dormitórios (com 1 ou 2 suítes), com metragens privativas entre 79 m² e 134 m². Inclui persianas integradas nos dormitórios, sacada com churrasqueira a carvão e 1 a 2 vagas de garagem.",
    amenities:
      "Complexo de lazer 'Home Club': piscinas adulto e infantil, bar da piscina, academia completa, espaço gourmet, salão de festas, espaço teen, brinquedoteca, playground, pet place e guarita de segurança 24 horas.",
    coastRelation:
      "Localizado no interior do bairro Agronômica, em ponto estratégico próximo a hospitais, tribunais e universidades, a cerca de 3 minutos de carro da orla da Beira-Mar Norte.",
    editorialProfile:
      "Perfeito para famílias que valorizam uma infraestrutura completa de lazer para os filhos e desejam morar em um edifício novo, com custo condominial otimizado.",
    faqs: [
      {
        q: "Quando foi entregue o Villa Celimontana?",
        a: "O residencial foi anunciado como pronto para morar pela Construtora Fontana em dezembro de 2023.",
      },
      {
        q: "O Villa Celimontana fica de frente para o mar?",
        a: "Não. Fica situado na Travessa Felipe Godinho e Silva, no coração da Agronômica, oferecendo tranquilidade residencial próxima aos principais pontos da cidade.",
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
              Análise aprofundada de 8 edifícios icônicos: arquitetura, tipologias, diferenciais construtivos,
              lazer e acervo de imóveis selecionados por Michele Prietsch.
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

                  {/* Reel integration for La Perle */}
                  {section.id === "la-perle" && <InstagramReel url={LA_PERLE_REEL_URL} />}

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
                Michele realiza curadoria personalizada de oportunidades ativas e opções <strong className="text-white">off-market</strong> na Beira-Mar Norte e Agronômica.
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
                Fontes técnicas e documentais: portfólios institucionais da Lumis/Lohn Esquadrias, Fundermax, CFL Imóveis e Construtora Fontana.
                Fotografias: acervo de imóveis apresentado no site de Michele dos Imóveis. As características específicas de cada unidade e a disponibilidade devem ser confirmadas no atendimento.
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
