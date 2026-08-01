/**
 * Tipos e utilitários puros da vertical de LANÇAMENTOS.
 * Sem createServerFn: seguro para importar no cliente e no servidor.
 */

export type DeveloperRow = {
  id: string;
  slug: string;
  name: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  logo_url: string | null;
  description: string | null;
  city: string | null;
  state: string | null;
  founded_year: number | null;
  seo_title: string | null;
  seo_description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DeveloperListItem = DeveloperRow & {
  developments_count: number;
  duplicate_slug: boolean;
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
  latitude: number | null;
  longitude: number | null;
  price_min_brl: number | null;
  price_max_brl: number | null;
  area_min_m2: number | null;
  area_max_m2: number | null;
  bedrooms_min: number | null;
  bedrooms_max: number | null;
  launch_date: string | null;
  delivery_estimate: string | null;
  amenities: string[];
  gallery: string[];
  video_url: string | null;
  brochure_url: string | null;
  architecture: string | null;
  landscaping: string | null;
  interiors: string | null;
  cover_image: string | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
  publication_status: string;
  /** Revisão editorial da capa: pending | approved | rejected. */
  cover_review_status?: string | null;
  /** Revisão editorial do texto (institucional x descrição de unidade). */
  description_review_status?: string | null;
  review_notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type QualityIssue = string;

export type DevelopmentListItem = DevelopmentRow & {
  units_count: number;
  quality_score: number;
  quality_issues: QualityIssue[];
  ready_to_publish: boolean;
  potential_duplicate: boolean;
};

export type DevelopmentUnit = {
  id: string;
  development_id: string;
  property_id: string | null;
  unit_name: string | null;
  area_m2: number | null;
  bedrooms: number | null;
  suites: number | null;
  bathrooms: number | null;
  parking_spots: number | null;
  price_brl: number | null;
  is_available: boolean;
  position: number;
  property: {
    id: string;
    code: string;
    title: string;
    neighborhood: string | null;
    price_brl: number | null;
    published: boolean;
  } | null;
};

export type PropertySearchResult = {
  id: string;
  code: string;
  title: string;
  neighborhood: string | null;
  condo_name: string | null;
  price_brl: number | null;
  published: boolean;
  is_launch: boolean;
};

export type DevelopmentSuggestion = {
  key: string;
  label: string;
  properties_count: number;
  neighborhoods: string[];
  dominant_address: string | null;
  name_variations: string[];
  property_ids: string[];
  sample_codes: string[];
  matched_development_id: string | null;
  launch_flagged_count: number;
};

/* ───────── Normalização e slug ───────── */

export function slugifyLaunch(input: string): string {
  return normalizeLaunchText(input)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** NFD + strip acentos + trim + lowercase + colapso de espaços. */
export function normalizeLaunchText(input: string): string {
  return (input ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const GENERIC_TERMS = new Set([
  "residencial",
  "edificio",
  "ed",
  "condominio",
  "cond",
  "empreendimento",
  "apartamento",
  "apartamentos",
  "apto",
  "beach",
  "home",
  "homes",
  "house",
  "club",
  "clube",
  "life",
  "prime",
  "tower",
  "towers",
  "torre",
  "garden",
  "gardens",
  "villa",
  "village",
  "square",
  "park",
  "porto",
  "by",
  "da",
  "de",
  "do",
  "das",
  "dos",
  "e",
  "o",
  "a",
]);

/** Remove termos genéricos para comparar núcleos de nome. */
export function coreLaunchName(input: string): string {
  const tokens = normalizeLaunchText(input)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(" ")
    .filter((t) => t.length > 1 && !GENERIC_TERMS.has(t));
  return tokens.join(" ").trim();
}

export function normalizeAddress(input: string | null): string {
  return normalizeLaunchText(input ?? "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/* ───────── Qualidade ───────── */

const QUALITY_FIELDS: { key: keyof DevelopmentRow | "units"; label: string; weight: number }[] = [
  { key: "name", label: "Nome", weight: 10 },
  { key: "slug", label: "Slug", weight: 5 },
  { key: "developer_id", label: "Construtora", weight: 10 },
  { key: "neighborhood", label: "Bairro", weight: 10 },
  { key: "address", label: "Endereço", weight: 10 },
  { key: "description", label: "Descrição", weight: 10 },
  { key: "cover_image", label: "Hero image", weight: 10 },
  { key: "gallery", label: "Galeria", weight: 10 },
  { key: "delivery_estimate", label: "Previsão de entrega", weight: 5 },
  { key: "units", label: "Unidades relacionadas", weight: 10 },
  { key: "seo_title", label: "SEO title", weight: 5 },
  { key: "seo_description", label: "SEO description", weight: 5 },
];

export function scoreDevelopment(row: DevelopmentRow, unitsCount: number) {
  let score = 0;
  const issues: string[] = [];
  for (const field of QUALITY_FIELDS) {
    let filled: boolean;
    if (field.key === "units") filled = unitsCount > 0;
    else {
      const value = row[field.key as keyof DevelopmentRow];
      filled = Array.isArray(value)
        ? value.length > 0
        : value !== null && value !== undefined && String(value).trim() !== "";
    }
    if (filled) score += field.weight;
    else issues.push(field.label);
  }
  return { score, issues, ready: issues.length === 0 };
}

