import {
  type PublicDevelopmentCard,
  getPublicClient,
  loadEligible,
  normalizeLaunchText,
  toCard,
} from "@/lib/launches-public";
import { findNeighborhoodByName } from "@/lib/neighborhoods";

/**
 * Linkagem interna contextual da vertical de LANÇAMENTOS.
 * Somente leitura pública (RLS anon), sem escrita e sem alterar
 * relacionamentos existentes entre imóveis, condomínios e construtoras.
 */

export type LaunchTypeLink = { label: string; tipo: string; bairro: string; count: number };
export type LaunchCondoLink = { slug: string; name: string; address: string | null };
export type LaunchPropertyLink = {
  code: string;
  title: string;
  neighborhood: string | null;
  price_brl: number | null;
  bedrooms: number | null;
  area_m2: number | null;
  cover_image: string | null;
};

export type LaunchRelated = {
  bairro: string | null;
  bairroSlug: string | null;
  typesInBairro: LaunchTypeLink[];
  condominiums: LaunchCondoLink[];
  neighborhoodLaunches: PublicDevelopmentCard[];
  developerLaunches: PublicDevelopmentCard[];
  properties: LaunchPropertyLink[];
};

const TYPE_LINKS: Array<{ label: string; tipo: string; match: (t: string) => boolean }> = [
  {
    label: "Apartamentos",
    tipo: "apartamento",
    match: (t) => t.startsWith("apartamento") || t === "loft" || t === "estúdio",
  },
  { label: "Coberturas", tipo: "cobertura", match: (t) => t === "cobertura" },
  { label: "Casas", tipo: "casa", match: (t) => t === "casa" || t === "casa de condomínio" },
];

function esc(s: string) {
  return s.replace(/[\\%_]/g, "\\$&");
}

export function emptyRelated(): LaunchRelated {
  return {
    bairro: null,
    bairroSlug: null,
    typesInBairro: [],
    condominiums: [],
    neighborhoodLaunches: [],
    developerLaunches: [],
    properties: [],
  };
}

export async function loadLaunchRelated(input: {
  slug: string;
  neighborhood: string | null;
  developerId: string | null;
}): Promise<LaunchRelated> {
  const supabase = getPublicClient();
  const bairro = input.neighborhood?.trim() || null;
  const nb = findNeighborhoodByName(bairro);
  const out = emptyRelated();
  out.bairro = bairro;
  out.bairroSlug = nb?.slug ?? null;

  const { rows, unitsByDev, developers } = await loadEligible();
  const cards = rows
    .filter((r) => r.slug !== input.slug)
    .map((r) =>
      toCard(r, unitsByDev.get(r.id) ?? [], r.developer_id ? developers.get(r.developer_id) ?? null : null),
    );

  if (bairro) {
    const nbKey = normalizeLaunchText(bairro);
    out.neighborhoodLaunches = cards
      .filter((c) => normalizeLaunchText(c.neighborhood ?? "") === nbKey)
      .slice(0, 6);
  }
  if (input.developerId) {
    const devSlug = developers.get(input.developerId)?.slug ?? null;
    out.developerLaunches = devSlug
      ? cards.filter((c) => c.developer?.slug === devSlug).slice(0, 6)
      : [];
  }

  if (!bairro) return out;

  const [typeRes, condoRes, propRes] = await Promise.all([
    supabase
      .from("properties")
      .select("property_type")
      .eq("published", true)
      .ilike("neighborhood", `%${esc(bairro)}%`)
      .limit(500),
    supabase
      .from("condominiums")
      .select("slug, name, address")
      .eq("is_active", true)
      .ilike("neighborhood", `%${esc(bairro)}%`)
      .order("name", { ascending: true })
      .limit(6),
    supabase
      .from("properties")
      .select("code, title, neighborhood, price_brl, bedrooms, area_m2, cover_image")
      .eq("published", true)
      .ilike("neighborhood", `%${esc(bairro)}%`)
      .order("featured", { ascending: false })
      .limit(6),
  ]);

  const counts = new Map<string, number>();
  for (const r of (typeRes.data ?? []) as { property_type: string | null }[]) {
    const low = (r.property_type ?? "").toLowerCase();
    const hit = TYPE_LINKS.find((t) => t.match(low));
    if (!hit) continue;
    counts.set(hit.tipo, (counts.get(hit.tipo) ?? 0) + 1);
  }
  out.typesInBairro = TYPE_LINKS.filter((t) => (counts.get(t.tipo) ?? 0) > 0).map((t) => ({
    label: t.label,
    tipo: t.tipo,
    bairro,
    count: counts.get(t.tipo) ?? 0,
  }));

  out.condominiums = ((condoRes.data ?? []) as { slug: string; name: string; address: string | null }[]).map(
    (c) => ({ slug: c.slug, name: c.name, address: c.address ?? null }),
  );

  out.properties = ((propRes.data ?? []) as LaunchPropertyLink[]).map((p) => ({
    code: p.code,
    title: p.title,
    neighborhood: p.neighborhood ?? null,
    price_brl: p.price_brl ?? null,
    bedrooms: p.bedrooms ?? null,
    area_m2: p.area_m2 ?? null,
    cover_image: p.cover_image ?? null,
  }));

  return out;
}

export type DeveloperRelated = {
  otherDevelopers: { slug: string; name: string; count: number }[];
  neighborhoods: { name: string; slug: string | null; count: number }[];
  stats: { published: number; unitsAvailable: number };
};

export async function loadDeveloperRelated(developerId: string): Promise<DeveloperRelated> {
  const { rows, unitsByDev, developers } = await loadEligible();

  const byDeveloper = new Map<string, number>();
  for (const r of rows) if (r.developer_id) byDeveloper.set(r.developer_id, (byDeveloper.get(r.developer_id) ?? 0) + 1);

  const mine = rows.filter((r) => r.developer_id === developerId);
  const units = mine.flatMap((r) => unitsByDev.get(r.id) ?? []);

  const nbCounts = new Map<string, number>();
  for (const r of mine) {
    const n = r.neighborhood?.trim();
    if (!n) continue;
    nbCounts.set(n, (nbCounts.get(n) ?? 0) + 1);
  }

  return {
    otherDevelopers: [...byDeveloper.entries()]
      .filter(([id]) => id !== developerId)
      .map(([id, count]) => {
        const d = developers.get(id);
        return d ? { slug: d.slug, name: d.name, count } : null;
      })
      .filter(Boolean)
      .slice(0, 6) as { slug: string; name: string; count: number }[],
    neighborhoods: [...nbCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, slug: findNeighborhoodByName(name)?.slug ?? null, count })),
    stats: {
      published: mine.length,
      unitsAvailable: units.filter((u) => u.is_available).length,
    },
  };
}
