import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, MapPin, Phone } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchProperties } from "@/lib/properties.functions";
import {
  NEIGHBORHOODS,
  getNeighborhood,
  type Neighborhood,
} from "@/lib/neighborhoods";
import { PropertyCard } from "@/components/PropertyCard";
import { ChromaGridShell } from "@/components/ChromaGridShell";


const SITE = "https://micheledosimoveis.com.br";
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
    // Bairros estratégicos (indexWhenEmpty) permanecem indexáveis mesmo
    // sem imóveis públicos, pois representam autoridade local, atuação
    // editorial e captação off market. Demais bairros vazios recebem
    // noindex,follow para evitar thin content.
    const shouldIndex = count > 0 || n.indexWhenEmpty === true;
    const robots = shouldIndex ? "index, follow" : "noindex, follow";
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

      <PropertiesSection neighborhood={n} properties={properties} waUrl={waUrl} />


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
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-2xl tracking-tight">
              Todas as regiões de atuação
            </h2>
            <Link
              to="/imoveis"
              className="text-sm underline text-muted-foreground hover:text-foreground"
            >
              Ver índice completo de bairros
            </Link>
          </div>
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
          <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
            <Link to="/" className="inline-flex items-center gap-2 hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao início
            </Link>
            <Link to="/buscar" className="hover:text-foreground hover:underline">
              Pesquisa com filtros
            </Link>
            <Link to="/anuncie" className="hover:text-foreground hover:underline">
              Anunciar meu imóvel
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ visível — espelha o JSON-LD FAQPage emitido no head */}
      <section className="border-t border-black/5 bg-secondary/30">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 py-12">
          <h2 className="font-display text-2xl sm:text-3xl tracking-tight">
            Perguntas frequentes sobre {n.name}
          </h2>
          <dl className="mt-6 space-y-4">
            {[
              {
                q: `Quais tipos de imóveis a Michele oferece em ${n.name}?`,
                a: `Em ${n.name}, a Michele atua com ${n.metaDesc}, incluindo apartamentos, coberturas, casas e lançamentos selecionados. Cada imóvel passa por curadoria antes de ser apresentado.`,
              },
              {
                q: `Há imóveis disponíveis em ${n.name} agora?`,
                a:
                  properties.length > 0
                    ? `Sim. Hoje há ${properties.length} ${properties.length === 1 ? "imóvel publicado" : "imóveis publicados"} em ${n.name}. Também trabalhamos com opções off market que não aparecem em listagens públicas — consulte a Michele para receber a seleção completa.`
                    : `No momento o portfólio público de ${n.name} está vazio, mas atuamos com operações off market nesta região. Fale com a Michele para receber opções sob medida que não são divulgadas publicamente.`,
              },
              {
                q: `Por que escolher ${n.name} em Florianópolis?`,
                a: n.intro,
              },
              {
                q: "Como funciona o atendimento personalizado?",
                a: "Michele Prietsch (CRECI 69502) é corretora associada à Gralha Imóveis e conduz pessoalmente cada negociação — desde a leitura de perfil até a entrega das chaves, com discrição, curadoria e segurança jurídica.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl bg-card ring-1 ring-black/5 px-5 py-4 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4 text-sm font-medium text-foreground">
                  <span>{item.q}</span>
                  <ArrowRight className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground transition group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}

type SortKey = "relevance" | "price-desc" | "price-asc";

function PropertiesSection({
  neighborhood: n,
  properties,
  waUrl,
}: {
  neighborhood: Neighborhood;
  properties: import("@/lib/properties.functions").PropertyListItem[];
  waUrl: string;
}) {
  const [sort, setSort] = useState<SortKey>("relevance");
  const PAGE_SIZE = 12;
  const [limit, setLimit] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const sorted = useMemo(() => {
    if (sort === "relevance") return properties;
    const arr = [...properties];
    arr.sort((a, b) => {
      if (sort === "price-desc") {
        const pa = a.price_brl ?? -Infinity;
        const pb = b.price_brl ?? -Infinity;
        return pb - pa;
      }
      // price-asc: nulos vão para o fim
      const va = a.price_brl ?? Infinity;
      const vb = b.price_brl ?? Infinity;
      return va - vb;
    });
    return arr;
  }, [properties, sort]);

  // Reset ao trocar ordenação
  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [sort]);

  const total = properties.length;
  const visible = Math.min(total, limit);
  const hasMore = visible < total;

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLimit((l) => Math.min(l + PAGE_SIZE, total));
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, total]);

  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 pb-16">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl sm:text-3xl tracking-tight">
          Imóveis disponíveis em {n.name}
        </h2>
        {total > 0 && (
          <Link
            to="/buscar"
            search={{ bairro: n.query }}
            className="text-sm underline text-muted-foreground hover:text-foreground"
          >
            Ver todos
          </Link>
        )}
      </div>

      {total === 0 ? (
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
        <>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card ring-1 ring-black/5 px-4 py-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {hasMore ? (
                <>
                  Exibindo{" "}
                  <span className="font-medium text-foreground">{visible}</span>{" "}
                  de{" "}
                  <span className="font-medium text-foreground">{total}</span>{" "}
                  {total === 1 ? "imóvel" : "imóveis"} em {n.name}
                </>
              ) : (
                <>
                  <span className="font-medium text-foreground">{total}</span>{" "}
                  {total === 1 ? "imóvel encontrado" : "imóveis encontrados"} em{" "}
                  {n.name}
                </>
              )}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Ordenar por</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-full ring-1 ring-black/10 bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                aria-label="Ordenar imóveis por preço"
              >
                <option value="relevance">Relevância</option>
                <option value="price-desc">Maior preço</option>
                <option value="price-asc">Menor preço</option>
              </select>
            </label>
          </div>

          <div className="mt-6">
            <ChromaGridShell>
              {sorted.slice(0, visible).map((p) => (
                <PropertyCard key={p.id} p={p} />
              ))}
            </ChromaGridShell>
          </div>

          {hasMore && (
            <div
              ref={sentinelRef}
              className="mt-8 flex justify-center"
              aria-hidden="true"
            >
              <button
                type="button"
                onClick={() => setLimit((l) => Math.min(l + PAGE_SIZE, total))}
                className="text-sm underline text-muted-foreground hover:text-foreground"
              >
                Carregar mais imóveis
              </button>
            </div>
          )}
        </>
      )}
    </section>

  );
}

