import { createClient } from "@supabase/supabase-js";
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

