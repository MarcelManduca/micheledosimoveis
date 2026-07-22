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

export async function buildVrsync(): Promise<VrsyncResult> {
  const generatedAt = new Date().toISOString();
  const rows = await fetchAllPublished();

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

    // Duplicata
    if (seenCodes.has(r.code)) {
      report.duplicateCodes.push(r.code);
      report.rejected += 1;
      report.rejectionReasons.push({ code: r.code, reason: "código duplicado" });
      continue;
    }

    // Tipologia
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

    // Fotos
    const photos = normalizePhotos(r.property_photos, r.cover_image);
    if (photos.length === 0) report.missingPhoto += 1;

    // Diagnóstico de dados
    if (!r.address) report.missingAddress += 1;
    if (!r.description) report.missingDescription += 1;
    if (r.price_brl == null) report.missingPrice += 1;
    if (r.area_m2 == null) report.missingArea += 1;

    // Regras mínimas
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

    // Regras específicas por tipo
    const isNoBedroomType = TYPES_WITHOUT_BEDROOMS.has(propertyType);
    if (!isNoBedroomType) {
      if (r.area_m2 == null || Number(r.area_m2) <= 0) {
        report.rejected += 1;
        report.rejectionReasons.push({ code: r.code, reason: "sem área" });
        continue;
      }
    }

    // Features normalizadas
    const feat = normalizeFeatures(r.features);
    const condoFeat = normalizeFeatures(r.condo_features);
    report.invalidFeaturesRemoved += feat.removed + condoFeat.removed;
    const allFeatures = Array.from(new Set([...feat.valid, ...condoFeat.valid]));

    seenCodes.add(r.code);
    report.exported += 1;

    // Endereço: separar número final se houver ("Rua X, 123" → street + 123)
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

    // Media
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

    // Details
    lines.push("      <Details>");
    lines.push(`        ${tag("PropertyType", propertyType)}`);
    if (r.description) lines.push(`        <Description>${cdata(r.description)}</Description>`);
    lines.push(`        ${tag("ListPrice", r.price_brl, { currency: "BRL" })}`);
    if (r.condo_fee_brl != null && Number(r.condo_fee_brl) > 0)
      lines.push(
        `        ${tag("PropertyAdministrationFee", r.condo_fee_brl, { currency: "BRL" })}`,
      );
    if (r.iptu_brl != null && Number(r.iptu_brl) > 0) {
      // Periodicidade não é armazenada; assumimos "Yearly" como default seguro
      // do provedor (valor anual). Fonte: contrato de importação Michele dos Imóveis.
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

    // Location
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

// ─────────────────────────── Helpers de formatação ─────────────────────────
function cdata(s: string): string {
  // Remove HTML e quebra fechamentos de CDATA hostis.
  const clean = String(s ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\]\]>/g, "]]]]><![CDATA[>")
    // Remove caracteres de controle inválidos em XML 1.0
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return `<![CDATA[${clean}]]>`;
}

function parseAddress(raw: string): { street: string; number: string | null } {
  const s = raw.trim();
  // "Rua X, 123" | "Rua X 123" | "Rua X, nº 123"
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

// ─────────────────────────── Server functions ─────────────────────────
/** Admin: gera VRSync e retorna XML + relatório de qualidade. */
export const vrsyncExport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<VrsyncResult> => {
    await assertAdmin({ supabase: context.supabase as any, userId: context.userId });
    return buildVrsync();
  });

/** Admin: apenas o relatório (para o painel). */
export const vrsyncReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<VrsyncReport> => {
    await assertAdmin({ supabase: context.supabase as any, userId: context.userId });
    const { report } = await buildVrsync();
    return report;
  });
