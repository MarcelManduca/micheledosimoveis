import { Link } from "@tanstack/react-router";
import { Building2, CalendarClock, MapPin, Ruler, BedDouble } from "lucide-react";
import { brl } from "@/lib/format";
import type { PublicDevelopmentCard } from "@/lib/launches-public";

export const STAGE_LABELS: Record<string, string> = {
  pre_launch: "Pré-lançamento",
  launch: "Lançamento",
  under_construction: "Em obras",
  ready: "Pronto para morar",
};

export function stageLabel(stage: string): string {
  return STAGE_LABELS[stage] ?? stage;
}

export function priceRange(min: number | null, max: number | null): string {
  if (min === null && max === null) return "Valores sob consulta";
  if (min !== null && max !== null && min !== max) return `${brl(min)} a ${brl(max)}`;
  return `A partir de ${brl(min ?? max)}`;
}

export function areaRange(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  if (min !== null && max !== null && min !== max) return `${Math.round(min)} a ${Math.round(max)} m²`;
  return `${Math.round((min ?? max) as number)} m²`;
}

/** Card de lançamento — imagem lazy, dimensões reservadas, sem JS extra. */
export function LaunchCard({ item, eager = false }: { item: PublicDevelopmentCard; eager?: boolean }) {
  const area = areaRange(item.stats.area_min, item.stats.area_max);
  return (
    <Link
      to="/lancamentos/$slug"
      params={{ slug: item.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
        {item.cover_image ? (
          <img
            src={item.cover_image}
            alt={`${item.name} — ${item.neighborhood ?? item.city}`}
            width={800}
            height={600}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <Building2 className="h-8 w-8" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground">
          {stageLabel(item.stage)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg font-semibold leading-tight">{item.name}</h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {item.neighborhood ?? item.city}
        </p>
        {item.developer ? (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            {item.developer.name}
          </p>
        ) : null}
        {item.delivery_estimate ? (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            Entrega {item.delivery_estimate}
          </p>
        ) : null}

        <div className="mt-auto space-y-1 pt-3">
          <p className="text-sm font-medium">{priceRange(item.stats.price_min, item.stats.price_max)}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {area ? (
              <span className="inline-flex items-center gap-1">
                <Ruler className="h-3.5 w-3.5" />
                {area}
              </span>
            ) : null}
            {item.stats.bedrooms.length ? (
              <span className="inline-flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" />
                {item.stats.bedrooms.join(", ")} dorm.
              </span>
            ) : null}
            {item.stats.units_available > 0 ? (
              <span>{item.stats.units_available} unidade(s) disponível(is)</span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
