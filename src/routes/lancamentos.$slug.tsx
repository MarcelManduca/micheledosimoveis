import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import {
  Building2,
  CalendarClock,
  ExternalLink,
  FileText,
  MapPin,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { ENABLE_LAUNCHES_VERTICAL } from "@/lib/feature-flags";
import { getPublicDevelopment } from "@/lib/launches-public.functions";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import MapPlaceholder from "@/components/MapPlaceholder";
import { areaRange, priceRange, stageLabel } from "@/components/launches/LaunchCard";
import { brl } from "@/lib/format";
import { SITE as SITE_INFO, buildWhatsAppUrl } from "@/lib/site-config";

const LeafletMap = lazy(() => import("@/components/LeafletMap"));
const SITE = "https://micheledosimoveis.com.br";

export const Route = createFileRoute("/lancamentos/$slug")({
  beforeLoad: () => {
    if (!ENABLE_LAUNCHES_VERTICAL) throw notFound();
  },
  loader: async ({ params }) => {
    const development = await getPublicDevelopment({ data: { slug: params.slug } });
    if (!development) throw notFound();
    return { development };
  },
  head: ({ params, loaderData }) => {
    const url = `${SITE}/lancamentos/${params.slug}`;
    if (!loaderData) {
      return {
        meta: [{ title: "Lançamento não encontrado" }, { name: "robots", content: "noindex, nofollow" }],
      };
    }
    const d = loaderData.development;
    const title = d.seo_title || `${d.name} — ${d.neighborhood ?? d.city} | Michele dos Imóveis`;
    const description =
      d.seo_description ||
      `${d.name}, ${stageLabel(d.stage).toLowerCase()} ${d.neighborhood ? `no bairro ${d.neighborhood}` : ""} em ${d.city}. Unidades, plantas e condições com Michele dos Imóveis.`.replace(
        /\s+/g,
        " ",
      );
    const image = d.cover_image ?? d.gallery?.[0] ?? null;

    const schemas: Record<string, unknown>[] = [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description,
        url,
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE },
          { "@type": "ListItem", position: 2, name: "Lançamentos", item: `${SITE}/lancamentos` },
          { "@type": "ListItem", position: 3, name: d.name, item: url },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "ApartmentComplex",
        name: d.name,
        url,
        ...(image ? { image } : {}),
        ...(d.description ? { description: d.description } : {}),
        ...(d.amenities?.length ? { amenityFeature: d.amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: a })) } : {}),
        address: {
          "@type": "PostalAddress",
          streetAddress: d.address ?? undefined,
          addressLocality: d.city,
          addressRegion: d.state,
          postalCode: d.postal_code ?? undefined,
          addressCountry: "BR",
        },
        ...(d.latitude && d.longitude
          ? { geo: { "@type": "GeoCoordinates", latitude: d.latitude, longitude: d.longitude } }
          : {}),
        ...(d.units.length ? { numberOfAvailableAccommodationUnits: d.stats.units_available } : {}),
      },
      {
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        name: "Michele dos Imóveis",
        url: SITE,
        telephone: SITE_INFO.phoneDisplay,
        areaServed: "Florianópolis, SC",
      },
    ];

    if (d.developer) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: d.developer.name,
        url: `${SITE}/construtoras/${d.developer.slug}`,
        ...(d.developer.logo_url ? { logo: d.developer.logo_url } : {}),
        ...(d.developer.website ? { sameAs: [d.developer.website] } : {}),
      });
    }

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image", content: image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(image ? [{ name: "twitter:image", content: image }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(schemas) }],
    };
  },
  component: LancamentoDetalhe,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader variant="light" />
      <main className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="text-2xl font-semibold">Lançamento não encontrado</h1>
        <p className="mt-3 text-muted-foreground">
          Este empreendimento não está disponível publicamente.
        </p>
        <Link to="/" className="mt-6 inline-flex rounded-full border border-border px-5 py-3 text-sm">
          Voltar ao início
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-foreground">
      Não foi possível carregar o lançamento. {error.message}
    </div>
  ),
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function youtubeId(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{6,})/);
  return m?.[1] ?? null;
}

function LancamentoDetalhe() {
  const { development: d } = Route.useLoaderData();
  const [showMap, setShowMap] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const hero = d.cover_image ?? d.gallery?.[0] ?? null;
  const gallery = (d.gallery ?? []).filter((g) => g !== hero);
  const area = areaRange(d.stats.area_min, d.stats.area_max);
  const videoId = youtubeId(d.video_url);
  const mapQuery = [d.address, d.neighborhood, d.city, d.state].filter(Boolean).join(", ");
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery || d.name)}`;
  const whatsapp = buildWhatsAppUrl(
    `Olá Michele! Tenho interesse no empreendimento ${d.name}${d.neighborhood ? ` (${d.neighborhood})` : ""}. Pode me enviar mais informações?`,
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader variant="light" />

      <main className="pb-20 pt-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <nav aria-label="Trilha" className="mb-4 text-xs text-muted-foreground">
            <Link to="/" className="hover:underline">
              Início
            </Link>
            <span className="mx-1.5">/</span>
            <Link to="/lancamentos" className="hover:underline">
              Lançamentos
            </Link>
            <span className="mx-1.5">/</span>
            <span>{d.name}</span>
          </nav>

          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-secondary">
            {hero ? (
              <img
                src={hero}
                alt={`${d.name} — ${d.neighborhood ?? d.city}`}
                width={1600}
                height={900}
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-muted-foreground">
                <Building2 className="h-10 w-10" />
              </div>
            )}
          </div>

          <header className="mt-8">
            <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium">
              {stageLabel(d.stage)}
            </span>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{d.name}</h1>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {[d.neighborhood, d.city].filter(Boolean).join(" · ")}
              </span>
              {d.developer ? (
                <Link
                  to="/construtoras/$slug"
                  params={{ slug: d.developer.slug }}
                  className="inline-flex items-center gap-1.5 hover:underline"
                >
                  <Building2 className="h-4 w-4" />
                  {d.developer.name}
                </Link>
              ) : null}
              {d.delivery_estimate ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4" />
                  Entrega {d.delivery_estimate}
                </span>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
              >
                Falar no WhatsApp
              </a>
              {d.units.length > 0 ? (
                <a
                  href="#unidades"
                  className="rounded-full border border-border px-5 py-3 text-sm font-medium"
                >
                  Ver unidades disponíveis
                </a>
              ) : null}
              {d.brochure_url ? (
                <a
                  href={d.brochure_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium"
                >
                  <FileText className="h-4 w-4" /> Book do empreendimento
                </a>
              ) : null}
            </div>
          </header>

          {(d.stats.price_min !== null || area || d.stats.bedrooms.length) ? (
            <dl className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Valores</dt>
                <dd className="mt-1 font-medium">
                  {priceRange(d.stats.price_min, d.stats.price_max)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Áreas</dt>
                <dd className="mt-1 font-medium">{area ?? "Sob consulta"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Dormitórios</dt>
                <dd className="mt-1 font-medium">
                  {d.stats.bedrooms.length ? `${d.stats.bedrooms.join(", ")} dorm.` : "Sob consulta"}
                </dd>
              </div>
            </dl>
          ) : null}

          {d.description ? (
            <Section title="Sobre o empreendimento">
              <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                {d.description}
              </p>
            </Section>
          ) : null}

          {gallery.length ? (
            <Section title="Galeria">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {gallery.slice(0, 12).map((src, i) => (
                  <img
                    key={src + i}
                    src={src}
                    alt={`${d.name} — imagem ${i + 2}`}
                    width={800}
                    height={600}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full rounded-2xl object-cover"
                  />
                ))}
              </div>
            </Section>
          ) : null}

          {(d.architecture || d.landscaping || d.interiors) ? (
            <Section title="Projeto">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Arquitetura", d.architecture],
                  ["Paisagismo", d.landscaping],
                  ["Interiores", d.interiors],
                ]
                  .filter(([, v]) => v)
                  .map(([label, value]) => (
                    <div key={label as string} className="rounded-2xl border border-border p-5">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                      <p className="mt-1.5 text-sm">{value}</p>
                    </div>
                  ))}
              </div>
            </Section>
          ) : null}

          {d.amenities?.length ? (
            <Section title="Comodidades">
              <ul className="flex flex-wrap gap-2">
                {d.amenities.map((a) => (
                  <li
                    key={a}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> {a}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {videoId ? (
            <Section title="Vídeo">
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-secondary">
                {showVideo ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
                    title={`Vídeo do empreendimento ${d.name}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowVideo(true)}
                    className="grid h-full w-full place-items-center gap-2 text-muted-foreground"
                  >
                    <PlayCircle className="h-12 w-12" />
                    <span className="text-sm">Reproduzir vídeo</span>
                  </button>
                )}
              </div>
            </Section>
          ) : null}

          {d.units.length ? (
            <section id="unidades" className="mt-12 scroll-mt-24">
              <h2 className="text-xl font-semibold">Unidades disponíveis</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Unidades reais em carteira, vinculadas ao empreendimento.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {d.units.map((u) => {
                  const inner = (
                    <>
                      <p className="font-medium">{u.unit_name ?? u.property?.title ?? "Unidade"}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {[
                          u.area_m2 ? `${Math.round(u.area_m2)} m²` : null,
                          u.bedrooms ? `${u.bedrooms} dorm.` : null,
                          u.suites ? `${u.suites} suíte(s)` : null,
                          u.parking_spots ? `${u.parking_spots} vaga(s)` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Detalhes sob consulta"}
                      </p>
                      <p className="mt-2 text-sm font-medium">{brl(u.price_brl)}</p>
                      {u.floor_plan_url ? (
                        <span className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" /> Planta disponível
                        </span>
                      ) : null}
                      {!u.is_available ? (
                        <span className="mt-2 inline-block text-xs text-muted-foreground">
                          Indisponível
                        </span>
                      ) : null}
                    </>
                  );
                  return u.property?.code ? (
                    <Link
                      key={u.id}
                      to="/imovel/$code"
                      params={{ code: u.property.code }}
                      className="rounded-2xl border border-border bg-card p-5 transition hover:shadow-md"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div key={u.id} className="rounded-2xl border border-border bg-card p-5">
                      {inner}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          <Section title="Localização">
            <div className="overflow-hidden rounded-2xl border border-border">
              {showMap ? (
                <Suspense
                  fallback={<div className="grid h-72 place-items-center text-sm text-muted-foreground">Carregando mapa…</div>}
                >
                  <LeafletMap query={mapQuery || `${d.name}, Florianópolis`} title={d.name} />
                </Suspense>
              ) : (
                <MapPlaceholder
                  title={d.name}
                  address={d.address}
                  canOpen
                  onOpen={() => setShowMap(true)}
                />
              )}
            </div>
            <a
              href={gmaps}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Abrir no Google Maps
            </a>
          </Section>

          <section className="mt-14 rounded-3xl border border-border bg-card p-8 text-center">
            <h2 className="text-xl font-semibold">Quer condições e disponibilidade atualizadas?</h2>
            <p className="mt-2 text-muted-foreground">
              Michele acompanha a negociação do início ao fim, com informações direto da fonte.
            </p>
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background"
            >
              Falar no WhatsApp
            </a>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
