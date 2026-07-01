import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { PropertyCard } from "@/components/PropertyCard";
import type { PropertyListItem } from "@/lib/properties.functions";

// ChromaGridShell (CSS+JS) só entra no bundle quando a seção
// se aproxima da viewport — fora do critical path do mobile.
const ChromaGridShell = lazy(() =>
  import("@/components/ChromaGridShell").then((m) => ({ default: m.ChromaGridShell })),
);

function PlainGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
      {children}
    </div>
  );
}

const INITIAL_MOBILE = 3;
const INITIAL_DESKTOP = 6;
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
  const [initial, setInitial] = useState(INITIAL_DESKTOP);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [nearViewport, setNearViewport] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 767px)");
    const apply = () => setInitial(mql.matches ? INITIAL_MOBILE : INITIAL_DESKTOP);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);
  useEffect(() => {
    if (nearViewport) return;
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNearViewport(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setNearViewport(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [nearViewport]);
  const visibleCount = expanded
    ? Math.min(items.length, EXPANDED)
    : Math.min(items.length, initial);
  const visible = items.slice(0, visibleCount);
  const canExpand = !expanded && items.length > initial;
  const showViewAll = expanded && items.length > EXPANDED;

  const cards = visible.map((p) => <PropertyCard key={p.id} p={p} lockAfter={3} />);

  return (
    <div ref={wrapRef} className="space-y-10">
      {nearViewport ? (
        <Suspense fallback={<PlainGrid>{cards}</PlainGrid>}>
          <ChromaGridShell>{cards}</ChromaGridShell>
        </Suspense>
      ) : (
        <PlainGrid>{cards}</PlainGrid>
      )}


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
