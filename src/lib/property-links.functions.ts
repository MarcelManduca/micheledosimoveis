import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { NEIGHBORHOODS, findNeighborhoodByName } from "@/lib/neighborhoods";

function getPublicClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Backend indisponível.");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export type TypeLink = { label: string; tipo: string; bairro: string; count: number };
export type NeighborhoodLink = { slug: string; name: string; tag: string };
export type CondoLink = { slug: string; name: string; address: string | null };
export type SimilarProperty = {
  id: string;
  code: string;
  title: string;
  neighborhood: string | null;
  city: string | null;
  price_brl: number | null;
  area_m2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  cover_image: string | null;
};

export type PropertyInternalLinks = {
  bairro: string | null;
  bairroSlug: string | null;
  typesInBairro: TypeLink[];
  nearbyNeighborhoods: NeighborhoodLink[];
  condominiums: CondoLink[];
  similar: SimilarProperty[];
};

// Mapeia property_type raw para uma categoria "amigável" para o usuário.
const TYPE_CATEGORIES: Array<{ label: string; slug: string; match: (t: string) => boolean }> = [
  { label: "Apartamento", slug: "apartamento", match: (t) => t.startsWith("apartamento") || t === "loft" || t === "estúdio" },
  { label: "Casa", slug: "casa", match: (t) => t === "casa" || t === "casa de condomínio" },
  { label: "Cobertura", slug: "cobertura", match: (t) => t === "cobertura" },
  { label: "Terreno", slug: "terreno", match: (t) => t.startsWith("terreno") },
  { label: "Sala comercial", slug: "sala comercial", match: (t) => t === "sala comercial" },
];

function categorize(t: string | null): { label: string; slug: string } | null {
  if (!t) return null;
  const low = t.toLowerCase();
  const c = TYPE_CATEGORIES.find((x) => x.match(low));
  return c ? { label: c.label, slug: c.slug } : null;
}

export const getPropertyInternalLinks = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        code: z.string().trim().min(1).max(64),
        neighborhood: z.string().trim().max(120).nullable().optional(),
        propertyType: z.string().trim().max(60).nullable().optional(),
        priceBrl: z.number().nullable().optional(),
        bedrooms: z.number().int().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<PropertyInternalLinks> => {
    const supabase = getPublicClient();
    const nb = findNeighborhoodByName(data.neighborhood);
    const bairroName = data.neighborhood ?? null;
    const bairroSlug = nb?.slug ?? null;

    // Bloco 1: tipos com pelo menos 3 imóveis no bairro
    let typesInBairro: TypeLink[] = [];
    if (bairroName) {
      const { data: rows } = await supabase
        .from("properties")
        .select("property_type")
        .eq("published", true)
        .ilike("neighborhood", `%${bairroName.replace(/[\\%_]/g, "\\$&")}%`)
        .limit(500);
      const counts = new Map<string, { label: string; count: number }>();
      for (const r of rows ?? []) {
        const cat = categorize((r as { property_type: string | null }).property_type);
        if (!cat) continue;
        const cur = counts.get(cat.slug) ?? { label: cat.label, count: 0 };
        cur.count += 1;
        counts.set(cat.slug, cur);
      }
      typesInBairro = Array.from(counts.entries())
        .filter(([, v]) => v.count >= 3)
        .map(([slug, v]) => ({ label: v.label, tipo: slug, bairro: bairroName, count: v.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    }

    // Bloco 2: bairros próximos com >= 3 imóveis
    let nearbyNeighborhoods: NeighborhoodLink[] = [];
    if (nb) {
      const candidates = nb.related
        .map((s) => NEIGHBORHOODS.find((n) => n.slug === s))
        .filter(Boolean) as typeof NEIGHBORHOODS;
      const results = await Promise.all(
        candidates.map(async (c) => {
          const { count } = await supabase
            .from("properties")
            .select("id", { count: "exact", head: true })
            .eq("published", true)
            .ilike("neighborhood", `%${c.query.replace(/[\\%_]/g, "\\$&")}%`);
          return { c, count: count ?? 0 };
        }),
      );
      nearbyNeighborhoods = results
        .filter((r) => r.count >= 3)
        .slice(0, 8)
        .map((r) => ({ slug: r.c.slug, name: r.c.name, tag: r.c.tag }));
    }

    // Bloco 3: condomínios ativos no mesmo bairro
    let condominiums: CondoLink[] = [];
    if (bairroName) {
      const { data: rows } = await supabase
        .from("condominiums")
        .select("slug, name, address")
        .eq("is_active", true)
        .ilike("neighborhood", `%${bairroName.replace(/[\\%_]/g, "\\$&")}%`)
        .order("name", { ascending: true })
        .limit(8);
      condominiums = (rows ?? []).map((r) => ({
        slug: (r as any).slug,
        name: (r as any).name,
        address: (r as any).address ?? null,
      }));
    }

    // Bloco 4: imóveis semelhantes
    let similar: SimilarProperty[] = [];
    {
      const price = data.priceBrl ?? null;
      let q = supabase
        .from("properties")
        .select(
          "id, code, title, neighborhood, city, price_brl, area_m2, bedrooms, bathrooms, cover_image, property_type",
        )
        .eq("published", true)
        .neq("code", data.code)
        .limit(24);
      if (data.propertyType) q = q.eq("property_type", data.propertyType);
      if (data.bedrooms != null) q = q.eq("bedrooms", data.bedrooms);
      if (price != null && price > 0) {
        q = q.gte("price_brl", Math.round(price * 0.8)).lte("price_brl", Math.round(price * 1.2));
      }
      const { data: rows } = await q;
      const arr = (rows ?? []) as unknown as (SimilarProperty & { property_type: string | null })[];
      arr.sort((a, b) => {
        const aSame = a.neighborhood && bairroName && a.neighborhood.toLowerCase().includes(bairroName.toLowerCase()) ? 1 : 0;
        const bSame = b.neighborhood && bairroName && b.neighborhood.toLowerCase().includes(bairroName.toLowerCase()) ? 1 : 0;
        return bSame - aSame;
      });
      similar = arr.slice(0, 6).map(({ property_type: _t, ...rest }) => rest);
    }

    return {
      bairro: bairroName,
      bairroSlug,
      typesInBairro,
      nearbyNeighborhoods,
      condominiums,
      similar,
    };
  });
