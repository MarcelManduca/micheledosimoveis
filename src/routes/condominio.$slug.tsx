import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { lazy, Suspense, useMemo, useState } from "react";
import { MapPin, Phone, ArrowRight, Building2, ExternalLink } from "lucide-react";
import {
  getCondominiumBySlug,
  getPropertiesForCondominium,
  getCondoValueRefs,
  listCondominiums,
  type CondominiumDetail,
  type CondoValueRefs,
} from "@/lib/condominiums.functions";
import { getNeighborhood } from "@/lib/neighborhoods";
import { PropertyCard } from "@/components/PropertyCard";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import MapPlaceholder from "@/components/MapPlaceholder";
import { brl } from "@/lib/format";

const LeafletMap = lazy(() => import("@/components/LeafletMap"));


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

function refsQO(condoName: string, nQuery: string | undefined) {
  return queryOptions({
    queryKey: ["condo-value-refs", condoName, nQuery],
    queryFn: () =>
      getCondoValueRefs({ data: { condoName, neighborhoodQuery: nQuery } }),
    staleTime: 60_000,
  });
}

function formatCep(cep: string | null | undefined): string | null {
  if (!cep) return null;
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function buildFaq(condo: CondominiumDetail, hasProperties: boolean) {
  const bairro = condo.normalized_neighborhood ?? "Florianópolis";
  const addr = condo.address ?? bairro;
  const topAmen = condo.amenities.slice(0, 5);
  const amenList =
    topAmen.length > 0 ? topAmen.join(", ") : "não estão publicamente disponíveis";
  return [
    {
      q: `Onde fica o ${condo.name}?`,
      a: `O ${condo.name} fica em ${addr}, no bairro ${bairro}, em ${condo.city}/${condo.state}.`,
    },
    {
      q: `Quais comodidades existem no ${condo.name}?`,
      a: `As comodidades conhecidas incluem ${amenList}. Essas informações devem ser confirmadas no atendimento antes de qualquer decisão de compra ou venda.`,
    },
    {
      q: `Há imóveis disponíveis no ${condo.name}?`,
      a: hasProperties
        ? `Sim. Nesta página estão listados os imóveis publicados por Michele dos Imóveis neste condomínio. A disponibilidade depende dos imóveis ativos na base e pode ser confirmada diretamente com Michele.`
        : `A disponibilidade depende dos imóveis publicados na base de Michele dos Imóveis. Se não houver imóvel publicado no momento, Michele pode indicar opções semelhantes na região. Em alguns casos, também podem existir oportunidades não divulgadas publicamente.`,
    },
    {
      q: `Como saber o valor de um imóvel no ${condo.name}?`,
      a: `O valor depende de fatores como metragem, posição, conservação, vagas, vista, padrão da unidade, condomínio, IPTU e momento de mercado. Michele pode ajudar com uma avaliação personalizada.`,
    },
    {
      q: `Como anunciar um imóvel no ${condo.name}?`,
      a: `Proprietários que possuem imóvel no ${condo.name} podem falar com Michele para avaliar preço, posicionamento, documentação, apresentação comercial e estratégia de divulgação. A melhor abordagem depende do perfil do imóvel, do momento de mercado e do objetivo do proprietário.`,
    },
    {
      q: `A Michele atende compradores interessados neste condomínio?`,
      a: `Sim. Michele dos Imóveis oferece atendimento imobiliário para compradores interessados em condomínios e imóveis de alto padrão em Florianópolis.`,
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
      context.queryClient.ensureQueryData(
        refsQO(condo.name, nInfo?.query ?? condo.normalized_neighborhood ?? undefined),
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
    const description = `Conheça o ${condo.name}, em ${bairro}, Florianópolis. Veja localização, comodidades, imóveis próximos e fale com Michele dos Imóveis.`;
    const ogImage = `${SITE}/michele-dos-imoveis-og.png`;

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
        postalCode: formatCep(condo.postal_code) ?? undefined,
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
        { property: "og:image", content: ogImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
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
  const { condo } = Route.useLoaderData();
  const nInfo = getNeighborhood(condo.bairro_slug ?? "");
  const props = useQuery(
    propsQO(condo.name, nInfo?.query ?? condo.normalized_neighborhood ?? undefined),
  );
  const nearby = useQuery(nearbyCondosQO(condo.bairro_slug, condo.slug));
  const refs = useQuery(
    refsQO(condo.name, nInfo?.query ?? condo.normalized_neighborhood ?? undefined),
  );
  const [showMap, setShowMap] = useState(false);

  const bairro = condo.normalized_neighborhood ?? "Florianópolis";
  const cep = formatCep(condo.postal_code);
  const inCondoCount = props.data?.inCondo.length ?? 0;
  const nearbyPropsCount = props.data?.nearby.length ?? 0;
  const hasProps = inCondoCount > 0;
  const faq = useMemo(() => buildFaq(condo, hasProps), [condo, hasProps]);

  const buyerLink =
    WHATSAPP +
    encodeURIComponent(
      `Olá, Michele. Tenho interesse em imóveis no ${condo.name}, em ${bairro}. Pode me ajudar?`,
    );
  const ownerLink =
    WHATSAPP +
    encodeURIComponent(
      `Olá, Michele. Tenho um imóvel no ${condo.name}, em ${bairro}, e gostaria de avaliar preço e estratégia de venda.`,
    );
  const alertLink =
    WHATSAPP +
    encodeURIComponent(
      `Olá, Michele. Quero ser avisado quando surgir imóvel no ${condo.name}, em ${bairro}.`,
    );

  const hasCoords = condo.latitude != null && condo.longitude != null;
  const addressQuery = [condo.address, bairro, condo.city, condo.state]
    .filter(Boolean)
    .join(", ");
  const mapLink = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${condo.latitude},${condo.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery + ", Brasil")}`;
  const leafletQuery = addressQuery || `${bairro}, ${condo.city}, ${condo.state}, Brasil`;




  return (
    <div className="min-h-screen bg-background">
      <SiteHeader variant="light" />
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

          {/* Intro semântica */}
          <section className="prose prose-sm max-w-none">
            <p className="text-base leading-relaxed text-muted-foreground">
              O {condo.name} está localizado em {bairro}, {condo.city}/{condo.state}. Esta página
              reúne informações gerais sobre o condomínio, endereço, comodidades conhecidas,
              imóveis publicados na base de Michele dos Imóveis e opções próximas na região. Para
              compradores e proprietários, Michele oferece atendimento imobiliário personalizado,
              incluindo consulta de oportunidades off market e avaliação para venda.
            </p>
          </section>

          {/* Resumo do condomínio */}
          <section className="mt-10">
            <h2 className="font-display text-2xl tracking-tight">Resumo do condomínio</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryCard label="Nome" value={condo.name} />
              <SummaryCard label="Tipo" value="Condomínio residencial" />
              {condo.address && <SummaryCard label="Endereço" value={condo.address} />}
              <SummaryCard label="Bairro" value={bairro} />
              <SummaryCard label="Cidade / UF" value={`${condo.city}/${condo.state}`} />
              <SummaryCard
                label="Comodidades conhecidas"
                value={
                  condo.amenities.length > 0
                    ? `${condo.amenities.length} cadastradas`
                    : "Não disponíveis"
                }
              />
              <SummaryCard
                label="Imóveis publicados neste condomínio"
                value={
                  props.isLoading
                    ? "—"
                    : inCondoCount > 0
                      ? `${inCondoCount} ${inCondoCount === 1 ? "imóvel" : "imóveis"}`
                      : "Nenhum imóvel publicado no momento"
                }
              />
              <SummaryCard
                label={`Imóveis próximos em ${bairro}`}
                value={
                  props.isLoading
                    ? "—"
                    : nearbyPropsCount > 0
                      ? `${nearbyPropsCount} ${nearbyPropsCount === 1 ? "imóvel" : "imóveis"}`
                      : "Nenhum no momento"
                }
              />
            </div>
          </section>

          {/* Informações gerais + Comodidades */}
          <section className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-card p-6 ring-1 ring-black/5">
              <h2 className="font-display text-lg tracking-tight">Informações gerais</h2>
              <dl className="mt-4 grid grid-cols-1 gap-2 text-sm">
                <InfoRow label="Nome" value={condo.name} />
                {condo.address && <InfoRow label="Endereço" value={condo.address} />}
                <InfoRow label="Bairro" value={bairro} />
                <InfoRow label="Cidade" value={condo.city} />
                <InfoRow label="Estado" value={condo.state} />
                {cep && <InfoRow label="CEP" value={cep} />}
                <InfoRow label="Tipo" value="Condomínio residencial" />
                <InfoRow
                  label="Comodidades principais"
                  value={
                    condo.amenities.length > 0
                      ? condo.amenities.slice(0, 4).join(", ")
                      : "Não disponíveis"
                  }
                />
                <InfoRow label="Coordenadas disponíveis" value={hasCoords ? "Sim" : "Não"} last />
              </dl>
            </div>

            <div className="rounded-2xl bg-card p-6 ring-1 ring-black/5">
              <h2 className="font-display text-lg tracking-tight">Estrutura e comodidades</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                As comodidades cadastradas para o {condo.name} ajudam a identificar o perfil da
                estrutura disponível. As informações devem ser confirmadas no atendimento antes de
                qualquer decisão de compra ou venda.
              </p>
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
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No momento, não há imóveis publicados neste condomínio na base de Michele dos
                  Imóveis. Michele pode indicar oportunidades publicadas, imóveis semelhantes na
                  região ou opções consultadas diretamente no atendimento. Em alguns casos, também
                  podem existir oportunidades não divulgadas publicamente.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={alertLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                  >
                    <Phone className="h-4 w-4" /> Avise-me quando surgir imóvel neste condomínio
                  </a>
                  {nInfo && (
                    <Link
                      to="/imoveis/$slug"
                      params={{ slug: nInfo.slug }}
                      className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium"
                    >
                      Ver imóveis próximos em {bairro}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Imóveis próximos no bairro */}
          {nearbyPropsCount > 0 && (
            <section className="mt-14">
              <h2 className="font-display text-2xl tracking-tight">
                Imóveis próximos em {bairro}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Opções publicadas no mesmo bairro ou em regiões próximas, selecionadas a partir da
                base ativa da Michele dos Imóveis.
              </p>
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

          {/* Referências de valores */}
          {refs.data && refs.data.source !== "none" && (
            <ValueRefsSection refs={refs.data} bairro={bairro} condoName={condo.name} />
          )}



          {/* Localização */}
          <section className="mt-14">
            <h2 className="font-display text-2xl tracking-tight">
              Localização do {condo.name}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-3xl">
              O {condo.name} fica em {condo.address ?? bairro}, no bairro {bairro}, em{" "}
              {condo.city}/{condo.state}. A localização é um dos principais critérios para
              avaliar um imóvel, junto com metragem, posição, conservação, vagas, vista e
              liquidez da região.
            </p>

            <div className="mt-5 rounded-2xl bg-card p-4 ring-1 ring-black/5">
              <dl className="grid gap-2 text-sm sm:grid-cols-3">
                {condo.address && (
                  <div className="sm:col-span-3">
                    <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">Endereço</dt>
                    <dd className="mt-0.5">{condo.address}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">Bairro</dt>
                  <dd className="mt-0.5">{bairro}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">Cidade / UF</dt>
                  <dd className="mt-0.5">{condo.city}/{condo.state}</dd>
                </div>
                {cep && (
                  <div>
                    <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">CEP</dt>
                    <dd className="mt-0.5">{cep}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-black/5">
                {showMap && hasCoords ? (
                  <Suspense
                    fallback={
                      <div className="grid h-[360px] w-full place-items-center bg-secondary text-sm text-muted-foreground">
                        Carregando mapa…
                      </div>
                    }
                  >
                    <LeafletMap query={leafletQuery} title={condo.name} />
                  </Suspense>
                ) : (
                  <MapPlaceholder
                    title={condo.name}
                    address={condo.address}
                    canOpen={hasCoords}
                    onOpen={() => setShowMap(true)}
                  />
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {hasCoords && !showMap && (
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                  >
                    <MapPin className="h-4 w-4" /> Ver mapa da localização
                  </button>
                )}
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir localização do ${condo.name} no Google Maps`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                >
                  Abrir no Google Maps <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </section>


          {/* Sobre o bairro */}
          <section className="mt-14 rounded-2xl bg-card p-6 ring-1 ring-black/5">
            <h2 className="font-display text-2xl tracking-tight">Sobre morar em {bairro}</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {nInfo?.intro
                ? nInfo.intro
                : `${bairro} é uma região de ${condo.city} com oferta de serviços, comércio, mobilidade e diferentes perfis de imóveis. Para quem pesquisa condomínios no bairro, é importante avaliar localização, estrutura do prédio, perfil do entorno, liquidez e disponibilidade de imóveis semelhantes.`}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {nInfo && (
                <Link
                  to="/imoveis/$slug"
                  params={{ slug: nInfo.slug }}
                  className="inline-flex items-center gap-2 text-sm underline"
                >
                  Ver imóveis em {bairro}
                </Link>
              )}
              {condo.bairro_slug && (
                <Link
                  to="/condominios/$bairro"
                  params={{ bairro: condo.bairro_slug }}
                  className="inline-flex items-center gap-2 text-sm underline"
                >
                  Ver condomínios em {bairro}
                </Link>
              )}
            </div>
          </section>

          {/* Condomínios próximos */}
          {(nearby.data?.items.length ?? 0) > 0 && (
            <section className="mt-14">
              <h2 className="font-display text-2xl tracking-tight">Condomínios próximos</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Outros condomínios cadastrados no mesmo bairro ou em regiões próximas.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {nearby.data!.items.map((c) => (
                  <Link
                    key={c.id}
                    to="/condominio/$slug"
                    params={{ slug: c.slug }}
                    className="group flex flex-col rounded-2xl bg-card p-5 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <h3 className="mt-3 font-display text-base leading-tight tracking-tight line-clamp-2">
                      {c.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.normalized_neighborhood ?? bairro}
                    </p>
                    {c.address && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                        {c.address}
                      </p>
                    )}
                    {c.amenities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {c.amenities.slice(0, 3).map((a) => (
                          <span
                            key={a}
                            className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-foreground group-hover:underline">
                      Ver condomínio <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Proprietários */}
          <section className="mt-14 rounded-2xl bg-card p-8 ring-1 ring-black/5">
            <h2 className="font-display text-2xl tracking-tight">
              Você tem imóvel no {condo.name}?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Michele dos Imóveis pode ajudar na avaliação, posicionamento e divulgação do seu
              imóvel, considerando preço, apresentação, documentação, público comprador e
              estratégia comercial.
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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-black/5">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-sm font-medium leading-snug">{value}</div>
    </div>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={`flex justify-between gap-4 ${last ? "" : "border-b border-border pb-2"}`}
    >
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

function ValueRefsSection({
  refs,
  bairro,
  condoName,
}: {
  refs: CondoValueRefs;
  bairro: string;
  condoName: string;
}) {
  const isCondo = refs.source === "condo";
  const heading = isCondo
    ? "Referências dos imóveis publicados"
    : "Referências de imóveis no bairro";
  const subtitle = isCondo
    ? `Calculado a partir de ${refs.count} ${refs.count === 1 ? "imóvel publicado" : "imóveis publicados"} no ${condoName}.`
    : `Calculado a partir de ${refs.count} imóveis publicados em ${bairro}.`;

  const items: { label: string; value: string }[] = [];
  if (refs.minPrice != null) items.push({ label: "Preço mínimo", value: brl(refs.minPrice) });
  if (refs.medianPrice != null) items.push({ label: "Preço mediano", value: brl(refs.medianPrice) });
  if (refs.maxPrice != null) items.push({ label: "Preço máximo", value: brl(refs.maxPrice) });
  if (refs.avgCondoFee != null) items.push({ label: "Condomínio médio", value: brl(refs.avgCondoFee) });
  if (refs.avgIptu != null) items.push({ label: "IPTU médio", value: brl(refs.avgIptu) });
  if (refs.avgArea != null) items.push({ label: "Área média", value: `${refs.avgArea} m²` });
  if (refs.commonBedrooms != null)
    items.push({ label: "Dormitórios mais comuns", value: String(refs.commonBedrooms) });
  if (refs.commonParking != null)
    items.push({ label: "Vagas mais comuns", value: String(refs.commonParking) });

  if (items.length === 0) return null;

  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl tracking-tight">{heading}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <div key={i.label} className="rounded-xl bg-card p-4 ring-1 ring-black/5">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {i.label}
            </div>
            <div className="mt-1.5 text-sm font-medium leading-snug">{i.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground max-w-3xl">
        Os valores apresentados são referências aproximadas calculadas a partir dos imóveis
        publicados na base de Michele dos Imóveis ou de informações cadastradas. Condomínio,
        IPTU, disponibilidade, metragens e demais dados podem variar conforme unidade,
        atualização cadastral e negociação. As informações devem ser confirmadas no atendimento
        antes de qualquer decisão.
      </p>
    </section>
  );
}
