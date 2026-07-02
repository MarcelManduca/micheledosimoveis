import type { PortfolioProperty } from "@/lib/properties.functions";

// ─────────── Normalization ───────────

// Lista de regiões estratégicas usadas SOMENTE no painel interno de
// inteligência de portfólio. Não afeta a busca pública nem os filtros da home.
export const STRATEGIC_NEIGHBORHOODS = [
  "Centro / Beira-Mar Norte",
  "Agronômica",
  "Jurerê Internacional",
  "Jurerê Tradicional",
  "Praia Brava",
  "João Paulo",
  "Cacupé",
  "Santo Antônio de Lisboa",
  "Itacorubi",
  "Trindade",
  "Santa Mônica",
  "Córrego Grande",
  "Lagoa da Conceição",
  "Canto da Lagoa",
  "Campeche",
  "Novo Campeche",
  "Rio Tavares",
  "Morro das Pedras",
];

export const MACRO_TYPES = [
  "Apartamento",
  "Casa",
  "Cobertura",
  "Terreno",
  "Comercial/Especial",
  "Rural/Especial",
] as const;
export type MacroType = (typeof MACRO_TYPES)[number] | "Outros";

// Tipologias residenciais consideradas na análise executiva de dormitórios.
export const RESIDENTIAL_MACROS: readonly MacroType[] = [
  "Apartamento",
  "Casa",
  "Cobertura",
] as const;
export function isResidentialMacro(m: MacroType): boolean {
  return (RESIDENTIAL_MACROS as readonly MacroType[]).includes(m);
}

export const BEDROOM_GROUPS = ["0", "1", "2", "3", "4+"] as const;
export type BedroomGroup = (typeof BEDROOM_GROUPS)[number];

// Grupos de dormitórios usados na visão executiva — apenas residenciais,
// sem "0" (evita contabilizar terrenos/comerciais como 0 dormitórios).
export const RESIDENTIAL_BEDROOM_GROUPS = ["1", "2", "3", "4+"] as const;
export type ResidentialBedroomGroup = (typeof RESIDENTIAL_BEDROOM_GROUPS)[number];

export const PRICE_BANDS = [
  "Até R$ 1M",
  "R$ 1M – R$ 3M",
  "R$ 3M – R$ 5M",
  "R$ 5M – R$ 10M",
  "Acima de R$ 10M",
] as const;
export type PriceBand = (typeof PRICE_BANDS)[number];

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function slugKey(s: string | null | undefined): string {
  return stripAccents((s ?? "").toLowerCase().trim())
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Aliases exclusivos do painel analítico. Não modifica dados brutos da base
// nem o filtro público — apenas padroniza a exibição/agrupamento no painel.
const NEIGHBORHOOD_ALIAS: Record<string, string> = {};
for (const n of STRATEGIC_NEIGHBORHOODS) NEIGHBORHOOD_ALIAS[slugKey(n)] = n;
Object.assign(NEIGHBORHOOD_ALIAS, {
  [slugKey("centro")]: "Centro / Beira-Mar Norte",
  [slugKey("beira mar")]: "Centro / Beira-Mar Norte",
  [slugKey("beira mar norte")]: "Centro / Beira-Mar Norte",
  [slugKey("beira-mar norte")]: "Centro / Beira-Mar Norte",
  [slugKey("centro beira mar norte")]: "Centro / Beira-Mar Norte",
  [slugKey("jurere")]: "Jurerê Tradicional",
  [slugKey("joao paulo")]: "João Paulo",
  [slugKey("lagoa da conceicao")]: "Lagoa da Conceição",
  [slugKey("corrego grande")]: "Córrego Grande",
  [slugKey("canto da lagoa")]: "Canto da Lagoa",
  [slugKey("morro das pedras")]: "Morro das Pedras",
  [slugKey("cachoeira do bom jesus")]: "Cachoeira do Bom Jesus",
  [slugKey("santo antonio de lisboa")]: "Santo Antônio de Lisboa",
  [slugKey("barra da lagoa")]: "Barra da Lagoa",
  [slugKey("ponta das canas")]: "Ponta das Canas",
  [slugKey("pantano do sul")]: "Pântano do Sul",
  [slugKey("saco dos limoes")]: "Saco dos Limões",
  [slugKey("monte verde")]: "Monte Verde",
  [slugKey("vargem do bom jesus")]: "Vargem do Bom Jesus",
});

// Somente para uso analítico dentro deste módulo/painel interno.
// NÃO usar em filtros públicos, buscas ou páginas de imóveis.
export function normalizeNeighborhoodForAnalytics(raw: string | null | undefined): string {
  if (!raw) return "—";
  const key = slugKey(raw);
  if (NEIGHBORHOOD_ALIAS[key]) return NEIGHBORHOOD_ALIAS[key];
  return raw
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => {
      if (i > 0 && ["de", "da", "do", "das", "dos", "e"].includes(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ")
    .replace(/\bJoao\b/g, "João");
}

export function normalizeMacroType(raw: string | null | undefined): MacroType {
  const k = slugKey(raw);
  if (!k) return "Outros";
  if (k.includes("apartamento")) return "Apartamento";
  if (k.includes("cobertura")) return "Cobertura";
  if (k.startsWith("casa") || k.includes("casa de condominio") || k.includes("casa condominio")) {
    if (k.includes("comercial")) return "Comercial/Especial";
    return "Casa";
  }
  if (k.includes("terreno") || k.includes("lote")) return "Terreno";
  if (k.includes("sitio") || k.includes("fazenda") || k.includes("chacara")) return "Rural/Especial";
  if (
    k.includes("loja") ||
    k.includes("sala comercial") ||
    k.includes("predio") ||
    k.includes("galpao") ||
    k.includes("hotel") ||
    k.includes("pousada") ||
    k.includes("box") ||
    k.includes("garagem") ||
    k.includes("comercial")
  )
    return "Comercial/Especial";
  return "Outros";
}

export function bedroomGroup(b: number | null | undefined): BedroomGroup {
  const n = b ?? 0;
  if (n <= 0) return "0";
  if (n === 1) return "1";
  if (n === 2) return "2";
  if (n === 3) return "3";
  return "4+";
}

export function priceBand(price: number | null | undefined): PriceBand | null {
  if (!price || price <= 0) return null;
  if (price < 1_000_000) return "Até R$ 1M";
  if (price < 3_000_000) return "R$ 1M – R$ 3M";
  if (price < 5_000_000) return "R$ 3M – R$ 5M";
  if (price < 10_000_000) return "R$ 5M – R$ 10M";
  return "Acima de R$ 10M";
}

// ─────────── Active property criteria ───────────

export function isActive(p: PortfolioProperty): boolean {
  if (!p.published) return false;
  if (p.unavailable_since) return false;
  const s = (p.last_check_status ?? "").toLowerCase();
  if (s === "not_found" || s === "unavailable" || s === "indisponivel") return false;
  return true;
}

export type EnrichedProperty = PortfolioProperty & {
  n_bairro: string;
  macro: MacroType;
  bedGroup: BedroomGroup;
  band: PriceBand | null;
  pricePerM2: number | null;
  isStrategic: boolean;
  active: boolean;
};

export function enrich(list: PortfolioProperty[]): EnrichedProperty[] {
  return list.map((p) => {
    const n = normalizeNeighborhoodForAnalytics(p.neighborhood);
    const macro = normalizeMacroType(p.property_type);
    const bg = bedroomGroup(p.bedrooms);
    const band = priceBand(p.price_brl);
    const ppm =
      p.price_brl && p.area_m2 && p.area_m2 > 0 ? p.price_brl / p.area_m2 : null;
    return {
      ...p,
      n_bairro: n,
      macro,
      bedGroup: bg,
      band,
      pricePerM2: ppm,
      isStrategic: STRATEGIC_NEIGHBORHOODS.includes(n),
      active: isActive(p),
    };
  });
}

// ─────────── Stats helpers ───────────

export function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
export function mean(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function brl(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

// ─────────── Insights ───────────

export type Insight = {
  priority: "Alta" | "Média" | "Monitorar" | "Baixa";
  score: number;
  bairro: string;
  tipo: string;
  dorms: string;
  quantidade: number;
  precoRef: number | null;
  diagnostico: string;
  acao: string;
};

export function generatePortfolioInsights(props: EnrichedProperty[]): Insight[] {
  const active = props.filter((p) => p.active);
  const insights: Insight[] = [];

  // Combination bairro + macro + bedGroup
  const combos = new Map<string, EnrichedProperty[]>();
  for (const p of active) {
    if (!p.isStrategic) continue;
    if (p.macro === "Outros" || p.macro === "Rural/Especial") continue;
    const key = `${p.n_bairro}||${p.macro}||${p.bedGroup}`;
    if (!combos.has(key)) combos.set(key, []);
    combos.get(key)!.push(p);
  }

  const priorityMacros: MacroType[] = ["Apartamento", "Casa", "Cobertura", "Terreno"];

  // Also cover ZERO combinations explicitly for priority macros × 2/3/4+
  for (const bairro of STRATEGIC_NEIGHBORHOODS) {
    for (const macro of priorityMacros) {
      for (const bg of ["2", "3", "4+"] as BedroomGroup[]) {
        const key = `${bairro}||${macro}||${bg}`;
        if (!combos.has(key)) combos.set(key, []);
      }
    }
  }

  for (const [key, list] of combos) {
    const [bairro, macro, bg] = key.split("||");
    const qty = list.length;
    if (qty > 3) continue;
    const bairroTotal = active.filter((p) => p.n_bairro === bairro).length;
    let score = 0;
    score += 30; // strategic
    if (bairroTotal <= 10) score += 25;
    if (qty <= 2) score += 25;
    const prices = list.map((p) => p.price_brl ?? 0).filter((v) => v > 0);
    const med = median(prices);
    if (med != null && med > 3_000_000) score += 10;
    if (priorityMacros.includes(macro as MacroType)) score += 10;

    let priority: Insight["priority"] = "Baixa";
    if (score >= 80) priority = "Alta";
    else if (score >= 60) priority = "Média";
    else if (score >= 40) priority = "Monitorar";

    let diag = "";
    let acao = "";
    if (qty === 0) {
      diag = `Não há imóveis ativos com esse perfil em um bairro estratégico.`;
      acao = `Captar ${macro.toLowerCase()}s de ${bg} dormitórios em ${bairro}.`;
    } else if (qty === 1) {
      diag = `Há apenas 1 oferta ativa com esse perfil em um bairro estratégico.`;
      acao = `Buscar novas captações de ${macro.toLowerCase()}s de ${bg} dormitórios em ${bairro}.`;
    } else if (qty === 2) {
      diag = `Estoque muito baixo (2 unidades) neste perfil.`;
      acao = `Reforçar captação de ${macro.toLowerCase()}s de ${bg} dormitórios em ${bairro}.`;
    } else {
      diag = `Estoque limitado (3 unidades) — monitorar reposição.`;
      acao = `Monitorar oportunidades de ${macro.toLowerCase()}s de ${bg} dormitórios em ${bairro}.`;
    }

    insights.push({
      priority,
      score,
      bairro,
      tipo: macro,
      dorms: bg,
      quantidade: qty,
      precoRef: med,
      diagnostico: diag,
      acao,
    });
  }

  insights.sort((a, b) => b.score - a.score || a.quantidade - b.quantidade);
  return insights;
}

export function neighborhoodStockStatus(count: number): {
  label: "CRÍTICO" | "ALTO" | "ATENÇÃO" | "OK";
  color: string;
} {
  if (count <= 5) return { label: "CRÍTICO", color: "bg-red-500" };
  if (count <= 10) return { label: "ALTO", color: "bg-orange-500" };
  if (count <= 20) return { label: "ATENÇÃO", color: "bg-yellow-500" };
  return { label: "OK", color: "bg-emerald-500" };
}

export function heatmapCellColor(n: number): string {
  if (n === 0) return "bg-red-700 text-white";
  if (n === 1) return "bg-red-500 text-white";
  if (n === 2) return "bg-orange-500 text-white";
  if (n <= 5) return "bg-yellow-400 text-yellow-950";
  if (n <= 10) return "bg-emerald-300 text-emerald-950";
  return "bg-emerald-600 text-white";
}
