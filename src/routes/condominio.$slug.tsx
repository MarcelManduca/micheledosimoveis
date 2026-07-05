import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MapPin, Phone, ArrowRight, Building2, ExternalLink } from "lucide-react";
import {
  getCondominiumBySlug,
  getPropertiesForCondominium,
  listCondominiums,
  type CondominiumDetail,
} from "@/lib/condominiums.functions";
import { getNeighborhood } from "@/lib/neighborhoods";
import { PropertyCard } from "@/components/PropertyCard";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";

const SITE = "https://micheledosimoveis.com.br";
const WHATSAPP = "https://api.whatsapp.com/send?phone=5548991828828&text=";

function condoQO(slug: string) {
  return queryOptions({
    queryKey: ["condominium", slug],
    queryFn: () => getCondominiumBySlug({ data: { slug } }),
    staleTime: 60_000,
  });
}

function propsQO(condoName: string, nQuery: string | undefined) {
  return queryOptions({
    queryKey: ["condominium-properties", condoName, nQuery],
    queryFn: () =>
      getPropertiesForCondominium({
        data: { condoName, neighborhoodQuery: nQuery },
      }),
    staleTime: 30_000,
  });
}

function nearbyCondosQO(bairroSlug: string | null, excludeSlug: string) {
  return queryOptions({
    queryKey: ["nearby-condos", bairroSlug, excludeSlug],
    queryFn: async () => {
      if (!bairroSlug) return { items: [], total: 0 };
      const res = await listCondominiums({
        data: { bairroSlug, page: 1, pageSize: 12 },
      });
      return {
        ...res,
        items: res.items.filter((c) => c.slug !== excludeSlug).slice(0, 6),
      };
    },
    staleTime: 60_000,
  });
}

function buildFaq(condo: CondominiumDetail, hasProperties: boolean) {
  const bairro = condo.normalized_neighborhood ?? "Florianópolis";
  return [
    {
      q: `Onde fica o ${condo.name}?`,
      a: `O ${condo.name} está localizado em ${condo.address ?? bairro}, no bairro ${bairro}, em ${condo.city}, ${condo.state}.`,
    },
    {
      q: `O ${condo.name} tem imóveis disponíveis?`,
      a: hasProperties
        ? `Sim. Consulte na página os imóveis publicados por Michele dos Imóveis neste condomínio ou fale diretamente pelo WhatsApp para saber mais.`
        : `No momento, não há imóveis publicados neste condomínio na base de Michele dos Imóveis. Fale com Michele para consultar oportunidades off market ou imóveis semelhantes na região.`,
    },
    {
      q: `Como saber o valor de um imóvel no ${condo.name}?`,
      a: `Michele dos Imóveis realiza avaliações personalizadas considerando localização, comodidades, condições do imóvel e comparativos de mercado no bairro ${bairro}.`,
    },
    {
      q: `Posso vender meu imóvel nesse condomínio com discrição?`,
      a: `Sim. Michele dos Imóveis atende proprietários com estratégias discretas, inclusive em formato off market, quando faz sentido para o imóvel e para o mercado local.`,
    },
    {
      q: `A Michele atende compradores interessados neste condomínio?`,
      a: `Sim. Michele dos Imóveis oferece atendimento imobiliário a compradores interessados em imóveis no ${bairro} e em condomínios da região.`,
    },
  ];
}

export const Route = createFileRoute("/condominio/$slug")({
  loader: async ({ params, context }) => {
    const condo = await context.queryClient.ensureQueryData(condoQO(params.slug));
    if (!condo) throw notFound();
    const nInfo = getNeighborhood(condo.bairro_slug ?? "");
    await Promise.all([
      context.queryClient.ensureQueryData(
        propsQO(condo.name, nInfo?.query ?? condo.normalized_neighborhood ?? undefined),
      ),
      context.queryClient.ensureQueryData(
        nearbyCondosQO(condo.bairro_slug, condo.slug),
      ),
    ]);
    return { condo };
  },
  head: ({ params, loaderData }) => {
    const condo = loaderData?.condo;
    if (!condo) {
      return {
        meta: [
          { title: "Condomínio · Michele dos Imóveis" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const bairro = condo.normalized_neighborhood ?? "Florianópolis";
    const url = `${SITE}/condominio/${params.slug}`;
    const title = `${condo.name} em ${bairro}, Florianópolis | Michele dos Imóveis`;
    const description = `Conheça o ${condo.name}, localizado em ${bairro}, Florianópolis. Veja informações gerais, comodidades, imóveis próximos e fale com Michele dos Imóveis.`;

    const apartmentComplex: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "ApartmentComplex",
      name: condo.name,
      description,
      url,
      address: {
        "@type": "PostalAddress",
        streetAddress: condo.address ?? undefined,
        addressLocality: condo.city,
        addressRegion: condo.state,
        addressCountry: "BR",
      },
      amenityFeature: condo.amenities.map((a: string) => ({
        "@type": "LocationFeatureSpecification",
        name: a,
        value: true,
      })),
      mainEntityOfPage: url,
    };
    if (condo.latitude != null && condo.longitude != null) {
      apartmentComplex.geo = {
        "@type": "GeoCoordinates",
        latitude: condo.latitude,
        longitude: condo.longitude,
      };
    }

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE },
        { "@type": "ListItem", position: 2, name: "Condomínios", item: `${SITE}/condominios` },
        {
          "@type": "ListItem",
          position: 3,
          name: bairro,
          item: `${SITE}/condominios/${condo.bairro_slug ?? ""}`,
        },
        { "@type": "ListItem", position: 4, name: condo.name, item: url },
      ],
    };

    const webPage = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url,
      inLanguage: "pt-BR",
    };

    const realEstateAgent = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      name: "Michele dos Imóveis",
      url: SITE,
      telephone: "+55-48-99182-8828",
      areaServed: { "@type": "Place", name: `${bairro}, Florianópolis - SC` },
      description: "Atendimento imobiliário para compradores e proprietários na região.",
    };

    const faq = buildFaq(condo, false);
    const faqPage = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(webPage) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumb) },
        { type: "application/ld+json", children: JSON.stringify(apartmentComplex) },
        { type: "application/ld+json", children: JSON.stringify(realEstateAgent) },
        { type: "application/ld+json", children: JSON.stringify(faqPage) },
      ],
    };
  },
  component: CondominioPage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-sm text-muted-foreground">
      Não foi possível carregar o condomínio. {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-16 text-center">
      <p className="text-sm text-muted-foreground">Condomínio não encontrado ou indisponível.</p>
      <Link to="/condominios" className="mt-4 inline-block text-sm underline">
        Ver todos os condomínios
      </Link>
    </div>
  ),
});

function CondominioPage() {
  const { slug } = Route.useParams();
  const { condo } = Route.useLoaderData();
  const nInfo = getNeighborhood(condo.bairro_slug ?? "");
  const props = useQuery(
    propsQO(condo.name, nInfo?.query ?? condo.normalized_neighborhood ?? undefined),
  );
  const nearby = useQuery(nearbyCondosQO(condo.bairro_slug, condo.slug));
  const [showMap, setShowMap] = useState(false);

  const bairro = condo.normalized_neighborhood ?? "Florianópolis";
  const hasProps = (props.data?.inCondo?.length ?? 0) > 0;
  const faq = useMemo(() => buildFaq(condo, hasProps), [condo, hasProps]);

  const buyerLink =
    WHATSAPP +
    encodeURIComponent(
      `Olá, Michele. Tenho interesse em imóveis no ${condo.name}, em ${bairro}. Pode me ajudar?`,
    );
  const ownerLink =
    WHATSAPP +
    encodeURIComponent(
      `Olá, Michele. Tenho um imóvel no ${condo.name}, em ${bairro}, e gostaria de avaliar uma estratégia de venda.`,
    );

  const mapEmbed =
    condo.latitude != null && condo.longitude != null
      ? `https://www.google.com/maps?q=${condo.latitude},${condo.longitude}&z=16&output=embed`
      : null;
  const mapLink =
    condo.latitude != null && condo.longitude != null
      ? `https://www.google.com/maps?q=${condo.latitude},${condo.longitude}`
      : null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          {/* Breadcrumbs */}
          <nav aria-label="breadcrumb" className="mb-6 text-xs text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/" className="hover:text-foreground">Início</Link></li>
              <li>/</li>
              <li><Link to="/condominios" className="hover:text-foreground">Condomínios</Link></li>
              <li>/</li>
              <li>
                {condo.bairro_slug ? (
                  <Link
                    to="/condominios/$bairro"
                    params={{ bairro: condo.bairro_slug }}
                    className="hover:text-foreground"
                  >
                    {bairro}
                  </Link>
                ) : (
                  bairro
                )}
              </li>
              <li>/</li>
              <li className="text-foreground line-clamp-1">{condo.name}</li>
            </ol>
          </nav>

          {/* Hero */}
          <header className="mb-8">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Building2 className="h-4 w-4" /> Condomínio residencial
            </div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl tracking-tight">
              {condo.name}
            </h1>
            {(condo.address || bairro) && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {[condo.address, bairro, condo.city].filter(Boolean).join(", ")}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs">{bairro}</span>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs">{condo.city}</span>
              {condo.amenities.slice(0, 3).map((a: string) => (
                <span key={a} className="rounded-full bg-secondary px-3 py-1 text-xs">
                  {a}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={buyerLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                <Phone className="h-4 w-4" /> Tenho interesse nesse condomínio
              </a>
              <a
                href={ownerLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium"
              >
                Quero vender imóvel neste condomínio
              </a>
            </div>
          </header>

          {/* Resumo original */}
          <section className="prose prose-sm max-w-none">
            <p className="text-base leading-relaxed text-muted-foreground">
              O {condo.name} está localizado em {bairro}, Florianópolis, em uma região com boa
              conexão urbana e acesso a serviços, comércio e vias importantes. Esta página reúne
              informações gerais sobre localização, comodidades conhecidas e atendimento imobiliário
              para quem deseja comprar, vender ou avaliar imóveis na região.
            </p>
          </section>

          {/* Informações gerais + Comodidades */}
          <section className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-card p-6 ring-1 ring-black/5">
              <h2 className="font-display text-lg tracking-tight">Informações gerais</h2>
              <dl className="mt-4 grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Nome</dt>
                  <dd className="text-right">{condo.name}</dd>
                </div>
                {condo.address && (
                  <div className="flex justify-between gap-4 border-b border-border pb-2">
                    <dt className="text-muted-foreground">Endereço</dt>
                    <dd className="text-right">{condo.address}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Bairro</dt>
                  <dd className="text-right">{bairro}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Cidade</dt>
                  <dd className="text-right">{condo.city}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Estado</dt>
                  <dd className="text-right">{condo.state}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl bg-card p-6 ring-1 ring-black/5">
              <h2 className="font-display text-lg tracking-tight">Estrutura e comodidades</h2>
              {condo.amenities.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Informações de estrutura não disponíveis publicamente.
                </p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {condo.amenities.map((a: string) => (
                    <span
                      key={a}
                      className="rounded-full border border-border bg-background px-3 py-1 text-xs"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Imóveis disponíveis */}
          <section className="mt-14">
            <h2 className="font-display text-2xl tracking-tight">
              Imóveis disponíveis no {condo.name}
            </h2>
            {props.isLoading ? (
              <p className="mt-3 text-sm text-muted-foreground">Carregando…</p>
            ) : hasProps ? (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {props.data!.inCondo.map((p) => (
                  <PropertyCard key={p.id} p={p} />
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">
                  No momento, não há imóveis publicados neste condomínio. Fale com Michele para
                  consultar oportunidades off market ou imóveis semelhantes na região.
                </p>
                <a
                  href={buyerLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                >
                  <Phone className="h-4 w-4" /> Avise-me quando surgir imóvel
                </a>
              </div>
            )}
          </section>

          {/* Imóveis próximos no bairro */}
          {(props.data?.nearby.length ?? 0) > 0 && (
            <section className="mt-14">
              <h2 className="font-display text-2xl tracking-tight">
                Imóveis próximos em {bairro}
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {props.data!.nearby.slice(0, 6).map((p) => (
                  <PropertyCard key={p.id} p={p} />
                ))}
              </div>
              {nInfo && (
                <div className="mt-6">
                  <Link
                    to="/imoveis/$slug"
                    params={{ slug: nInfo.slug }}
                    className="inline-flex items-center gap-2 text-sm underline"
                  >
                    Ver todos os imóveis em {bairro} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Sobre o bairro */}
          {nInfo && (
            <section className="mt-14 rounded-2xl bg-card p-6 ring-1 ring-black/5">
              <h2 className="font-display text-2xl tracking-tight">Sobre morar em {bairro}</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{nInfo.intro}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/imoveis/$slug"
                  params={{ slug: nInfo.slug }}
                  className="inline-flex items-center gap-2 text-sm underline"
                >
                  Ver imóveis em {bairro}
                </Link>
                {condo.bairro_slug && (
                  <Link
                    to="/condominios/$bairro"
                    params={{ bairro: condo.bairro_slug }}
                    className="inline-flex items-center gap-2 text-sm underline"
                  >
                    Ver todos os condomínios em {bairro}
                  </Link>
                )}
              </div>
            </section>
          )}

          {/* Condomínios próximos */}
          {(nearby.data?.items.length ?? 0) > 0 && (
            <section className="mt-14">
              <h2 className="font-display text-2xl tracking-tight">Condomínios próximos</h2>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {nearby.data!.items.map((c) => (
                  <Link
                    key={c.id}
                    to="/condominio/$slug"
                    params={{ slug: c.slug }}
                    className="group rounded-2xl bg-card p-5 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <h3 className="mt-3 font-display text-base leading-tight tracking-tight line-clamp-2">
                      {c.name}
                    </h3>
                    {c.address && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{c.address}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Mapa */}
          {mapEmbed && (
            <section className="mt-14">
              <h2 className="font-display text-2xl tracking-tight">Localização</h2>
              <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-black/5">
                {showMap ? (
                  <iframe
                    title={`Mapa — ${condo.name}`}
                    src={mapEmbed}
                    className="h-[380px] w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <button
                    onClick={() => setShowMap(true)}
                    className="flex h-[220px] w-full flex-col items-center justify-center gap-2 bg-secondary text-sm text-muted-foreground hover:bg-secondary/80"
                  >
                    <MapPin className="h-6 w-6" />
                    Ver mapa da localização
                  </button>
                )}
              </div>
              {mapLink && (
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  Abrir no Google Maps <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </section>
          )}

          {/* Proprietários */}
          <section className="mt-14 rounded-2xl bg-card p-8 ring-1 ring-black/5">
            <h2 className="font-display text-2xl tracking-tight">
              Você tem imóvel no {condo.name}?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Michele dos Imóveis pode ajudar na avaliação, posicionamento e estratégia de venda do
              seu imóvel, inclusive em formato discreto ou off market.
            </p>
            <a
              href={ownerLink}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Quero avaliar meu imóvel
            </a>
          </section>

          {/* FAQ */}
          <section className="mt-14">
            <h2 className="font-display text-2xl tracking-tight">Perguntas frequentes</h2>
            <div className="mt-6 space-y-4">
              {faq.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl bg-card p-5 ring-1 ring-black/5 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium">
                    {f.q}
                    <ArrowRight className="h-4 w-4 transition group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA final */}
          <section className="mt-14 flex flex-col items-start gap-4 rounded-2xl bg-foreground p-8 text-background sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl tracking-tight">
                Fale com Michele sobre imóveis no {condo.name}
              </h2>
              <p className="mt-2 text-sm opacity-80">
                Atendimento personalizado para compradores e proprietários em {bairro}.
              </p>
            </div>
            <a
              href={buyerLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-background px-4 py-2.5 text-sm font-medium text-foreground"
            >
              <Phone className="h-4 w-4" /> Falar no WhatsApp
            </a>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
