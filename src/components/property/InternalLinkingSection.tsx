import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2, MapPin, Home, Compass } from "lucide-react";
import type { PropertyInternalLinks } from "@/lib/property-links.functions";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";

const NEIGHBORHOOD_IMAGES = new Map(
  NEIGHBORHOODS.filter((n) => n.image).map((n) => [n.slug, n.image!] as const),
);


function trackClick(block: string, destination: string, anchor: string, origin: string) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({
    event: "internal_link_click",
    origin_page: origin,
    destination,
    block,
    anchor_text: anchor,
  });
}

function brl(n: number | null) {
  if (n == null) return "Sob consulta";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function InternalLinkingSection({
  links,
  originPath,
}: {
  links: PropertyInternalLinks;
  originPath: string;
}) {
  const { bairro, bairroSlug, typesInBairro, nearbyNeighborhoods, condominiums, similar } = links;
  const hasAny =
    typesInBairro.length + nearbyNeighborhoods.length + condominiums.length + similar.length > 0;
  if (!hasAny) return null;

  const cardBase =
    "group flex items-start gap-3 rounded-2xl bg-card ring-1 ring-black/5 px-5 py-4 hover:shadow-md hover:ring-black/10 transition";

  return (
    <section
      aria-label="Explore mais imóveis e regiões"
      className="border-t border-black/5 bg-secondary/30"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14 space-y-14">
        {/* Bloco 1 */}
        {typesInBairro.length > 0 && bairro && (
          <div>
            <h2 className="font-display text-2xl sm:text-3xl tracking-tight">
              Mais imóveis à venda em {bairro}
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {typesInBairro.map((t) => {
                const href = `/buscar?tipo=${encodeURIComponent(t.tipo)}&bairro=${encodeURIComponent(t.bairro)}`;
                const anchor = `${t.label} em ${bairro}`;
                return (
                  <li key={t.tipo}>
                    <a
                      href={href}
                      onClick={() => trackClick("mais_no_bairro", href, anchor, originPath)}
                      className={cardBase}
                    >
                      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 ring-1 ring-black/5">
                        <Home className="h-4 w-4" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-display text-lg tracking-tight">
                          {t.label} em {bairro}
                        </span>
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          {t.count} {t.count === 1 ? "opção" : "opções"} disponíveis
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 mt-2 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Bloco 2 */}
        {nearbyNeighborhoods.length > 0 && bairro && (
          <div>
            <h2 className="font-display text-2xl sm:text-3xl tracking-tight">
              Imóveis próximos de {bairro}
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {nearbyNeighborhoods.map((n) => {
                const href = `/imoveis/${n.slug}`;
                return (
                  <li key={n.slug}>
                    <Link
                      to="/imoveis/$slug"
                      params={{ slug: n.slug }}
                      onClick={() => trackClick("bairros_proximos", href, n.name, originPath)}
                      className={cardBase}
                    >
                      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 ring-1 ring-black/5">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-display text-lg tracking-tight">{n.name}</span>
                        <span className="block text-xs text-muted-foreground mt-0.5">{n.tag}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 mt-2 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Bloco 3 */}
        {condominiums.length > 0 && (
          <div>
            <h2 className="font-display text-2xl sm:text-3xl tracking-tight">
              Condomínios {bairro ? `em ${bairro}` : "próximos"}
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {condominiums.map((c) => {
                const href = `/condominio/${c.slug}`;
                return (
                  <li key={c.slug}>
                    <Link
                      to="/condominio/$slug"
                      params={{ slug: c.slug }}
                      onClick={() => trackClick("condominios_proximos", href, c.name, originPath)}
                      className={cardBase}
                    >
                      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 ring-1 ring-black/5">
                        <Building2 className="h-4 w-4" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-display text-lg tracking-tight">{c.name}</span>
                        {c.address && (
                          <span className="block text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {c.address}
                          </span>
                        )}
                      </span>
                      <ArrowRight className="h-4 w-4 mt-2 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Bloco 4 */}
        {similar.length > 0 && (
          <div>
            <h2 className="font-display text-2xl sm:text-3xl tracking-tight">
              Outros imóveis semelhantes
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => {
                const href = `/imovel/${s.code}`;
                return (
                  <li key={s.id}>
                    <Link
                      to="/imovel/$code"
                      params={{ code: s.code }}
                      onClick={() => trackClick("semelhantes", href, s.title, originPath)}
                      className="group block overflow-hidden rounded-2xl bg-card ring-1 ring-black/5 hover:shadow-lg hover:ring-black/10 transition"
                    >
                      <div className="aspect-[4/3] bg-secondary overflow-hidden">
                        {s.cover_image ? (
                          <img
                            src={s.cover_image}
                            alt={s.title}
                            loading="lazy"
                            className="h-full w-full object-cover group-hover:scale-[1.02] transition"
                          />
                        ) : (
                          <div className="h-full w-full grid place-items-center text-muted-foreground">
                            <Home className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="text-xs text-muted-foreground">
                          {[s.neighborhood, s.city].filter(Boolean).join(" · ")}
                        </div>
                        <h3 className="mt-1 font-display text-lg leading-tight line-clamp-2">
                          {s.title}
                        </h3>
                        <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-x-3">
                          {s.bedrooms != null && <span>{s.bedrooms} dorm.</span>}
                          {s.bathrooms != null && <span>{s.bathrooms} ban.</span>}
                          {s.area_m2 != null && <span>{s.area_m2}m²</span>}
                        </div>
                        <div className="mt-2 font-display text-xl">{brl(s.price_brl)}</div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Bloco 5 */}
        <div>
          <h2 className="font-display text-2xl sm:text-3xl tracking-tight">Explore também</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: "/buscar", label: "Comprar imóvel", desc: "Busca completa com filtros" },
              { href: "/anuncie", label: "Anunciar meu imóvel", desc: "Curadoria para vender bem" },
              bairroSlug
                ? { href: `/imoveis/${bairroSlug}`, label: `Guia de ${bairro}`, desc: "Perfil do bairro" }
                : { href: "/imoveis", label: "Guia de bairros", desc: "Todas as regiões" },
              { href: "/imoveis", label: "Todos os bairros", desc: "Regiões de atuação" },
              { href: "/condominios", label: "Todos os condomínios", desc: "Base curada de Florianópolis" },
              { href: "/buscar?tipo=lancamento", label: "Lançamentos", desc: "Novidades e pré-lançamentos" },
            ].map((item) => (
              <li key={item.href + item.label}>
                <a
                  href={item.href}
                  onClick={() => trackClick("explore_tambem", item.href, item.label, originPath)}
                  className={cardBase}
                >
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 ring-1 ring-black/5">
                    <Compass className="h-4 w-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-lg tracking-tight">{item.label}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{item.desc}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 mt-2 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
