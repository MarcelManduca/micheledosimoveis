import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, MapPin, Phone } from "lucide-react";
import { searchProperties } from "@/lib/properties.functions";
import {
  NEIGHBORHOODS,
  getNeighborhood,
  type Neighborhood,
} from "@/lib/neighborhoods";
import { PropertyCard } from "@/components/PropertyCard";

const SITE = "https://micheledosimoveis.lovable.app";
const WHATSAPP =
  "https://api.whatsapp.com/send?phone=5548991828828&text=";

export const Route = createFileRoute("/imoveis/$slug")({
  loader: async ({ params }) => {
    const n = getNeighborhood(params.slug);
    if (!n) throw notFound();
    const properties = await searchProperties({
      data: {
        tipo: null,
        bairro: n.query,
        dorms: null,
        precoMin: null,
        precoMax: null,
      },
    });
    return { neighborhood: n, properties };
  },
  head: ({ params, loaderData }) => {
    const n = loaderData?.neighborhood;
    if (!n) return { meta: [{ title: "Imóveis · Michele dos Imóveis" }] };
    const url = `${SITE}/imoveis/${params.slug}`;
    const title = `Imóveis de alto padrão em ${n.name}, Florianópolis | Michele dos Imóveis`;
    const description = `Curadoria de ${n.metaDesc}. Atendimento sob medida com Michele Prietsch — corretora associada à Gralha Imóveis.`;
    const count = loaderData?.properties?.length ?? 0;
    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Imóveis em ${n.name}, Florianópolis`,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: count,
      itemListElement: (loaderData?.properties ?? [])
        .slice(0, 20)
        .map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE}/imovel/${p.code}`,
          name: p.title,
        })),
    };
    const localBusiness = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      name: "Michele dos Imóveis",
      image: `${SITE}/og-michele.jpg`,
      url,
      telephone: "+5548991828828",
      priceRange: "$$$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: "R. Alves de Brito, 285",
        addressLocality: "Florianópolis",
        addressRegion: "SC",
        postalCode: "88015-440",
        addressCountry: "BR",
      },
      areaServed: {
        "@type": "Place",
        name: `${n.name}, Florianópolis`,
        ...(n.geo
          ? { geo: { "@type": "GeoCoordinates", latitude: n.geo.lat, longitude: n.geo.lng } }
          : {}),
      },
      knowsAbout: [
        "Imóveis de alto padrão",
        "Apartamentos frente mar",
        "Coberturas",
        "Casas em condomínio fechado",
        "Lançamentos imobiliários",
        n.name,
      ],
    };
    const breadcrumbs = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE },
        { "@type": "ListItem", position: 2, name: "Imóveis por bairro", item: `${SITE}/imoveis` },
        { "@type": "ListItem", position: 3, name: n.name, item: url },
      ],
    };
    const faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `Quais tipos de imóveis a Michele oferece em ${n.name}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Em ${n.name}, a Michele atua com ${n.metaDesc}, incluindo apartamentos, coberturas, casas e lançamentos selecionados. Cada imóvel passa por curadoria antes de ser apresentado.`,
          },
        },
        {
          "@type": "Question",
          name: `Há imóveis disponíveis em ${n.name} agora?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: count > 0
              ? `Sim. Hoje há ${count} ${count === 1 ? "imóvel publicado" : "imóveis publicados"} em ${n.name}. Também trabalhamos com opções off market que não aparecem em listagens públicas — consulte a Michele para receber a seleção completa.`
              : `No momento o portfólio público de ${n.name} está vazio, mas atuamos com operações off market nesta região. Fale com a Michele para receber opções sob medida que não são divulgadas publicamente.`,
          },
        },
        {
          "@type": "Question",
          name: `Por que escolher ${n.name} em Florianópolis?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${n.intro}`,
          },
        },
        {
          "@type": "Question",
          name: "Como funciona o atendimento personalizado?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Michele Prietsch (CRECI 69502) é corretora associada à Gralha Imóveis e conduz pessoalmente cada negociação — desde a leitura de perfil até a entrega das chaves, com discrição, curadoria e segurança jurídica.",
          },
        },
      ],
    };
    // Bairros sem portfólio público viram conteúdo "thin" para o Google.
    // Marcamos noindex,follow: a página continua acessível e passa link
    // equity para os imóveis e bairros vizinhos, mas não polui o índice.
    const robots = count === 0 ? "noindex, follow" : "index, follow";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: robots },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(localBusiness) },
        { type: "application/ld+json", children: JSON.stringify(itemList) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbs) },
        { type: "application/ld+json", children: JSON.stringify(faq) },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center px-6 text-center">
      <div>
        <h1 className="font-display text-3xl">Bairro não encontrado</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Confira a lista de regiões de atuação na página inicial.
        </p>
        <Link to="/" className="mt-6 inline-block text-sm underline">
          Voltar ao início
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div>
          <h1 className="font-display text-3xl">Não foi possível carregar</h1>
          <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
          <button
            onClick={() => {
              reset();
              router.invalidate();
            }}
            className="mt-6 text-sm underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  },
  component: NeighborhoodPage,
});

function NeighborhoodPage() {
  const data = Route.useLoaderData() as {
    neighborhood: Neighborhood;
    properties: import("@/lib/properties.functions").PropertyListItem[];
  };
  const n = data.neighborhood;
  const properties = data.properties;
  const related = n.related
    .map((slug: string) => NEIGHBORHOODS.find((x) => x.slug === slug))
    .filter(Boolean) as Neighborhood[];
  const waUrl =
    WHATSAPP +
    encodeURIComponent(
      `Olá Michele! Tenho interesse em imóveis de alto padrão em ${n.name}, Florianópolis.`,
    );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-black/5 bg-secondary/40">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-16">
          <nav aria-label="breadcrumb" className="text-xs text-muted-foreground">
            <Link to="/" className="hover:underline">Início</Link>
            <span className="mx-2">/</span>
            <Link to="/imoveis" className="hover:underline">Imóveis por bairro</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{n.name}</span>
          </nav>

          <h1 className="mt-4 font-display text-4xl sm:text-5xl tracking-tight">
            Imóveis de alto padrão em {n.name}
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Florianópolis · Santa Catarina
          </p>

          <p className="mt-6 max-w-3xl text-muted-foreground leading-relaxed">
            {n.intro}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm hover:opacity-90 transition"
            >
              <Phone className="h-4 w-4" />
              Falar com Michele sobre {n.name}
            </a>
            <Link
              to="/buscar"
              search={{ bairro: n.query }}
              className="inline-flex items-center gap-2 rounded-full ring-1 ring-black/10 px-5 py-2.5 text-sm hover:bg-secondary transition"
            >
              Buscar com filtros
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
        <h2 className="font-display text-2xl sm:text-3xl tracking-tight">
          Por que {n.name}?
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {n.highlights.map((h: string) => (
            <li
              key={h}
              className="flex items-start gap-3 rounded-2xl bg-card ring-1 ring-black/5 px-5 py-4"
            >
              <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70">
                <MapPin className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm text-foreground/90">{h}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Properties */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 pb-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl sm:text-3xl tracking-tight">
            Imóveis disponíveis em {n.name}
          </h2>
          {properties.length > 0 && (
            <Link
              to="/buscar"
              search={{ bairro: n.query }}
              className="text-sm underline text-muted-foreground hover:text-foreground"
            >
              Ver todos
            </Link>
          )}
        </div>

        {properties.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-card ring-1 ring-black/5 p-8 text-center">
            <p className="text-muted-foreground">
              No momento não há imóveis publicados em {n.name}. Atuamos com
              operações <strong className="text-foreground">off market</strong>{" "}
              nesta região — fale com a Michele para receber opções sob medida.
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm hover:opacity-90 transition"
            >
              <Phone className="h-4 w-4" />
              Receber opções de {n.name}
            </a>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.slice(0, 12).map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>

      {/* Related neighborhoods (internal linking) */}
      {related.length > 0 && (
        <section className="border-t border-black/5 bg-secondary/30">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
            <h2 className="font-display text-2xl sm:text-3xl tracking-tight">
              Bairros próximos
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to="/imoveis/$slug"
                    params={{ slug: r.slug }}
                    className="group flex items-start gap-4 rounded-2xl bg-card ring-1 ring-black/5 px-5 py-4 hover:shadow-lg hover:ring-black/10 transition"
                  >
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 ring-1 ring-black/5">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-display text-lg tracking-tight">
                        {r.name}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {r.tag}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 mt-2 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* All regions footer-style for internal linking */}
      <section className="border-t border-black/5">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
          <h2 className="font-display text-2xl tracking-tight">
            Todas as regiões de atuação
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {NEIGHBORHOODS.map((r) => (
              <li key={r.slug}>
                <Link
                  to="/imoveis/$slug"
                  params={{ slug: r.slug }}
                  className={
                    "inline-block rounded-full px-4 py-1.5 text-xs ring-1 transition " +
                    (r.slug === n.slug
                      ? "bg-foreground text-background ring-foreground"
                      : "bg-card ring-black/10 hover:bg-secondary")
                  }
                >
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao início
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
