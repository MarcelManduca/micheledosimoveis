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
  condo_fee_min_brl: number | null;
  condo_fee_avg_brl: number | null;
  iptu_min_brl: number | null;
  iptu_avg_brl: number | null;
  area_min_m2: number | null;
  area_max_m2: number | null;
  bedrooms_min: number | null;
  bedrooms_max: number | null;
  bathrooms_min: number | null;
  bathrooms_max: number | null;
  parking_spots_min: number | null;
  parking_spots_max: number | null;
  units_count: number | null;
  towers_count: number | null;
  floors_count: number | null;
  construction_year: number | null;
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
  SUMMARY_COLS +
  ", city, state, postal_code, latitude, longitude, description" +
  ", condo_fee_min_brl, condo_fee_avg_brl, iptu_min_brl, iptu_avg_brl" +
  ", area_min_m2, area_max_m2, bedrooms_min, bedrooms_max" +
  ", bathrooms_min, bathrooms_max, parking_spots_min, parking_spots_max" +
  ", units_count, towers_count, floors_count, construction_year";

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
      condo_fee_min_brl: (r.condo_fee_min_brl as number | null) ?? null,
      condo_fee_avg_brl: (r.condo_fee_avg_brl as number | null) ?? null,
      iptu_min_brl: (r.iptu_min_brl as number | null) ?? null,
      iptu_avg_brl: (r.iptu_avg_brl as number | null) ?? null,
      area_min_m2: (r.area_min_m2 as number | null) ?? null,
      area_max_m2: (r.area_max_m2 as number | null) ?? null,
      bedrooms_min: (r.bedrooms_min as number | null) ?? null,
      bedrooms_max: (r.bedrooms_max as number | null) ?? null,
      bathrooms_min: (r.bathrooms_min as number | null) ?? null,
      bathrooms_max: (r.bathrooms_max as number | null) ?? null,
      parking_spots_min: (r.parking_spots_min as number | null) ?? null,
      parking_spots_max: (r.parking_spots_max as number | null) ?? null,
      units_count: (r.units_count as number | null) ?? null,
      towers_count: (r.towers_count as number | null) ?? null,
      floors_count: (r.floors_count as number | null) ?? null,
      construction_year: (r.construction_year as number | null) ?? null,
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
  "id, code, title, address, neighborhood, city, price_brl, area_m2, bedrooms, bathrooms, cover_image, featured, is_launch, property_photos(url, position)";

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

// ---------------------------------------------------------------------------
// Address-based matching (logradouro + número). condo_name NÃO é usado sozinho.
// ---------------------------------------------------------------------------

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Normaliza endereço para comparação: minúsculas, sem acento, abreviações expandidas. */
export function normalizeAddressForMatch(address: string): string {
  let s = stripAccents(address.toLowerCase());
  s = s.replace(/[.,;:()]/g, " ");
  s = s.replace(/\s-\s/g, " ");
  // n° / nº / n.º / no.
  s = s.replace(/\bn[º°o]\.?\s*/g, " ");
  // Abreviações comuns de logradouro
  s = s.replace(/\brua\b/g, "rua");
  s = s.replace(/\br\b/g, "rua");
  s = s.replace(/\bavenida\b/g, "avenida");
  s = s.replace(/\bav\b/g, "avenida");
  s = s.replace(/\brodovia\b/g, "rodovia");
  s = s.replace(/\brod\b/g, "rodovia");
  s = s.replace(/\btravessa\b/g, "travessa");
  s = s.replace(/\btv\b/g, "travessa");
  s = s.replace(/\bservidao\b/g, "servidao");
  s = s.replace(/\bserv\b/g, "servidao");
  s = s.replace(/\balameda\b/g, "alameda");
  s = s.replace(/\bal\b/g, "alameda");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

/** Extrai logradouro e número principal do endereço. Ignora apto/bloco/torre. */
export function extractStreetAndNumber(address: string | null | undefined): {
  street: string | null;
  number: string | null;
} {
  if (!address) return { street: null, number: null };
  const normalized = normalizeAddressForMatch(address);
  // Descarta tudo a partir de complementos
  const cut =
    normalized.split(
      /\b(apto|apartamento|apart|bloco|bl|torre|sala|unidade|un|casa|cj|conjunto|fundos)\b/,
    )[0] ?? normalized;

  // "<logradouro> <número><letra opcional>" antes de vírgula/traço/fim
  const m = cut.match(/^(.+?)\s+(\d{1,6}[a-z]?)\b/);
  if (m) {
    const street = m[1].replace(/\s+/g, " ").trim();
    const number = m[2].toUpperCase();
    return { street: street || null, number };
  }
  return { street: cut.trim() || null, number: null };
}

/** Remove tipo de logradouro do início e retorna o núcleo do nome da via. */
export function extractStreetCore(street: string | null | undefined): string | null {
  if (!street) return null;
  let s = street.trim();
  // Tipos já normalizados (sem acento, minúsculo) via normalizeAddressForMatch.
  const typeRe =
    /^(rua|r|avenida|av|servidao|serv|rodovia|rod|travessa|tv|alameda|al|estrada|est|praca|largo|viela|via|beco|ladeira|passagem|passeio|caminho|rotula|rot)\b\.?\s+/;
  let prev = "";
  while (s !== prev) {
    prev = s;
    s = s.replace(typeRe, "").trim();
  }
  s = s.replace(/\s+/g, " ").trim();
  return s || null;
}

/** Comparação de logradouro tolerante: compara pelos núcleos (sem tipo). */
function streetsEqualish(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const coreA = extractStreetCore(a) ?? a;
  const coreB = extractStreetCore(b) ?? b;
  if (coreA && coreB && coreA === coreB) return true;
  // Fallback tolerante: uma contém a outra (mínimo 6 chars) para variações menores.
  const shorter = coreA.length < coreB.length ? coreA : coreB;
  const longer = coreA.length < coreB.length ? coreB : coreA;
  if (shorter && shorter.length >= 6 && longer.includes(shorter)) return true;
  return false;
}

export type MatchResult = {
  matched: boolean;
  confidence: "high" | "medium" | "low" | "none";
  method: "address_exact" | "address_neighborhood" | "name_only" | "nearby_neighborhood" | "none";
};

/**
 * Regra pública: match SÓ é "high" quando logradouro + número batem.
 * condo_name é apenas reforço, nunca critério único.
 */
export function matchPropertyToCondominiumByAddress(
  property: { address: string | null; neighborhood?: string | null },
  condominium: { address: string | null; normalized_neighborhood?: string | null },
): MatchResult {
  const c = extractStreetAndNumber(condominium.address);
  const p = extractStreetAndNumber(property.address);

  if (c.street && c.number && p.street && p.number) {
    if (streetsEqualish(c.street, p.street) && c.number === p.number) {
      const cNb = condominium.normalized_neighborhood
        ? stripAccents(condominium.normalized_neighborhood.toLowerCase()).trim()
        : "";
      const pNb = property.neighborhood
        ? stripAccents(property.neighborhood.toLowerCase()).trim()
        : "";
      const neighborhoodOk = !cNb || !pNb || cNb === pNb || cNb.includes(pNb) || pNb.includes(cNb);
      return {
        matched: true,
        confidence: neighborhoodOk ? "high" : "medium",
        method: neighborhoodOk ? "address_exact" : "address_neighborhood",
      };
    }
  }
  return { matched: false, confidence: "none", method: "none" };
}

export const getPropertiesForCondominium = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        condoName: z.string().min(1),
        condoAddress: z.string().nullable().optional(),
        condoNeighborhood: z.string().nullable().optional(),
        neighborhoodQuery: z.string().optional(),
      })
      .parse(input),
  )
  .handler(
    async ({
      data,
    }): Promise<{ inCondo: PropertyListItem[]; nearby: PropertyListItem[] }> => {
      const supabase = getPublicClient();

      // Pool candidato: imóveis publicados no mesmo bairro. Se não há bairro,
      // não conseguimos montar um pool seguro — retornamos vazio para "inCondo".
      const nbQuery = (data.neighborhoodQuery ?? "").trim();
      if (!nbQuery) return { inCondo: [], nearby: [] };

      const nb = escapeLike(nbQuery);
      const poolRes = await supabase
        .from("properties")
        .select(PROP_LIST_COLS)
        .eq("published", true)
        .ilike("neighborhood", `%${nb}%`)
        .order("created_at", { ascending: false })
        .limit(60);

      const pool = (poolRes.data ?? []).map((r) =>
        normalizeProperty(r as unknown as Record<string, unknown>),
      );

      const condo = {
        address: data.condoAddress ?? null,
        normalized_neighborhood: data.condoNeighborhood ?? null,
      };

      const inCondo: PropertyListItem[] = [];
      const nearby: PropertyListItem[] = [];

      for (const p of pool) {
        const prop = p as PropertyListItem & { address?: string | null };
        const res = matchPropertyToCondominiumByAddress(
          { address: prop.address ?? null, neighborhood: prop.neighborhood },
          condo,
        );
        if (res.confidence === "high") inCondo.push(prop);
        else nearby.push(prop);
      }

      return { inCondo: inCondo.slice(0, 24), nearby: nearby.slice(0, 8) };
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
  address: string | null;
  neighborhood: string | null;
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

const STAT_COLS =
  "address, neighborhood, price_brl, condo_fee_brl, iptu_brl, area_m2, bedrooms, parking_spots";

const EMPTY_REFS: CondoValueRefs = {
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

export const getCondoValueRefs = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        condoName: z.string().min(1),
        condoAddress: z.string().nullable().optional(),
        condoNeighborhood: z.string().nullable().optional(),
        neighborhoodQuery: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<CondoValueRefs> => {
    const supabase = getPublicClient();
    const nbQuery = (data.neighborhoodQuery ?? "").trim();
    if (!nbQuery) return EMPTY_REFS;

    const nb = escapeLike(nbQuery);
    const poolRes = await supabase
      .from("properties")
      .select(STAT_COLS)
      .eq("published", true)
      .ilike("neighborhood", `%${nb}%`)
      .limit(400);

    const pool = (poolRes.data ?? []) as unknown as StatRow[];
    const condo = {
      address: data.condoAddress ?? null,
      normalized_neighborhood: data.condoNeighborhood ?? null,
    };

    const inCondo: StatRow[] = [];
    for (const row of pool) {
      const res = matchPropertyToCondominiumByAddress(
        { address: row.address, neighborhood: row.neighborhood },
        condo,
      );
      if (res.confidence === "high") inCondo.push(row);
    }

    // Somente dados específicos do condomínio (match de endereço de alta confiança).
    // Não fazemos fallback para o bairro na página individual do condomínio.
    if (inCondo.length >= 2) return computeRefs(inCondo, "condo");
    return EMPTY_REFS;
  });

// ---------------------------------------------------------------------------
// Dados específicos do condomínio (não usa bairro, não inventa valores).
// ---------------------------------------------------------------------------

export type CondominiumFacts = {
  postalCode: string | null;
  condoFeeLabel: string | null;
  iptuLabel: string | null;
  areaLabel: string | null;
  bedroomsLabel: string | null;
  bathroomsLabel: string | null;
  parkingSpotsLabel: string | null;
  unitsLabel: string | null;
  towersLabel: string | null;
  floorsLabel: string | null;
  constructionYearLabel: string | null;
  hasAnyQuantitativeData: boolean;
};

function formatCepInternal(cep: string | null | undefined): string | null {
  if (!cep) return null;
  const d = cep.replace(/\D/g, "");
  if (d.length !== 8) return null;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

function brlLabel(n: number): string {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function rangeLabel(
  min: number | null,
  max: number | null,
  unit: string,
  singular?: string,
): string | null {
  if (min == null && max == null) return null;
  const u = (n: number) => (singular && n === 1 ? singular : unit);
  if (min != null && max != null) {
    if (min === max) return `${min} ${u(min)}`;
    return `${min} a ${max} ${u(max)}`;
  }
  if (min != null) return `a partir de ${min} ${u(min)}`;
  if (max != null) return `até ${max} ${u(max)}`;
  return null;
}

function moneyRefLabel(min: number | null, avg: number | null): string | null {
  if (min != null && min > 0) return `a partir de ${brlLabel(min)}`;
  if (avg != null && avg > 0) return `média de ${brlLabel(avg)}`;
  return null;
}

export function getCondominiumFacts(condo: CondominiumDetail): CondominiumFacts {
  const areaLabel = rangeLabel(condo.area_min_m2, condo.area_max_m2, "m²");
  const bedroomsLabel = rangeLabel(
    condo.bedrooms_min,
    condo.bedrooms_max,
    "dormitórios",
    "dormitório",
  );
  const bathroomsLabel = rangeLabel(
    condo.bathrooms_min,
    condo.bathrooms_max,
    "banheiros",
    "banheiro",
  );
  const parkingSpotsLabel = rangeLabel(
    condo.parking_spots_min,
    condo.parking_spots_max,
    "vagas",
    "vaga",
  );
  const condoFeeLabel = moneyRefLabel(condo.condo_fee_min_brl, condo.condo_fee_avg_brl);
  const iptuLabel = moneyRefLabel(condo.iptu_min_brl, condo.iptu_avg_brl);
  const unitsLabel =
    condo.units_count != null && condo.units_count > 0
      ? `${condo.units_count} ${condo.units_count === 1 ? "unidade" : "unidades"}`
      : null;
  const towersLabel =
    condo.towers_count != null && condo.towers_count > 0
      ? `${condo.towers_count} ${condo.towers_count === 1 ? "torre" : "torres"}`
      : null;
  const floorsLabel =
    condo.floors_count != null && condo.floors_count > 0
      ? `${condo.floors_count} ${condo.floors_count === 1 ? "andar" : "andares"}`
      : null;
  const constructionYearLabel =
    condo.construction_year != null && condo.construction_year > 0
      ? String(condo.construction_year)
      : null;

  const hasAnyQuantitativeData = [
    condoFeeLabel,
    iptuLabel,
    areaLabel,
    bedroomsLabel,
    bathroomsLabel,
    parkingSpotsLabel,
    unitsLabel,
    towersLabel,
    floorsLabel,
    constructionYearLabel,
  ].some((v) => v != null);

  return {
    postalCode: formatCepInternal(condo.postal_code),
    condoFeeLabel,
    iptuLabel,
    areaLabel,
    bedroomsLabel,
    bathroomsLabel,
    parkingSpotsLabel,
    unitsLabel,
    towersLabel,
    floorsLabel,
    constructionYearLabel,
    hasAnyQuantitativeData,
  };
}



