import { Link } from "@tanstack/react-router";
import { BedDouble, Bath, Maximize, MapPin } from "lucide-react";
import type { PropertyListItem } from "@/lib/properties.functions";

function brl(n: number | null) {
  if (n == null) return "Sob consulta";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function PropertyCard({ p }: { p: PropertyListItem }) {
  return (
    <Link
      to="/imovel/$code"
      params={{ code: p.code }}
      className="group block overflow-hidden rounded-2xl bg-card ring-1 ring-black/5 hover:shadow-xl hover:ring-black/10 transition"
    >
      <div className="aspect-[4/3] overflow-hidden bg-secondary">
        {p.cover_image ? (
          <img
            src={p.cover_image}
            alt={p.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-muted-foreground text-xs">
            Sem foto
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
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
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Cód. {p.code}
            </div>
            <div className="mt-1 font-display text-xl tracking-tight">{brl(p.price_brl)}</div>
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition">
            Ver detalhes →
          </span>
        </div>
      </div>
    </Link>
  );
}
