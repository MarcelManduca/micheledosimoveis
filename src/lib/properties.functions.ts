import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabase } from "@/integrations/supabase/client";

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
  featured: boolean;
};

// Public: list properties for the homepage
export const listProperties = createServerFn({ method: "GET" }).handler(
  async (): Promise<PropertyListItem[]> => {
    const { data, error } = await supabase
      .from("properties")
      .select(
        "id, code, title, neighborhood, city, price_brl, area_m2, bedrooms, bathrooms, cover_image, featured",
      )
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(12);
    if (error) throw new Error(error.message);
    return data ?? [];
  },
);

// Public: get a property and its photos by code
export const getPropertyByCode = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => {
    if (typeof d !== "object" || d === null || !("code" in d)) throw new Error("code required");
    const code = String((d as { code: unknown }).code);
    return { code };
  })
  .handler(async ({ data }) => {
    const { data: prop, error } = await supabase
      .from("properties")
      .select("*")
      .eq("code", data.code)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!prop) return null;
    const { data: photos } = await supabase
      .from("property_photos")
      .select("url, position")
      .eq("property_id", prop.id)
      .order("position", { ascending: true });
    return { property: prop, photos: photos ?? [] };
  });

// Auth: check if current user is admin / claim admin if none exists yet
export const getMyAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) === 0) {
      // Bootstrap: first authenticated user becomes admin
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "admin" });
      return { isAdmin: true, bootstrapped: true };
    }
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data, bootstrapped: false };
  });

// Admin: import a property from a Gralha Imóveis URL
export const importGralhaProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => {
    if (typeof d !== "object" || d === null || !("url" in d)) throw new Error("url required");
    return { url: String((d as { url: unknown }).url) };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Verify admin
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Acesso negado: apenas administradores.");

    const { scrapeGralhaProperty } = await import("./gralha-scraper.server");
    const scraped = await scrapeGralhaProperty(data.url);

    // Upsert property by code
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
        },
        { onConflict: "code" },
      )
      .select("id, code")
      .single();
    if (upErr) throw new Error(upErr.message);

    // Reset photos and insert fresh set
    await supabaseAdmin.from("property_photos").delete().eq("property_id", upserted.id);
    if (scraped.photos.length > 0) {
      const rows = scraped.photos.map((url, i) => ({
        property_id: upserted.id,
        url,
        position: i,
      }));
      const { error: phErr } = await supabaseAdmin.from("property_photos").insert(rows);
      if (phErr) throw new Error(phErr.message);
    }

    return { id: upserted.id, code: upserted.code, photos: scraped.photos.length };
  });

// Admin: list all properties (including unpublished)
export const adminListProperties = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Acesso negado.");
    const { data, error } = await supabaseAdmin
      .from("properties")
      .select(
        "id, code, title, neighborhood, city, price_brl, featured, published, created_at, cover_image",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// Admin: toggle featured / delete
export const setPropertyFeatured = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => {
    const o = d as { id?: string; featured?: boolean };
    if (!o?.id) throw new Error("id required");
    return { id: String(o.id), featured: !!o.featured };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles").select("id").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (!roleRow) throw new Error("Acesso negado.");
    const { error } = await supabaseAdmin
      .from("properties")
      .update({ featured: data.featured })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => {
    const o = d as { id?: string };
    if (!o?.id) throw new Error("id required");
    return { id: String(o.id) };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles").select("id").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (!roleRow) throw new Error("Acesso negado.");
    const { error } = await supabaseAdmin.from("properties").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
