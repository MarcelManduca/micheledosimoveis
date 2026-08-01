import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Vertical de LANÇAMENTOS — módulo isolado.
 * Não importa nem altera nada de imóveis, condomínios ou VRSync.
 * Somente leitura sobre `properties` (nunca escreve no anúncio original).
 */

import {
  type DeveloperRow,
  type DeveloperListItem,
  type DevelopmentRow,
  type DevelopmentListItem,
  type DevelopmentUnit,
  type PropertySearchResult,
  type DevelopmentSuggestion,
  slugifyLaunch,
  normalizeLaunchText,
  coreLaunchName,
  normalizeAddress,
  scoreDevelopment,
} from "@/lib/launches-shared";
import {
  developerSchema,
  developmentSchema,
  fail,
  isUniqueViolation,
  linkProperties,
} from "@/lib/launches-schemas";

export * from "@/lib/launches-shared";
export { DEVELOPMENT_STAGES } from "@/lib/launches-schemas";

/* ───────── Construtoras ───────── */

export const adminListDevelopers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("developers")
      .select("*")
      .order("name", { ascending: true });
    if (error) fail("Não foi possível carregar as construtoras.", error);

    const { data: devs, error: devsError } = await context.supabase
      .from("developments")
      .select("developer_id");
    if (devsError) fail("Não foi possível carregar os lançamentos.", devsError);

    const counts = new Map<string, number>();
    for (const d of devs ?? []) {
      if (!d.developer_id) continue;
      counts.set(d.developer_id, (counts.get(d.developer_id) ?? 0) + 1);
    }

    const rows = (data ?? []) as DeveloperRow[];
    const coreCounts = new Map<string, number>();
    for (const r of rows) {
      const core = coreLaunchName(r.name) || normalizeLaunchText(r.name);
      coreCounts.set(core, (coreCounts.get(core) ?? 0) + 1);
    }

    return rows.map<DeveloperListItem>((r) => ({
      ...r,
      developments_count: counts.get(r.id) ?? 0,
      duplicate_slug: (coreCounts.get(coreLaunchName(r.name) || normalizeLaunchText(r.name)) ?? 0) > 1,
    }));
  });

export const adminSaveDeveloper = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => developerSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...payload } = data;
    const slug = slugifyLaunch(payload.slug || payload.name);
    if (!slug) throw new Error("Não foi possível gerar um slug válido a partir do nome.");

    const dup = await context.supabase
      .from("developers")
      .select("id")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();
    if (dup.data && dup.data.id !== id) {
      throw new Error("Já existe uma construtora com este slug.");
    }

    const row = { ...payload, slug };
    const query = id
      ? context.supabase.from("developers").update(row).eq("id", id).select("*").single()
      : context.supabase.from("developers").insert(row).select("*").single();
    const { data: saved, error } = await query;
    if (error) {
      if (isUniqueViolation(error)) throw new Error("Já existe uma construtora com este slug.");
      fail("Não foi possível salvar a construtora.", error);
    }
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

/* ───────── Lançamentos ───────── */

export const adminListDevelopments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("developments")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) fail("Não foi possível carregar os lançamentos.", error);

    const { data: units, error: unitsError } = await context.supabase
      .from("development_properties")
      .select("development_id");
    if (unitsError) fail("Não foi possível carregar as unidades.", unitsError);

    const unitCounts = new Map<string, number>();
    for (const u of units ?? []) {
      unitCounts.set(u.development_id, (unitCounts.get(u.development_id) ?? 0) + 1);
    }

    const rows = (data ?? []) as unknown as DevelopmentRow[];
    const coreCount = new Map<string, number>();
    for (const r of rows) {
      const core = coreLaunchName(r.name) || normalizeLaunchText(r.name);
      if (core) coreCount.set(core, (coreCount.get(core) ?? 0) + 1);
    }

    return rows.map<DevelopmentListItem>((row) => {
      const units_count = unitCounts.get(row.id) ?? 0;
      const { score, issues, ready } = scoreDevelopment(row, units_count);
      const core = coreLaunchName(row.name) || normalizeLaunchText(row.name);
      return {
        ...row,
        units_count,
        quality_score: score,
        quality_issues: issues,
        ready_to_publish: ready,
        potential_duplicate: (coreCount.get(core) ?? 0) > 1,
      };
    });
  });

export const adminSaveDevelopment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => developmentSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...payload } = data;
    const slug = slugifyLaunch(payload.slug || payload.name);
    if (!slug) throw new Error("Não foi possível gerar um slug válido a partir do nome.");

    const dup = await context.supabase
      .from("developments")
      .select("id")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();
    if (dup.data && dup.data.id !== id) {
      throw new Error("Já existe um lançamento com este slug.");
    }

    const row = {
      ...payload,
      slug,
      launch_date: payload.launch_date ? payload.launch_date : null,
      publication_status: payload.is_published ? "published" : "draft",
    };

    if (payload.is_published) {
      const { count } = id
        ? await context.supabase
            .from("development_properties")
            .select("id", { count: "exact", head: true })
            .eq("development_id", id)
        : { count: 0 };
      const blockers = publicationBlockers(
        row as unknown as DevelopmentRow,
        count ?? 0,
      );
      if (blockers.length > 0) {
        throw new Error(`Não é possível publicar: ${blockers.join(" ")}`);
      }
    }

    const query = id
      ? context.supabase.from("developments").update(row).eq("id", id).select("*").single()
      : context.supabase.from("developments").insert(row).select("*").single();
    const { data: saved, error } = await query;
    if (error) {
      if (isUniqueViolation(error)) throw new Error("Já existe um lançamento com este slug.");
      fail("Não foi possível salvar o lançamento.", error);
    }
    return saved as unknown as DevelopmentRow;
  });

export const adminDeleteDevelopment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("developments").delete().eq("id", data.id);
    if (error) fail("Não foi possível excluir o lançamento.", error);
    return { ok: true };
  });

/* ───────── Relacionamento com imóveis ───────── */

export const adminListDevelopmentUnits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        development_id: z.string().uuid(),
        page: z.number().int().min(1).default(1),
        page_size: z.number().int().min(1).max(100).default(20),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const from = (data.page - 1) * data.page_size;
    const to = from + data.page_size - 1;
    const { data: rows, error, count } = await context.supabase
      .from("development_properties")
      .select(
        "*, property:properties(id, code, title, neighborhood, price_brl, published)",
        { count: "exact" },
      )
      .eq("development_id", data.development_id)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
      .range(from, to);
    if (error) fail("Não foi possível carregar as unidades do lançamento.", error);
    return {
      units: (rows ?? []) as unknown as DevelopmentUnit[],
      total: count ?? 0,
      page: data.page,
      page_size: data.page_size,
    };
  });

export const adminSearchPropertiesForLaunch = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ query: z.string().trim().default(""), limit: z.number().int().min(1).max(50).default(20) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const term = data.query.trim();
    if (!term) return [] as PropertySearchResult[];
    const like = `%${term.replace(/[%,]/g, " ")}%`;
    const { data: rows, error } = await context.supabase
      .from("properties")
      .select("id, code, title, neighborhood, condo_name, price_brl, published, is_launch")
      .or(`code.ilike.${like},title.ilike.${like},neighborhood.ilike.${like},condo_name.ilike.${like}`)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) fail("Não foi possível buscar imóveis.", error);
    return (rows ?? []) as PropertySearchResult[];
  });

export const adminLinkPropertyToDevelopment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ development_id: z.string().uuid(), property_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const existing = await context.supabase
      .from("development_properties")
      .select("id")
      .eq("development_id", data.development_id)
      .eq("property_id", data.property_id)
      .limit(1)
      .maybeSingle();
    if (existing.data) throw new Error("Este imóvel já está vinculado a este lançamento.");

    const { data: prop, error: propError } = await context.supabase
      .from("properties")
      .select("code, title, area_m2, bedrooms, suites, bathrooms, parking_spots, price_brl")
      .eq("id", data.property_id)
      .maybeSingle();
    if (propError) fail("Não foi possível carregar o imóvel.", propError);
    if (!prop) throw new Error("Imóvel não encontrado.");

    const { error } = await context.supabase.from("development_properties").insert({
      development_id: data.development_id,
      property_id: data.property_id,
      unit_name: prop.code ? `Imóvel ${prop.code}` : prop.title,
      area_m2: prop.area_m2,
      bedrooms: prop.bedrooms,
      suites: prop.suites,
      bathrooms: prop.bathrooms,
      parking_spots: prop.parking_spots,
      price_brl: prop.price_brl,
    });
    if (error) {
      if (isUniqueViolation(error)) throw new Error("Este imóvel já está vinculado a este lançamento.");
      fail("Não foi possível vincular o imóvel.", error);
    }
    return { ok: true };
  });

export const adminUnlinkDevelopmentUnit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("development_properties")
      .delete()
      .eq("id", data.id);
    if (error) fail("Não foi possível remover o vínculo.", error);
    return { ok: true };
  });

/* ───────── Detecção assistida de empreendimentos ───────── */

export const adminDevelopmentSuggestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ min_properties: z.number().int().min(2).max(50).default(2) }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("properties")
      .select("id, code, title, condo_name, address, neighborhood, is_launch, published")
      .not("condo_name", "is", null)
      .limit(5000);
    if (error) fail("Não foi possível analisar os imóveis.", error);

    const { data: developments, error: devError } = await context.supabase
      .from("developments")
      .select("id, name, slug, neighborhood, address");
    if (devError) fail("Não foi possível carregar os lançamentos.", devError);

    const { data: dismissed, error: disError } = await context.supabase
      .from("development_suggestion_dismissals")
      .select("suggestion_key");
    if (disError) fail("Não foi possível carregar as sugestões ignoradas.", disError);
    const dismissedKeys = new Set((dismissed ?? []).map((d) => d.suggestion_key));

    type Group = {
      key: string;
      labels: Map<string, number>;
      neighborhoods: Map<string, number>;
      addresses: Map<string, number>;
      ids: string[];
      codes: string[];
      launches: number;
    };
    const groups = new Map<string, Group>();

    for (const p of rows ?? []) {
      const raw = (p.condo_name ?? "").trim();
      if (!raw) continue;
      const core = coreLaunchName(raw);
      if (!core || core.length < 3) continue;
      const nb = normalizeLaunchText(p.neighborhood ?? "");
      const key = `${core}::${nb}`;
      let g = groups.get(key);
      if (!g) {
        g = {
          key,
          labels: new Map(),
          neighborhoods: new Map(),
          addresses: new Map(),
          ids: [],
          codes: [],
          launches: 0,
        };
        groups.set(key, g);
      }
      g.labels.set(raw, (g.labels.get(raw) ?? 0) + 1);
      if (p.neighborhood) g.neighborhoods.set(p.neighborhood, (g.neighborhoods.get(p.neighborhood) ?? 0) + 1);
      if (p.address) g.addresses.set(p.address, (g.addresses.get(p.address) ?? 0) + 1);
      g.ids.push(p.id);
      if (g.codes.length < 5 && p.code) g.codes.push(p.code);
      if (p.is_launch) g.launches += 1;
    }

    const top = (m: Map<string, number>): string | null =>
      [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const suggestions: DevelopmentSuggestion[] = [];
    for (const g of groups.values()) {
      if (g.ids.length < data.min_properties) continue;
      if (dismissedKeys.has(g.key)) continue;
      const label = top(g.labels) ?? g.key;
      const neighborhood = top(g.neighborhoods);
      const address = top(g.addresses);
      const core = coreLaunchName(label);
      const slug = slugifyLaunch(label);

      // Correspondência conservadora com lançamentos existentes:
      // exige núcleo de nome idêntico OU slug idêntico E (mesmo bairro ou mesmo endereço).
      const match = (developments ?? []).find((d) => {
        const sameCore = coreLaunchName(d.name) === core;
        const sameSlug = d.slug === slug;
        if (!sameCore && !sameSlug) return false;
        const sameNb =
          !!neighborhood && normalizeLaunchText(d.neighborhood ?? "") === normalizeLaunchText(neighborhood);
        const sameAddr = !!address && normalizeAddress(d.address) === normalizeAddress(address);
        return sameSlug || sameNb || sameAddr;
      });

      suggestions.push({
        key: g.key,
        label,
        properties_count: g.ids.length,
        neighborhoods: [...g.neighborhoods.keys()],
        dominant_address: address,
        name_variations: [...g.labels.keys()].slice(0, 6),
        property_ids: g.ids,
        sample_codes: g.codes,
        matched_development_id: match?.id ?? null,
        launch_flagged_count: g.launches,
      });
    }

    suggestions.sort((a, b) => b.properties_count - a.properties_count);
    return suggestions.slice(0, 200);
  });

export const adminDismissSuggestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ key: z.string().min(1), label: z.string().optional().nullable() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("development_suggestion_dismissals")
      .upsert(
        { suggestion_key: data.key, label: data.label ?? null, dismissed_by: context.userId },
        { onConflict: "suggestion_key" },
      );
    if (error) fail("Não foi possível ignorar a sugestão.", error);
    return { ok: true };
  });

/** Cria um rascunho a partir de uma sugestão e vincula os imóveis do grupo. */
export const adminCreateDraftFromSuggestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        label: z.string().min(1),
        neighborhood: z.string().nullable().optional(),
        address: z.string().nullable().optional(),
        property_ids: z.array(z.string().uuid()).default([]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const slug = slugifyLaunch(data.label);
    if (!slug) throw new Error("Não foi possível gerar um slug válido a partir do nome.");
    const dup = await context.supabase
      .from("developments")
      .select("id")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();
    if (dup.data) throw new Error("Já existe um lançamento com este slug.");

    const { data: created, error } = await context.supabase
      .from("developments")
      .insert({
        slug,
        name: data.label,
        neighborhood: data.neighborhood ?? null,
        address: data.address ?? null,
        stage: "launch",
        is_published: false,
        publication_status: "draft",
      })
      .select("*")
      .single();
    if (error) {
      if (isUniqueViolation(error)) throw new Error("Já existe um lançamento com este slug.");
      fail("Não foi possível criar o rascunho.", error);
    }

    if (data.property_ids.length > 0) {
      await linkProperties(context, created.id, data.property_ids);
    }
    return created as unknown as DevelopmentRow;
  });

/** Vincula os imóveis de uma sugestão a um lançamento existente. */
export const adminLinkSuggestionToDevelopment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        development_id: z.string().uuid(),
        property_ids: z.array(z.string().uuid()).min(1),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const linked = await linkProperties(context, data.development_id, data.property_ids);
    return { linked };
  });


