import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useState } from "react";
import { ArrowRight, MapPin, Star, Phone, Instagram, Mail, ShieldCheck, Rocket, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-beiramar.jpg";
import heroImg2 from "@/assets/hero-beiramar-2.jpg";
import heroImg3 from "@/assets/hero-beiramar-3.jpg";
import heroImg4 from "@/assets/hero-beiramar-4.jpg";
import portrait from "@/assets/michele-portrait.jpg";
import portraitHover from "@/assets/michele-portrait-2.jpg";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";
import { listLaunches, listProperties, type PropertyListItem } from "@/lib/properties.functions";
import type { ChromaItem } from "@/components/ChromaGrid";
import { useIsMobile } from "@/hooks/use-mobile";
import { PropertyFilters } from "@/components/PropertyFilters";
import { PropertyCard } from "@/components/PropertyCard";
import { LazyVisible } from "@/components/LazyVisible";
import dome01 from "@/assets/dome/michele-01.jpg.asset.json";
import dome02 from "@/assets/dome/michele-02.jpg.asset.json";
import dome03 from "@/assets/dome/michele-03.jpg.asset.json";
import dome04 from "@/assets/dome/michele-04.jpg.asset.json";
import dome05 from "@/assets/dome/michele-05.jpg.asset.json";
import dome06 from "@/assets/dome/michele-06.jpg.asset.json";
import dome07 from "@/assets/dome/michele-07.jpg.asset.json";
import dome08 from "@/assets/dome/michele-08.jpg.asset.json";
import dome09 from "@/assets/dome/michele-09.jpg.asset.json";
import dome10 from "@/assets/dome/michele-10.jpg.asset.json";
import dome11 from "@/assets/dome/michele-11.jpg.asset.json";
import dome12 from "@/assets/dome/michele-12.jpg.asset.json";
import dome13 from "@/assets/dome/michele-13.jpg.asset.json";
import dome14 from "@/assets/dome/michele-14.jpg.asset.json";
import dome15 from "@/assets/dome/michele-15.jpg.asset.json";

// Lazy-loaded heavy components (GSAP / 3D). Mounted only when scrolled into view.
const ChromaGrid = lazy(() =>
  import("@/components/ChromaGrid").then((m) => ({ default: m.ChromaGrid })),
);
const DomeGallery = lazy(() => import("@/components/DomeGallery.jsx"));


const DOME_IMAGES = [
  dome01, dome02, dome03, dome04, dome05, dome06, dome07, dome08,
  dome09, dome10, dome11, dome12, dome13, dome14, dome15,
].map((a, i) => ({ src: a.url, alt: `Michele Prietsch - foto ${i + 1}` }));


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
    links: [
      { rel: "canonical", href: "https://micheledosimoveis.lovable.app/" },
      { rel: "preload", as: "image", href: heroImg, fetchpriority: "high" } as any,
    ],
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
            <Link to="/anuncie" className="hover:text-white transition">Anuncie</Link>
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
          <div className="relative h-[88vh] min-h-[600px] w-full overflow-hidden">
            <img
              src={heroImg}
              alt="Imóvel de alto padrão em Florianópolis com vista para o mar"
              width={1920}
              height={1280}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover origin-center animate-hero-fade-a will-change-transform motion-reduce:animate-none"
            />
            <img
              src={heroImg3}
              alt="Skyline da Beira-Mar Norte ao entardecer"
              width={1920}
              height={1280}
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className="absolute inset-0 h-full w-full object-cover origin-center animate-hero-fade-b will-change-transform motion-reduce:animate-none motion-reduce:opacity-0"
            />
            <img
              src={heroImg4}
              alt="Orla da Beira-Mar Norte com edifícios à beira da baía"
              width={1920}
              height={1280}
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className="absolute inset-0 h-full w-full object-cover origin-center animate-hero-fade-d will-change-transform motion-reduce:animate-none motion-reduce:opacity-0"
            />
            <img
              src={heroImg2}
              alt="Vista aérea da Beira-Mar Norte em Florianópolis"
              width={2000}
              height={1333}
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className="absolute inset-0 h-full w-full object-cover origin-center animate-hero-fade-c will-change-transform motion-reduce:animate-none motion-reduce:opacity-0"
            />
          </div>
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
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Atendimento Certificado</div>
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

      {/* Filtros de busca */}
      <section id="filtros" className="mx-auto max-w-7xl px-6 sm:px-10 pt-20 sm:pt-28">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Pesquisa de imóveis
          </div>
          <h2 className="mt-3 font-display font-light text-3xl sm:text-4xl tracking-tight">
            Encontre o imóvel <span className="italic">ideal para você.</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Filtre por tipo, bairro, dormitórios e faixa de preço.
          </p>
        </div>
        <div className="mt-8">
          <PropertyFilters />
        </div>
      </section>

      {/* Featured Properties */}
      <LaunchesAndFeatured items={items} />

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

      {/* CTA — Anuncie seu imóvel (link para página dedicada) */}
      <section id="anuncie" className="mx-auto max-w-7xl px-6 sm:px-10 py-20 sm:py-28">
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0b0b0b] text-background p-10 sm:p-16 ring-1 ring-[#C8A464]/30">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#C8A464]/15 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1.4fr,1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#C8A464]/15 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#E6C68A] ring-1 ring-[#C8A464]/30">
                <Sparkles className="h-3.5 w-3.5" /> Para proprietários
              </div>
              <h2 className="mt-5 font-display font-light text-3xl sm:text-5xl leading-[1.05] tracking-tight">
                Anuncie seu imóvel com <span className="italic text-[#E6C68A]">curadoria de alto padrão.</span>
              </h2>
              <p className="mt-5 max-w-xl text-background/75 leading-relaxed">
                Venda com estratégia, discrição e acesso aos compradores certos. Precificação,
                produção visual profissional, divulgação qualificada e a opção de venda{" "}
                <strong className="text-background font-medium">Off Market</strong> sigilosa.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <Link
                to="/anuncie"
                className="group inline-flex items-center justify-between gap-3 rounded-full bg-[#C8A464] text-black pl-6 pr-2 py-3 text-sm font-medium hover:bg-[#d4b478] transition"
              >
                Quero anunciar meu imóvel
                <span className="grid h-9 w-9 place-items-center rounded-full bg-black text-[#E6C68A] group-hover:translate-x-0.5 transition">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link
                to="/anuncie"
                className="inline-flex items-center justify-center gap-2 rounded-full ring-1 ring-background/30 text-background/90 px-5 py-3 text-sm hover:bg-background/10 transition"
              >
                Saber mais sobre venda Off Market
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* About */}

      <section id="sobre" className="bg-secondary/60 border-y border-border">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-24 sm:py-32 grid gap-14 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <div className="group relative w-full max-w-md aspect-square rounded-[28px] overflow-hidden shadow-xl">
              <img
                src={portrait}
                alt="Michele Prietsch, corretora de imóveis de alto padrão em Florianópolis"
                loading="lazy"
                width={800}
                height={800}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
              />
              <img
                src={portraitHover}
                alt=""
                aria-hidden="true"
                loading="lazy"
                width={800}
                height={800}
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100"
              />
            </div>
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

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { n: "+16 anos", l: "no mercado imobiliário" },
                { n: "150+", l: "imóveis negociados" },
                { n: "R$ 380M", l: "em VGV transacionado" },
                { n: "16k", l: "seguidores no Instagram" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-background p-5 ring-1 ring-black/5">
                  <div className="font-display text-2xl">{s.n}</div>
                  <div className="mt-1 text-xs text-muted-foreground leading-snug">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dome Gallery - faixa horizontal abaixo dos indicadores */}
        <div className="mx-auto max-w-7xl px-6 sm:px-10 pb-24 sm:pb-32 -mt-4">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
            Bastidores · Michele em cena
          </div>
          <div
            className="relative w-full overflow-hidden rounded-[24px] ring-1 ring-black/5 bg-secondary/60"
            style={{ aspectRatio: "21 / 9" }}
            aria-label="Galeria de fotos de Michele Prietsch"
          >
            <DomeGallery
              images={DOME_IMAGES}
              grayscale={true}
              fit={0.5}
              fitBasis="width"
              minRadius={320}
              maxRadius={900}
              padFactor={0.14}
              overlayBlurColor="#ece8df"
              openedImageWidth="360px"
              openedImageHeight="360px"
              imageBorderRadius="12px"
              openedImageBorderRadius="20px"
              segments={30}
            />

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
            <div className="font-display text-base text-foreground">Michele dos Imóveis</div>
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
              R. Alves de Brito, 285<br />
              Centro · Florianópolis/SC

            </p>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 sm:px-10 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Michele Prietsch · Todos os direitos reservados.</span>
            <div className="flex items-center gap-4">
              <Link to="/privacidade" className="text-muted-foreground/80 hover:text-foreground transition">
                Privacidade & LGPD
              </Link>
              <Link to="/auth" className="text-muted-foreground/70 hover:text-foreground transition">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar com Michele no WhatsApp"
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white pl-4 pr-5 py-3 text-sm font-medium shadow-2xl ring-1 ring-black/10 hover:bg-[#1ebe57] transition"
      >
        <span className="relative grid h-6 w-6 place-items-center">
          <span className="absolute inset-0 rounded-full bg-white/40 animate-ping" />
          <svg viewBox="0 0 32 32" className="relative h-6 w-6" fill="currentColor" aria-hidden="true">
            <path d="M19.11 17.27c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47l-.52-.01c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27 0 1.34.97 2.63 1.11 2.81.14.18 1.91 2.91 4.62 4.08.65.28 1.15.45 1.55.58.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32zM16.01 4C9.39 4 4 9.39 4 16.01c0 2.12.56 4.19 1.62 6.01L4 28l6.16-1.61a11.94 11.94 0 0 0 5.84 1.5h.01C22.62 27.89 28 22.5 28 15.88 28 9.27 22.63 4 16.01 4z"/>
          </svg>
        </span>
        <span>WhatsApp</span>
      </a>
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
            className="block overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            style={{ background: c.gradient }}
          >
            <div className="aspect-[4/3] overflow-hidden p-2">
              <img src={c.image} alt={c.title} loading="lazy" className="h-full w-full rounded-xl object-cover transition-transform duration-700 hover:scale-[1.04]" />
            </div>
            <div className="space-y-3 px-4 pb-4 pt-2 text-white">
              <div className="flex items-center justify-between gap-3">
                {c.handle && (
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70 ring-1 ring-white/15">
                    {c.handle}
                  </span>
                )}
                <span className="text-xs text-white/55">Ver detalhes →</span>
              </div>
              <div>
                <h3 className="line-clamp-2 text-base font-medium leading-snug">{c.title}</h3>
                {c.subtitle && <p className="mt-1 truncate text-xs text-white/65">{c.subtitle}</p>}
              </div>
              {c.location && (
                <div className="flex items-end justify-between gap-3 border-t border-white/10 pt-3">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-white/45">Valor</span>
                  <span className="shrink-0 text-lg font-semibold">{c.location}</span>
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    );
  }

  const cols = Math.max(1, Math.min(chromaItems.length, 3));
  return (
    <div className="relative">
      <ChromaGrid items={chromaItems} columns={cols} radius={320} damping={0.45} fadeOut={0.6} ease="power3.out" />
    </div>
  );

}

function ExpandableProperties({
  items,
  viewAllHref,
  viewAllSearch,
}: {
  items: PropertyListItem[];
  viewAllHref: string;
  viewAllSearch?: Record<string, string>;
}) {
  const [expanded, setExpanded] = useState(false);
  const INITIAL = 6;
  const EXPANDED = 12;
  const visibleCount = expanded ? Math.min(items.length, EXPANDED) : Math.min(items.length, INITIAL);
  const visible = items.slice(0, visibleCount);
  const canExpand = !expanded && items.length > INITIAL;
  const showViewAll = expanded && items.length > EXPANDED;


  return (
    <div className="space-y-10">
      <ChromaGridProperties items={visible} />
      {(canExpand || showViewAll) && (
        <div className="flex justify-center">
          {canExpand ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-sm font-medium tracking-wide hover:bg-foreground hover:text-background transition-colors"
            >
              Ver mais imóveis
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <Link
              to={viewAllHref as any}
              search={viewAllSearch as any}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium tracking-wide text-background hover:bg-foreground/90 transition-colors"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}




function LaunchesAndFeatured({ items }: { items: PropertyListItem[] }) {
  const launches = useQuery({
    queryKey: ["launches-home"],
    queryFn: () => listLaunches(),
    initialData: [] as PropertyListItem[],
  });
  const launchItems = launches.data ?? [];

  return (
    <>
      <section id="imoveis" className="mx-auto max-w-7xl px-6 sm:px-10 py-20 sm:py-24">
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

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum imóvel marcado como destaque no momento. Veja todos os imóveis na{" "}
            <Link to="/buscar" className="underline">pesquisa</Link>.
          </p>
        ) : (
          <ExpandableProperties items={items} viewAllHref="/buscar" />
        )}
      </section>

      {launchItems.length > 0 && (
        <section id="lancamentos" className="border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6 sm:px-10 py-20 sm:py-24">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-700">
                  <Rocket className="h-3.5 w-3.5" /> Lançamentos imobiliários
                </div>
                <h2 className="mt-3 font-display font-light text-4xl sm:text-5xl tracking-tight">
                  Novos empreendimentos em <span className="italic">Florianópolis.</span>
                </h2>
              </div>
              <p className="max-w-sm text-muted-foreground">
                Empreendimentos contemporâneos e oportunidades de investimento em
                lançamentos selecionados nas regiões mais valorizadas da Ilha.
              </p>
            </div>
            <ExpandableProperties items={launchItems} viewAllHref="/buscar" />

          </div>
        </section>
      )}
    </>
  );
}
