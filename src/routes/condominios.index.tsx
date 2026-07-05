import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, queryOptions, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Search, Building2, ArrowRight, Phone } from "lucide-react";
import { listCondominiums, listBairros } from "@/lib/condominiums.functions";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";

const SITE = "https://micheledosimoveis.com.br";
const WHATSAPP = "https://api.whatsapp.com/send?phone=5548991828828&text=";

const bairrosQO = queryOptions({
  queryKey: ["condominiums", "bairros"],
  queryFn: () => listBairros(),
  staleTime: 60_000,
});

function makeListQO(query: string, bairroSlug: string, page: number) {
  return queryOptions({
    queryKey: ["condominiums", "list", { query, bairroSlug, page }],
    queryFn: () =>
      listCondominiums({
        data: {
          query: query || undefined,
          bairroSlug: bairroSlug || undefined,
          page,
          pageSize: 24,
        },
      }),
    staleTime: 30_000,
  });
}

export const Route = createFileRoute("/condominios/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(bairrosQO),
      context.queryClient.ensureQueryData(makeListQO("", "", 1)),
    ]);
    return null;
  },
  head: () => {
    const url = `${SITE}/condominios`;
    const title = "Condomínios em Florianópolis | Michele dos Imóveis";
    const description =
      "Consulte condomínios em Florianópolis por bairro, veja informações gerais, comodidades e fale com Michele dos Imóveis para comprar ou vender.";
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
              {
                "@type": "ListItem",
                position: 2,
                name: "Condomínios",
                item: url,
              },
            ],
          }),
        },
      ],
    };
  },
  component: CondominiosIndex,
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-sm text-muted-foreground">
      Não foi possível carregar os condomínios. {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-8">Página não encontrada.</div>,
});

function CondominiosIndex() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [bairroSlug, setBairroSlug] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [query, bairroSlug]);

  const bairros = useQuery(bairrosQO);
  const list = useQuery(makeListQO(query, bairroSlug, page));

  // Prefetch next page
  useEffect(() => {
    if (list.data && page * 24 < list.data.total) {
      qc.prefetchQuery(makeListQO(query, bairroSlug, page + 1));
    }
  }, [list.data, page, query, bairroSlug, qc]);

  const items = list.data?.items ?? [];
  const total = list.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 24));

  const whatsappBuyer = useMemo(
    () =>
      WHATSAPP +
      encodeURIComponent(
        "Olá, Michele. Tenho interesse em imóveis em condomínios de Florianópolis. Pode me ajudar?",
      ),
    [],
  );
  const whatsappOwner = useMemo(
    () =>
      WHATSAPP +
      encodeURIComponent(
        "Olá, Michele. Tenho um imóvel em um condomínio de Florianópolis e gostaria de avaliar uma estratégia de venda.",
      ),
    [],
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <nav aria-label="breadcrumb" className="mb-6 text-xs text-muted-foreground">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link to="/" className="hover:text-foreground">
                  Início
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">Condomínios</li>
            </ol>
          </nav>

          <header className="mb-10 max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl tracking-tight">
              Condomínios em Florianópolis
            </h1>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Encontre informações sobre condomínios em Florianópolis, organize sua busca por bairro
              e fale com Michele dos Imóveis para consultar imóveis disponíveis, oportunidades off
              market ou avaliação para venda.
            </p>
          </header>

          <div className="mb-8 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome do condomínio"
                className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select
              value={bairroSlug}
              onChange={(e) => setBairroSlug(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-64"
            >
              <option value="">Todos os bairros</option>
              {(bairros.data ?? []).map((b) => (
                <option key={b.bairro_slug} value={b.bairro_slug}>
                  {b.normalized_neighborhood} ({b.count})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4 text-xs text-muted-foreground">
            {list.isLoading
              ? "Carregando…"
              : `${total} condomínio${total === 1 ? "" : "s"} publicado${total === 1 ? "" : "s"}`}
          </div>

          {items.length === 0 && !list.isLoading ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Nenhum condomínio encontrado com esses filtros.
            </div>
          ) : (
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
                  {c.normalized_neighborhood && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {c.normalized_neighborhood}, Florianópolis
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
                      {c.amenities.length > 4 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{c.amenities.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-input px-3 py-2 text-sm disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-xs text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-input px-3 py-2 text-sm disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          )}

          <section className="mt-16 grid gap-4 rounded-2xl bg-card p-8 ring-1 ring-black/5 sm:grid-cols-2">
            <div>
              <h2 className="font-display text-xl tracking-tight">Quer comprar em algum condomínio?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Michele dos Imóveis oferece atendimento personalizado para compradores em Florianópolis.
              </p>
              <a
                href={whatsappBuyer}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                <Phone className="h-4 w-4" /> Falar com Michele
              </a>
            </div>
            <div>
              <h2 className="font-display text-xl tracking-tight">Tem imóvel em um condomínio?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Avaliação, posicionamento e estratégia de venda — inclusive em formato discreto ou
                off market.
              </p>
              <a
                href={whatsappOwner}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium"
              >
                Quero avaliar meu imóvel
              </a>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
