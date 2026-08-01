import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { stripSearchParams } from "@tanstack/react-router";
import { z } from "zod";
import { Search } from "lucide-react";
import { ENABLE_LAUNCHES_VERTICAL } from "@/lib/feature-flags";
import { listPublicDevelopments } from "@/lib/launches-public.functions";
import { LaunchCard, STAGE_LABELS } from "@/components/launches/LaunchCard";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import { WHATSAPP_URL } from "@/lib/site-config";

const SITE = "https://micheledosimoveis.com.br";
const PAGE_SIZE = 12;

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  bairro: fallback(z.string(), "").default(""),
  construtora: fallback(z.string(), "").default(""),
  estagio: fallback(z.string(), "").default(""),
  entrega: fallback(z.string(), "").default(""),
  preco_min: fallback(z.number().nullable(), null).default(null),
  preco_max: fallback(z.number().nullable(), null).default(null),
  dorms: fallback(z.number().nullable(), null).default(null),
  ordem: fallback(z.string(), "relevance").default("relevance"),
  pagina: fallback(z.number().int(), 1).default(1),
});

type LaunchSearch = z.infer<typeof searchSchema>;

function listQO(s: LaunchSearch) {
  return queryOptions({
    queryKey: ["launches", "public", "list", s],
    queryFn: () =>
      listPublicDevelopments({
        data: {
          q: s.q,
          neighborhood: s.bairro,
          developer: s.construtora,
          stage: s.estagio,
          delivery: s.entrega,
          price_min: s.preco_min,
          price_max: s.preco_max,
          bedrooms: s.dorms,
          sort: s.ordem,
          page: Math.max(1, s.pagina),
          page_size: PAGE_SIZE,
        },
      }),
    staleTime: 30_000,
  });
}

export const Route = createFileRoute("/lancamentos/")({
  validateSearch: zodValidator(searchSchema),
  search: {
    middlewares: [
      stripSearchParams({
        q: "",
        bairro: "",
        construtora: "",
        estagio: "",
        entrega: "",
        preco_min: null,
        preco_max: null,
        dorms: null,
        ordem: "relevance",
        pagina: 1,
      }),
    ],
  },
  beforeLoad: () => {
    if (!ENABLE_LAUNCHES_VERTICAL) throw notFound();
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(listQO(deps));
    return null;
  },
  head: () => {
    const url = `${SITE}/lancamentos`;
    const title = "Lançamentos imobiliários em Florianópolis | Michele dos Imóveis";
    const description =
      "Conheça lançamentos e empreendimentos em Florianópolis por bairro, construtora e estágio de obra, com unidades disponíveis e atendimento especializado.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        // Homologação: vertical em preview, ainda fora do índice.
        { name: "robots", content: "noindex, nofollow" },
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
          children: JSON.stringify([
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
                { "@type": "ListItem", position: 2, name: "Lançamentos", item: url },
              ],
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
  component: LancamentosIndex,
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">Página não encontrada.</div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-foreground">
      Não foi possível carregar os lançamentos. {error.message}
    </div>
  ),
});

function LancamentosIndex() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  // O loader hidrata exatamente este snapshot; suspense evita um primeiro
  // render cliente sem facets e elimina divergência SSR/hidratação.
  const list = useSuspenseQuery(listQO(search));

  const items = list.data?.items ?? [];
  const total = list.data?.total ?? 0;
  const facets = list.data?.facets;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, search.pagina), totalPages);

  const update = (patch: Partial<LaunchSearch>) =>
    navigate({ search: (prev: LaunchSearch) => ({ ...prev, ...patch, pagina: patch.pagina ?? 1 }) });

  const selectClass =
    "h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader variant="light" />

      <main className="mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-8">
        <nav aria-label="Trilha" className="mb-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">
            Início
          </Link>
          <span className="mx-1.5">/</span>
          <span>Lançamentos</span>
        </nav>

        <h1 className="text-3xl font-semibold sm:text-4xl">Lançamentos em Florianópolis</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Empreendimentos acompanhados de perto por Michele dos Imóveis — do pré-lançamento à
          entrega, com unidades reais disponíveis para negociação.
        </p>

        <section className="mt-8 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="relative sm:col-span-2">
            <span className="sr-only">Buscar lançamento</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              defaultValue={search.q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="Buscar por nome, bairro ou construtora"
              className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm"
            />
          </label>

          <select
            className={selectClass}
            value={search.bairro}
            onChange={(e) => update({ bairro: e.target.value })}
            aria-label="Filtrar por bairro"
          >
            <option value="">Todos os bairros</option>
            {facets?.neighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={search.construtora}
            onChange={(e) => update({ construtora: e.target.value })}
            aria-label="Filtrar por construtora"
          >
            <option value="">Todas as construtoras</option>
            {facets?.developers.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={search.estagio}
            onChange={(e) => update({ estagio: e.target.value })}
            aria-label="Filtrar por estágio"
          >
            <option value="">Todos os estágios</option>
            {Object.entries(STAGE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={search.entrega}
            onChange={(e) => update({ entrega: e.target.value })}
            aria-label="Filtrar por previsão de entrega"
          >
            <option value="">Qualquer entrega</option>
            {facets?.deliveries.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={search.dorms === null ? "" : String(search.dorms)}
            onChange={(e) => update({ dorms: e.target.value ? Number(e.target.value) : null })}
            aria-label="Filtrar por dormitórios"
          >
            <option value="">Dormitórios</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+ dormitórios
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Preço mín."
              defaultValue={search.preco_min ?? ""}
              onChange={(e) => update({ preco_min: e.target.value ? Number(e.target.value) : null })}
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm"
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="Preço máx."
              defaultValue={search.preco_max ?? ""}
              onChange={(e) => update({ preco_max: e.target.value ? Number(e.target.value) : null })}
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm"
            />
          </div>

          <select
            className={selectClass}
            value={search.ordem}
            onChange={(e) => update({ ordem: e.target.value })}
            aria-label="Ordenar"
          >
            <option value="relevance">Mais relevantes</option>
            <option value="recent">Lançamento recente</option>
            <option value="delivery">Entrega mais próxima</option>
          </select>
        </section>

        <p className="mt-6 text-sm text-muted-foreground">
          {list.isLoading ? "Carregando…" : `${total} empreendimento(s) encontrado(s)`}
        </p>

        {items.length === 0 && !list.isLoading ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground">
              Nenhum lançamento corresponde a esses filtros no momento.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
            >
              Falar com Michele sobre lançamentos
            </a>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <LaunchCard key={item.id} item={item} eager={i < 3} />
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Paginação">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => update({ pagina: page - 1 })}
              className="rounded-full border border-border px-4 py-2 text-sm disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => update({ pagina: page + 1 })}
              className="rounded-full border border-border px-4 py-2 text-sm disabled:opacity-40"
            >
              Próxima
            </button>
          </nav>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}
