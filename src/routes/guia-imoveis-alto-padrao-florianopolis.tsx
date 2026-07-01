import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, MessageCircle, MapPin } from "lucide-react";
import { WHATSAPP_URL, SITE } from "@/lib/site-config";

const CANONICAL = "https://micheledosimoveis.com.br/guia-imoveis-alto-padrao-florianopolis";
const OG_IMAGE = "https://micheledosimoveis.com.br/michele-dos-imoveis-og.png";

const TITLE = "Guia de Imóveis de Alto Padrão em Florianópolis | Michele dos Imóveis";
const DESCRIPTION =
  "Conheça os principais bairros, tipos de imóveis e critérios para comprar imóveis de alto padrão em Florianópolis com curadoria de Michele Prietsch.";
const OG_DESCRIPTION =
  "Um guia completo sobre bairros, tipos de imóveis, imóveis off market e critérios para comprar imóveis de alto padrão em Florianópolis.";
const TWITTER_DESCRIPTION =
  "Conheça bairros, imóveis frente mar, coberturas, casas em condomínio e oportunidades off market em Florianópolis.";

const FAQ = [
  {
    q: "Qual é o melhor bairro para comprar imóvel de alto padrão em Florianópolis?",
    a: "Depende do perfil do comprador. Jurerê Internacional é forte em exclusividade e praia; Beira-Mar Norte oferece centralidade e vista; Cacupé entrega privacidade e natureza; Campeche e Novo Campeche combinam praia e valorização; Lagoa da Conceição oferece estilo de vida e paisagem.",
  },
  {
    q: "Vale a pena comprar imóvel frente mar em Florianópolis?",
    a: "Sim, desde que a escolha considere localização, documentação, conservação, posição solar, privacidade e liquidez. Imóveis frente mar tendem a ter forte apelo de escassez e desejo, mas precisam ser avaliados individualmente.",
  },
  {
    q: "O que é um imóvel off market?",
    a: "É um imóvel disponível para venda sem divulgação pública ampla. Geralmente é apresentado de forma discreta a compradores qualificados, preservando privacidade do proprietário e estratégia comercial.",
  },
  {
    q: "Quais imóveis de alto padrão têm maior liquidez?",
    a: "Imóveis bem localizados, com vista, boa planta, documentação regular, padrão construtivo superior e preço coerente tendem a ter maior liquidez. Apartamentos na Beira-Mar Norte, casas em regiões nobres e imóveis próximos ao mar costumam ter boa procura.",
  },
  {
    q: "É melhor comprar pronto ou lançamento?",
    a: "Depende do objetivo. Imóveis prontos permitem avaliar exatamente o que será comprado. Lançamentos podem oferecer plantas modernas, condições comerciais e potencial de valorização até a entrega. A decisão deve considerar prazo, risco, construtora e localização.",
  },
  {
    q: "Como vender um imóvel de alto padrão com discrição?",
    a: "A venda discreta pode ser feita por meio de estratégia off market, com apresentação seletiva para compradores qualificados, sem exposição pública ampla em portais e redes sociais.",
  },
];

const REGIOES_GUIA: Array<{ slug: string; nome: string; resumo: string }> = [
  { slug: "jurere-internacional", nome: "Jurerê Internacional", resumo: "Exclusividade, praia planejada e forte reconhecimento de mercado." },
  { slug: "beira-mar-norte", nome: "Beira-Mar Norte", resumo: "Centralidade, vista para a baía e alta liquidez." },
  { slug: "cacupe", nome: "Cacupé", resumo: "Privacidade, natureza e pôr do sol." },
  { slug: "joao-paulo", nome: "João Paulo", resumo: "Vista para a baía e proximidade ao Centro." },
  { slug: "campeche", nome: "Campeche", resumo: "Praia, lifestyle e lançamentos no Sul da Ilha." },
  { slug: "novo-campeche", nome: "Novo Campeche", resumo: "Empreendimentos contemporâneos próximos ao mar." },
  { slug: "lagoa-da-conceicao", nome: "Lagoa da Conceição", resumo: "Estilo de vida, natureza e identidade única." },
  { slug: "praia-brava", nome: "Praia Brava", resumo: "Mar aberto e arquitetura contemporânea no Norte." },
  { slug: "santo-antonio-de-lisboa", nome: "Santo Antônio de Lisboa", resumo: "Charme açoriano, vista e sofisticação discreta." },
];

const TOC = [
  { id: "o-que-define", label: "O que define alto padrão" },
  { id: "regioes", label: "Principais regiões" },
  { id: "tipos", label: "Tipos de imóveis" },
  { id: "off-market", label: "Imóveis off market" },
  { id: "escolher-bairro", label: "Como escolher o bairro" },
  { id: "avaliar", label: "O que avaliar antes de comprar" },
  { id: "proprietarios", label: "Para proprietários" },
  { id: "curadoria", label: "Curadoria imobiliária" },
  { id: "michele", label: "Michele dos Imóveis" },
  { id: "faq", label: "Perguntas frequentes" },
];

export const Route = createFileRoute("/guia-imoveis-alto-padrao-florianopolis")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "index, follow" },
      { name: "author", content: "Michele Prietsch" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: OG_DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: CANONICAL },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:site_name", content: "Michele dos Imóveis" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: TWITTER_DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Guia de imóveis de alto padrão em Florianópolis",
          description: DESCRIPTION,
          inLanguage: "pt-BR",
          author: { "@type": "Person", name: "Michele Prietsch" },
          publisher: {
            "@type": "Organization",
            name: "Michele dos Imóveis",
            logo: {
              "@type": "ImageObject",
              url: "https://micheledosimoveis.com.br/michele-dos-imoveis-og.png",
            },
          },
          image: OG_IMAGE,
          url: CANONICAL,
          mainEntityOfPage: CANONICAL,
          about: [
            "imóveis de alto padrão",
            "Florianópolis",
            "imóveis de luxo",
            "imóveis off market",
            "imóveis frente mar",
            "coberturas",
            "casas em condomínio",
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://micheledosimoveis.com.br/" },
            {
              "@type": "ListItem",
              position: 2,
              name: "Guia de imóveis de alto padrão em Florianópolis",
              item: CANONICAL,
            },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: GuiaPage,
});

function GuiaPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 py-5 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <Link to="/" className="font-display text-lg tracking-tight">
            Michele dos Imóveis
          </Link>
        </div>
      </header>

      {/* Hero editorial */}
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-4xl px-6 sm:px-10 py-16 sm:py-24">
          <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Início</Link>
            <span className="mx-2">/</span>
            <span>Guia editorial</span>
          </nav>
          <h1 className="mt-5 font-display text-4xl sm:text-5xl leading-[1.08] tracking-tight">
            Guia de imóveis de alto padrão em Florianópolis
          </h1>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Um panorama completo sobre bairros, tipos de imóveis, critérios de escolha e
            oportunidades off market na Ilha de Santa Catarina.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-3 text-sm font-medium hover:bg-foreground/90 transition"
            >
              <MessageCircle className="h-4 w-4" />
              Falar com Michele no WhatsApp
            </a>
            <Link
              to="/imoveis"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-5 py-3 text-sm font-medium hover:bg-foreground/5 transition"
            >
              <MapPin className="h-4 w-4" />
              Ver imóveis por região
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-6 sm:px-10 py-16 sm:py-20">
        {/* Sumário */}
        <aside className="mb-14 rounded-2xl border border-border bg-secondary/30 p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sumário</div>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
            {TOC.map((t, i) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="text-foreground/80 hover:text-foreground hover:underline">
                  {String(i + 1).padStart(2, "0")}. {t.label}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        <article className="prose-editorial space-y-6 leading-relaxed text-foreground/90">
          <p>
            Florianópolis reúne alguns dos endereços mais desejados do Brasil para quem busca
            qualidade de vida, natureza, segurança, arquitetura contemporânea e valorização
            imobiliária. Entre o mar, a lagoa, as encostas verdes e os bairros consolidados, a
            cidade oferece diferentes perfis de imóveis de alto padrão: apartamentos frente mar,
            coberturas, casas em condomínio, residências com vista, lançamentos exclusivos e
            oportunidades off market.
          </p>
          <p>
            Comprar um imóvel de alto padrão em Florianópolis exige mais do que escolher uma boa
            localização. É preciso entender o estilo de vida de cada região, a liquidez do
            endereço, o padrão construtivo, a privacidade, a posição solar, a vista, a documentação
            e o potencial de valorização.
          </p>
          <p>
            Este guia foi criado para ajudar compradores, investidores e proprietários a
            compreenderem melhor o mercado imobiliário de alto padrão em Florianópolis.
          </p>

          <H2 id="o-que-define">O que define um imóvel de alto padrão em Florianópolis?</H2>
          <p>
            Um imóvel de alto padrão não é definido apenas pelo preço. Em Florianópolis, esse
            conceito envolve um conjunto de fatores que, juntos, determinam valor, exclusividade e
            desejo.
          </p>
          <p>Entre os principais critérios estão:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>localização valorizada;</li>
            <li>vista para o mar, lagoa, baía ou áreas verdes;</li>
            <li>arquitetura diferenciada;</li>
            <li>acabamentos superiores;</li>
            <li>planta bem resolvida;</li>
            <li>privacidade;</li>
            <li>segurança;</li>
            <li>vagas de garagem compatíveis com o perfil do imóvel;</li>
            <li>áreas sociais amplas;</li>
            <li>infraestrutura de lazer;</li>
            <li>liquidez;</li>
            <li>documentação regular;</li>
            <li>potencial de valorização.</li>
          </ul>
          <p>
            Em regiões como <BLink slug="jurere-internacional">Jurerê Internacional</BLink>,{" "}
            <BLink slug="beira-mar-norte">Beira-Mar Norte</BLink>,{" "}
            <BLink slug="cacupe">Cacupé</BLink>, <BLink slug="joao-paulo">João Paulo</BLink>,{" "}
            <BLink slug="campeche">Campeche</BLink>,{" "}
            <BLink slug="lagoa-da-conceicao">Lagoa da Conceição</BLink> e{" "}
            <BLink slug="praia-brava">Praia Brava</BLink>, esses fatores aparecem de formas
            diferentes. Por isso, a escolha ideal depende diretamente do perfil de quem compra.
          </p>

          <H2 id="regioes">Principais regiões para imóveis de alto padrão em Florianópolis</H2>

          <H3>Jurerê Internacional</H3>
          <p>
            Jurerê Internacional é um dos bairros mais conhecidos quando o assunto é alto padrão em
            Florianópolis. A região combina praia, urbanismo planejado, segurança, vida social,
            gastronomia e imóveis de alto valor agregado.
          </p>
          <p>
            É uma escolha frequente para quem busca casas amplas, residências próximas ao mar,
            imóveis para temporada de alto padrão e endereços com forte reconhecimento no mercado.
          </p>
          <p>
            Jurerê Internacional costuma atrair compradores que valorizam exclusividade, status,
            lazer e proximidade com uma das praias mais desejadas da Ilha.{" "}
            <BLink slug="jurere-internacional">Ver imóveis em Jurerê Internacional →</BLink>
          </p>

          <H3>Beira-Mar Norte</H3>
          <p>
            A Beira-Mar Norte é uma das regiões mais tradicionais e valorizadas de Florianópolis.
            Com localização central, acesso rápido a serviços, escolas, clínicas, restaurantes,
            shopping, marina e principais vias da cidade, é ideal para quem busca conveniência sem
            abrir mão de vista e sofisticação.
          </p>
          <p>
            A região concentra apartamentos de alto padrão, coberturas, imóveis frente mar e
            empreendimentos consolidados com alta liquidez.{" "}
            <BLink slug="beira-mar-norte">Ver imóveis na Beira-Mar Norte →</BLink>
          </p>

          <H3>Cacupé</H3>
          <p>
            Cacupé é uma região associada à privacidade, natureza, vista para o mar e pôr do sol. O
            bairro atrai compradores que buscam casas de alto padrão, condomínios exclusivos e
            imóveis com perfil mais reservado.
          </p>
          <p>
            É uma excelente opção para quem valoriza silêncio, contemplação, vista e
            exclusividade. <BLink slug="cacupe">Ver imóveis em Cacupé →</BLink>
          </p>

          <H3>João Paulo</H3>
          <p>
            João Paulo é uma região estratégica para quem deseja morar perto do Centro, mas com
            atmosfera residencial e vista privilegiada para a baía. O bairro reúne apartamentos de
            alto padrão, coberturas e imóveis com boa liquidez.
          </p>
          <p>
            É indicado para quem busca praticidade, vista, segurança e bom padrão residencial.{" "}
            <BLink slug="joao-paulo">Ver imóveis no João Paulo →</BLink>
          </p>

          <H3>Campeche</H3>
          <p>
            O Campeche se consolidou como uma das regiões mais desejadas do Sul da Ilha. O bairro
            combina praia extensa, natureza, gastronomia, serviços, lançamentos imobiliários e um
            estilo de vida mais leve.
          </p>
          <p>
            No alto padrão, o Campeche oferece casas, apartamentos, coberturas e empreendimentos
            contemporâneos, muitos deles próximos ao mar ou com fácil acesso à praia.{" "}
            <BLink slug="campeche">Ver imóveis no Campeche →</BLink>
          </p>

          <H3>Novo Campeche</H3>
          <p>
            O Novo Campeche é uma das áreas mais valorizadas dentro da região do Campeche. Com ruas
            planejadas, empreendimentos contemporâneos e proximidade com a praia, o bairro atrai
            compradores que buscam imóveis modernos e estilo de vida conectado ao mar.{" "}
            <BLink slug="novo-campeche">Ver imóveis no Novo Campeche →</BLink>
          </p>

          <H3>Lagoa da Conceição</H3>
          <p>
            A Lagoa da Conceição é uma das regiões mais simbólicas de Florianópolis. O bairro
            oferece natureza, gastronomia, vida ao ar livre, esportes náuticos e um estilo de vida
            único.
          </p>
          <p>
            No segmento de alto padrão, a Lagoa reúne casas com vista, imóveis próximos à água,
            residências em meio à natureza e propriedades com forte apelo de lifestyle.{" "}
            <BLink slug="lagoa-da-conceicao">Ver imóveis na Lagoa →</BLink>
          </p>

          <H3>Praia Brava</H3>
          <p>
            A Praia Brava é uma região de alto padrão no Norte da Ilha, conhecida pelo mar aberto,
            empreendimentos contemporâneos e atmosfera de praia sofisticada.
          </p>
          <p>
            É uma escolha interessante para quem busca praia, valorização e uma experiência mais
            ligada ao litoral. <BLink slug="praia-brava">Ver imóveis na Praia Brava →</BLink>
          </p>

          <H3>Santo Antônio de Lisboa</H3>
          <p>
            Santo Antônio de Lisboa combina história, charme açoriano, gastronomia, vista para o
            mar e um dos pores do sol mais bonitos de Florianópolis.
          </p>
          <p>
            É uma opção para quem valoriza identidade, tranquilidade e sofisticação discreta.{" "}
            <BLink slug="santo-antonio-de-lisboa">Ver imóveis em Santo Antônio de Lisboa →</BLink>
          </p>

          {/* Grid de bairros destacados */}
          <div className="not-prose my-10 grid gap-3 sm:grid-cols-2">
            {REGIOES_GUIA.map((r) => (
              <Link
                key={r.slug}
                to="/imoveis/$slug"
                params={{ slug: r.slug }}
                className="group rounded-xl border border-border bg-card p-5 hover:border-foreground/30 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-display text-lg tracking-tight">{r.nome}</div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.resumo}</p>
              </Link>
            ))}
          </div>

          <H2 id="tipos">Tipos de imóveis de alto padrão mais procurados</H2>

          <H3>Apartamentos frente mar</H3>
          <p>
            Apartamentos frente mar estão entre os imóveis mais desejados de Florianópolis. A
            vista, a localização e a escassez de terrenos em áreas nobres fazem com que esse tipo
            de imóvel tenha forte apelo de valorização e liquidez.
          </p>
          <p>
            São comuns em regiões como <BLink slug="beira-mar-norte">Beira-Mar Norte</BLink>,
            Agronômica, <BLink slug="joao-paulo">João Paulo</BLink>,{" "}
            <BLink slug="cacupe">Cacupé</BLink>, <BLink slug="praia-brava">Praia Brava</BLink> e
            algumas áreas do Sul da Ilha.
          </p>

          <H3>Coberturas</H3>
          <p>
            Coberturas de alto padrão costumam atrair quem busca privacidade, vista, áreas externas
            e sensação de casa com a segurança de um edifício.
          </p>
          <p>
            Ao avaliar uma cobertura, é importante observar posição solar, vista, ventilação,
            qualidade da área externa, privacidade em relação aos prédios vizinhos, vagas de
            garagem e padrão do condomínio.
          </p>

          <H3>Casas em condomínio</H3>
          <p>
            Casas em condomínio fechado são procuradas por famílias e compradores que valorizam
            segurança, espaço, privacidade e áreas de lazer. Em Florianópolis, aparecem em regiões
            como Cacupé, Jurerê, Campeche, Rio Tavares, Lagoa da Conceição e bairros residenciais
            estratégicos.
          </p>
          <p>
            Nesse tipo de imóvel, a análise deve considerar não apenas a casa, mas também o
            condomínio, sua segurança, manutenção, vizinhança e regras internas.
          </p>

          <H3>Casas com vista</H3>
          <p>
            Casas com vista para o mar, baía, lagoa ou áreas verdes têm grande valor emocional e
            comercial. Em Florianópolis, a vista é um dos atributos que mais influenciam percepção
            de valor.
          </p>
          <p>
            No entanto, é importante avaliar acesso, inclinação do terreno, privacidade, incidência
            solar, documentação e manutenção.
          </p>

          <H3>Lançamentos imobiliários</H3>
          <p>
            Lançamentos de alto padrão são uma alternativa para quem busca imóveis modernos,
            plantas atualizadas, infraestrutura nova e possibilidade de valorização até a entrega.
          </p>
          <p>
            A escolha deve considerar reputação da construtora, localização, memorial descritivo,
            padrão de acabamento, liquidez futura e condições comerciais.
          </p>

          <H2 id="off-market">O papel dos imóveis off market no alto padrão</H2>
          <p>
            No mercado de alto padrão, nem todos os imóveis disponíveis são divulgados
            publicamente. Muitos proprietários preferem preservar privacidade, segurança e
            discrição durante o processo de venda.
          </p>
          <p>Essas oportunidades são chamadas de off market.</p>
          <p>
            Um imóvel off market pode ser apresentado apenas para compradores qualificados, com
            perfil compatível e atendimento personalizado. Esse modelo é comum em imóveis de maior
            valor, casas exclusivas, coberturas diferenciadas e propriedades em regiões muito
            valorizadas.
          </p>
          <p>
            Para o comprador, o off market pode representar acesso a oportunidades que não aparecem
            nos portais. Para o proprietário, é uma forma de vender com estratégia, sigilo e
            controle de exposição.
          </p>

          <CTABox
            to="/anuncie"
            title="Quero vender meu imóvel com discrição"
            desc="Atendimento off market para proprietários que buscam sigilo e curadoria."
          />

          <H2 id="escolher-bairro">Como escolher o melhor bairro para comprar</H2>
          <p>
            A escolha do bairro ideal depende do estilo de vida, da rotina e do objetivo da compra.
          </p>
          <p>
            Quem busca vida urbana, serviços e mobilidade tende a considerar{" "}
            <BLink slug="beira-mar-norte">Beira-Mar Norte</BLink>, Centro, Agronômica e{" "}
            <BLink slug="joao-paulo">João Paulo</BLink>.
          </p>
          <p>
            Quem prioriza praia, lazer e reconhecimento de mercado pode olhar para{" "}
            <BLink slug="jurere-internacional">Jurerê Internacional</BLink>,{" "}
            <BLink slug="praia-brava">Praia Brava</BLink>,{" "}
            <BLink slug="campeche">Campeche</BLink> e{" "}
            <BLink slug="novo-campeche">Novo Campeche</BLink>.
          </p>
          <p>
            Quem valoriza privacidade, vista e natureza pode encontrar boas oportunidades em{" "}
            <BLink slug="cacupe">Cacupé</BLink>,{" "}
            <BLink slug="santo-antonio-de-lisboa">Santo Antônio de Lisboa</BLink>,{" "}
            <BLink slug="lagoa-da-conceicao">Lagoa da Conceição</BLink>, Canto da Lagoa, Rio
            Tavares e Morro das Pedras.
          </p>
          <p>
            Mais do que escolher o bairro “mais valorizado”, o ideal é encontrar o endereço que
            combina com o momento de vida, a forma de morar e a estratégia patrimonial do
            comprador.
          </p>

          <H2 id="avaliar">O que avaliar antes de comprar um imóvel de alto padrão</H2>
          <p>Antes de avançar em uma compra, é importante analisar:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>documentação do imóvel;</li>
            <li>matrícula atualizada;</li>
            <li>regularidade da construção;</li>
            <li>padrão do condomínio;</li>
            <li>liquidez da localização;</li>
            <li>posição solar;</li>
            <li>vista real e futura;</li>
            <li>qualidade dos acabamentos;</li>
            <li>estado de conservação;</li>
            <li>custo condominial;</li>
            <li>vagas de garagem;</li>
            <li>privacidade;</li>
            <li>segurança;</li>
            <li>potencial de valorização;</li>
            <li>perfil da vizinhança;</li>
            <li>histórico da construtora, quando for lançamento.</li>
          </ul>
          <p>
            Em imóveis de alto padrão, uma escolha aparentemente estética pode ter impacto
            financeiro relevante. Por isso, a curadoria profissional é importante para filtrar
            oportunidades e reduzir riscos.
          </p>

          <H2 id="proprietarios">Para proprietários: como vender um imóvel de alto padrão</H2>
          <p>
            A venda de um imóvel de alto padrão exige posicionamento, precificação correta e
            apresentação qualificada.
          </p>
          <p>
            Fotos profissionais, vídeos, textos bem construídos, estratégia de divulgação, rede de
            relacionamento e atendimento consultivo fazem diferença no resultado.
          </p>
          <p>
            Além disso, nem todo imóvel deve ser divulgado de forma aberta. Em alguns casos, o
            formato off market pode ser mais adequado, especialmente quando o proprietário deseja
            preservar privacidade ou testar o mercado com mais controle.
          </p>
          <p>
            Uma venda bem conduzida começa antes do anúncio: começa na avaliação do imóvel, na
            leitura do público comprador e na definição da estratégia comercial.
          </p>

          <CTABox
            to="/anuncie"
            title="Anunciar meu imóvel com Michele"
            desc="Curadoria, precificação estratégica e divulgação qualificada."
          />

          <H2 id="curadoria">Curadoria imobiliária: por que ela importa</H2>
          <p>
            No alto padrão, o comprador geralmente não quer apenas uma lista de imóveis. Ele busca
            orientação, leitura de mercado, discrição e acesso a boas oportunidades.
          </p>
          <p>
            A curadoria imobiliária seleciona imóveis com base no perfil real do cliente,
            considerando localização, estilo de vida, orçamento, objetivo patrimonial, preferências
            arquitetônicas e expectativas de valorização.
          </p>
          <p>
            Esse processo economiza tempo, evita visitas improdutivas e aumenta a chance de
            encontrar um imóvel realmente alinhado.
          </p>

          <H2 id="michele">Michele dos Imóveis: atendimento especializado em Florianópolis</H2>
          <p>
            Michele Prietsch, a Michele dos Imóveis, atua com curadoria de imóveis de alto padrão
            em Florianópolis, conectando compradores, vendedores e oportunidades selecionadas nas
            principais regiões da Ilha.
          </p>
          <p>
            Com atendimento personalizado e associação à Gralha Imóveis, Michele oferece suporte
            para quem busca comprar, vender ou avaliar imóveis de alto padrão com segurança,
            discrição e estratégia.
          </p>
          <p>
            Se você procura um imóvel em Florianópolis ou deseja vender com posicionamento
            adequado, o atendimento começa pela compreensão do seu objetivo.
          </p>

          <H2 id="faq">Perguntas frequentes sobre imóveis de alto padrão em Florianópolis</H2>
          <div className="not-prose divide-y divide-border rounded-2xl border border-border overflow-hidden">
            {FAQ.map((f) => (
              <details key={f.q} className="group open:bg-secondary/40">
                <summary className="cursor-pointer list-none p-5 font-medium flex items-center justify-between gap-4">
                  <span>{f.q}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 transition group-open:rotate-90 text-muted-foreground" />
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>

          <H2 id="cta-final">Encontre seu imóvel de alto padrão em Florianópolis</H2>
          <p>
            Cada imóvel conta uma história, mas a escolha certa precisa combinar localização,
            arquitetura, estilo de vida e segurança patrimonial.
          </p>
          <p>
            Se você busca comprar ou vender um imóvel de alto padrão em Florianópolis, fale com
            Michele Prietsch e receba uma curadoria personalizada.
          </p>
        </article>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-3 text-sm font-medium hover:bg-foreground/90 transition"
          >
            <MessageCircle className="h-4 w-4" />
            Falar com Michele no WhatsApp
          </a>
          <Link
            to="/imoveis"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-5 py-3 text-sm font-medium hover:bg-foreground/5 transition"
          >
            <MapPin className="h-4 w-4" />
            Ver imóveis por região
          </Link>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 py-10 text-sm text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="font-display text-foreground">Michele dos Imóveis</div>
            <div className="mt-1">{SITE.creci} · {SITE.address.street}, {SITE.address.district} — {SITE.address.cityState}</div>
          </div>
          <Link to="/" className="hover:text-foreground">Voltar para a home →</Link>
        </div>
      </footer>
    </div>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 font-display text-2xl sm:text-3xl tracking-tight mt-12 mb-2">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-xl tracking-tight mt-8 mb-1">{children}</h3>;
}

function BLink({ slug, children }: { slug: string; children: React.ReactNode }) {
  return (
    <Link to="/imoveis/$slug" params={{ slug }} className="underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground">
      {children}
    </Link>
  );
}

function CTABox({ to, title, desc }: { to: "/anuncie"; title: string; desc: string }) {
  return (
    <div className="not-prose my-8 rounded-2xl border border-foreground/15 bg-foreground text-background p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div>
        <div className="font-display text-lg tracking-tight">{title}</div>
        <p className="mt-1 text-sm text-background/75">{desc}</p>
      </div>
      <Link
        to={to}
        className="inline-flex items-center gap-2 rounded-full bg-background text-foreground px-5 py-2.5 text-sm font-medium hover:bg-background/90 transition whitespace-nowrap"
      >
        Saber mais <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
