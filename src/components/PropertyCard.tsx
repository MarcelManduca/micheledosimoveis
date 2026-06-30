import { Link } from "@tanstack/react-router";
import { BedDouble, Bath, Maximize, MapPin, ArrowRight } from "lucide-react";
import type { PropertyListItem } from "@/lib/properties.functions";
import { PropertyImageCarousel } from "@/components/PropertyImageCarousel";

function brl(n: number | null) {
  if (n == null) return "Sob consulta";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function PropertyCard({ p }: { p: PropertyListItem }) {
  const images = p.images?.length ? p.images : p.cover_image ? [p.cover_image] : [];

  return (
    <Link
      to="/imovel/$code"
      params={{ code: p.code }}
      className="group block overflow-hidden rounded-2xl bg-card ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-black/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <PropertyImageCarousel images={images} alt={p.title} className="h-full w-full" />

        {p.featured && (
          <span className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-background shadow-sm">
            <Sparkles className="h-3 w-3" />
            Super Destaque
          </span>
        )}

        <span className="pointer-events-none absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm ring-1 ring-black/5">
          <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
          Michele dos Imóveis
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Cód. {p.code}
          </span>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground/5 text-muted-foreground transition group-hover:bg-foreground group-hover:text-background">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-4">
          <h3 className="font-display text-lg leading-tight tracking-tight line-clamp-2">
            {p.title}
          </h3>
        </div>
        {(p.neighborhood || p.city) && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {[p.neighborhood, p.city].filter(Boolean).join(", ")}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {p.bedrooms != null && (
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" /> {p.bedrooms}
            </span>
          )}
          {p.bathrooms != null && (
            <span className="inline-flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" /> {p.bathrooms}
            </span>
          )}
          {p.area_m2 != null && (
            <span className="inline-flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" /> {p.area_m2} m²
            </span>
          )}
        </div>
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-border pt-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Valor
            </div>
            <div className="mt-1 font-display text-2xl tracking-tight">{brl(p.price_brl)}</div>
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition">
            Ver detalhes →
          </span>
        </div>
      </div>
    </Link>
  );
}
