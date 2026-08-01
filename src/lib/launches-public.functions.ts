import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import {
  type DevelopmentRow,
  type DeveloperRow,
  coreLaunchName,
  normalizeLaunchText,
  scoreDevelopment,
} from "@/lib/launches-shared";

/**
 * Leituras PÚBLICAS da vertical de LANÇAMENTOS.
 * Módulo isolado: somente SELECT via chave publicável (RLS anon),
 * sem qualquer escrita e sem tocar em imóveis, condomínios ou VRSync.
 */

/** Score mínimo editorial para exposição pública. */
export const PUBLIC_MIN_SCORE = 50;
/** Tamanho mínimo de descrição para considerar "conteúdo editorial suficiente". */
export const PUBLIC_MIN_DESCRIPTION = 200;

export type PublicUnit = {
  id: string;
  unit_name: string | null;
  area_m2: number | null;
  bedrooms: number | null;
  suites: number | null;
  bathrooms: number | null;
  parking_spots: number | null;
  price_brl: number | null;
  is_available: boolean;
  floor_plan_url: string | null;
  property: {
    code: string;
    title: string;
    neighborhood: string | null;
    price_brl: number | null;
    cover_image: string | null;
  } | null;
};

export type UnitStats = {
  units_total: number;
  units_available: number;
  price_min: number | null;
  price_max: number | null;
  area_min: number | null;
  area_max: number | null;
  bedrooms: number[];
};

export type PublicDevelopmentCard = {
  id: string;
  slug: string;
  name: string;
  neighborhood: string | null;
  city: string;
  stage: string;
  delivery_estimate: string | null;
  launch_date: string | null;
  cover_image: string | null;
  developer: { slug: string; name: string } | null;
  stats: UnitStats;
  quality_score: number;
};

export type PublicDevelopmentDetail = DevelopmentRow & {
  developer: DeveloperRow | null;
  units: PublicUnit[];
  stats: UnitStats;
};

function getPublicClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Backend indisponível no momento.");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

function emptyStats(): UnitStats {
  return {
    units_total: 0,
    units_available: 0,
    price_min: null,
    price_max: null,
    area_min: null,
    area_max: null,
    bedrooms: [],
  };
}

type RawUnit = {
  development_id: string;
  price_brl: number | null;
  area_m2: number | null;
  bedrooms: number | null;
  is_available: boolean;
};

function buildStats(units: RawUnit[]): UnitStats {
  const stats = emptyStats();
  const beds = new Set<number>();
  for (const u of units) {
    stats.units_total += 1;
    if (u.is_available) stats.units_available += 1;
    if (typeof u.price_brl === "number" && u.price_brl > 0) {
      stats.price_min = stats.price_min === null ? u.price_brl : Math.min(stats.price_min, u.price_brl);
      stats.price_max = stats.price_max === null ? u.price_brl : Math.max(stats.price_max, u.price_brl);
    }
    if (typeof u.area_m2 === "number" && u.area_m2 > 0) {
      stats.area_min = stats.area_min === null ? u.area_m2 : Math.min(stats.area_min, u.area_m2);
      stats.area_max = stats.area_max === null ? u.area_m2 : Math.max(stats.area_max, u.area_m2);
    }
    if (typeof u.bedrooms === "number" && u.bedrooms > 0) beds.add(u.bedrooms);
  }
  stats.bedrooms = [...beds].sort((a, b) => a - b);
  return stats;
}

/** Critério único de exposição pública — usado na lista e no detalhe. */
export function isPubliclyEligible(row: DevelopmentRow, unitsCount: number): boolean {
  if (!row.is_published || row.publication_status !== "published") return false;
  const { score } = scoreDevelopment(row, unitsCount);
  if (score < PUBLIC_MIN_SCORE) return false;
  const hasEditorial = (row.description ?? "").trim().length >= PUBLIC_MIN_DESCRIPTION;
  return unitsCount > 0 || hasEditorial;
}

async function loadEligible() {
  const supabase = getPublicClient();
  const [devsRes, unitsRes, developersRes] = await Promise.all([
    supabase.from("developments").select("*").eq("is_published", true).limit(1000),
    supabase
      .from("development_properties")
      .select("development_id, price_brl, area_m2, bedrooms, is_available")
      .limit(5000),
    supabase.from("developers").select("*").limit(1000),
  ]);
  if (devsRes.error) throw new Error("Não foi possível carregar os lançamentos.");

  const unitsByDev = new Map<string, RawUnit[]>();
  for (const u of (unitsRes.data ?? []) as RawUnit[]) {
    const list = unitsByDev.get(u.development_id) ?? [];
    list.push(u);
    unitsByDev.set(u.development_id, list);
  }
  const developers = new Map<string, DeveloperRow>();
  for (const d of (developersRes.data ?? []) as DeveloperRow[]) developers.set(d.id, d);

  const rows = ((devsRes.data ?? []) as unknown as DevelopmentRow[]).filter((row) =>
    isPubliclyEligible(row, (unitsByDev.get(row.id) ?? []).length),
  );

  return { rows, unitsByDev, developers };
}

function toCard(
  row: DevelopmentRow,
  units: RawUnit[],
  developer: DeveloperRow | null,
): PublicDevelopmentCard {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    neighborhood: row.neighborhood,
    city: row.city,
    stage: row.stage,
    delivery_estimate: row.delivery_estimate,
    launch_date: row.launch_date,
    cover_image: row.cover_image ?? row.gallery?.[0] ?? null,
    developer: developer ? { slug: developer.slug, name: developer.name } : null,
    stats: buildStats(units),
    quality_score: scoreDevelopment(row, units.length).score,
  };
}

const listSchema = z.object({
  q: z.string().trim().default(""),
  neighborhood: z.string().trim().default(""),
  developer: z.string().trim().default(""),
  stage: z.string().trim().default(""),
  delivery: z.string().trim().default(""),
  price_min: z.number().nullable().default(null),
  price_max: z.number().nullable().default(null),
  bedrooms: z.number().nullable().default(null),
  sort: z.string().trim().default("relevance"),
  page: z.number().int().default(1),
  page_size: z.number().int().default(12),
});

export const listPublicDevelopments = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => listSchema.parse(input ?? {}))
  .handler(async ({ data }) => {
    const { rows, unitsByDev, developers } = await loadEligible();

    const cards = rows.map((row) =>
      toCard(row, unitsByDev.get(row.id) ?? [], row.developer_id ? developers.get(row.developer_id) ?? null : null),
    );

    const facets = {
      neighborhoods: [...new Set(cards.map((c) => c.neighborhood).filter(Boolean) as string[])].sort(),
      developers: [
        ...new Map(cards.filter((c) => c.developer).map((c) => [c.developer!.slug, c.developer!])).values(),
      ].sort((a, b) => a.name.localeCompare(b.name)),
      stages: [...new Set(cards.map((c) => c.stage))],
      deliveries: [...new Set(cards.map((c) => c.delivery_estimate).filter(Boolean) as string[])].sort(),
    };

    const q = normalizeLaunchText(data.q);
    let filtered = cards.filter((c) => {
      if (q && !normalizeLaunchText(`${c.name} ${c.neighborhood ?? ""} ${c.developer?.name ?? ""}`).includes(q))
        return false;
      if (data.neighborhood && normalizeLaunchText(c.neighborhood ?? "") !== normalizeLaunchText(data.neighborhood))
        return false;
      if (data.developer && c.developer?.slug !== data.developer) return false;
      if (data.stage && c.stage !== data.stage) return false;
      if (data.delivery && c.delivery_estimate !== data.delivery) return false;
      if (data.price_min !== null && (c.stats.price_max === null || c.stats.price_max < data.price_min)) return false;
      if (data.price_max !== null && (c.stats.price_min === null || c.stats.price_min > data.price_max)) return false;
      if (data.bedrooms !== null && !c.stats.bedrooms.includes(data.bedrooms)) return false;
      return true;
    });

    filtered = filtered.sort((a, b) => {
      if (data.sort === "recent") {
        return (b.launch_date ?? "").localeCompare(a.launch_date ?? "") || b.quality_score - a.quality_score;
      }
      if (data.sort === "delivery") {
        const av = a.delivery_estimate ?? "zzzz";
        const bv = b.delivery_estimate ?? "zzzz";
        return av.localeCompare(bv);
      }
      return (
        b.quality_score - a.quality_score ||
        b.stats.units_available - a.stats.units_available ||
        a.name.localeCompare(b.name)
      );
    });

    const total = filtered.length;
    const pageSize = Math.min(Math.max(data.page_size, 1), 48);
    const page = Math.max(data.page, 1);
    const start = (page - 1) * pageSize;

    return { items: filtered.slice(start, start + pageSize), total, page, page_size: pageSize, facets };
  });

export const getPublicDevelopment = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().trim().min(1) }).parse(input))
  .handler(async ({ data }): Promise<PublicDevelopmentDetail | null> => {
    const supabase = getPublicClient();
    const { data: row, error } = await supabase
      .from("developments")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw new Error("Não foi possível carregar o lançamento.");
    if (!row) return null;

    const development = row as unknown as DevelopmentRow;

    const { data: unitRows } = await supabase
      .from("development_properties")
      .select(
        "id, unit_name, area_m2, bedrooms, suites, bathrooms, parking_spots, price_brl, is_available, floor_plan_url, position, property:properties(code, title, neighborhood, price_brl, cover_image)",
      )
      .eq("development_id", development.id)
      .order("position", { ascending: true });

    const units = (unitRows ?? []) as unknown as PublicUnit[];
    if (!isPubliclyEligible(development, units.length)) return null;

    let developer: DeveloperRow | null = null;
    if (development.developer_id) {
      const { data: dev } = await supabase
        .from("developers")
        .select("*")
        .eq("id", development.developer_id)
        .maybeSingle();
      developer = (dev as DeveloperRow | null) ?? null;
    }

    return {
      ...development,
      developer,
      units,
      stats: buildStats(
        units.map((u) => ({
          development_id: development.id,
          price_brl: u.price_brl,
          area_m2: u.area_m2,
          bedrooms: u.bedrooms,
          is_available: u.is_available,
        })),
      ),
    };
  });

export type PublicDeveloperDetail = {
  developer: DeveloperRow;
  developments: PublicDevelopmentCard[];
  delivered: PublicDevelopmentCard[];
};

export const getPublicDeveloper = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().trim().min(1) }).parse(input))
  .handler(async ({ data }): Promise<PublicDeveloperDetail | null> => {
    const supabase = getPublicClient();
    const { data: dev, error } = await supabase
      .from("developers")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error("Não foi possível carregar a construtora.");
    if (!dev) return null;

    const developer = dev as DeveloperRow;
    const { rows, unitsByDev } = await loadEligible();
    const cards = rows
      .filter((r) => r.developer_id === developer.id)
      .map((r) => toCard(r, unitsByDev.get(r.id) ?? [], developer));

    return {
      developer,
      developments: cards.filter((c) => c.stage !== "ready"),
      delivered: cards.filter((c) => c.stage === "ready"),
    };
  });

/**
 * Bloco aditivo na página do imóvel: identifica o empreendimento
 * público ao qual o imóvel está vinculado (por property_id).
 */
export const getDevelopmentForPropertyCode = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ code: z.string().trim().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const supabase = getPublicClient();
    const { data: prop } = await supabase
      .from("properties")
      .select("id")
      .eq("code", data.code)
      .maybeSingle();
    if (!prop) return null;

    const { data: link } = await supabase
      .from("development_properties")
      .select("development_id")
      .eq("property_id", prop.id)
      .limit(1)
      .maybeSingle();
    if (!link) return null;

    const { data: row } = await supabase
      .from("developments")
      .select("*")
      .eq("id", link.development_id)
      .eq("is_published", true)
      .maybeSingle();
    if (!row) return null;

    const development = row as unknown as DevelopmentRow;
    const { count } = await supabase
      .from("development_properties")
      .select("id", { count: "exact", head: true })
      .eq("development_id", development.id);

    if (!isPubliclyEligible(development, count ?? 0)) return null;
    return { slug: development.slug, name: development.name, neighborhood: development.neighborhood };
  });

/** Nome núcleo — reexport utilitário para uso em UI de lançamentos. */
export { coreLaunchName };
