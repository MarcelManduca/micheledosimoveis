import { Suspense, lazy } from "react";
import type { ChromaItem } from "@/components/ChromaGrid";
import { useIsMobile } from "@/hooks/use-mobile";
import type { PropertyListItem } from "@/lib/properties.functions";
import { brl } from "@/lib/format";
import { CHROMA_PALETTE, WHATSAPP_URL } from "@/lib/site-config";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";

const ChromaGrid = lazy(() =>
  import("@/components/ChromaGrid").then((m) => ({ default: m.ChromaGrid })),
);

const FALLBACK_PROPERTIES = [
  { img: prop1, code: "MP-1042", name: "Edifício Mira Mare", neighborhood: "Beira Mar Norte, Florianópolis", price: "R$ 6.900.000" },
  { img: prop2, code: "MP-1078", name: "Cobertura Vista Baía", neighborhood: "Beira Mar Norte, Florianópolis", price: "R$ 12.500.000" },
  { img: prop3, code: "MP-1101", name: "Residencial Costa Norte", neighborhood: "Beira Mar Norte, Florianópolis", price: "R$ 4.200.000" },
];

function toChromaItems(items: PropertyListItem[]): ChromaItem[] {
  if (items.length === 0) {
    return FALLBACK_PROPERTIES.map((p, i) => {
      const tone = CHROMA_PALETTE[i % CHROMA_PALETTE.length];
      return {
        image: p.img,
        title: p.name,
        subtitle: p.neighborhood,
        handle: `Cód. ${p.code}`,
        location: p.price,
        borderColor: tone.border,
        gradient: tone.gradient,
        url: WHATSAPP_URL,
      };
    });
  }
  return items.map((p, i) => {
    const tone = CHROMA_PALETTE[i % CHROMA_PALETTE.length];
    return {
      image: p.cover_image ?? "",
      title: p.title,
      subtitle: [p.neighborhood, p.city].filter(Boolean).join(", "),
      handle: `Cód. ${p.code}`,
      location: brl(p.price_brl),
      borderColor: tone.border,
      gradient: tone.gradient,
      url: `/imovel/${p.code}`,
    };
  });
}

/**
 * Renderiza cards de imóveis com efeito ChromaGrid no desktop e
 * cai para um grid plano (mais leve) em dispositivos móveis.
 */
export function ChromaGridProperties({ items }: { items: PropertyListItem[] }) {
  const chromaItems = toChromaItems(items);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {chromaItems.map((c, i) => (
          <a
            key={i}
            href={c.url ?? "#"}
            target={c.url?.startsWith("http") ? "_blank" : undefined}
            rel={c.url?.startsWith("http") ? "noopener noreferrer" : undefined}
            className="block overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            style={{ background: c.gradient }}
          >
            <div className="aspect-[4/3] overflow-hidden p-2">
              <img src={c.image} alt={c.title} loading="lazy" className="h-full w-full rounded-xl object-cover transition-transform duration-700 hover:scale-[1.04]" />
            </div>
            <div className="space-y-3 px-4 pb-4 pt-2 text-white">
              <div className="flex items-center justify-between gap-3">
                {c.handle && (
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70 ring-1 ring-white/15">
                    {c.handle}
                  </span>
                )}
                <span className="text-xs text-white/55">Ver detalhes →</span>
              </div>
              <div>
                <h3 className="line-clamp-2 text-base font-medium leading-snug">{c.title}</h3>
                {c.subtitle && <p className="mt-1 truncate text-xs text-white/65">{c.subtitle}</p>}
              </div>
              {c.location && (
                <div className="flex items-end justify-between gap-3 border-t border-white/10 pt-3">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-white/45">Valor</span>
                  <span className="shrink-0 text-lg font-semibold">{c.location}</span>
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    );
  }

  const cols = Math.max(1, Math.min(chromaItems.length, 3));
  return (
    <div className="relative">
      <Suspense fallback={<div className="h-[420px] w-full" aria-hidden />}>
        <ChromaGrid items={chromaItems} columns={cols} radius={320} damping={0.45} fadeOut={0.6} ease="power3.out" />
      </Suspense>
    </div>
  );
}
