import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { searchProperties, type PropertyListItem } from "@/lib/properties.functions";
import { PropertyFilters, PRECO_FAIXAS, type FiltersValue } from "@/components/PropertyFilters";
import { PropertyCard } from "@/components/PropertyCard";

const searchSchema = z.object({
  tipo: fallback(z.string().optional(), undefined),
  bairro: fallback(z.string().optional(), undefined),
  dorms: fallback(z.number().int().min(1).max(10).optional(), undefined),
  faixa: fallback(z.number().int().min(0).max(20).optional(), undefined),
});

export const Route = createFileRoute("/buscar")({
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => search,
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
  head: () => ({
    meta: [
      { title: "Buscar imóveis em Florianópolis | Michele dos Imóveis" },
      {
        name: "description",
        content:
          "Pesquise imóveis de alto padrão em Florianópolis por bairro, tipo, dormitórios e faixa de preço com curadoria de Michele Prietsch.",
      },
      { property: "og:title", content: "Buscar imóveis em Florianópolis | Michele dos Imóveis" },
    ],
  }),
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen grid place-items-center px-6 text-center">
      <div>
        <h1 className="font-display text-3xl">Erro na busca</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={reset} className="mt-6 text-sm underline">
          Tentar novamente
        </button>
      </div>
    </div>
  ),
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
                href="https://api.whatsapp.com/send?phone=5548991828828"
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
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
