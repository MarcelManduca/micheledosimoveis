import { z } from "zod";

/** Schemas e helpers de validação da vertical de LANÇAMENTOS. */



const nullableText = z.string().trim().optional().nullable();
const nullableNumber = z.number().nullable().optional();

export const developerSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  slug: z.string().min(1),
  name: z.string().trim().min(1, "Informe o nome da construtora."),
  website: nullableText,
  phone: nullableText,
  email: nullableText,
  instagram: nullableText,
  logo_url: nullableText,
  description: nullableText,
  city: nullableText,
  state: nullableText,
  founded_year: nullableNumber,
  seo_title: nullableText,
  seo_description: nullableText,
  is_active: z.boolean().default(false),
});

export const DEVELOPMENT_STAGES = [
  { value: "pre_launch", label: "Pré-lançamento" },
  { value: "launch", label: "Lançamento" },
  { value: "under_construction", label: "Em obras" },
  { value: "ready", label: "Pronto para morar" },
] as const;

export const developmentSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  slug: z.string().min(1),
  name: z.string().trim().min(1, "Informe o nome do lançamento."),
  developer_id: z.string().uuid().nullable().optional(),
  stage: z.string().default("launch"),
  address: nullableText,
  neighborhood: nullableText,
  city: z.string().default("Florianópolis"),
  state: z.string().default("SC"),
  postal_code: nullableText,
  latitude: nullableNumber,
  longitude: nullableNumber,
  price_min_brl: nullableNumber,
  price_max_brl: nullableNumber,
  area_min_m2: nullableNumber,
  area_max_m2: nullableNumber,
  bedrooms_min: nullableNumber,
  bedrooms_max: nullableNumber,
  launch_date: nullableText,
  delivery_estimate: nullableText,
  amenities: z.array(z.string()).default([]),
  gallery: z.array(z.string()).default([]),
  video_url: nullableText,
  brochure_url: nullableText,
  architecture: nullableText,
  landscaping: nullableText,
  interiors: nullableText,
  cover_image: nullableText,
  description: nullableText,
  seo_title: nullableText,
  seo_description: nullableText,
  is_published: z.boolean().default(false),
});

export function fail(message: string, error: unknown): never {
  console.error("[launches]", message, error);
  throw new Error(message);
}

export function isUniqueViolation(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return code === "23505";
}


export async function linkProperties(

  context: { supabase: any },
  developmentId: string,
  propertyIds: string[],
): Promise<number> {
  const { data: existing } = await context.supabase
    .from("development_properties")
    .select("property_id")
    .eq("development_id", developmentId);
  const already = new Set((existing ?? []).map((e: { property_id: string | null }) => e.property_id));
  const pending = propertyIds.filter((id) => !already.has(id));
  if (pending.length === 0) return 0;

  const { data: props } = await context.supabase
    .from("properties")
    .select("id, code, title, area_m2, bedrooms, suites, bathrooms, parking_spots, price_brl")
    .in("id", pending);

  const rows = (props ?? []).map((p: any, index: number) => ({
    development_id: developmentId,
    property_id: p.id,
    unit_name: p.code ? `Imóvel ${p.code}` : p.title,
    area_m2: p.area_m2,
    bedrooms: p.bedrooms,
    suites: p.suites,
    bathrooms: p.bathrooms,
    parking_spots: p.parking_spots,
    price_brl: p.price_brl,
    position: index,
  }));
  if (rows.length === 0) return 0;
  const { error } = await context.supabase.from("development_properties").insert(rows);
  if (error) fail("Não foi possível vincular os imóveis.", error);
  return rows.length;
}
