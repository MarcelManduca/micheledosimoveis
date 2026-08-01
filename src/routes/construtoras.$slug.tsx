import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { Building2, CalendarClock, ExternalLink, Instagram, MapPin } from "lucide-react";
import { ENABLE_LAUNCHES_VERTICAL } from "@/lib/feature-flags";
import { getDeveloperRelated, getPublicDeveloper } from "@/lib/launches-public.functions";
import type { PublicDevelopmentCard } from "@/lib/launches-public";
import { LaunchCard } from "@/components/launches/LaunchCard";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import MapPlaceholder from "@/components/MapPlaceholder";
import { buildWhatsAppUrl } from "@/lib/site-config";

const LeafletMap = lazy(() => import("@/components/LeafletMap"));
const SITE = "https://micheledosimoveis.com.br";

export const Route = createFileRoute("/construtoras/$slug")({
  beforeLoad: () => {
    if (!ENABLE_LAUNCHES_VERTICAL) throw notFound();
  },
  loader: async ({ params }) => {
    const data = await getPublicDeveloper({ data: { slug: params.slug } });
    if (!data) throw notFound();
    const related = await getDeveloperRelated({ data: { developerId: data.developer.id } });
    return { ...data, related };
  },
  head: ({ params, loaderData }) => {
    const url = `${SITE}/construtoras/${params.slug}`;
    if (!loaderData) {
      return {
        meta: [{ title: "Construtora não encontrada" }, { name: "robots", content: "noindex, nofollow" }],
      };
    }
    const dev = loaderData.developer;
    const title = dev.seo_title || `${dev.name} — lançamentos em Florianópolis | Michele dos Imóveis`;
    const description =
      dev.seo_description ||
      `Conheça a construtora ${dev.name} e seus empreendimentos acompanhados por Michele dos Imóveis em ${dev.city ?? "Florianópolis"}.`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        ...(dev.logo_url ? [{ property: "og:image", content: dev.logo_url }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(dev.logo_url ? [{ name: "twitter:image", content: dev.logo_url }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify([
            { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Início", item: SITE },
                { "@type": "ListItem", position: 2, name: "Lançamentos", item: `${SITE}/lancamentos` },
                { "@type": "ListItem", position: 3, name: dev.name, item: url },
              ],
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: dev.name,
              url,
              ...(dev.logo_url ? { logo: dev.logo_url } : {}),
              ...(dev.description ? { description: dev.description } : {}),
              ...(dev.founded_year ? { foundingDate: String(dev.founded_year) } : {}),
              ...(dev.city
                ? {
                    address: {
                      "@type": "PostalAddress",
                      addressLocality: dev.city,
                      addressRegion: dev.state ?? "SC",
                      addressCountry: "BR",
                    },
                  }
                : {}),
              sameAs: [dev.website, dev.instagram].filter(Boolean),
            },
            {
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              name: "Michele dos Imóveis",
              url: SITE,
              areaServed: "Florianópolis, SC",
            },
          ]),
        },
      ],
    };
  },
  component: ConstrutoraDetalhe,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader variant="light" />
      <main className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="text-2xl font-semibold">Construtora não encontrada</h1>
        <Link to="/" className="mt-6 inline-flex rounded-full border border-border px-5 py-3 text-sm">
          Voltar ao início
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-foreground">
      Não foi possível carregar a construtora. {error.message}
    </div>
  ),
});

function ConstrutoraDetalhe() {
  const { developer: dev, developments, delivered } = Route.useLoaderData();
  const related = Route.useLoaderData().related as DeveloperRelated;
  const [showMap, setShowMap] = useState(false);

  const mapQuery = [dev.city, dev.state].filter(Boolean).join(", ");
  const whatsapp = buildWhatsAppUrl(
    `Olá Michele! Gostaria de saber mais sobre os empreendimentos da construtora ${dev.name}.`,
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader variant="light" />

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-28 sm:px-8">
        <nav aria-label="Trilha" className="mb-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">
            Início
          </Link>
          <span className="mx-1.5">/</span>
          <Link to="/lancamentos" className="hover:underline">
            Lançamentos
          </Link>
          <span className="mx-1.5">/</span>
          <span>{dev.name}</span>
        </nav>

        <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {dev.logo_url ? (
            <img
              src={dev.logo_url}
              alt={`Logo ${dev.name}`}
              width={240}
              height={120}
              decoding="async"
              className="h-24 w-auto max-w-[220px] rounded-2xl border border-border bg-card object-contain p-3"
            />
          ) : (
            <div className="grid h-24 w-24 place-items-center rounded-2xl border border-border bg-card text-muted-foreground">
              <Building2 className="h-8 w-8" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">{dev.name}</h1>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {dev.city ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {dev.city}
                  {dev.state ? `/${dev.state}` : ""}
                </span>
              ) : null}
              {dev.founded_year ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4" /> Desde {dev.founded_year}
                </span>
              ) : null}
              {dev.website ? (
                <a
                  href={dev.website}
                  target="_blank"
                  rel="noreferrer nofollow"
                  className="inline-flex items-center gap-1.5 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" /> Site oficial
                </a>
              ) : null}
              {dev.instagram ? (
                <a
                  href={dev.instagram.startsWith("http") ? dev.instagram : `https://instagram.com/${dev.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer nofollow"
                  className="inline-flex items-center gap-1.5 hover:underline"
                >
                  <Instagram className="h-4 w-4" /> Instagram
                </a>
              ) : null}
            </div>
          </div>
        </header>

        {dev.description ? (
          <p className="mt-8 max-w-3xl whitespace-pre-line leading-relaxed text-muted-foreground">
            {dev.description}
          </p>
        ) : null}

        <dl className="mt-8 grid gap-x-6 gap-y-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["Fundação", dev.founded_year ? String(dev.founded_year) : null],
              ["Cidade sede", [dev.city, dev.state].filter(Boolean).join("/") || null],
              ["Empreendimentos publicados", String(related.stats.published)],
              [
                "Unidades disponíveis",
                related.stats.unitsAvailable > 0 ? String(related.stats.unitsAvailable) : "Sob consulta",
              ],
            ] as Array<[string, string | null]>
          )
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-sm font-medium">{value}</dd>
              </div>
            ))}
        </dl>

        <section className="mt-12">
          <h2 className="text-xl font-semibold">Lançamentos publicados</h2>
          {developments.length ? (
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {developments.map((item: PublicDevelopmentCard) => (
                <LaunchCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-muted-foreground">
              Nenhum lançamento publicado desta construtora no momento.
            </p>
          )}
        </section>

        {delivered.length ? (
          <section className="mt-12">
            <h2 className="text-xl font-semibold">Empreendimentos entregues</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {delivered.map((item: PublicDevelopmentCard) => (
                <LaunchCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ) : null}

        {dev.city ? (
          <section className="mt-12">
            <h2 className="text-xl font-semibold">Onde atua</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-border">
              {showMap ? (
                <Suspense
                  fallback={<div className="grid h-72 place-items-center text-sm text-muted-foreground">Carregando mapa…</div>}
                >
                  <LeafletMap query={mapQuery} title={dev.name} />
                </Suspense>
              ) : (
                <MapPlaceholder title={dev.name} address={mapQuery} canOpen onOpen={() => setShowMap(true)} />
              )}
            </div>
          </section>
        ) : null}

        {related.otherDevelopers.length || related.neighborhoods.length ? (
          <section className="mt-14">
            <h2 className="text-xl font-semibold">Conheça também</h2>

            {related.neighborhoods.length ? (
              <div className="mt-5">
                <h3 className="text-sm font-medium text-muted-foreground">Bairros onde atua</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {related.neighborhoods.map((n) => (
                    <li key={n.name}>
                      <Link
                        to="/lancamentos"
                        search={{ bairro: n.name }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"
                      >
                        <MapPin className="h-3.5 w-3.5" /> {n.name}
                        <span className="text-xs text-muted-foreground">({n.count})</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {related.neighborhoods.some((n) => n.slug) ? (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground">Lançamentos e imóveis relacionados</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {related.neighborhoods
                    .filter((n) => n.slug)
                    .map((n) => (
                      <li key={`guia-${n.slug}`}>
                        <Link
                          to="/imoveis/$slug"
                          params={{ slug: n.slug as string }}
                          className="inline-flex rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"
                        >
                          Imóveis em {n.name}
                        </Link>
                      </li>
                    ))}
                  <li>
                    <Link
                      to="/lancamentos"
                      className="inline-flex rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"
                    >
                      Todos os lançamentos
                    </Link>
                  </li>
                </ul>
              </div>
            ) : null}

            {related.otherDevelopers.length ? (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground">Outras construtoras</h3>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {related.otherDevelopers.map((o) => (
                    <li key={o.slug}>
                      <Link
                        to="/construtoras/$slug"
                        params={{ slug: o.slug }}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 transition hover:shadow-md"
                      >
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 text-sm font-medium">{o.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {o.count} {o.count === 1 ? "empreendimento" : "empreendimentos"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}


        <section className="mt-14 rounded-3xl border border-border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold">Interesse em um empreendimento desta construtora?</h2>
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background"
          >
            Falar no WhatsApp
          </a>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
