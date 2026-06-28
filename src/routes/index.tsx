import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, MapPin, Bath, BedDouble, Maximize, Star, Phone, Instagram, Mail, ShieldCheck, Camera, LineChart, Users, Sparkles, Lock, EyeOff } from "lucide-react";
import heroImg from "@/assets/hero-beiramar.jpg";
import portrait from "@/assets/michele-portrait.jpg";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";
import { listProperties, type PropertyListItem } from "@/lib/properties.functions";
import { ChromaGrid, type ChromaItem } from "@/components/ChromaGrid";
import { useIsMobile } from "@/hooks/use-mobile";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Michele Prietsch | Michele dos Imóveis em Florianópolis" },
      { name: "description", content: "Michele Prietsch, conhecida como Michele dos Imóveis, é corretora especializada em imóveis de alto padrão em Florianópolis, com atendimento personalizado para compra, venda e curadoria imobiliária." },
      { property: "og:title", content: "Michele Prietsch | Michele dos Imóveis em Florianópolis" },
      { property: "og:description", content: "Corretora especializada em imóveis de alto padrão em Florianópolis — curadoria, discrição e atendimento sob medida em Jurerê Internacional, Praia Brava, Cacupé, Lagoa da Conceição, Campeche e Beira-Mar Norte." },
      { property: "og:image", content: heroImg },
      { property: "og:url", content: "https://micheledosimoveis.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://micheledosimoveis.lovable.app/" }],
  }),

  loader: () => listProperties(),
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen grid place-items-center px-6 text-center">
      <div>
        <h1 className="font-display text-3xl">Não foi possível carregar</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={reset} className="mt-6 text-sm underline">Tentar novamente</button>
      </div>
    </div>
  ),
  component: Index,
});

const WHATSAPP_URL =
  "https://api.whatsapp.com/send?phone=5548991828828&text=" +
  encodeURIComponent("Olá Michele! Vi sua página e gostaria de saber mais sobre imóveis de alto padrão em Florianópolis.");

const REGIOES = [
  { nome: "Centro / Beira Mar Norte", desc: "Vista mar e localização central" },
  { nome: "Agronômica", desc: "Próximo ao centro, vista privilegiada" },
  { nome: "Jurerê Internacional", desc: "Endereço mais exclusivo da Ilha" },
  { nome: "Jurerê Tradicional", desc: "Praia familiar e tranquila" },
  { nome: "Praia Brava", desc: "Mar aberto e arquitetura contemporânea" },
  { nome: "João Paulo", desc: "Vista para a baía, alto padrão residencial" },
  { nome: "Cacupé", desc: "Mar calmo, pôr do sol e exclusividade" },
  { nome: "Santo Antônio de Lisboa", desc: "Charme açoriano à beira-mar" },
  { nome: "Itacorubi", desc: "Bairro nobre, próximo a tudo" },
  { nome: "Trindade", desc: "Centralidade e valorização constante" },
  { nome: "Santa Mônica", desc: "Residencial, arborizado, alto padrão" },
  { nome: "Córrego Grande", desc: "Tranquilidade a minutos do centro" },
  { nome: "Lagoa da Conceição", desc: "Estilo de vida único na Ilha" },
  { nome: "Canto da Lagoa", desc: "Reserva, natureza e exclusividade" },
  { nome: "Campeche", desc: "Praia, lifestyle e novos lançamentos" },
  { nome: "Novo Campeche", desc: "Empreendimentos contemporâneos pé na areia" },
  { nome: "Rio Tavares", desc: "Casas em condomínio com amplo terreno" },
  { nome: "Morro das Pedras", desc: "Vista mar aberta e privacidade" },
];




const fallbackProperties = [
  { img: prop1, code: "MP-1042", name: "Edifício Mira Mare", neighborhood: "Beira Mar Norte, Florianópolis", beds: 4, baths: 5, area: "320 m²", price: "R$ 6.900.000" },
  { img: prop2, code: "MP-1078", name: "Cobertura Vista Baía", neighborhood: "Beira Mar Norte, Florianópolis", beds: 4, baths: 6, area: "480 m²", price: "R$ 12.500.000" },
  { img: prop3, code: "MP-1101", name: "Residencial Costa Norte", neighborhood: "Beira Mar Norte, Florianópolis", beds: 3, baths: 4, area: "245 m²", price: "R$ 4.200.000" },
];

function brl(n: number | null) {
  if (n == null) return "Sob consulta";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

const BIO_FULL = [
  "Sou Michele Prietsch, corretora de imóveis com 16 anos de experiência no mercado imobiliário e atuação especializada em imóveis de alto padrão em Florianópolis. Gaúcha de origem e apaixonada pela Ilha, encontrei em Florianópolis o cenário ideal para unir minha trajetória profissional à qualidade de vida, à arquitetura e ao estilo de vida que tornam a cidade uma das mais desejadas do Brasil.",
  "Embora meu nome seja Michele Prietsch, muitos clientes passaram a me chamar carinhosamente de Michele dos Imóveis — um apelido que nasceu da minha presença constante no mercado imobiliário, da forma próxima como conduzo cada atendimento e da dedicação em conectar pessoas aos imóveis certos em Florianópolis. Com o tempo, esse nome se tornou parte da minha identidade profissional e da minha marca pessoal.",
  "Atendo compradores, vendedores e investidores que buscam uma experiência imobiliária personalizada, segura e transparente. Meu trabalho vai além da intermediação: envolve escuta ativa, curadoria criteriosa, análise de perfil, leitura de mercado e acompanhamento próximo em cada etapa da negociação.",
  "Atuo em regiões valorizadas de Florianópolis, incluindo Jurerê Internacional, Praia Brava, Cacupé, Lagoa da Conceição, Campeche, Morro das Pedras, Centro, Beira-Mar Norte, Agronômica, Itacorubi, Trindade, Santa Mônica e Córrego Grande, sempre com foco em imóveis que combinam localização, arquitetura, conforto, liquidez e estilo de vida.",
  "Apaixonada por arquitetura, fotografia e produção de conteúdo, apresento cada imóvel de forma autêntica e estratégica, destacando não apenas suas características técnicas, mas também a experiência de morar, investir ou viver naquele endereço.",
  "Meu compromisso é tornar a compra ou venda de imóveis em Florianópolis uma jornada mais leve, segura e memorável, conectando pessoas a imóveis que fazem sentido para seu momento de vida.",
  "Será um prazer acompanhar você nessa escolha.",
];

function AboutBio() {
  const [expanded, setExpanded] = useState(false);
  // Preview limits: ~650 chars desktop, ~480 mobile. We render the full text
  // in the DOM (for SEO) and use CSS line-clamp to control visible length.
  return (
    <div className="mt-6">
      <div
        className={
          expanded
            ? "space-y-4 text-muted-foreground leading-relaxed"
            : "space-y-4 text-muted-foreground leading-relaxed [&>p:nth-child(n+2)]:hidden sm:[&>p:nth-child(n+2)]:hidden"
        }
      >
        {BIO_FULL.map((p, i) => (
          <p key={i}>
            {i === 0 ? (
              <>
                Sou <strong className="text-foreground font-medium">Michele Prietsch</strong>
                {p.slice("Sou Michele Prietsch".length)}
              </>
            ) : (
              p
            )}
          </p>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline transition"
      >
        {expanded ? "Mostrar menos" : "Ler mais sobre Michele"}
        <ArrowRight className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>
    </div>
  );
}



function Index() {
  const dbProperties = (Route.useLoaderData() ?? []) as PropertyListItem[];
  const live = useQuery({
    queryKey: ["properties-home"],
    queryFn: () => listProperties(),
    initialData: dbProperties,
  });
  const items = live.data ?? dbProperties;
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Nav */}
      <header className="absolute top-0 left-0 right-0 z-30">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-5 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3">
            <span className="sr-only">Michele Prietsch</span>
          </a>


          <nav className="hidden md:flex items-center gap-9 text-sm text-white/90">
            <a href="#top" className="hover:text-white transition">Início</a>
            <a href="#imoveis" className="hover:text-white transition">Imóveis</a>
            <a href="#regioes" className="hover:text-white transition">Regiões</a>
            <a href="#anuncie" className="hover:text-white transition">Anuncie</a>
            <a href="#sobre" className="hover:text-white transition">Sobre</a>
            <a href="#contato" className="hover:text-white transition">Contato</a>

          </nav>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background pl-4 pr-2 py-2 text-sm font-medium shadow-lg hover:bg-foreground/90 transition"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span className="hidden sm:inline">Receber atendimento</span>
            <span className="sm:hidden">Atendimento</span>
            <span className="ml-1 grid h-7 w-7 place-items-center rounded-full bg-background text-foreground group-hover:translate-x-0.5 transition">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative px-3 sm:px-5 pt-3">
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px]">
          <img
            src={heroImg}
            alt="Imóvel de alto padrão em Florianópolis com vista para o mar"
            width={1920}
            height={1280}
            className="h-[88vh] min-h-[600px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/70" />

          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
              <div className="max-w-2xl text-white">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs uppercase tracking-[0.18em] ring-1 ring-white/20">
                  <MapPin className="h-3.5 w-3.5" /> Florianópolis · Alto padrão
                </span>
                <h1 className="mt-6 font-display font-light leading-[0.95] tracking-tight text-[clamp(3rem,8vw,6.5rem)]">
                  Michele<br />
                  <span className="italic">dos Imóveis.</span>
                </h1>
                <p className="mt-6 max-w-xl text-base sm:text-lg text-white/85">
                  Imóveis de alto padrão nos melhores endereços de Florianópolis —
                  de Jurerê Internacional à Lagoa da Conceição, da Beira Mar Norte
                  ao Campeche. Curadoria, discrição e atendimento sob medida.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <a
                    href="#imoveis"
                    className="group inline-flex items-center gap-3 rounded-full bg-white text-foreground pl-6 pr-2 py-2 text-sm font-medium hover:bg-white/95 transition"
                  >
                    Explorar imóveis
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background group-hover:translate-x-0.5 transition">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </a>
                  <a
                    href="#sobre"
                    className="text-sm text-white/90 underline-offset-4 hover:underline px-2 py-2"
                  >
                    Conheça a corretora
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Floating broker card */}
          <div className="absolute bottom-5 right-5 sm:bottom-8 sm:right-8 hidden sm:flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur px-4 py-3 shadow-2xl ring-1 ring-black/5">
            <img
              src={portrait}
              alt="Michele Prietsch"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
            />
            <div>
              <div className="text-sm font-medium text-foreground">Michele Prietsch</div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <span className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </span>
                <span className="ml-1">5,0 · CRECI/SC</span>
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                <ShieldCheck className="h-3 w-3" /> Corretora associada · Gralha Imóveis
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip — Gralha badge */}
        <div className="mx-auto max-w-7xl mt-8 sm:mt-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 rounded-2xl bg-secondary/60 ring-1 ring-black/5 px-6 py-5 text-center sm:text-left">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-600/10 text-emerald-700 ring-1 ring-emerald-600/20">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Selo de autoridade</div>
              <div className="mt-1 font-display text-lg sm:text-xl tracking-tight">
                Corretora associada à <span className="italic">Gralha Imóveis</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground max-w-xl">
                Respaldo de uma das imobiliárias mais tradicionais de Florianópolis —
                segurança jurídica, curadoria e portfólio exclusivo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section id="imoveis" className="mx-auto max-w-7xl px-6 sm:px-10 py-24 sm:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Imóveis em destaque
            </div>
            <h2 className="mt-3 font-display font-light text-4xl sm:text-5xl tracking-tight">
              Uma seleção <span className="italic">para morar bem em Floripa.</span>
            </h2>
          </div>
          <p className="max-w-sm text-muted-foreground">
            Apartamentos, coberturas, casas e lançamentos nos bairros mais
            valorizados da Ilha — todos vistoriados pessoalmente pela Michele.
          </p>

        </div>

        <ChromaGridProperties items={items} />
      </section>

      {/* Regiões de atuação — SEO/GEO */}
      <section id="regioes" className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-24 sm:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Onde a Michele atua
              </div>
              <h2 className="mt-3 font-display font-light text-4xl sm:text-5xl tracking-tight">
                Os melhores endereços de <span className="italic">Florianópolis.</span>
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                Cobertura completa nos bairros e praias mais valorizados da Ilha de
                Santa Catarina — do Norte ao Sul, da orla à reserva. Conheço cada
                rua, cada empreendimento e cada vista. Selecione a região do seu
                interesse e receba opções sob medida.
              </p>
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {REGIOES.map((r) => (
              <li key={r.nome}>
                <a
                  href={`${WHATSAPP_URL.split("&text=")[0]}&text=${encodeURIComponent(`Olá Michele! Tenho interesse em imóveis de alto padrão em ${r.nome}, Florianópolis.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-4 rounded-2xl bg-card ring-1 ring-black/5 px-5 py-4 hover:shadow-lg hover:ring-black/10 transition"
                >
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 ring-1 ring-black/5">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-lg tracking-tight">{r.nome}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{r.desc}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 mt-2 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-sm text-muted-foreground text-center max-w-3xl mx-auto">
            Imóveis de alto padrão em Florianópolis: apartamentos frente mar,
            coberturas duplex, casas em condomínio fechado e lançamentos
            exclusivos em Jurerê Internacional, Jurerê Tradicional, Praia Brava,
            Beira Mar Norte, Agronômica, João Paulo, Cacupé, Santo Antônio de
            Lisboa, Itacorubi, Trindade, Santa Mônica, Córrego Grande, Lagoa da
            Conceição, Canto da Lagoa, Campeche, Novo Campeche, Rio Tavares e
            Morro das Pedras.
          </p>
        </div>
      </section>

      {/* Anuncie seu imóvel — captação de alto padrão */}
      <section id="anuncie" className="relative bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-24 sm:py-32">
          <div className="grid gap-14 lg:grid-cols-[1.1fr,1fr] lg:items-start">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-background/60">
                Para proprietários
              </div>
              <h2 className="mt-4 font-display font-light text-4xl sm:text-5xl leading-[1.05] tracking-tight">
                Anuncie seu imóvel de alto padrão em <span className="italic">Florianópolis.</span>
              </h2>
              <h3 className="mt-5 font-display text-xl sm:text-2xl text-background/80 tracking-tight">
                Venda com estratégia, discrição e acesso aos compradores certos.
              </h3>
              <p className="mt-6 text-background/75 leading-relaxed">
                Vender um imóvel de alto padrão exige mais do que simplesmente anunciar. Exige leitura de mercado, posicionamento correto, precificação estratégica, apresentação visual de qualidade e acesso aos compradores certos.
              </p>
              <p className="mt-4 text-background/75 leading-relaxed">
                <strong className="text-background font-medium">Michele Prietsch</strong>, também conhecida como <em>Michele dos Imóveis</em>, oferece uma curadoria imobiliária personalizada para proprietários que desejam vender imóveis de luxo e alto luxo em Florianópolis com segurança, discrição e alto nível de profissionalismo.
              </p>
              <p className="mt-4 text-background/75 leading-relaxed">
                O trabalho envolve análise criteriosa do imóvel, ferramentas avançadas de precificação, produção de fotos e vídeos profissionais, estratégia de divulgação nas redes sociais e endereçamento direto a clientes de carteira com perfil compatível.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={`https://api.whatsapp.com/send?phone=5548991828828&text=${encodeURIComponent("Olá, Michele. Tenho interesse em anunciar meu imóvel com curadoria de alto padrão e gostaria de entender como funciona o processo.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-3 rounded-full bg-background text-foreground pl-6 pr-2 py-2 text-sm font-medium hover:bg-background/95 transition"
                >
                  Quero anunciar meu imóvel
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background group-hover:translate-x-0.5 transition">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </a>
                <a
                  href={`https://api.whatsapp.com/send?phone=5548991828828&text=${encodeURIComponent("Olá, Michele. Tenho um imóvel de alto padrão e gostaria de conversar sobre uma venda Off Market, com sigilo e discrição.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-background/85 underline-offset-4 hover:underline px-2 py-2"
                >
                  Tenho interesse em venda Off Market
                </a>
              </div>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: LineChart, title: "Precificação estratégica", desc: "Ferramentas avançadas e leitura de mercado para uma faixa de valor competitiva e coerente com o alto padrão de Florianópolis." },
                { icon: Camera, title: "Fotos e vídeos profissionais", desc: "Produção visual que valoriza arquitetura, acabamentos, ambientes e o estilo de vida que o imóvel proporciona." },
                { icon: Sparkles, title: "Divulgação qualificada", desc: "Exposição em redes sociais, canais digitais e base de relacionamento, sempre respeitando o posicionamento premium do imóvel." },
                { icon: Users, title: "Clientes de carteira", desc: "Endereçamento ativo a compradores e investidores com perfil compatível — sem exposição genérica." },
                { icon: ShieldCheck, title: "Atendimento consultivo", desc: "Acompanhamento próximo da avaliação à negociação, com transparência, critério e discrição." },
              ].map(({ icon: Icon, title, desc }) => (
                <li
                  key={title}
                  className="rounded-2xl bg-background/[0.06] ring-1 ring-background/10 p-5 backdrop-blur-sm"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-background/10 ring-1 ring-background/15">
                    <Icon className="h-4 w-4 text-background" />
                  </span>
                  <div className="mt-4 font-display text-lg tracking-tight text-background">{title}</div>
                  <p className="mt-1.5 text-sm text-background/70 leading-relaxed">{desc}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Off Market — card premium destacado */}
          <div className="mt-16 sm:mt-20 relative overflow-hidden rounded-[28px] sm:rounded-[36px] ring-1 ring-[#C8A464]/40 bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-black p-8 sm:p-14">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#C8A464]/10 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr,1.2fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#C8A464]/15 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#E6C68A] ring-1 ring-[#C8A464]/30">
                  <Lock className="h-3.5 w-3.5" /> Exclusivo · Sigiloso
                </div>
                <h3 className="mt-5 font-display font-light text-3xl sm:text-4xl leading-[1.1] tracking-tight text-background">
                  Venda <span className="italic text-[#E6C68A]">Off Market</span>: sigilo para imóveis de luxo e alto luxo.
                </h3>
                <div className="mt-6 flex items-center gap-4 text-sm text-background/70">
                  <span className="inline-flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-[#E6C68A]" /> Sem exposição em portais
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline-flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#E6C68A]" /> Rede com +200 corretores
                  </span>
                </div>
              </div>

              <div>
                <p className="text-background/80 leading-relaxed">
                  Nem todo proprietário deseja expor publicamente a venda do seu imóvel. No mercado de luxo e alto luxo, cresce a busca por negociações <strong className="text-background font-medium">Off Market</strong> — uma estratégia em que o imóvel é apresentado de forma reservada, apenas para compradores e profissionais selecionados.
                </p>
                <p className="mt-4 text-background/75 leading-relaxed">
                  Para proprietários que valorizam privacidade, discrição e controle sobre a exposição, Michele Prietsch atua com divulgação interna e sigilosa. Por meio de uma rede com conexão a mais de 200 corretores, o imóvel é apresentado a profissionais qualificados e potenciais compradores sem exposição aberta nos portais ou redes sociais.
                </p>
                <p className="mt-4 text-background/75 leading-relaxed">
                  Essa abordagem preserva a imagem do proprietário, protege informações sensíveis e aumenta a precisão na busca por compradores realmente alinhados ao perfil do imóvel.
                </p>

                <a
                  href={`https://api.whatsapp.com/send?phone=5548991828828&text=${encodeURIComponent("Olá, Michele. Tenho um imóvel de alto padrão e gostaria de conversar sobre uma venda Off Market, com sigilo e discrição.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[#C8A464] text-black pl-6 pr-2 py-2 text-sm font-medium hover:bg-[#d4b478] transition"
                >
                  Conversar sobre venda Off Market
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-black text-[#E6C68A] group-hover:translate-x-0.5 transition">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </a>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-background/60 max-w-3xl mx-auto">
            Seu imóvel merece mais do que um anúncio. Merece estratégia, curadoria e compradores qualificados.
          </p>
        </div>
      </section>

      {/* About */}

      <section id="sobre" className="bg-secondary/60 border-y border-border">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-24 sm:py-32 grid gap-14 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <img
              src={portrait}
              alt="Michele Prietsch, corretora de imóveis de alto padrão em Florianópolis"
              loading="lazy"
              width={800}
              height={800}
              className="w-full max-w-md rounded-[28px] object-cover aspect-square shadow-xl"
            />
            <div className="absolute -bottom-6 -right-2 sm:right-10 rounded-2xl bg-background px-5 py-4 shadow-xl ring-1 ring-black/5">
              <div className="font-display text-3xl">+16 anos</div>
              <div className="text-xs text-muted-foreground mt-1">no mercado imobiliário</div>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Corretora de imóveis de alto padrão em Florianópolis
            </div>
            <h2 className="mt-3 font-display font-light text-4xl sm:text-5xl tracking-tight">
              Mais que vender imóveis,<br />
              <span className="italic">conectar histórias em Florianópolis.</span>
            </h2>

            <AboutBio />

            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { n: "+16 anos", l: "no mercado imobiliário" },
                { n: "150+", l: "imóveis negociados" },
                { n: "R$ 380M", l: "em VGV transacionado" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-background p-5 ring-1 ring-black/5">
                  <div className="font-display text-2xl">{s.n}</div>
                  <div className="mt-1 text-xs text-muted-foreground leading-snug">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* CTA / Contato */}
      <section id="contato" className="mx-auto max-w-7xl px-6 sm:px-10 py-24 sm:py-32">
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-foreground text-background p-10 sm:p-16">
          <div className="grid gap-10 lg:grid-cols-[1.4fr,1fr] lg:items-end">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-background/60">
                Vamos conversar
              </div>
              <h2 className="mt-4 font-display font-light text-4xl sm:text-6xl leading-[1] tracking-tight">
                Encontre o seu<br />
                <span className="italic">endereço em Floripa.</span>
              </h2>
              <p className="mt-6 max-w-md text-background/70">
                Conte o bairro, o estilo de vida e o orçamento que você procura.
                Em poucas horas eu retorno com uma seleção personalizada —
                inclusive imóveis fora do mercado.
              </p>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-background text-foreground pl-6 pr-2 py-2 text-sm font-medium hover:bg-background/90 transition"
              >
                Falar no WhatsApp
                <span className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            </div>

            <ul className="space-y-4 text-sm text-background/85">
              <li className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-background/10">
                  <Phone className="h-4 w-4" />
                </span>
                +55 (48) 9 9182-8828
              </li>
              <li>
                <a
                  href="mailto:micheledosimoveis@gmail.com"
                  className="flex items-center gap-3 hover:text-background transition"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-background/10">
                    <Mail className="h-4 w-4" />
                  </span>
                  Enviar e-mail
                </a>
              </li>

              <li>
                <a
                  href="https://www.instagram.com/micheledosimoveis"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 hover:text-background transition"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-background/10">
                    <Instagram className="h-4 w-4" />
                  </span>
                  @micheledosimoveis
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-background/10">
                  <MapPin className="h-4 w-4" />
                </span>
                Florianópolis/SC · Norte, Centro, Leste e Sul da Ilha
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-12 grid gap-8 md:grid-cols-3 text-sm text-muted-foreground">
          <div>
            <div className="font-display text-base text-foreground">Michele Prietsch · Imóveis</div>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" /> Corretora associada · Gralha Imóveis
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-foreground/70">Credenciais</div>
            <p className="mt-2 leading-relaxed">
              Michele Prietsch<br />
              CRECI 69502 · CRECI 11463J
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-foreground/70">Endereço</div>
            <p className="mt-2 leading-relaxed">
              Rua Alvares de Brito, 285<br />
              Centro · Florianópolis/SC
            </p>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 sm:px-10 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Michele Prietsch · Todos os direitos reservados.</span>
            <Link to="/auth" className="text-muted-foreground/70 hover:text-foreground transition">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const CHROMA_PALETTE: Array<{ border: string; gradient: string }> = [
  { border: "#C8A464", gradient: "linear-gradient(145deg, #C8A464, #0b0b0b)" },
  { border: "#1E3A5F", gradient: "linear-gradient(180deg, #1E3A5F, #0b0b0b)" },
  { border: "#0F766E", gradient: "linear-gradient(165deg, #0F766E, #0b0b0b)" },
  { border: "#8B5E3C", gradient: "linear-gradient(195deg, #8B5E3C, #0b0b0b)" },
  { border: "#4B5563", gradient: "linear-gradient(225deg, #4B5563, #0b0b0b)" },
  { border: "#9CA3AF", gradient: "linear-gradient(135deg, #9CA3AF, #0b0b0b)" },
];

function ChromaGridProperties({ items }: { items: PropertyListItem[] }) {
  const chromaItems: ChromaItem[] = items.length > 0
    ? items.map((p, i) => {
        const tone = CHROMA_PALETTE[i % CHROMA_PALETTE.length];
        return {
          image: p.cover_image ?? "",
          title: p.title,
          subtitle: [p.neighborhood, p.city].filter(Boolean).join(", "),
          handle: `Cód. ${p.code}`,
          location: brl(p.price_brl),
          borderColor: tone.border,
          gradient: tone.gradient,
          url: `/imovel/${p.code}`,
        };
      })
    : fallbackProperties.map((p, i) => {
        const tone = CHROMA_PALETTE[i % CHROMA_PALETTE.length];
        return {
          image: p.img,
          title: p.name,
          subtitle: p.neighborhood,
          handle: `Cód. ${p.code}`,
          location: p.price,
          borderColor: tone.border,
          gradient: tone.gradient,
          url: WHATSAPP_URL,
        };
      });

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {chromaItems.map((c, i) => (
          <a
            key={i}
            href={c.url ?? "#"}
            target={c.url?.startsWith("http") ? "_blank" : undefined}
            rel={c.url?.startsWith("http") ? "noopener noreferrer" : undefined}
            className="block overflow-hidden rounded-2xl border border-border bg-card"
            style={{ background: c.gradient }}
          >
            <div className="aspect-[4/3] overflow-hidden p-2">
              <img src={c.image} alt={c.title} loading="lazy" className="h-full w-full rounded-xl object-cover" />
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 px-4 pb-4 pt-2 text-white">
              <div className="min-w-0">
                <h3 className="truncate text-base font-medium">{c.title}</h3>
                {c.subtitle && <p className="truncate text-xs text-white/70">{c.subtitle}</p>}
                {c.handle && <span className="text-[11px] text-white/60">{c.handle}</span>}
              </div>
              {c.location && <span className="shrink-0 text-sm font-medium">{c.location}</span>}
            </div>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" style={{ minHeight: 600 }}>
      <ChromaGrid items={chromaItems} radius={320} damping={0.45} fadeOut={0.6} ease="power3.out" />
    </div>
  );
}

