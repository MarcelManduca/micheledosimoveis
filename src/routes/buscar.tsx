import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { searchProperties, type PropertyListItem } from "@/lib/properties.functions";
import { PropertyFilters, PRECO_FAIXAS, type FiltersValue } from "@/components/PropertyFilters";
import { PropertyCard } from "@/components/PropertyCard";
import { ChromaGridShell } from "@/components/ChromaGridShell";
import { findNeighborhoodByName } from "@/lib/neighborhoods";
import { buildWhatsAppUrl } from "@/lib/site-config";

// Parser resiliente — nunca lança erro para o usuário final.
// Motivo: `@tanstack/zod-adapter`'s `fallback()` usa `z.custom().pipe(...)` e
// no Zod v4 `z.custom()` rejeita `undefined` antes do `.catch()` ser aplicado,
// resultando em "expected: nonoptional" quando o parâmetro está ausente na URL
// (ex.: link compartilhado no Instagram sem filtros, ou apenas com `fbclid`).
// Aqui fazemos preprocess + `.catch(undefined)` para tolerar qualquer entrada.
const toOptionalInt = z
  .preprocess((v) => {
    if (v == null || v === "") return undefined;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : undefined;
  }, z.number().int().optional())
  .catch(undefined);

const toOptionalString = z
  .preprocess(
    (v) => (v == null || v === "" ? undefined : String(v)),
    z.string().optional(),
  )
  .catch(undefined);

const searchSchema = z.object({
  tipo: toOptionalString,
  bairro: toOptionalString,
  dorms: toOptionalInt,
  faixa: toOptionalInt,
});

type SearchShape = z.infer<typeof searchSchema>;

function safeParseSearch(raw: Record<string, unknown>): SearchShape {
  try {
    const parsed = searchSchema.parse(raw ?? {});
    // Clamp para faixas válidas — nunca lança, apenas remove o campo inválido.
    const dorms = parsed.dorms != null && parsed.dorms >= 1 && parsed.dorms <= 10
      ? parsed.dorms
      : undefined;
    const faixa = parsed.faixa != null && parsed.faixa >= 0 && parsed.faixa <= 20
      ? parsed.faixa
      : undefined;
    return { ...parsed, dorms, faixa };
  } catch (err) {
    if (typeof console !== "undefined") {
      console.warn("[buscar] Falha ao interpretar filtros da URL, ignorando:", err);
    }
    return {};
  }
}

export const Route = createFileRoute("/buscar")({
  validateSearch: (s: Record<string, unknown>) => safeParseSearch(s),
  loaderDeps: ({ search }) => search,
  // Redireciona busca-por-bairro (único filtro) para a rota canônica
  // do bairro programático — consolida link equity e evita duplicate content.
  beforeLoad: ({ search }) => {
    const onlyBairro =
      Boolean(search.bairro) && !search.tipo && search.dorms == null && search.faixa == null;
    if (onlyBairro) {
      const nb = findNeighborhoodByName(search.bairro);
      if (nb) {
        throw redirect({ to: "/imoveis/$slug", params: { slug: nb.slug }, replace: true });
      }
    }
  },
  loader: ({ deps }) => {
    const faixa = deps.faixa != null ? PRECO_FAIXAS[deps.faixa] : undefined;
    return searchProperties({
      data: {
        tipo: deps.tipo ?? null,
        bairro: deps.bairro ?? null,
        dorms: deps.dorms ?? null,
        precoMin: faixa?.min ?? null,
        precoMax: faixa?.max ?? null,
      },
    });
  },
  head: ({ match }) => {
    const search = (match.search ?? {}) as z.infer<typeof searchSchema>;
    const hasFilters = Boolean(search.tipo || search.bairro || search.dorms != null || search.faixa != null);
    const onlyBairro =
      Boolean(search.bairro) && !search.tipo && search.dorms == null && search.faixa == null;
    const nb = onlyBairro ? findNeighborhoodByName(search.bairro) : undefined;
    const baseTitle = "Buscar imóveis em Florianópolis | Michele dos Imóveis";
    const baseDesc =
      "Pesquise imóveis de alto padrão em Florianópolis por bairro, tipo, dormitórios e faixa de preço com curadoria de Michele Prietsch.";
    // Canonical consistente do bairro: quando o filtro é apenas o bairro
    // e ele corresponde a uma região programática, apontamos canonical e
    // og:url para /imoveis/$slug (a versão canônica do bairro).
    const canonical = nb
      ? `https://micheledosimoveis.com.br/imoveis/${nb.slug}`
      : "https://micheledosimoveis.com.br/buscar";
    return {
      meta: [
        { title: baseTitle },
        { name: "description", content: baseDesc },
        { property: "og:title", content: baseTitle },
        { property: "og:description", content: baseDesc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        // Variantes com filtros (incluindo o caso bairro canonicalizado)
        // são duplicatas — noindex,follow.
        ...(hasFilters
          ? [{ name: "robots" as const, content: "noindex,follow" }]
          : []),
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  errorComponent: ({ error, reset }) => {
    if (typeof console !== "undefined") {
      console.error("[buscar] Erro inesperado na página de busca:", error);
    }
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center bg-background text-foreground">
        <div className="max-w-md">
          <h1 className="font-display text-3xl">Não foi possível carregar a busca</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Não conseguimos interpretar os filtros da pesquisa. Você pode limpar os filtros
            e recomeçar.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to="/buscar"
              search={{}}
              onClick={() => reset()}
              className="inline-flex items-center rounded-full bg-foreground text-background px-4 py-2 text-sm"
            >
              Limpar filtros
            </Link>
            <Link to="/" className="text-sm underline">
              Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center">
      <Link to="/" className="underline">
        Voltar ao início
      </Link>
    </div>
  ),
  component: BuscarPage,
});

function BuscarPage() {
  const search = Route.useSearch();
  const initial = Route.useLoaderData() as PropertyListItem[];
  const live = useQuery({
    queryKey: ["search", search],
    queryFn: () => {
      const faixa = search.faixa != null ? PRECO_FAIXAS[search.faixa] : undefined;
      return searchProperties({
        data: {
          tipo: search.tipo ?? null,
          bairro: search.bairro ?? null,
          dorms: search.dorms ?? null,
          precoMin: faixa?.min ?? null,
          precoMax: faixa?.max ?? null,
        },
      });
    },
    initialData: initial,
  });
  const results = live.data ?? [];

  const initialFilters: FiltersValue = {
    tipo: search.tipo,
    bairro: search.bairro,
    dorms: search.dorms,
    faixa: search.faixa,
  };

  const activeChips: string[] = [];
  if (search.tipo) activeChips.push(search.tipo);
  if (search.bairro) activeChips.push(search.bairro);
  if (search.dorms != null) activeChips.push(`${search.dorms}+ dorms`);
  if (search.faixa != null) activeChips.push(PRECO_FAIXAS[search.faixa].label);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-5 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <Link to="/" className="font-display text-lg tracking-tight">
            Michele dos Imóveis
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 sm:px-10 py-12">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Resultados</div>
        <h1 className="mt-3 font-display font-light text-4xl sm:text-5xl tracking-tight">
          Imóveis em <span className="italic">Florianópolis</span>
        </h1>
        {activeChips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeChips.map((c) => (
              <span
                key={c}
                className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground"
              >
                {c}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8">
          <PropertyFilters initial={initialFilters} />
        </div>

        <div className="mt-10 text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
        </div>

        {results.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-card ring-1 ring-black/5 p-10 text-center">
            <p className="font-display text-xl">Nenhum imóvel encontrado com esses filtros.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Ajuste os filtros acima ou{" "}
              <a
                href={buildWhatsAppUrl(
                  `Olá Michele! Não encontrei resultados na busca${
                    search.bairro ? ` para ${search.bairro}` : ""
                  }. Pode me ajudar com uma curadoria personalizada?`,
                )}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                fale com a Michele
              </a>{" "}
              para uma busca personalizada.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <ChromaGridShell>
              {results.map((p) => (
                <PropertyCard key={p.id} p={p} />
              ))}
            </ChromaGridShell>
          </div>
        )}
      </main>
    </div>
  );
}
