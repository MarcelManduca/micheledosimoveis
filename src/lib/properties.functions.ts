import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type PropertyListItem = {
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
  images: string[];
  featured: boolean;
  is_launch?: boolean;
};

function getPublicClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Backend indisponível no momento.");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

function safeError(message: string, err: unknown): never {
  console.error(message, err);
  throw new Error(message);
}

async function assertAdmin(ctx: {
  supabase: Awaited<ReturnType<typeof getPublicClient>>;
  userId: string;
}) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) safeError("Não foi possível verificar suas permissões.", error);
  if (!data) throw new Error("Acesso negado: apenas administradores.");
}

const LIST_COLS =
  "id, code, title, neighborhood, city, price_brl, area_m2, bedrooms, bathrooms, cover_image, featured, is_launch, property_photos(url, position)";

type PhotoJoin = { url: string; position: number };

function normalizeRow(row: Record<string, unknown>): PropertyListItem {
  const photos = (row.property_photos as PhotoJoin[] | null | undefined) ?? [];
  const sorted = [...photos].sort((a, b) => a.position - b.position).map((p) => p.url);
  const cover = (row.cover_image as string | null) ?? null;
  const images = sorted.length > 0 ? sorted : cover ? [cover] : [];
  const { property_photos: _omit, ...rest } = row as Record<string, unknown>;
  void _omit;
  return { ...(rest as Omit<PropertyListItem, "images">), images } as PropertyListItem;
}

function normalizeRows(rows: unknown[] | null): PropertyListItem[] {
  return (rows ?? []).map((r) => normalizeRow(r as Record<string, unknown>));
}

// ───────── Public reads ─────────

export const listProperties = createServerFn({ method: "GET" }).handler(
  async (): Promise<PropertyListItem[]> => {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from("properties")
      .select(LIST_COLS)
      .eq("published", true)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(12);
    if (error) safeError("Não foi possível carregar os imóveis.", error);
    return normalizeRows(data);
  },
);

export const listLaunches = createServerFn({ method: "GET" }).handler(
  async (): Promise<PropertyListItem[]> => {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from("properties")
      .select(LIST_COLS)
      .eq("published", true)
      .eq("is_launch", true)
      .order("created_at", { ascending: false })
      .limit(12);
    if (error) safeError("Não foi possível carregar os lançamentos.", error);
    return normalizeRows(data);
  },
);

const searchSchema = z
  .object({
    tipo: z.string().trim().max(60).optional().nullable(),
    bairro: z.string().trim().max(120).optional().nullable(),
    dorms: z.number().int().min(0).max(10).optional().nullable(),
    precoMin: z.number().int().min(0).max(1_000_000_000).optional().nullable(),
    precoMax: z.number().int().min(0).max(1_000_000_000).optional().nullable(),
  })
  .refine(
    (d) => d.precoMin == null || d.precoMax == null || d.precoMin <= d.precoMax,
    { message: "Faixa de preço inválida." },
  );

// Escape LIKE/ILIKE wildcards so user input can't broaden the match
// (e.g. "%" matching everything, "_" matching any single char).
function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, "\\$&");
}

export const searchProperties = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => searchSchema.parse(d))
  .handler(async ({ data }): Promise<PropertyListItem[]> => {
    const supabase = getPublicClient();
    let q = supabase
      .from("properties")
      .select(LIST_COLS)
      .eq("published", true);
    if (data.tipo) q = q.ilike("property_type", `%${escapeLike(data.tipo)}%`);
    if (data.bairro) q = q.ilike("neighborhood", `%${escapeLike(data.bairro)}%`);
    if (data.dorms != null) {
      if (data.dorms >= 4) q = q.gte("bedrooms", 4);
      else q = q.eq("bedrooms", data.dorms);
    }
    if (data.precoMin != null) q = q.gte("price_brl", data.precoMin);
    if (data.precoMax != null) q = q.lte("price_brl", data.precoMax);
    const { data: rows, error } = await q
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) safeError("Não foi possível pesquisar os imóveis.", error);
    return normalizeRows(rows);
  });

const codeSchema = z.object({
  code: z.string().trim().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/),
});

export const getPropertyByCode = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => codeSchema.parse(d))
  .handler(async ({ data }) => {
    const supabase = getPublicClient();
    const { data: prop, error } = await supabase
      .from("properties")
      .select("*")
      .eq("code", data.code)
      .eq("published", true)
      .maybeSingle();
    if (error) safeError("Não foi possível carregar o imóvel.", error);
    if (!prop) return null;
    const { data: photos, error: phErr } = await supabase
      .from("property_photos")
      .select("url, position")
      .eq("property_id", prop.id)
      .order("position", { ascending: true });
    if (phErr) safeError("Não foi possível carregar as fotos.", phErr);
    return { property: prop, photos: photos ?? [] };
  });

// ───────── Admin status / bootstrap ─────────

export const getMyAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Read-only check. Admin promotion is NOT performed here — it must be
    // done explicitly via a SQL migration / backend tool. Doing it from a
    // user-facing server fn would silently elevate any signed-in user if the
    // user_roles table were ever emptied.
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) safeError("Não foi possível verificar seu acesso.", error);
    return { isAdmin: Boolean(data), bootstrapped: false };
  });

// ───────── Admin actions ─────────

const importSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .url()
    .refine(
      (u) => {
        try {
          const p = new URL(u);
          return (
            p.protocol === "https:" &&
            (p.hostname === "gralhaimoveis.com.br" || p.hostname === "www.gralhaimoveis.com.br")
          );
        } catch {
          return false;
        }
      },
      { message: "Use um link https://www.gralhaimoveis.com.br/imovel/..." },
    ),
  featured: z.boolean().optional().default(false),
  isLaunch: z.boolean().optional().default(false),
});

export const importGralhaProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => importSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin({ supabase: context.supabase as never, userId: context.userId });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { scrapeGralhaProperty } = await import("./gralha-scraper.server");

    let scraped;
    try {
      scraped = await scrapeGralhaProperty(data.url);
    } catch (err) {
      console.error("scrapeGralhaProperty failed", err);
      // Surface a stable, user-safe message; don't echo upstream errors that
      // might include internal hostnames, stack frames, or HTML snippets.
      throw new Error("Falha ao importar o imóvel. Verifique o link e tente novamente.");
    }

    const { data: upserted, error: upErr } = await supabaseAdmin
      .from("properties")
      .upsert(
        {
          code: scraped.code,
          source_url: scraped.source_url,
          title: scraped.title,
          property_type: scraped.property_type,
          neighborhood: scraped.neighborhood,
          city: scraped.city,
          state: scraped.state,
          address: scraped.address,
          condo_name: scraped.condo_name,
          price_brl: scraped.price_brl,
          condo_fee_brl: scraped.condo_fee_brl,
          iptu_brl: scraped.iptu_brl,
          area_m2: scraped.area_m2,
          bedrooms: scraped.bedrooms,
          suites: scraped.suites,
          bathrooms: scraped.bathrooms,
          parking_spots: scraped.parking_spots,
          description: scraped.description,
          features: scraped.features,
          condo_features: scraped.condo_features,
          cover_image: scraped.cover_image,
          published: true,
          featured: data.featured,
          is_launch: data.isLaunch,
        },
        { onConflict: "code" },
      )
      .select("id, code")
      .single();
    if (upErr || !upserted) safeError("Não foi possível salvar o imóvel.", upErr);

    const { error: delErr } = await supabaseAdmin
      .from("property_photos")
      .delete()
      .eq("property_id", upserted!.id);
    if (delErr) safeError("Não foi possível atualizar as fotos.", delErr);

    if (scraped.photos.length > 0) {
      const rows = scraped.photos.slice(0, 80).map((url, i) => ({
        property_id: upserted!.id,
        url,
        position: i,
      }));
      const { error: phErr } = await supabaseAdmin.from("property_photos").insert(rows);
      if (phErr) safeError("Não foi possível salvar as fotos.", phErr);
    }

    return { id: upserted!.id, code: upserted!.code, photos: scraped.photos.length };
  });

export const adminListProperties = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin({ supabase: context.supabase as never, userId: context.userId });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("properties")
      .select(
        "id, code, title, neighborhood, city, price_brl, featured, is_launch, published, created_at, cover_image",
      )
      .order("created_at", { ascending: false });
    if (error) safeError("Não foi possível listar os imóveis.", error);
    return data ?? [];
  });

const idSchema = z.object({ id: z.string().uuid() });
const featuredSchema = idSchema.extend({ featured: z.boolean() });
const launchSchema = idSchema.extend({ is_launch: z.boolean() });

export const setPropertyFeatured = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => featuredSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin({ supabase: context.supabase as never, userId: context.userId });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("properties")
      .update({ featured: data.featured })
      .eq("id", data.id);
    if (error) safeError("Não foi possível atualizar o destaque.", error);
    return { ok: true };
  });

export const setPropertyLaunch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => launchSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin({ supabase: context.supabase as never, userId: context.userId });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("properties")
      .update({ is_launch: data.is_launch })
      .eq("id", data.id);
    if (error) safeError("Não foi possível atualizar o lançamento.", error);
    return { ok: true };
  });

export const deleteProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin({ supabase: context.supabase as never, userId: context.userId });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("properties").delete().eq("id", data.id);
    if (error) safeError("Não foi possível excluir o imóvel.", error);
    return { ok: true };
  });

// ───────── Availability + full refresh sync ─────────

export type SyncSummary = {
  checked: number;
  available: number;
  refreshed: number;
  unpublished: number;
  errors: number;
  details: Array<{ code: string; status: string; detail: string }>;
};

async function runAvailabilitySync(): Promise<SyncSummary> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { checkGralhaAvailability } = await import("./gralha-availability.server");
  const { scrapeGralhaProperty } = await import("./gralha-scraper.server");

  const { data: rows, error } = await supabaseAdmin
    .from("properties")
    .select("id, code, source_url, published")
    .not("source_url", "is", null);
  if (error) safeError("Não foi possível listar imóveis para sincronizar.", error);

  const summary: SyncSummary = {
    checked: 0,
    available: 0,
    refreshed: 0,
    unpublished: 0,
    errors: 0,
    details: [],
  };

  for (const row of rows ?? []) {
    if (!row.source_url) continue;
    summary.checked += 1;
    const result = await checkGralhaAvailability(row.source_url);
    const now = new Date().toISOString();

    if (result.status === "not_found") {
      summary.unpublished += 1;
      summary.details.push({ code: row.code, status: "removido", detail: result.detail });
      await supabaseAdmin
        .from("properties")
        .update({
          last_checked_at: now,
          last_check_status: `not_found: ${result.detail}`,
          unavailable_since: now,
          published: false,
        })
        .eq("id", row.id);
      continue;
    }

    if (result.status === "error") {
      summary.errors += 1;
      summary.details.push({ code: row.code, status: "erro", detail: result.detail });
      await supabaseAdmin
        .from("properties")
        .update({
          last_checked_at: now,
          last_check_status: `error: ${result.detail}`,
        })
        .eq("id", row.id);
      continue;
    }

    // Available — re-scrape to refresh price, photos, description, etc.
    summary.available += 1;
    try {
      const scraped = await scrapeGralhaProperty(row.source_url);
      const { error: upErr } = await supabaseAdmin
        .from("properties")
        .update({
          // Refresh content fields; preserve featured/is_launch/published
          title: scraped.title,
          property_type: scraped.property_type,
          neighborhood: scraped.neighborhood,
          city: scraped.city,
          state: scraped.state,
          address: scraped.address,
          condo_name: scraped.condo_name,
          price_brl: scraped.price_brl,
          condo_fee_brl: scraped.condo_fee_brl,
          iptu_brl: scraped.iptu_brl,
          area_m2: scraped.area_m2,
          bedrooms: scraped.bedrooms,
          suites: scraped.suites,
          bathrooms: scraped.bathrooms,
          parking_spots: scraped.parking_spots,
          description: scraped.description,
          features: scraped.features,
          condo_features: scraped.condo_features,
          cover_image: scraped.cover_image,
          last_checked_at: now,
          last_check_status: "available",
          unavailable_since: null,
        })
        .eq("id", row.id);
      if (upErr) throw upErr;

      // Replace photo set
      await supabaseAdmin.from("property_photos").delete().eq("property_id", row.id);
      if (scraped.photos.length > 0) {
        const rowsToInsert = scraped.photos.slice(0, 80).map((url, i) => ({
          property_id: row.id,
          url,
          position: i,
        }));
        await supabaseAdmin.from("property_photos").insert(rowsToInsert);
      }
      summary.refreshed += 1;
      summary.details.push({ code: row.code, status: "atualizado", detail: "Dados e fotos sincronizados" });
    } catch (err) {
      // Listing is available but refresh failed — keep it published, log the issue.
      summary.errors += 1;
      summary.details.push({
        code: row.code,
        status: "erro_refresh",
        detail: (err as Error).message || "Falha ao atualizar dados",
      });
      await supabaseAdmin
        .from("properties")
        .update({
          last_checked_at: now,
          last_check_status: `refresh_error: ${(err as Error).message || "desconhecido"}`,
        })
        .eq("id", row.id);
    }
  }
  return summary;
}

export const syncPropertiesAvailability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin({ supabase: context.supabase as never, userId: context.userId });
    return runAvailabilitySync();
  });

export async function _runAvailabilitySyncInternal() {
  return runAvailabilitySync();
}

