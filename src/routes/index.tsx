import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin, Bath, BedDouble, Maximize, Star, Phone, Instagram, Mail, ShieldCheck } from "lucide-react";
import heroImg from "@/assets/hero-beiramar.jpg";
import portrait from "@/assets/michele-portrait.jpg";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";
import { listProperties, type PropertyListItem } from "@/lib/properties.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Michele dos Imóveis — Alto padrão em Florianópolis | Jurerê, Beira Mar, Lagoa, Campeche" },
      { name: "description", content: "Corretora de imóveis de alto padrão em Florianópolis: Jurerê Internacional, Beira Mar Norte, Praia Brava, Lagoa da Conceição, Campeche, Santo Antônio de Lisboa e principais bairros e praias da Ilha." },
      { property: "og:title", content: "Michele dos Imóveis — Alto padrão em Florianópolis" },
      { property: "og:description", content: "Apartamentos, casas e coberturas de luxo nos melhores endereços de Florianópolis." },
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
            alt="Apartamento de alto padrão na Beira Mar Norte com vista para o mar"
            width={1920}
            height={1280}
            className="h-[88vh] min-h-[600px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/70" />

          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
              <div className="max-w-2xl text-white">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs uppercase tracking-[0.18em] ring-1 ring-white/20">
                  <MapPin className="h-3.5 w-3.5" /> Beira Mar Norte · Florianópolis
                </span>
                <h1 className="mt-6 font-display font-light leading-[0.95] tracking-tight text-[clamp(3rem,8vw,6.5rem)]">
                  Michele<br />
                  <span className="italic">dos Imóveis.</span>
                </h1>
                <p className="mt-6 max-w-md text-base sm:text-lg text-white/85">
                  Imóveis de alto padrão em frente ao mar. Curadoria, discrição e
                  atendimento sob medida para quem busca morar — ou investir — bem.
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
              Uma seleção <span className="italic">à beira-mar.</span>
            </h2>
          </div>
          <p className="max-w-sm text-muted-foreground">
            Apartamentos, coberturas e lançamentos com vista para a Baía Norte —
            todos vistoriados pessoalmente pela Michele.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.length > 0
            ? items.map((p) => (
                <Link
                  key={p.id}
                  to="/imovel/$code"
                  params={{ code: p.code }}
                  className="group block overflow-hidden rounded-3xl bg-card ring-1 ring-black/5 hover:shadow-2xl transition-shadow"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    {p.cover_image && (
                      <img
                        src={p.cover_image}
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-foreground">
                      Venda
                    </span>
                    <span className="absolute top-4 right-4 rounded-full bg-black/55 backdrop-blur px-3 py-1 text-xs text-white">
                      Cód. {p.code}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {[p.neighborhood, p.city].filter(Boolean).join(", ")}
                    </div>
                    <h3 className="mt-2 font-display text-2xl tracking-tight line-clamp-2">
                      {p.title}
                    </h3>
                    <div className="mt-4 flex items-center gap-5 text-sm text-muted-foreground">
                      {p.bedrooms != null && (
                        <span className="inline-flex items-center gap-1.5">
                          <BedDouble className="h-4 w-4" /> {p.bedrooms}
                        </span>
                      )}
                      {p.bathrooms != null && (
                        <span className="inline-flex items-center gap-1.5">
                          <Bath className="h-4 w-4" /> {p.bathrooms}
                        </span>
                      )}
                      {p.area_m2 != null && (
                        <span className="inline-flex items-center gap-1.5">
                          <Maximize className="h-4 w-4" /> {p.area_m2} m²
                        </span>
                      )}
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                      <div>
                        <div className="text-xs text-muted-foreground">A partir de</div>
                        <div className="font-display text-xl">{brl(p.price_brl)}</div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:text-accent transition">
                        Detalhes <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            : fallbackProperties.map((p) => (
                <article
                  key={p.code}
                  className="group overflow-hidden rounded-3xl bg-card ring-1 ring-black/5 hover:shadow-2xl transition-shadow"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={p.img}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-foreground">
                      Venda
                    </span>
                    <span className="absolute top-4 right-4 rounded-full bg-black/55 backdrop-blur px-3 py-1 text-xs text-white">
                      Cód. {p.code}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {p.neighborhood}
                    </div>
                    <h3 className="mt-2 font-display text-2xl tracking-tight">{p.name}</h3>
                    <div className="mt-4 flex items-center gap-5 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><BedDouble className="h-4 w-4" /> {p.beds}</span>
                      <span className="inline-flex items-center gap-1.5"><Bath className="h-4 w-4" /> {p.baths}</span>
                      <span className="inline-flex items-center gap-1.5"><Maximize className="h-4 w-4" /> {p.area}</span>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                      <div>
                        <div className="text-xs text-muted-foreground">A partir de</div>
                        <div className="font-display text-xl">{p.price}</div>
                      </div>
                      <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent transition"
                      >
                        Detalhes <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
        </div>
      </section>

      {/* About */}
      <section id="sobre" className="bg-secondary/60 border-y border-border">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-24 sm:py-32 grid gap-14 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <img
              src={portrait}
              alt="Retrato da corretora Michele Prietsch"
              loading="lazy"
              width={800}
              height={800}
              className="w-full max-w-md rounded-[28px] object-cover aspect-square shadow-xl"
            />
            <div className="absolute -bottom-6 -right-2 sm:right-10 rounded-2xl bg-background px-5 py-4 shadow-xl ring-1 ring-black/5">
              <div className="font-display text-3xl">+12 anos</div>
              <div className="text-xs text-muted-foreground mt-1">no mercado de alto padrão</div>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sobre</div>
            <h2 className="mt-3 font-display font-light text-4xl sm:text-5xl tracking-tight">
              Mais que vender imóveis,<br />
              <span className="italic">conectar histórias.</span>
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Sou <strong className="text-foreground font-medium">Michele Prietsch</strong>, corretora
              especializada em imóveis de alto padrão em Florianópolis, com atuação dedicada à
              Av. Beira Mar Norte e entorno. Trabalho com escuta, curadoria criteriosa e
              total discrição — para que cada negociação seja tão única quanto o imóvel que a representa.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { n: "150+", l: "imóveis negociados" },
                { n: "R$ 380M", l: "em VGV transacionado" },
                { n: "98%", l: "clientes recorrentes" },
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
                <span className="italic">endereço à beira-mar.</span>
              </h2>
              <p className="mt-6 max-w-md text-background/70">
                Conte o que você procura. Em poucas horas eu retorno com uma seleção
                personalizada — inclusive opções fora do mercado.
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

              <li className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-background/10">
                  <Instagram className="h-4 w-4" />
                </span>
                @michele.prietsch
              </li>
              <li className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-background/10">
                  <MapPin className="h-4 w-4" />
                </span>
                Av. Beira Mar Norte · Florianópolis/SC
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
