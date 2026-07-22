/**
 * VRSync XML generator.
 *
 * Este módulo é INDEPENDENTE da exportação XML interna (que continua em
 * `properties.functions.ts`). Aqui construímos um feed no padrão VRSync
 * (Vista Real Sync) para sindicação com portais.
 *
 * Estratégia:
 *  - Buscar todos os imóveis publicados em lotes de 1000 (contornando o
 *    limite do PostgREST) usando o cliente público (RLS: anon lê publicados).
 *  - Aplicar transformação, normalização de features (whitelist + fusões),
 *    validação de tipologia e regras específicas por tipo.
 *  - Produzir XML bem-formado + relatório de qualidade dos dados.
 */
import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const SITE_URL = "https://micheledosimoveis.com.br";

// ─────────────────────────── Cliente publishable ─────────────────────────
function getPublicClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Backend indisponível no momento.");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) throw new Error("Não foi possível verificar suas permissões.");
  if (!data) throw new Error("Acesso negado: apenas administradores.");
}

// ─────────────────────────── Tipos ─────────────────────────
type PropertyRow = {
  id: string;
  code: string;
  title: string;
  property_type: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  condo_name: string | null;
  price_brl: number | null;
  condo_fee_brl: number | null;
  iptu_brl: number | null;
  area_m2: number | null;
  bedrooms: number | null;
  suites: number | null;
  bathrooms: number | null;
  parking_spots: number | null;
  description: string | null;
  features: string[] | null;
  condo_features: string[] | null;
  cover_image: string | null;
  featured: boolean | null;
  published: boolean;
  property_photos: Array<{ url: string; position: number }> | null;
};

export type VrsyncReport = {
  generatedAt: string;
  totalActive: number;
  processed: number;
  exported: number;
  rejected: number;
  missingAddress: number;
  missingDescription: number;
  missingPrice: number;
  missingArea: number;
  missingPhoto: number;
  unmappedTypes: Array<{ code: string; type: string }>;
  duplicateCodes: string[];
  invalidFeaturesRemoved: number;
  rejectionReasons: Array<{ code: string; reason: string }>;
};

// ─────────────────────────── Tipologias ─────────────────────────
// Mapeia tipos do banco → PropertyType oficial do VRSync (enumeração em inglês)
// aceita pelos portais (Viva Real / ZAP / OLX).
const TYPE_MAP: Record<string, { propertyType: string; usageType: "Residential" | "Commercial" }> = {
  "apartamento": { propertyType: "Apartment", usageType: "Residential" },
  "apartamento duplex": { propertyType: "Apartment", usageType: "Residential" },
  "apartamento garden": { propertyType: "Apartment", usageType: "Residential" },
  "casa": { propertyType: "Home", usageType: "Residential" },
  "casa de condomínio": { propertyType: "Condominium", usageType: "Residential" },
  "casa de condominio": { propertyType: "Condominium", usageType: "Residential" },
  "cobertura": { propertyType: "Penthouse", usageType: "Residential" },
  "estúdio": { propertyType: "Studio", usageType: "Residential" },
  "estudio": { propertyType: "Studio", usageType: "Residential" },
  "loft": { propertyType: "Loft", usageType: "Residential" },
  "kitnet": { propertyType: "Kitnet", usageType: "Residential" },
  "terreno": { propertyType: "Land Lot", usageType: "Residential" },
  "terreno condomínio": { propertyType: "Land Lot", usageType: "Residential" },
  "terreno condominio": { propertyType: "Land Lot", usageType: "Residential" },
  "terreno em condomínio": { propertyType: "Land Lot", usageType: "Residential" },
  "sítio/fazenda": { propertyType: "Farm", usageType: "Residential" },
  "sitio/fazenda": { propertyType: "Farm", usageType: "Residential" },
  "sítio": { propertyType: "Farm", usageType: "Residential" },
  "sitio": { propertyType: "Farm", usageType: "Residential" },
  "fazenda": { propertyType: "Farm", usageType: "Residential" },
  "sala comercial": { propertyType: "Office", usageType: "Commercial" },
  "sala": { propertyType: "Office", usageType: "Commercial" },
  "loja": { propertyType: "Store", usageType: "Commercial" },
  "casa comercial": { propertyType: "Business", usageType: "Commercial" },
  "prédio": { propertyType: "Residential Building", usageType: "Residential" },
  "predio": { propertyType: "Residential Building", usageType: "Residential" },
  "prédio residencial": { propertyType: "Residential Building", usageType: "Residential" },
  "predio residencial": { propertyType: "Residential Building", usageType: "Residential" },
  "prédio comercial": { propertyType: "Commercial Building", usageType: "Commercial" },
  "predio comercial": { propertyType: "Commercial Building", usageType: "Commercial" },
  "hotel/pousada": { propertyType: "Hotel", usageType: "Commercial" },
  "hotel": { propertyType: "Hotel", usageType: "Commercial" },
  "pousada": { propertyType: "Hotel", usageType: "Commercial" },
};

const TYPES_WITHOUT_BEDROOMS = new Set([
  "Land Lot",
  "Office",
  "Store",
  "Business",
  "Residential Building",
  "Commercial Building",
  "Hotel",
]);

function mapPropertyType(
  raw: string | null,
): { propertyType: string; usageType: "Residential" | "Commercial" } | null {
  if (!raw) return null;
  const norm = raw.trim().toLowerCase();
  return TYPE_MAP[norm] ?? null;
}

// ─────────────────────────── Features ─────────────────────────
// Whitelist de features reconhecidas (VRSync). Chaves em minúsculo/normalizado.
const FEATURE_WHITELIST: Record<string, string> = {
  "piscina": "Piscina",
  "piscina aquecida": "Piscina aquecida",
  "academia": "Academia",
  "sala de ginástica": "Academia",
  "salão de festas": "Salão de festas",
  "salao de festas": "Salão de festas",
  "salão gourmet": "Salão gourmet",
  "salao gourmet": "Salão gourmet",
  "espaço gourmet": "Espaço gourmet",
  "espaco gourmet": "Espaço gourmet",
  "churrasqueira": "Churrasqueira",
  "playground": "Playground",
  "brinquedoteca": "Brinquedoteca",
  "sala de jogos": "Sala de jogos",
  "quadra": "Quadra esportiva",
  "quadra esportiva": "Quadra esportiva",
  "quadra de tênis": "Quadra de tênis",
  "sauna": "Sauna",
  "spa": "Spa",
  "sala de massagem": "Sala de massagem",
  "elevador": "Elevador",
  "portaria 24h": "Portaria 24h",
  "portaria 24 horas": "Portaria 24h",
  "segurança 24h": "Segurança 24h",
  "seguranca 24h": "Segurança 24h",
  "vigilância": "Segurança 24h",
  "circuito de segurança": "Circuito de segurança",
  "cftv": "Circuito de segurança",
  "garagem": "Garagem",
  "vaga de garagem": "Garagem",
  "bicicletário": "Bicicletário",
  "bicicletario": "Bicicletário",
  "lavanderia": "Lavanderia",
  "coworking": "Coworking",
  "espaço pet": "Espaço pet",
  "espaco pet": "Espaço pet",
  "pet place": "Espaço pet",
  "área verde": "Área verde",
  "area verde": "Área verde",
  "jardim": "Jardim",
  "solarium": "Solarium",
  "solárium": "Solarium",
  "deck": "Deck",
  "hidromassagem": "Hidromassagem",
  "banheira": "Banheira",
  "sacada": "Sacada",
  "sacada gourmet": "Sacada gourmet",
  "varanda": "Varanda",
  "varanda gourmet": "Varanda gourmet",
  "ar condicionado": "Ar condicionado",
  "aquecimento": "Aquecimento",
  "aquecimento a gás": "Aquecimento a gás",
  "aquecimento solar": "Aquecimento solar",
  "gerador": "Gerador",
  "mobiliado": "Mobiliado",
  "semi mobiliado": "Semi mobiliado",
  "semi-mobiliado": "Semi mobiliado",
  "banheiro social": "Banheiro social",
  "lavabo": "Lavabo",
  "closet": "Closet",
  "dependência de empregada": "Dependência de empregada",
  "dependencia de empregada": "Dependência de empregada",
  "copa cozinha": "Copa cozinha",
  "copa": "Copa",
  "cozinha americana": "Cozinha americana",
  "cozinha planejada": "Cozinha planejada",
  "área de serviço": "Área de serviço",
  "area de serviço": "Área de serviço",
  "area de servico": "Área de serviço",
  "escritório": "Escritório",
  "escritorio": "Escritório",
  "home office": "Home office",
  "vista mar": "Vista para o mar",
  "vista para o mar": "Vista para o mar",
  "vista panorâmica": "Vista panorâmica",
  "frente para o mar": "Frente para o mar",
  "pé na areia": "Pé na areia",
  "pe na areia": "Pé na areia",
};

// Fragmentos inválidos (sozinhos não valem) que aparecem quebrados pelo scraper.
const INVALID_FRAGMENTS = new Set(
  [
    "ínio", "ínio:", "inio", "inio:",
    "banheiro", "social", "salão", "salao", "festas",
    "infraestrutura", "infraestrutura do", "imóvel", "imovel",
    "condomínio", "condominio", "condomínio:", "condominio:",
    "copa", "cozinha", "de", "do", "da", "sala",
  ].map((s) => s.toLowerCase()),
);

// Fusões: duas palavras adjacentes que deveriam ser uma feature composta.
const FUSION_PAIRS: Array<[string, string, string]> = [
  ["salão", "festas", "Salão de festas"],
  ["salao", "festas", "Salão de festas"],
  ["banheiro", "social", "Banheiro social"],
  ["copa", "cozinha", "Copa cozinha"],
  ["salão", "gourmet", "Salão gourmet"],
  ["salao", "gourmet", "Salão gourmet"],
  ["espaço", "gourmet", "Espaço gourmet"],
  ["espaco", "gourmet", "Espaço gourmet"],
  ["área", "gourmet", "Espaço gourmet"],
  ["area", "gourmet", "Espaço gourmet"],
  ["quadra", "tênis", "Quadra de tênis"],
  ["quadra", "tenis", "Quadra de tênis"],
  ["portaria", "24h", "Portaria 24h"],
  ["vista", "mar", "Vista para o mar"],
  ["frente", "mar", "Frente para o mar"],
  ["pé", "areia", "Pé na areia"],
  ["pe", "areia", "Pé na areia"],
  ["ar", "condicionado", "Ar condicionado"],
  ["cozinha", "americana", "Cozinha americana"],
  ["cozinha", "planejada", "Cozinha planejada"],
  ["área", "serviço", "Área de serviço"],
  ["area", "servico", "Área de serviço"],
  ["home", "office", "Home office"],
];

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[:;.,]+$/g, "")
    .trim();
}

/**
 * Normaliza uma lista de features/condo_features:
 *  1. Funde pares adjacentes conhecidos (Salão + Festas → Salão de festas).
 *  2. Descarta fragmentos inválidos.
 *  3. Passa cada item por whitelist (com variantes normalizadas).
 *  4. Remove duplicatas mantendo ordem.
 * Retorna { valid, removed } onde `removed` é a contagem de itens rejeitados.
 */
export function normalizeFeatures(raw: string[] | null | undefined): {
  valid: string[];
  removed: number;
} {
  const items = (raw ?? []).map((s) => (s ?? "").trim()).filter(Boolean);
  const fused: string[] = [];
  let i = 0;
  while (i < items.length) {
    const a = norm(items[i]);
    const b = i + 1 < items.length ? norm(items[i + 1]) : "";
    const pair = FUSION_PAIRS.find(([x, y]) => x === a && y === b);
    if (pair) {
      fused.push(pair[2]);
      i += 2;
      continue;
    }
    // Se o item já é uma frase completa (>1 palavra), mantém como está.
    fused.push(items[i]);
    i += 1;
  }

  const seen = new Set<string>();
  const valid: string[] = [];
  let removed = 0;
  for (const item of fused) {
    const key = norm(item);
    if (!key) {
      removed += 1;
      continue;
    }
    // Fragmento único inválido?
    if (INVALID_FRAGMENTS.has(key) && !FEATURE_WHITELIST[key]) {
      removed += 1;
      continue;
    }
    const canonical = FEATURE_WHITELIST[key];
    if (!canonical) {
      removed += 1;
      continue;
    }
    if (seen.has(canonical)) continue;
    seen.add(canonical);
    valid.push(canonical);
  }
  return { valid, removed };
}

// ─────────────────────────── Fotos ─────────────────────────
function isValidHttpsUrl(u: string): boolean {
  if (!u) return false;
  try {
    const p = new URL(u);
    return p.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizePhotos(
  photos: Array<{ url: string; position: number }> | null,
  cover: string | null,
): string[] {
  const list = (photos ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((p) => p.url);
  if (cover) list.unshift(cover);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of list) {
    if (!isValidHttpsUrl(url)) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
}

// ─────────────────────────── XML ─────────────────────────
function xmlEscape(s: unknown): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function tag(name: string, value: unknown, attrs?: Record<string, string>): string {
  const v = value == null || value === "" ? null : value;
  const a = attrs
    ? Object.entries(attrs)
        .map(([k, val]) => ` ${k}="${xmlEscape(val)}"`)
        .join("")
    : "";
  if (v == null) return `<${name}${a}/>`;
  return `<${name}${a}>${xmlEscape(v)}</${name}>`;
}

// ─────────────────────────── Fetch paginado ─────────────────────────
async function fetchAllPublished(): Promise<PropertyRow[]> {
  const supabase = getPublicClient();
  const cols =
    "id, code, title, property_type, neighborhood, city, state, address, condo_name, price_brl, condo_fee_brl, iptu_brl, area_m2, bedrooms, suites, bathrooms, parking_spots, description, features, condo_features, cover_image, featured, published, property_photos(url, position)";
  const PAGE = 1000;
  const all: PropertyRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("properties")
      .select(cols)
      .eq("published", true)
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`Falha ao buscar imóveis: ${error.message}`);
    const batch = (data ?? []) as unknown as PropertyRow[];
    all.push(...batch);
    if (batch.length < PAGE) break;
  }
  return all;
}

// ─────────────────────────── Builder ─────────────────────────
export type VrsyncResult = { xml: string; report: VrsyncReport };

/**
 * Núcleo do gerador: recebe as linhas já filtradas/ordenadas e produz o XML +
 * relatório. Usado tanto pelo feed geral (`buildVrsync`) quanto pelos feeds
 * segmentados (`buildVrsyncForFeed`).
 */
export function processRowsToXml(rows: PropertyRow[]): VrsyncResult {
  const generatedAt = new Date().toISOString();

  const report: VrsyncReport = {
    generatedAt,
    totalActive: rows.length,
    processed: 0,
    exported: 0,
    rejected: 0,
    missingAddress: 0,
    missingDescription: 0,
    missingPrice: 0,
    missingArea: 0,
    missingPhoto: 0,
    unmappedTypes: [],
    duplicateCodes: [],
    invalidFeaturesRemoved: 0,
    rejectionReasons: [],
  };

  const seenCodes = new Set<string>();
  const listings: string[] = [];

  for (const r of rows) {
    report.processed += 1;

    if (seenCodes.has(r.code)) {
      report.duplicateCodes.push(r.code);
      report.rejected += 1;
      report.rejectionReasons.push({ code: r.code, reason: "código duplicado" });
      continue;
    }

    const mapped = mapPropertyType(r.property_type);
    if (!mapped) {
      report.unmappedTypes.push({ code: r.code, type: r.property_type ?? "" });
      report.rejected += 1;
      report.rejectionReasons.push({
        code: r.code,
        reason: `tipologia não mapeada: ${r.property_type ?? "(vazio)"}`,
      });
      continue;
    }
    const { propertyType, usageType } = mapped;

    const photos = normalizePhotos(r.property_photos, r.cover_image);
    if (photos.length === 0) report.missingPhoto += 1;

    if (!r.address) report.missingAddress += 1;
    if (!r.description) report.missingDescription += 1;
    if (r.price_brl == null) report.missingPrice += 1;
    if (r.area_m2 == null) report.missingArea += 1;

    if (!r.address) {
      report.rejected += 1;
      report.rejectionReasons.push({ code: r.code, reason: "sem endereço" });
      continue;
    }
    if (r.price_brl == null || Number(r.price_brl) <= 0) {
      report.rejected += 1;
      report.rejectionReasons.push({ code: r.code, reason: "sem preço" });
      continue;
    }
    if (photos.length === 0) {
      report.rejected += 1;
      report.rejectionReasons.push({ code: r.code, reason: "sem foto" });
      continue;
    }

    const isNoBedroomType = TYPES_WITHOUT_BEDROOMS.has(propertyType);
    if (!isNoBedroomType) {
      if (r.area_m2 == null || Number(r.area_m2) <= 0) {
        report.rejected += 1;
        report.rejectionReasons.push({ code: r.code, reason: "sem área" });
        continue;
      }
    }

    const feat = normalizeFeatures(r.features);
    const condoFeat = normalizeFeatures(r.condo_features);
    report.invalidFeaturesRemoved += feat.removed + condoFeat.removed;
    const allFeatures = Array.from(new Set([...feat.valid, ...condoFeat.valid]));

    seenCodes.add(r.code);
    report.exported += 1;

    const addrParsed = parseAddress(r.address);
    const detailUrl = `${SITE_URL}/imovel/${encodeURIComponent(r.code)}`;
    const publicationType = r.featured ? "PREMIUM" : "STANDARD";

    const lines: string[] = [];
    lines.push("    <Listing>");
    lines.push(`      ${tag("ListingID", r.code)}`);
    lines.push(`      <Title>${cdata(r.title)}</Title>`);
    lines.push(`      ${tag("TransactionType", "For Sale")}`);
    lines.push(`      ${tag("PublicationType", publicationType)}`);
    lines.push(`      ${tag("DetailViewUrl", detailUrl)}`);

    lines.push("      <Media>");
    photos.forEach((url, idx) => {
      const attrs: Record<string, string> = {
        medium: "image",
        caption: idx === 0 ? "Principal" : `Foto ${idx + 1}`,
      };
      if (idx === 0) attrs.primary = "true";
      lines.push(`        ${tag("Item", url, attrs)}`);
    });
    lines.push("      </Media>");

    lines.push("      <Details>");
    lines.push(`        ${tag("PropertyType", propertyType)}`);
    if (r.description) lines.push(`        <Description>${cdata(r.description)}</Description>`);
    lines.push(`        ${tag("ListPrice", r.price_brl, { currency: "BRL" })}`);
    if (r.condo_fee_brl != null && Number(r.condo_fee_brl) > 0)
      lines.push(
        `        ${tag("PropertyAdministrationFee", r.condo_fee_brl, { currency: "BRL" })}`,
      );
    if (r.iptu_brl != null && Number(r.iptu_brl) > 0) {
      lines.push(
        `        ${tag("Iptu", r.iptu_brl, { currency: "BRL", period: "Yearly" })}`,
      );
    }
    if (r.area_m2 != null && Number(r.area_m2) > 0) {
      const areaTagName = propertyType === "Land Lot" || propertyType === "Farm" ? "LotArea" : "LivingArea";
      lines.push(`        ${tag(areaTagName, r.area_m2, { unit: "square metres" })}`);
    }
    if (!isNoBedroomType) {
      lines.push(`        ${tag("Bedrooms", r.bedrooms ?? 0)}`);
      lines.push(`        ${tag("Suites", r.suites ?? 0)}`);
      lines.push(`        ${tag("Bathrooms", r.bathrooms ?? 0)}`);
    }
    lines.push(`        ${tag("Garage", r.parking_spots ?? 0)}`);
    lines.push(`        ${tag("UsageType", usageType)}`);
    if (allFeatures.length > 0) {
      lines.push("        <Features>");
      for (const f of allFeatures) lines.push(`          ${tag("Feature", f)}`);
      lines.push("        </Features>");
    }
    lines.push("      </Details>");

    lines.push('      <Location displayAddress="Street">');
    lines.push(`        ${tag("Country", "Brasil", { abbreviation: "BR" })}`);
    lines.push(`        ${tag("State", r.state ?? "Santa Catarina", { abbreviation: stateAbbr(r.state) })}`);
    lines.push(`        ${tag("City", r.city ?? "Florianópolis")}`);
    if (r.neighborhood) lines.push(`        ${tag("Neighborhood", r.neighborhood)}`);
    lines.push(`        ${tag("Address", addrParsed.street)}`);
    if (addrParsed.number) lines.push(`        ${tag("StreetNumber", addrParsed.number)}`);
    if (r.condo_name) lines.push(`        ${tag("Complement", r.condo_name)}`);
    lines.push("      </Location>");

    lines.push("    </Listing>");
    listings.push(lines.join("\n"));
  }

  const header = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<ListingDataFeed',
    '  xmlns="http://www.vivareal.com/schemas/1.0/VRSync"',
    '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    '  xsi:schemaLocation="http://www.vivareal.com/schemas/1.0/VRSync http://xml.vivareal.com/vrsync.xsd">',
    "  <Header>",
    `    ${tag("Provider", "Michele dos Imóveis")}`,
    `    ${tag("Email", "micheledosimoveis@gmail.com")}`,
    `    ${tag("ContactName", "Michele Prietsch")}`,
    `    ${tag("PublishDate", generatedAt)}`,
    `    ${tag("Telephone", "48 99182-8828")}`,
    "  </Header>",
    `  <!-- VRSync feed · gerado em ${xmlEscape(generatedAt)} · ${report.exported} imóveis -->`,
    "  <Listings>",
  ].join("\n");

  const xml = [header, ...listings, "  </Listings>", "</ListingDataFeed>"].join("\n");
  return { xml, report };
}

export async function buildVrsync(): Promise<VrsyncResult> {
  const rows = await fetchAllPublished();
  return processRowsToXml(rows);
}

// ─────────────────────────── Helpers de formatação ─────────────────────────
function cdata(s: string): string {
  const clean = String(s ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\]\]>/g, "]]]]><![CDATA[>")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return `<![CDATA[${clean}]]>`;
}

function parseAddress(raw: string): { street: string; number: string | null } {
  const s = raw.trim();
  const m = s.match(/^(.*?)[,\s]+(?:n[º°o]?\s*)?(\d{1,6})(?:\s*[-–].*)?$/i);
  if (m) return { street: m[1].replace(/[,\s]+$/, "").trim(), number: m[2] };
  return { street: s, number: null };
}

function stateAbbr(state: string | null): string {
  if (!state) return "SC";
  const t = state.trim();
  if (t.length === 2) return t.toUpperCase();
  const map: Record<string, string> = {
    "santa catarina": "SC",
    "são paulo": "SP",
    "sao paulo": "SP",
    "rio de janeiro": "RJ",
    "paraná": "PR",
    "parana": "PR",
    "rio grande do sul": "RS",
  };
  return map[t.toLowerCase()] ?? "SC";
}

// ─────────────────────────── Feeds segmentados ─────────────────────────
export const SORT_BY_VALUES = [
  "recent",
  "price_desc",
  "price_asc",
  "featured_first",
  "launch_first",
  "code",
  "manual",
] as const;
export type SortBy = (typeof SORT_BY_VALUES)[number];

export type FeedFilters = {
  price_min?: number | null;
  price_max?: number | null;
  neighborhoods?: string[] | null;
  cities?: string[] | null;
  property_types?: string[] | null;
  bedrooms_min?: number | null;
  bedrooms_max?: number | null;
  suites_min?: number | null;
  parking_min?: number | null;
  area_min?: number | null;
  area_max?: number | null;
  only_published?: boolean;
  only_featured?: boolean;
  only_launch?: boolean;
  require_photo?: boolean;
  require_description?: boolean;
  require_address?: boolean;
  require_area?: boolean;
};

export type FeedConfig = {
  filters: FeedFilters;
  included_property_codes: string[];
  excluded_property_codes: string[];
  max_items: number | null;
  sort_by: SortBy;
};

const filtersSchema: z.ZodType<FeedFilters> = z
  .object({
    price_min: z.number().int().min(0).max(1_000_000_000).nullish(),
    price_max: z.number().int().min(0).max(1_000_000_000).nullish(),
    neighborhoods: z.array(z.string().trim().min(1).max(120)).max(120).nullish(),
    cities: z.array(z.string().trim().min(1).max(120)).max(60).nullish(),
    property_types: z.array(z.string().trim().min(1).max(80)).max(40).nullish(),
    bedrooms_min: z.number().int().min(0).max(20).nullish(),
    bedrooms_max: z.number().int().min(0).max(20).nullish(),
    suites_min: z.number().int().min(0).max(20).nullish(),
    parking_min: z.number().int().min(0).max(20).nullish(),
    area_min: z.number().min(0).max(1_000_000).nullish(),
    area_max: z.number().min(0).max(1_000_000).nullish(),
    only_published: z.boolean().optional(),
    only_featured: z.boolean().optional(),
    only_launch: z.boolean().optional(),
    require_photo: z.boolean().optional(),
    require_description: z.boolean().optional(),
    require_address: z.boolean().optional(),
    require_area: z.boolean().optional(),
  })
  .strict();

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, "Use letras minúsculas, números e hífens.");

const feedInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: slugSchema,
  description: z.string().trim().max(500).nullish(),
  is_active: z.boolean().optional().default(true),
  filters: filtersSchema.optional().default({}),
  included_property_codes: z.array(z.string().trim().min(1).max(64)).max(2000).optional().default([]),
  excluded_property_codes: z.array(z.string().trim().min(1).max(64)).max(2000).optional().default([]),
  max_items: z.number().int().positive().max(50000).nullish(),
  sort_by: z.enum(SORT_BY_VALUES).optional().default("recent"),
});

export type VrsyncFeedInput = z.infer<typeof feedInputSchema>;

export type VrsyncFeedRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  filters: FeedFilters;
  included_property_codes: string[];
  excluded_property_codes: string[];
  max_items: number | null;
  sort_by: SortBy;
  last_generated_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

const PROPERTY_COLS =
  "id, code, title, property_type, neighborhood, city, state, address, condo_name, price_brl, condo_fee_brl, iptu_brl, area_m2, bedrooms, suites, bathrooms, parking_spots, description, features, condo_features, cover_image, featured, is_launch, published, property_photos(url, position)";

type PropertyQuery = ReturnType<
  ReturnType<SupabaseClient<Database>["from"]>["select"]
>;

function applyFilters(base: PropertyQuery, filters: FeedFilters, excludeCodes: string[]): PropertyQuery {
  let q = base;
  const requirePublished = filters.only_published !== false; // default true
  if (requirePublished) q = q.eq("published", true);
  if (filters.only_featured) q = q.eq("featured", true);
  if (filters.only_launch) q = q.eq("is_launch", true);
  if (filters.price_min != null) q = q.gte("price_brl", filters.price_min);
  if (filters.price_max != null) q = q.lte("price_brl", filters.price_max);
  if (filters.area_min != null) q = q.gte("area_m2", filters.area_min);
  if (filters.area_max != null) q = q.lte("area_m2", filters.area_max);
  if (filters.bedrooms_min != null) q = q.gte("bedrooms", filters.bedrooms_min);
  if (filters.bedrooms_max != null) q = q.lte("bedrooms", filters.bedrooms_max);
  if (filters.suites_min != null) q = q.gte("suites", filters.suites_min);
  if (filters.parking_min != null) q = q.gte("parking_spots", filters.parking_min);
  if (filters.neighborhoods && filters.neighborhoods.length)
    q = q.in("neighborhood", filters.neighborhoods);
  if (filters.cities && filters.cities.length) q = q.in("city", filters.cities);
  if (filters.property_types && filters.property_types.length)
    q = q.in("property_type", filters.property_types);
  if (filters.require_description) q = q.not("description", "is", null).neq("description", "");
  if (filters.require_address) q = q.not("address", "is", null).neq("address", "");
  if (filters.require_area) q = q.not("area_m2", "is", null).gt("area_m2", 0);
  if (excludeCodes.length > 0) {
    // PostgREST NOT IN: pass sanitized code list (whitelist chars already enforced upstream).
    const safe = excludeCodes.filter((c) => /^[A-Za-z0-9_-]+$/.test(c));
    if (safe.length > 0) q = q.not("code", "in", `(${safe.join(",")})`);
  }
  return q;
}

function orderQuery(q: PropertyQuery, sortBy: SortBy): PropertyQuery {
  switch (sortBy) {
    case "price_desc":
      return q.order("price_brl", { ascending: false, nullsFirst: false }).order("id", { ascending: true });
    case "price_asc":
      return q.order("price_brl", { ascending: true, nullsFirst: false }).order("id", { ascending: true });
    case "featured_first":
      return q.order("featured", { ascending: false }).order("created_at", { ascending: false }).order("id", { ascending: true });
    case "launch_first":
      return q.order("is_launch", { ascending: false }).order("created_at", { ascending: false }).order("id", { ascending: true });
    case "code":
      return q.order("code", { ascending: true });
    case "manual":
    case "recent":
    default:
      return q.order("created_at", { ascending: false }).order("id", { ascending: true });
  }
}

async function fetchFilteredProperties(cfg: FeedConfig): Promise<PropertyRow[]> {
  const supabase = getPublicClient();
  const PAGE = 1000;
  const HARD_CAP = 20000;
  const all: PropertyRow[] = [];

  for (let from = 0; ; from += PAGE) {
    const base = supabase.from("properties").select(PROPERTY_COLS);
    const filtered = applyFilters(base, cfg.filters, cfg.excluded_property_codes);
    const ordered = orderQuery(filtered, cfg.sort_by);
    const { data, error } = await ordered.range(from, from + PAGE - 1);
    if (error) throw new Error(`Falha ao buscar imóveis: ${error.message}`);
    const batch = (data ?? []) as unknown as PropertyRow[];
    all.push(...batch);
    if (batch.length < PAGE) break;
    if (all.length >= HARD_CAP) break;
  }

  // Included codes: merge in properties not already present
  if (cfg.included_property_codes.length > 0) {
    const seen = new Set(all.map((r) => r.code));
    const excluded = new Set(cfg.excluded_property_codes);
    const missing = cfg.included_property_codes.filter((c) => !seen.has(c) && !excluded.has(c));
    if (missing.length > 0) {
      // Fetch in chunks to avoid huge IN() clauses.
      const CHUNK = 200;
      for (let i = 0; i < missing.length; i += CHUNK) {
        const codes = missing.slice(i, i + CHUNK);
        const { data, error } = await supabase
          .from("properties")
          .select(PROPERTY_COLS)
          .in("code", codes);
        if (error) throw new Error(`Falha ao carregar códigos incluídos: ${error.message}`);
        all.push(...((data ?? []) as unknown as PropertyRow[]));
      }
    }
  }

  // Post filter: require_photo (photos are joined, filter in memory)
  let out = all;
  if (cfg.filters.require_photo) {
    out = out.filter((r) => normalizePhotos(r.property_photos, r.cover_image).length > 0);
  }

  // Manual ordering: sort by position in included_property_codes
  if (cfg.sort_by === "manual" && cfg.included_property_codes.length > 0) {
    const order = new Map(cfg.included_property_codes.map((c, i) => [c, i]));
    out = out.slice().sort((a, b) => {
      const ai = order.get(a.code) ?? Number.MAX_SAFE_INTEGER;
      const bi = order.get(b.code) ?? Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;
      return a.code.localeCompare(b.code);
    });
  }

  if (cfg.max_items && cfg.max_items > 0) out = out.slice(0, cfg.max_items);
  return out;
}

/**
 * Build o feed VRSync a partir de um perfil (config já validado).
 * Reutiliza `processRowsToXml`.
 */
export async function buildVrsyncForFeed(cfg: FeedConfig): Promise<VrsyncResult> {
  const rows = await fetchFilteredProperties(cfg);
  return processRowsToXml(rows);
}

function toFeedRecord(row: Record<string, unknown>): VrsyncFeedRecord {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string | null) ?? null,
    is_active: Boolean(row.is_active),
    filters: (row.filters as FeedFilters | null) ?? {},
    included_property_codes: (row.included_property_codes as string[] | null) ?? [],
    excluded_property_codes: (row.excluded_property_codes as string[] | null) ?? [],
    max_items: (row.max_items as number | null) ?? null,
    sort_by: ((row.sort_by as SortBy | null) ?? "recent") as SortBy,
    last_generated_at: (row.last_generated_at as string | null) ?? null,
    created_by: (row.created_by as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

/**
 * Público (via publishable key + RLS anon SELECT is_active=true).
 * Retorna null se o perfil não existir ou estiver pausado.
 */
export async function loadActiveFeedBySlug(slug: string): Promise<VrsyncFeedRecord | null> {
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return null;
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("vrsync_feeds")
    .select("*")
    .eq("slug", parsed.data)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error(`Falha ao carregar perfil: ${error.message}`);
  if (!data) return null;
  return toFeedRecord(data as Record<string, unknown>);
}

// ─────────────────────────── Server functions ─────────────────────────
/** Admin: gera o feed geral VRSync + relatório. */
export const vrsyncExport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<VrsyncResult> => {
    await assertAdmin({ supabase: context.supabase as any, userId: context.userId });
    return buildVrsync();
  });

/** Admin: apenas o relatório do feed geral. */
export const vrsyncReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<VrsyncReport> => {
    await assertAdmin({ supabase: context.supabase as any, userId: context.userId });
    const { report } = await buildVrsync();
    return report;
  });

// ─────────── CRUD feeds segmentados ───────────
export const listVrsyncFeeds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<VrsyncFeedRecord[]> => {
    await assertAdmin({ supabase: context.supabase as any, userId: context.userId });
    const { data, error } = await context.supabase
      .from("vrsync_feeds")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Não foi possível listar as integrações: ${error.message}`);
    return (data ?? []).map((r) => toFeedRecord(r as Record<string, unknown>));
  });

export const createVrsyncFeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => feedInputSchema.parse(d))
  .handler(async ({ data, context }): Promise<VrsyncFeedRecord> => {
    await assertAdmin({ supabase: context.supabase as any, userId: context.userId });
    const { data: row, error } = await context.supabase
      .from("vrsync_feeds")
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        is_active: data.is_active ?? true,
        filters: data.filters ?? {},
        included_property_codes: data.included_property_codes ?? [],
        excluded_property_codes: data.excluded_property_codes ?? [],
        max_items: data.max_items ?? null,
        sort_by: data.sort_by ?? "recent",
        created_by: context.userId,
      })
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("Já existe uma integração com esse slug.");
      throw new Error(`Não foi possível criar a integração: ${error.message}`);
    }
    return toFeedRecord(row as Record<string, unknown>);
  });

const updateSchema = feedInputSchema.partial().extend({ id: z.string().uuid() });

export const updateVrsyncFeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateSchema.parse(d))
  .handler(async ({ data, context }): Promise<VrsyncFeedRecord> => {
    await assertAdmin({ supabase: context.supabase as any, userId: context.userId });
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.slug !== undefined) patch.slug = data.slug;
    if (data.description !== undefined) patch.description = data.description ?? null;
    if (data.is_active !== undefined) patch.is_active = data.is_active;
    if (data.filters !== undefined) patch.filters = data.filters;
    if (data.included_property_codes !== undefined)
      patch.included_property_codes = data.included_property_codes;
    if (data.excluded_property_codes !== undefined)
      patch.excluded_property_codes = data.excluded_property_codes;
    if (data.max_items !== undefined) patch.max_items = data.max_items ?? null;
    if (data.sort_by !== undefined) patch.sort_by = data.sort_by;

    const { data: row, error } = await context.supabase
      .from("vrsync_feeds")
      .update(patch as never)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("Já existe uma integração com esse slug.");
      throw new Error(`Não foi possível salvar: ${error.message}`);
    }
    return toFeedRecord(row as Record<string, unknown>);
  });

export const deleteVrsyncFeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin({ supabase: context.supabase as any, userId: context.userId });
    const { error } = await context.supabase.from("vrsync_feeds").delete().eq("id", data.id);
    if (error) throw new Error(`Não foi possível excluir: ${error.message}`);
    return { ok: true };
  });

export const setVrsyncFeedActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), is_active: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin({ supabase: context.supabase as any, userId: context.userId });
    const { error } = await context.supabase
      .from("vrsync_feeds")
      .update({ is_active: data.is_active })
      .eq("id", data.id);
    if (error) throw new Error(`Não foi possível atualizar o status: ${error.message}`);
    return { ok: true };
  });

export const duplicateVrsyncFeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<VrsyncFeedRecord> => {
    await assertAdmin({ supabase: context.supabase as any, userId: context.userId });
    const { data: src, error } = await context.supabase
      .from("vrsync_feeds")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(`Não foi possível carregar a integração: ${error.message}`);
    if (!src) throw new Error("Integração não encontrada.");

    // Slug único derivado do original.
    const base = (src as any).slug as string;
    let candidate = `${base}-copia`.slice(0, 80);
    for (let i = 2; i <= 20; i++) {
      const { data: existing } = await context.supabase
        .from("vrsync_feeds")
        .select("id")
        .eq("slug", candidate)
        .maybeSingle();
      if (!existing) break;
      candidate = `${base}-copia-${i}`.slice(0, 80);
    }

    const { data: row, error: insErr } = await context.supabase
      .from("vrsync_feeds")
      .insert({
        name: `${(src as any).name} (cópia)`.slice(0, 120),
        slug: candidate,
        description: (src as any).description,
        is_active: false,
        filters: (src as any).filters ?? {},
        included_property_codes: (src as any).included_property_codes ?? [],
        excluded_property_codes: (src as any).excluded_property_codes ?? [],
        max_items: (src as any).max_items ?? null,
        sort_by: (src as any).sort_by ?? "recent",
        created_by: context.userId,
      })
      .select("*")
      .single();
    if (insErr) throw new Error(`Não foi possível duplicar: ${insErr.message}`);
    return toFeedRecord(row as Record<string, unknown>);
  });

// ─────────── Preview / geração ───────────
export type VrsyncFeedPreview = {
  totalMatched: number;
  totalExportable: number;
  totalRejected: number;
  minPrice: number | null;
  maxPrice: number | null;
  avgPrice: number | null;
  neighborhoods: Array<{ name: string; count: number }>;
  propertyTypes: Array<{ name: string; count: number }>;
  sample: Array<{
    code: string;
    title: string;
    neighborhood: string | null;
    city: string | null;
    property_type: string | null;
    price_brl: number | null;
    cover_image: string | null;
    validation: "exportado" | "rejeitado";
    rejection_reason?: string;
  }>;
  report: VrsyncReport;
};

const previewSchema = feedInputSchema.pick({
  filters: true,
  included_property_codes: true,
  excluded_property_codes: true,
  max_items: true,
  sort_by: true,
});

export const previewVrsyncFeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => previewSchema.parse(d))
  .handler(async ({ data, context }): Promise<VrsyncFeedPreview> => {
    await assertAdmin({ supabase: context.supabase as any, userId: context.userId });
    const cfg: FeedConfig = {
      filters: (data.filters ?? {}) as FeedFilters,
      included_property_codes: data.included_property_codes ?? [],
      excluded_property_codes: data.excluded_property_codes ?? [],
      max_items: data.max_items ?? null,
      sort_by: (data.sort_by ?? "recent") as SortBy,
    };
    const rows = await fetchFilteredProperties(cfg);
    const { report } = processRowsToXml(rows);

    const prices = rows.map((r) => Number(r.price_brl)).filter((n) => Number.isFinite(n) && n > 0);
    const minPrice = prices.length ? Math.min(...prices) : null;
    const maxPrice = prices.length ? Math.max(...prices) : null;
    const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null;

    const nbCount = new Map<string, number>();
    const tpCount = new Map<string, number>();
    for (const r of rows) {
      if (r.neighborhood) nbCount.set(r.neighborhood, (nbCount.get(r.neighborhood) ?? 0) + 1);
      if (r.property_type) tpCount.set(r.property_type, (tpCount.get(r.property_type) ?? 0) + 1);
    }
    const topEntries = (m: Map<string, number>, n: number) =>
      Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, count]) => ({ name, count }));

    const rejectedByCode = new Map(report.rejectionReasons.map((r) => [r.code, r.reason]));
    const sample = rows.slice(0, 24).map((r) => {
      const rejection = rejectedByCode.get(r.code);
      return {
        code: r.code,
        title: r.title,
        neighborhood: r.neighborhood,
        city: r.city,
        property_type: r.property_type,
        price_brl: r.price_brl,
        cover_image: r.cover_image,
        validation: (rejection ? "rejeitado" : "exportado") as "exportado" | "rejeitado",
        rejection_reason: rejection,
      };
    });

    return {
      totalMatched: rows.length,
      totalExportable: report.exported,
      totalRejected: report.rejected,
      minPrice,
      maxPrice,
      avgPrice,
      neighborhoods: topEntries(nbCount, 10),
      propertyTypes: topEntries(tpCount, 10),
      sample,
      report,
    };
  });

/** Admin: gera XML + relatório para um perfil salvo. */
export const generateVrsyncFeedById = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<VrsyncResult & { name: string; slug: string }> => {
    await assertAdmin({ supabase: context.supabase as any, userId: context.userId });
    const { data: row, error } = await context.supabase
      .from("vrsync_feeds")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(`Falha ao carregar integração: ${error.message}`);
    if (!row) throw new Error("Integração não encontrada.");
    const feed = toFeedRecord(row as Record<string, unknown>);
    const result = await buildVrsyncForFeed({
      filters: feed.filters,
      included_property_codes: feed.included_property_codes,
      excluded_property_codes: feed.excluded_property_codes,
      max_items: feed.max_items,
      sort_by: feed.sort_by,
    });
    // Atualiza last_generated_at
    await context.supabase
      .from("vrsync_feeds")
      .update({ last_generated_at: new Date().toISOString() })
      .eq("id", feed.id);
    return { ...result, name: feed.name, slug: feed.slug };
  });

