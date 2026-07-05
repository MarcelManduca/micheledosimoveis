import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { MapPin, Building2, ArrowRight, Phone } from "lucide-react";
import { listCondominiums, listBairros } from "@/lib/condominiums.functions";
import { getNeighborhood } from "@/lib/neighborhoods";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";

const SITE = "https://micheledosimoveis.com.br";
const WHATSAPP = "https://api.whatsapp.com/send?phone=5548991828828&text=";

function listQO(bairroSlug: string) {
  return queryOptions({
    queryKey: ["condominiums", "list-bairro", bairroSlug],
    queryFn: () =>
      listCondominiums({ data: { bairroSlug, page: 1, pageSize: 48 } }),
    staleTime: 60_000,
  });
}
const bairrosQO = queryOptions({
  queryKey: ["condominiums", "bairros"],
  queryFn: () => listBairros(),
  staleTime: 60_000,
});

export const Route = createFileRoute("/condominios/$bairro")({
  loader: async ({ params, context }) => {
    const [list, allBairros] = await Promise.all([
      context.queryClient.ensureQueryData(listQO(params.bairro)),
      context.queryClient.ensureQueryData(bairrosQO),
    ]);
    if (list.total === 0) throw notFound();
    const bairroInfo = allBairros.find((b) => b.bairro_slug === params.bairro);
    const bairroName = bairroInfo?.normalized_neighborhood ?? params.bairro;
    return { bairroName, bairroSlug: params.bairro, count: list.total };
  },
  head: ({ params, loaderData }) => {
    const name = loaderData?.bairroName ?? params.bairro;
    const url = `${SITE}/condominios/${params.bairro}`;
    const title = `Condomínios no ${name}, Florianópolis | Michele dos Imóveis`;
    const description = `Veja condomínios no ${name}, Florianópolis, com endereço, comodidades e atendimento especializado para compra e venda de imóveis.`;
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
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: SITE },
              { "@type": "ListItem", position: 2, name: "Condomínios", item: `${SITE}/condominios` },
              { "@type": "ListItem", position: 3, name: name, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: CondominiosBairro,
  notFoundComponent: () => (
    <div className="p-16 text-center">
      <p className="text-sm text-muted-foreground">Nenhum condomínio publicado neste bairro.</p>
      <Link to="/condominios" className="mt-4 inline-block text-sm underline">
        Ver todos os condomínios
      </Link>
    </div>
  ),
});

function CondominiosBairro() {
  const { bairro } = Route.useParams();
  const { bairroName } = Route.useLoaderData();
  const list = useQuery(listQO(bairro));
  const items = list.data?.items ?? [];

  const nInfo = getNeighborhood(bairro);
  const buyerLink =
    WHATSAPP +
    encodeURIComponent(
      `Olá, Michele. Tenho interesse em condomínios no ${bairroName}, Florianópolis. Pode me ajudar?`,
    );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <nav aria-label="breadcrumb" className="mb-6 text-xs text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/" className="hover:text-foreground">Início</Link></li>
              <li>/</li>
              <li><Link to="/condominios" className="hover:text-foreground">Condomínios</Link></li>
              <li>/</li>
              <li className="text-foreground">{bairroName}</li>
            </ol>
          </nav>

          <header className="mb-10 max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl tracking-tight">
              Condomínios no {bairroName}
            </h1>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              {nInfo?.intro ??
                `Conheça condomínios no ${bairroName}, em Florianópolis. Esta página reúne informações gerais e opções de atendimento para compra, venda ou avaliação de imóveis na região.`}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {nInfo && (
                <Link
                  to="/imoveis/$slug"
                  params={{ slug: nInfo.slug }}
                  className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium"
                >
                  Ver imóveis no {bairroName}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <a
                href={buyerLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                <Phone className="h-4 w-4" /> Falar com Michele
              </a>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <Link
                key={c.id}
                to="/condominio/$slug"
                params={{ slug: c.slug }}
                className="group flex flex-col rounded-2xl bg-card p-5 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <h2 className="mt-4 font-display text-lg leading-tight tracking-tight line-clamp-2">
                  {c.name}
                </h2>
                {c.address && (
                  <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-2">{c.address}</span>
                  </div>
                )}
                {c.amenities.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {c.amenities.slice(0, 4).map((a) => (
                      <span
                        key={a}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {nInfo?.related && nInfo.related.length > 0 && (
            <section className="mt-16">
              <h2 className="font-display text-xl tracking-tight">Bairros próximos</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {nInfo.related.map((slug) => (
                  <Link
                    key={slug}
                    to="/condominios/$bairro"
                    params={{ bairro: slug }}
                    className="rounded-full border border-input bg-background px-3 py-1.5 text-xs hover:bg-secondary"
                  >
                    Condomínios em {getNeighborhood(slug)?.name ?? slug}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
