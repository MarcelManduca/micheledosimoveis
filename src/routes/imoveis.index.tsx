import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";
import { searchProperties } from "@/lib/properties.functions";

const SITE = "https://micheledosimoveis.lovable.app";
const URL = `${SITE}/imoveis`;

export const Route = createFileRoute("/imoveis/")({
  loader: async () => {
    // Conta imóveis publicados por bairro para enriquecer os cards e
    // indicar disponibilidade real ao usuário e aos crawlers.
    const entries = await Promise.all(
      NEIGHBORHOODS.map(async (n) => {
        try {
          const list = await searchProperties({
            data: {
              tipo: null,
              bairro: n.query,
              dorms: null,
              precoMin: null,
              precoMax: null,
            },
          });
          return { slug: n.slug, count: list.length };
        } catch {
          return { slug: n.slug, count: 0 };
        }
      }),
    );
    const counts = Object.fromEntries(entries.map((e) => [e.slug, e.count]));
    return { counts };
  },
  head: ({ loaderData }) => {
    const totalAtivos = Object.values(loaderData?.counts ?? {}).filter((c) => c > 0).length;
    const title = "Imóveis de alto padrão em Florianópolis por bairro | Michele dos Imóveis";
    const description = `Navegue por ${NEIGHBORHOODS.length} bairros de Florianópolis onde a Michele atua com curadoria de imóveis de alto padrão — apartamentos frente mar, coberturas, casas em condomínio fechado e lançamentos.`;
    const breadcrumbs = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE },
        { "@type": "ListItem", position: 2, name: "Imóveis por bairro", item: URL },
      ],
    };
    const collection = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: URL,
      numberOfItems: totalAtivos,
      hasPart: NEIGHBORHOODS.map((n) => ({
        "@type": "WebPage",
        name: `Imóveis em ${n.name}, Florianópolis`,
        url: `${SITE}/imoveis/${n.slug}`,
      })),
    };
    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Bairros de atuação em Florianópolis",
      numberOfItems: NEIGHBORHOODS.length,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: NEIGHBORHOODS.map((n, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE}/imoveis/${n.slug}`,
        name: `Imóveis em ${n.name}, Florianópolis`,
      })),
    };
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: URL },
      ],
      links: [{ rel: "canonical", href: URL }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(breadcrumbs) },
        { type: "application/ld+json", children: JSON.stringify(collection) },
        { type: "application/ld+json", children: JSON.stringify(itemList) },
      ],
    };
  },
  component: ImoveisIndex,
});

function ImoveisIndex() {
  const { counts } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-black/5 bg-secondary/40">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-16">
          <nav aria-label="breadcrumb" className="text-xs text-muted-foreground">
            <Link to="/" className="hover:underline">Início</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Imóveis por bairro</span>
          </nav>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl tracking-tight">
            Imóveis de alto padrão em Florianópolis
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">
            {NEIGHBORHOODS.length} bairros · Curadoria por região
          </p>
          <p className="mt-6 max-w-3xl text-muted-foreground leading-relaxed">
            Explore por região as oportunidades selecionadas pela Michele
            Prietsch: apartamentos frente mar, coberturas com vista, casas em
            condomínio fechado e lançamentos exclusivos — do Norte ao Sul da
            Ilha. Clique em um bairro para ver os imóveis disponíveis.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NEIGHBORHOODS.map((n) => {
            const count = counts[n.slug] ?? 0;
            return (
              <li key={n.slug}>
                <Link
                  to="/imoveis/$slug"
                  params={{ slug: n.slug }}
                  className="group flex h-full items-start gap-4 rounded-2xl bg-card ring-1 ring-black/5 px-5 py-4 hover:shadow-lg hover:ring-black/10 transition"
                >
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 ring-1 ring-black/5">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-lg tracking-tight">{n.name}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{n.tag}</span>
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-2 py-0.5 text-[11px] font-medium text-foreground/70 ring-1 ring-black/5">
                      {count > 0 ? `${count} ${count === 1 ? "imóvel" : "imóveis"}` : "Off market · consulte"}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 mt-2 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
