import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { PropertyCard } from "@/components/PropertyCard";
import { ChromaGridShell } from "@/components/ChromaGridShell";
import type { PropertyListItem } from "@/lib/properties.functions";

const INITIAL = 6;
const EXPANDED = 12;

/**
 * Lista paginada por revelação: mostra 6 itens, expande para 12,
 * depois encaminha o usuário para a busca completa.
 */
export function ExpandableProperties({
  items,
  viewAllHref,
  viewAllSearch,
}: {
  items: PropertyListItem[];
  viewAllHref: string;
  viewAllSearch?: Record<string, string>;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleCount = expanded
    ? Math.min(items.length, EXPANDED)
    : Math.min(items.length, INITIAL);
  const visible = items.slice(0, visibleCount);
  const canExpand = !expanded && items.length > INITIAL;
  const showViewAll = expanded && items.length > EXPANDED;

  return (
    <div className="space-y-10">
      <ChromaGridShell>
        {visible.map((p) => (
          <PropertyCard key={p.id} p={p} lockAfter={3} />
        ))}
      </ChromaGridShell>

      {(canExpand || showViewAll) && (
        <div className="flex justify-center">
          {canExpand ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-sm font-medium tracking-wide hover:bg-foreground hover:text-background transition-colors"
            >
              Ver mais imóveis
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <Link
              to={viewAllHref as any}
              search={viewAllSearch as any}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium tracking-wide text-background hover:bg-foreground/90 transition-colors"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
