import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import type { PropertyListItem } from "@/lib/properties.functions";

export type CondominiumSummary = {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  neighborhood: string | null;
  normalized_neighborhood: string | null;
  bairro_slug: string | null;
  amenities: string[];
};

export type CondominiumDetail = CondominiumSummary & {
  city: string;
  state: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
};

export type BairroCount = { bairro_slug: string; normalized_neighborhood: string; count: number };

function getPublicClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Backend indisponível no momento.");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

const SUMMARY_COLS =
  "id, slug, name, address, neighborhood, normalized_neighborhood, bairro_slug, amenities";
const DETAIL_COLS =
  SUMMARY_COLS + ", city, state, postal_code, latitude, longitude, description";

function escapeLike(term: string) {
  return term.replace(/[%_\\]/g, (m) => `\\${m}`);
}

export const listCondominiums = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        query: z.string().optional(),
        bairroSlug: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(48).default(24),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<{ items: CondominiumSummary[]; total: number }> => {
    const supabase = getPublicClient();
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;

    let q = supabase
      .from("condominiums")
      .select(SUMMARY_COLS, { count: "exact" })
      .eq("is_active", true);

    if (data.bairroSlug) q = q.eq("bairro_slug", data.bairroSlug);
    if (data.query && data.query.trim()) {
      q = q.ilike("normalized_name", `%${escapeLike(data.query.trim().toLowerCase())}%`);
    }

    const { data: rows, error, count } = await q
      .order("name", { ascending: true })
      .range(from, to);
    if (error) {
      console.error("listCondominiums", error);
      return { items: [], total: 0 };
    }
    return {
      items: (rows ?? []) as CondominiumSummary[],
      total: count ?? 0,
    };
  });

export const listBairros = createServerFn({ method: "GET" }).handler(
  async (): Promise<BairroCount[]> => {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from("condominiums")
      .select("bairro_slug, normalized_neighborhood")
      .eq("is_active", true);
    if (error) {
      console.error("listBairros", error);
      return [];
    }
    const map = new Map<string, BairroCount>();
    for (const r of data ?? []) {
      const slug = (r as { bairro_slug: string | null }).bairro_slug;
      const bairro = (r as { normalized_neighborhood: string | null }).normalized_neighborhood;
      if (!slug || !bairro) continue;
      const key = slug;
      const cur = map.get(key);
      if (cur) cur.count++;
      else map.set(key, { bairro_slug: slug, normalized_neighborhood: bairro, count: 1 });
    }
    return Array.from(map.values()).sort((a, b) =>
      a.normalized_neighborhood.localeCompare(b.normalized_neighborhood, "pt-BR"),
    );
  },
);

export const getCondominiumBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }): Promise<CondominiumDetail | null> => {
    const supabase = getPublicClient();
    const { data: row, error } = await supabase
      .from("condominiums")
      .select(DETAIL_COLS)
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) {
      console.error("getCondominiumBySlug", error);
      return null;
    }
    if (!row) return null;
    const r = row as unknown as Record<string, unknown>;
    return {
      id: r.id as string,
      slug: r.slug as string,
      name: r.name as string,
      address: (r.address as string | null) ?? null,
      neighborhood: (r.neighborhood as string | null) ?? null,
      normalized_neighborhood: (r.normalized_neighborhood as string | null) ?? null,
      bairro_slug: (r.bairro_slug as string | null) ?? null,
      amenities: (r.amenities as string[] | null) ?? [],
      city: (r.city as string) ?? "Florianópolis",
      postal_code: (r.postal_code as string | null) ?? null,
      state: (r.state as string) ?? "SC",
      latitude: (r.latitude as number | null) ?? null,
      longitude: (r.longitude as number | null) ?? null,
      description: (r.description as string | null) ?? null,
    };
  });

export const listActiveSlugs = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ slug: string; bairro_slug: string | null; updated_at: string }[]> => {
    const supabase = getPublicClient();
    const out: { slug: string; bairro_slug: string | null; updated_at: string }[] = [];
    let page = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("condominiums")
        .select("slug, bairro_slug, updated_at")
        .eq("is_active", true)
        .order("slug", { ascending: true })
        .range(page * pageSize, page * pageSize + pageSize - 1);
      if (error) {
        console.error("listActiveSlugs", error);
        break;
      }
      const rows = (data ?? []) as { slug: string; bairro_slug: string | null; updated_at: string }[];
      out.push(...rows);
      if (rows.length < pageSize) break;
      page++;
    }
    return out;
  },
);

const PROP_LIST_COLS =
  "id, code, title, neighborhood, city, price_brl, area_m2, bedrooms, bathrooms, cover_image, featured, is_launch, property_photos(url, position)";

type PhotoJoin = { url: string; position: number };
function normalizeProperty(row: Record<string, unknown>): PropertyListItem {
  const photos = (row.property_photos as PhotoJoin[] | null | undefined) ?? [];
  const sorted = [...photos].sort((a, b) => a.position - b.position).map((p) => p.url);
  const cover = (row.cover_image as string | null) ?? null;
  const images = sorted.length > 0 ? sorted : cover ? [cover] : [];
  const { property_photos: _omit, ...rest } = row;
  void _omit;
  return { ...(rest as Omit<PropertyListItem, "images">), images } as PropertyListItem;
}

export const getPropertiesForCondominium = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({ condoName: z.string().min(1), neighborhoodQuery: z.string().optional() })
      .parse(input),
  )
  .handler(
    async ({
      data,
    }): Promise<{ inCondo: PropertyListItem[]; nearby: PropertyListItem[] }> => {
      const supabase = getPublicClient();
      // Buscar imóveis ativos onde condo_name bate com o nome
      const like = `%${escapeLike(data.condoName)}%`;
      const inCondoRes = await supabase
        .from("properties")
        .select(PROP_LIST_COLS)
        .eq("published", true)
        .ilike("condo_name", like)
        .order("created_at", { ascending: false })
        .limit(24);
      const inCondo = (inCondoRes.data ?? []).map((r) =>
        normalizeProperty(r as unknown as Record<string, unknown>),
      );

      let nearby: PropertyListItem[] = [];
      if (data.neighborhoodQuery && data.neighborhoodQuery.trim()) {
        const nb = escapeLike(data.neighborhoodQuery.trim());
        const nearbyRes = await supabase
          .from("properties")
          .select(PROP_LIST_COLS)
          .eq("published", true)
          .ilike("neighborhood", `%${nb}%`)
          .order("created_at", { ascending: false })
          .limit(8);
        const inCondoIds = new Set(inCondo.map((p) => p.id));
        nearby = (nearbyRes.data ?? [])
          .map((r) => normalizeProperty(r as unknown as Record<string, unknown>))
          .filter((p) => !inCondoIds.has(p.id));
      }

      return { inCondo, nearby };
    },
  );

export type CondoValueRefs = {
  source: "condo" | "neighborhood" | "none";
  count: number;
  minPrice: number | null;
  medianPrice: number | null;
  maxPrice: number | null;
  avgCondoFee: number | null;
  avgIptu: number | null;
  avgArea: number | null;
  commonBedrooms: number | null;
  commonParking: number | null;
};

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}
function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}
function mode(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const c = new Map<number, number>();
  for (const n of nums) c.set(n, (c.get(n) ?? 0) + 1);
  let best: number | null = null;
  let bestCount = 0;
  for (const [k, v] of c) if (v > bestCount) { best = k; bestCount = v; }
  return best;
}

type StatRow = {
  price_brl: number | null;
  condo_fee_brl: number | null;
  iptu_brl: number | null;
  area_m2: number | null;
  bedrooms: number | null;
  parking_spots: number | null;
};
function computeRefs(rows: StatRow[], source: "condo" | "neighborhood"): CondoValueRefs {
  const prices = rows.map((r) => r.price_brl).filter((v): v is number => typeof v === "number" && v > 0);
  const fees = rows.map((r) => r.condo_fee_brl).filter((v): v is number => typeof v === "number" && v > 0);
  const iptus = rows.map((r) => r.iptu_brl).filter((v): v is number => typeof v === "number" && v > 0);
  const areas = rows.map((r) => r.area_m2).filter((v): v is number => typeof v === "number" && v > 0);
  const beds = rows.map((r) => r.bedrooms).filter((v): v is number => typeof v === "number" && v > 0);
  const parks = rows.map((r) => r.parking_spots).filter((v): v is number => typeof v === "number" && v >= 0);
  return {
    source,
    count: rows.length,
    minPrice: prices.length ? Math.min(...prices) : null,
    medianPrice: median(prices),
    maxPrice: prices.length ? Math.max(...prices) : null,
    avgCondoFee: avg(fees),
    avgIptu: avg(iptus),
    avgArea: avg(areas),
    commonBedrooms: mode(beds),
    commonParking: mode(parks),
  };
}

const STAT_COLS = "price_brl, condo_fee_brl, iptu_brl, area_m2, bedrooms, parking_spots";

export const getCondoValueRefs = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({ condoName: z.string().min(1), neighborhoodQuery: z.string().optional() })
      .parse(input),
  )
  .handler(async ({ data }): Promise<CondoValueRefs> => {
    const supabase = getPublicClient();
    const like = `%${escapeLike(data.condoName)}%`;
    const inCondoRes = await supabase
      .from("properties")
      .select(STAT_COLS)
      .eq("published", true)
      .ilike("condo_name", like)
      .limit(200);
    const inRows = (inCondoRes.data ?? []) as unknown as StatRow[];
    if (inRows.length >= 2) return computeRefs(inRows, "condo");

    if (data.neighborhoodQuery && data.neighborhoodQuery.trim()) {
      const nb = escapeLike(data.neighborhoodQuery.trim());
      const nearbyRes = await supabase
        .from("properties")
        .select(STAT_COLS)
        .eq("published", true)
        .ilike("neighborhood", `%${nb}%`)
        .limit(200);
      const nbRows = (nearbyRes.data ?? []) as unknown as StatRow[];
      if (nbRows.length >= 3) return computeRefs(nbRows, "neighborhood");
    }
    return {
      source: "none",
      count: 0,
      minPrice: null,
      medianPrice: null,
      maxPrice: null,
      avgCondoFee: null,
      avgIptu: null,
      avgArea: null,
      commonBedrooms: null,
      commonParking: null,
    };
  });

