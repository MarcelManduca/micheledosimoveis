import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { ENABLE_LAUNCHES_VERTICAL } from "@/lib/feature-flags";
import { getDevelopmentForPropertyCode } from "@/lib/launches-public.functions";

/**
 * Bloco ADITIVO na página do imóvel.
 * Renderiza apenas com a feature flag ativa e quando existe vínculo público.
 * Consulta client-side: não altera loader, SSR nem SEO da rota /imovel/$code.
 */
export function PropertyDevelopmentBanner({ code }: { code: string }) {
  const enabled = ENABLE_LAUNCHES_VERTICAL && Boolean(code);
  const q = useQuery({
    queryKey: ["launches", "property-development", code],
    queryFn: () => getDevelopmentForPropertyCode({ data: { code } }),
    enabled,
    staleTime: 5 * 60_000,
  });

  if (!enabled || !q.data) return null;

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
      <p className="inline-flex items-center gap-2 text-sm">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        Este imóvel pertence ao empreendimento <strong>{q.data.name}</strong>
        {q.data.neighborhood ? ` — ${q.data.neighborhood}` : ""}
      </p>
      <Link
        to="/lancamentos/$slug"
        params={{ slug: q.data.slug }}
        className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
      >
        Ver o empreendimento
      </Link>
    </div>
  );
}
