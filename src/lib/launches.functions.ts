import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Vertical de LANÇAMENTOS — módulo isolado.
 * Não importa nem altera nada de imóveis, condomínios ou VRSync.
 */

export type DeveloperRow = {
  id: string;
  slug: string;
  name: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  description: string | null;
  city: string | null;
  state: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DevelopmentRow = {
  id: string;
  slug: string;
  name: string;
  developer_id: string | null;
  stage: string;
  address: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  postal_code: string | null;
  price_min_brl: number | null;
  price_max_brl: number | null;
  area_min_m2: number | null;
  area_max_m2: number | null;
  bedrooms_min: number | null;
  bedrooms_max: number | null;
  delivery_estimate: string | null;
  cover_image: string | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
  publication_status: string;
  created_at: string;
  updated_at: string;
};

export function slugifyLaunch(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const nullableText = z.string().trim().optional().nullable();
const nullableNumber = z.number().nullable().optional();

const developerSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  slug: z.string().min(1),
  name: z.string().min(1),
  website: nullableText,
  phone: nullableText,
  email: nullableText,
  logo_url: nullableText,
  description: nullableText,
  city: nullableText,
  state: nullableText,
  is_active: z.boolean().default(false),
});

const developmentSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  slug: z.string().min(1),
  name: z.string().min(1),
  developer_id: z.string().uuid().nullable().optional(),
  stage: z.string().default("lancamento"),
  address: nullableText,
  neighborhood: nullableText,
  city: z.string().default("Florianópolis"),
  state: z.string().default("SC"),
  postal_code: nullableText,
  price_min_brl: nullableNumber,
  price_max_brl: nullableNumber,
  area_min_m2: nullableNumber,
  area_max_m2: nullableNumber,
  bedrooms_min: nullableNumber,
  bedrooms_max: nullableNumber,
  delivery_estimate: nullableText,
  cover_image: nullableText,
  description: nullableText,
  seo_title: nullableText,
  seo_description: nullableText,
  is_published: z.boolean().default(false),
});

function fail(message: string, error: unknown): never {
  console.error("[launches]", message, error);
  throw new Error(message);
}

// ───────── Construtoras ─────────

export const adminListDevelopers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("developers")
      .select("*")
      .order("name", { ascending: true });
    if (error) fail("Não foi possível carregar as construtoras.", error);
    return (data ?? []) as DeveloperRow[];
  });

export const adminSaveDeveloper = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => developerSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...payload } = data;
    const row = { ...payload, slug: slugifyLaunch(payload.slug) };
    const query = id
      ? context.supabase.from("developers").update(row).eq("id", id).select("*").single()
      : context.supabase.from("developers").insert(row).select("*").single();
    const { data: saved, error } = await query;
    if (error) fail("Não foi possível salvar a construtora.", error);
    return saved as DeveloperRow;
  });

export const adminDeleteDeveloper = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("developers").delete().eq("id", data.id);
    if (error) fail("Não foi possível excluir a construtora.", error);
    return { ok: true };
  });

// ───────── Lançamentos ─────────

export const adminListDevelopments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("developments")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) fail("Não foi possível carregar os lançamentos.", error);
    return (data ?? []) as DevelopmentRow[];
  });

export const adminSaveDevelopment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => developmentSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...payload } = data;
    const row = {
      ...payload,
      slug: slugifyLaunch(payload.slug),
      publication_status: payload.is_published ? "published" : "draft",
    };
    const query = id
      ? context.supabase.from("developments").update(row).eq("id", id).select("*").single()
      : context.supabase.from("developments").insert(row).select("*").single();
    const { data: saved, error } = await query;
    if (error) fail("Não foi possível salvar o lançamento.", error);
    return saved as DevelopmentRow;
  });

export const adminDeleteDevelopment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("developments").delete().eq("id", data.id);
    if (error) fail("Não foi possível excluir o lançamento.", error);
    return { ok: true };
  });
