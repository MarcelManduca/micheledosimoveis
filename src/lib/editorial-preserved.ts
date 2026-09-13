/**
 * Registro de imóveis de acervo editorial permanentemente preservados.
 * Permite que páginas `/imovel/CODIGO` citadas em artigos do blog permaneçam
 * acessíveis com aviso de indisponibilidade e CTA contextual, sem abrir
 * leitura indiscriminada a todos os imóveis com published=false.
 *
 * Fonte persistente de verdade:
 * - Prioridade 1: Tabela `editorial_preserved_properties` no Supabase (quando disponível).
 *   Se o registro no banco tiver `is_preserved = false` ou `is_admin_blocked = true`,
 *   a unidade é considerada revogada e NÃO é exibida.
 * - Prioridade 2: Catálogo semente estático (`EDITORIAL_PRESERVED_CATALOG`), utilizado
 *   como fallback seguro antes da migração do banco.
 */

export interface EditorialPreservedProperty {
  code: string;
  condoName: string;
  condoSlug: string | null;
  articlePath: string;
  title: string;
  propertyType: string;
  neighborhood: string;
  city: string;
  state: string;
  address: string;
  areaM2: number;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parkingSpots: number;
  description: string;
  features: string[];
  condoFeatures: string[];
  coverImage: string;
  photos: { url: string; position: number }[];
  isPreserved: boolean;
  isAdminBlocked?: boolean;
  unavailableNotice: string;
  snapshotDate: string;
}

export const EDITORIAL_PRESERVED_CATALOG: Record<string, EditorialPreservedProperty> = {
  "34547": {
    code: "34547",
    condoName: "La Perle Beira Mar",
    condoSlug: null,
    articlePath: "/blog/condominios-luxo-beira-mar-norte-agronomica#la-perle",
    title: "Apartamento em Agronômica com 3 dormitórios, 316m² — La Perle",
    propertyType: "apartamento",
    neighborhood: "Agronômica",
    city: "Florianópolis",
    state: "SC",
    address: "Avenida Governador Irineu Bornhausen, 3600",
    areaM2: 316,
    bedrooms: 3,
    suites: 3,
    bathrooms: 6,
    parkingSpots: 4,
    description:
      "Apartamento à beira-mar em Florianópolis no condomínio La Perle. Três suítes espaçosas, quatro vagas de garagem, acabamentos de alto padrão e ampla área social integrada com vista panorâmica para a Baía Norte.",
    features: [
      "Elevador privativo",
      "Vista Panorâmica",
      "Vista Mar",
      "Sacada Com Churrasqueira",
      "Ar Condicionado",
      "Alto Padrão",
      "Água Quente",
    ],
    condoFeatures: [
      "Piscina Adulto",
      "Piscina Infantil",
      "Piscina Aquecida / Spa",
      "Sala Fitness",
      "Salão de Festas",
      "Salão de Jogos",
      "Sauna",
      "Playground",
      "Portaria 24h",
    ],
    coverImage: "/blog/beira-mar-norte/la-perle.webp",
    photos: [
      { url: "/blog/beira-mar-norte/la-perle.webp", position: 1 },
      { url: "/blog/beira-mar-norte/la-perle-2.webp", position: 2 },
    ],
    isPreserved: true,
    isAdminBlocked: false,
    unavailableNotice: "Esta unidade não está disponível para venda no momento.",
    snapshotDate: "2026-09-12",
  },
  "31776": {
    code: "31776",
    condoName: "Acqua",
    condoSlug: "condominio-acqua-agronomica-florianopolis",
    articlePath: "/blog/condominios-luxo-beira-mar-norte-agronomica#acqua",
    title: "Apartamento em Agronômica com 4 dormitórios, 221m² — Acqua",
    propertyType: "apartamento",
    neighborhood: "Agronômica",
    city: "Florianópolis",
    state: "SC",
    address: "Rua Frei Caneca, 17",
    areaM2: 221,
    bedrooms: 4,
    suites: 4,
    bathrooms: 5,
    parkingSpots: 4,
    description:
      "Apartamento no condomínio Acqua (CFL), na região da Praça Governador Celso Ramos. Planta ampla com 4 suítes, ambientes sociais integrados e lazer completo em localização nobre da Agronômica.",
    features: [
      "Elevador",
      "Sacada Gourmet",
      "Piscina no Condomínio",
      "Academia",
      "Salão de Festas",
      "Segurança 24h",
    ],
    condoFeatures: [
      "Piscina de Raia",
      "Deck Molhado",
      "Academia Completa",
      "Spa com Sauna",
      "Lounge Gourmet",
      "Brinquedoteca",
      "Gerador de Energia",
      "Portaria Blindada",
    ],
    coverImage: "/blog/beira-mar-norte/acqua.webp",
    photos: [{ url: "/blog/beira-mar-norte/acqua.webp", position: 1 }],
    isPreserved: true,
    isAdminBlocked: false,
    unavailableNotice: "Esta unidade não está disponível para venda no momento.",
    snapshotDate: "2026-09-12",
  },
  "30870": {
    code: "30870",
    condoName: "Sonata Place",
    condoSlug: "condominio-sonata-place-agronomica-florianopolis",
    articlePath: "/blog/condominios-luxo-beira-mar-norte-agronomica#sonata-place",
    title: "Apartamento em Agronômica com 3 dormitórios, 131m² — Sonata Place",
    propertyType: "apartamento",
    neighborhood: "Agronômica",
    city: "Florianópolis",
    state: "SC",
    address: "Rua Comandante Constantino Nicolau Spyrides, 4152",
    areaM2: 131,
    bedrooms: 3,
    suites: 3,
    bathrooms: 4,
    parkingSpots: 2,
    description:
      "Apartamento no Sonata Place (Simphonia WOA Beiramar). 3 suítes, sacada com churrasqueira a carvão, acabamentos nobres e lazer privativo da torre a poucos metros da Beira-Mar Norte.",
    features: ["Sacada com Churrasqueira", "Piso Porcelanato", "Lavabo", "Infraestrutura para Ar Split"],
    condoFeatures: [
      "Piscina Adulto e Infantil",
      "Espaço Fitness",
      "Salão de Festas Gourmet",
      "Playground",
      "Guarita 24h",
    ],
    coverImage: "/blog/beira-mar-norte/sonata-place.webp",
    photos: [{ url: "/blog/beira-mar-norte/sonata-place.webp", position: 1 }],
    isPreserved: true,
    isAdminBlocked: false,
    unavailableNotice: "Esta unidade não está disponível para venda no momento.",
    snapshotDate: "2026-09-12",
  },
  "22461": {
    code: "22461",
    condoName: "Jazz Club",
    condoSlug: "condominio-jazz-club-agronomica-florianopolis",
    articlePath: "/blog/condominios-luxo-beira-mar-norte-agronomica#jazz-club",
    title: "Apartamento em Agronômica com 3 dormitórios, 107m² — Jazz Club",
    propertyType: "apartamento",
    neighborhood: "Agronômica",
    city: "Florianópolis",
    state: "SC",
    address: "Servidão Paulo Zimmer, 101",
    areaM2: 107,
    bedrooms: 3,
    suites: 3,
    bathrooms: 4,
    parkingSpots: 2,
    description:
      "Apartamento contemporâneo no Jazz Club (Simphonia WOA Beiramar). 3 suítes, living integrado, sacada com churrasqueira e estrutura de lazer e segurança exclusiva da torre na Agronômica.",
    features: ["Sacada com Churrasqueira", "Persianas Integradas", "Espera para Split", "Lavabo"],
    condoFeatures: [
      "Piscina Aquecida",
      "Fitness Center",
      "Lounge Bar / Gourmet",
      "Bicicletário",
      "Portaria 24h",
    ],
    coverImage: "/blog/beira-mar-norte/jazz-club.webp",
    photos: [{ url: "/blog/beira-mar-norte/jazz-club.webp", position: 1 }],
    isPreserved: true,
    isAdminBlocked: false,
    unavailableNotice: "Esta unidade não está disponível para venda no momento.",
    snapshotDate: "2026-09-12",
  },
  "44022": {
    code: "44022",
    condoName: "Soprano Hall",
    condoSlug: "condominio-soprano-hall-agronomica-florianopolis",
    articlePath: "/blog/condominios-luxo-beira-mar-norte-agronomica#soprano-hall",
    title: "Apartamento em Agronômica com 3 dormitórios, 168m² — Soprano Hall",
    propertyType: "apartamento",
    neighborhood: "Agronômica",
    city: "Florianópolis",
    state: "SC",
    address: "Servidão Paulo Zimmer, 55",
    areaM2: 168,
    bedrooms: 3,
    suites: 3,
    bathrooms: 4,
    parkingSpots: 3,
    description:
      "Residência no Soprano Hall (Simphonia WOA Beiramar). 3 suítes amplas, acabamento de alto padrão, sacada generosa com churrasqueira e vista para a orla da Agronômica.",
    features: ["Living com 3 Ambientes", "Lavabo", "Churrasqueira", "Área de Serviço Separada"],
    condoFeatures: [
      "Piscina com Deck Molhado",
      "Salão de Festas Climatizado",
      "Fitness Center",
      "Playground",
      "Portaria 24h",
    ],
    coverImage: "/blog/beira-mar-norte/soprano-hall.webp",
    photos: [{ url: "/blog/beira-mar-norte/soprano-hall.webp", position: 1 }],
    isPreserved: true,
    isAdminBlocked: false,
    unavailableNotice: "Esta unidade não está disponível para venda no momento.",
    snapshotDate: "2026-09-12",
  },
  "43575": {
    code: "43575",
    condoName: "Villa Celimontana",
    condoSlug: "residencial-villa-celimontana-agronomica-florianopolis",
    articlePath: "/blog/condominios-luxo-beira-mar-norte-agronomica#villa-celimontana",
    title: "Apartamento em Agronômica com 2 dormitórios, 79m² — Villa Celimontana",
    propertyType: "apartamento",
    neighborhood: "Agronômica",
    city: "Florianópolis",
    state: "SC",
    address: "Travessa Felipe Godinho e Silva, 30",
    areaM2: 79,
    bedrooms: 2,
    suites: 1,
    bathrooms: 2,
    parkingSpots: 1,
    description:
      "Apartamento no Residencial Villa Celimontana (Construtora Fontana), comunicado como pronto para morar em dezembro de 2023. Conceito home club na Agronômica com lazer completo para a família.",
    features: ["Sacada com Churrasqueira", "Persianas Integradas", "Piso Porcelanato", "Espera para Split"],
    condoFeatures: [
      "Piscinas Adulto e Infantil",
      "Bar da Piscina",
      "Academia",
      "Espaço Gourmet",
      "Espaço Teen e Kids",
      "Pet Place",
      "Portaria 24h",
    ],
    coverImage: "/blog/beira-mar-norte/villa-celimontana.webp",
    photos: [{ url: "/blog/beira-mar-norte/villa-celimontana.webp", position: 1 }],
    isPreserved: true,
    isAdminBlocked: false,
    unavailableNotice: "Esta unidade não está disponível para venda no momento.",
    snapshotDate: "2026-09-12",
  },
};

/**
 * Consulta síncrona ao catálogo estático (para contextos síncronos/UI).
 */
export function getEditorialPreservedSnapshot(code: string): EditorialPreservedProperty | null {
  const item = EDITORIAL_PRESERVED_CATALOG[code];
  if (!item || !item.isPreserved || item.isAdminBlocked) return null;
  return item;
}

export function isPreservedCode(code: string): boolean {
  const item = EDITORIAL_PRESERVED_CATALOG[code];
  return Boolean(item?.isPreserved && !item.isAdminBlocked);
}

/**
 * Resolução persistente completa (DB primeiro, catálogo semente como fallback).
 * Garante que revogar ou bloquear no banco de dados impeça definitivamente
 * o reaparecimento pelo catálogo estático.
 */
export async function resolveEditorialPreservedSnapshot(
  code: string,
  supabase?: any,
): Promise<EditorialPreservedProperty | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("editorial_preserved_properties")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (!error && data) {
        // Registro encontrado no banco de dados (fonte persistente prioritária)
        if (data.is_preserved === false || data.is_admin_blocked === true) {
          // Explicitamente revogado ou bloqueado administrativamente no banco
          return null;
        }
        return {
          code: data.code,
          condoName: data.condo_name,
          condoSlug: data.condo_slug,
          articlePath: `/blog/${data.article_slug ?? "condominios-luxo-beira-mar-norte-agronomica"}`,
          title: data.title,
          propertyType: data.property_type ?? "apartamento",
          neighborhood: data.neighborhood ?? "",
          city: data.city ?? "Florianópolis",
          state: data.state ?? "SC",
          address: data.address ?? "",
          areaM2: Number(data.area_m2) || 0,
          bedrooms: data.bedrooms ?? 0,
          suites: data.suites ?? 0,
          bathrooms: data.bathrooms ?? 0,
          parkingSpots: data.parking_spots ?? 0,
          description: data.description ?? "",
          features: data.features ?? [],
          condoFeatures: data.condo_features ?? [],
          coverImage: data.cover_image ?? "",
          photos: Array.isArray(data.photos) ? data.photos : [],
          isPreserved: Boolean(data.is_preserved),
          isAdminBlocked: Boolean(data.is_admin_blocked),
          unavailableNotice: data.unavailable_notice ?? "Esta unidade não está disponível para venda no momento.",
          snapshotDate: data.created_at ? new Date(data.created_at).toISOString().slice(0, 10) : "2026-09-12",
        };
      }
    } catch {
      // Tabela ainda não existente no runtime, prossegue para o catálogo semente
    }
  }

  // Fallback para o catálogo semente
  const seed = EDITORIAL_PRESERVED_CATALOG[code];
  if (!seed || !seed.isPreserved || seed.isAdminBlocked) return null;
  return seed;
}

/**
 * Checagem centralizada de bloqueio administrativo.
 * Retorna true se o código estiver explicitamente bloqueado para exibição pública.
 */
export async function isCodeAdministrativelyBlocked(
  code: string,
  supabase?: any,
): Promise<boolean> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("editorial_preserved_properties")
        .select("is_admin_blocked, is_preserved")
        .eq("code", code)
        .maybeSingle();
      if (!error && data) {
        return Boolean(data.is_admin_blocked);
      }
    } catch {
      // Fall through
    }
  }
  const seed = EDITORIAL_PRESERVED_CATALOG[code];
  return Boolean(seed?.isAdminBlocked);
}

export function isAdministrativeBlocked(code: string): boolean {
  return Boolean(EDITORIAL_PRESERVED_CATALOG[code]?.isAdminBlocked);
}

