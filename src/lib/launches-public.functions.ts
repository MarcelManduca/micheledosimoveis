import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  type DeveloperRow,
  type DevelopmentRow,
} from "@/lib/launches-shared";
import {
  type PublicDeveloperDetail,
  type PublicDevelopmentDetail,
  type PublicUnit,
  buildStats,
  getPublicClient,
  isPubliclyEligible,
  listSchema,
  loadEligible,
  normalizeLaunchText,
  toCard,
} from "@/lib/launches-public";

/**
 * Server functions PÚBLICAS da vertical de LANÇAMENTOS (thin wrapper).
 * Toda a lógica auxiliar vive em @/lib/launches-public.
 */

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
