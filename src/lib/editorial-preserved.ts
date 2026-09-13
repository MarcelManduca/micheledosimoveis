/**
 * Registro de imóveis de acervo editorial permanentemente preservados.
 * Permite que páginas `/imovel/CODIGO` citadas em artigos do blog permaneçam
 * acessíveis com aviso de indisponibilidade e CTA contextual, sem abrir
 * leitura indiscriminada a todos os imóveis com published=false.
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
  unavailableNotice: string;
}

export const EDITORIAL_PRESERVED_CATALOG: Record<string, EditorialPreservedProperty> = {
  "34547": {
    code: "34547",
    condoName: "La Perle Beira Mar",
    condoSlug: null, // Sem slug registrado no catálogo atual
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
    unavailableNotice: "Esta unidade não está disponível para venda no momento.",
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
      "Vista para Praça e Mar",
      "Suíte Master com Hidromassagem",
      "Piso em Madeira",
    ],
    condoFeatures: [
      "Piscina com Raia",
      "Espaço Gourmet",
      "Academia Equipada",
      "Brinquedoteca",
      "Segurança 24h",
    ],
    coverImage: "/blog/beira-mar-norte/acqua.webp",
    photos: [{ url: "/blog/beira-mar-norte/acqua.webp", position: 1 }],
    isPreserved: true,
    unavailableNotice: "Esta unidade não está disponível para venda no momento.",
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
      "Unidade no Sonata Place, integrante do complexo Simphonia WOA Beiramar. 3 suítes, living amplo, sacada com churrasqueira e fachada ventilada com tecnologia sustentável.",
    features: ["Elevador", "Churrasqueira a Carvão", "Persianas Elétricas", "Esquadrias de Alta Performance"],
    condoFeatures: [
      "Piscina Adulto e Infantil",
      "Espaço Fitness",
      "Salão de Festas Gourmet",
      "Playground",
      "Guarita Blindada",
    ],
    coverImage: "/blog/beira-mar-norte/sonata-place.webp",
    photos: [{ url: "/blog/beira-mar-norte/sonata-place.webp", position: 1 }],
    isPreserved: true,
    unavailableNotice: "Esta unidade não está disponível para venda no momento.",
  },
  "22461": {
    code: "22461",
    condoName: "Jazz Club",
    condoSlug: "condominio-jazz-club-agronomica-florianopolis",
    articlePath: "/blog/condominios-luxo-beira-mar-norte-agronomica#jazz-club",
    title: "Apartamento em Agronômica com 2 dormitórios, 99m² — Jazz Club",
    propertyType: "apartamento",
    neighborhood: "Agronômica",
    city: "Florianópolis",
    state: "SC",
    address: "Servidão Paulo Zimmer, 101",
    areaM2: 99,
    bedrooms: 2,
    suites: 2,
    bathrooms: 3,
    parkingSpots: 2,
    description:
      "Apartamento no Jazz Club (Simphonia WOA Beiramar). Planta prática e sofisticada com 2 suítes, sacada integrada e infraestrutura privativa de lazer no Boulevard Paulo Zimmer.",
    features: ["Sacada Integrada", "Lavabo", "Churrasqueira", "Acabamento em Porcelanato"],
    condoFeatures: [
      "Piscina Aquecida",
      "Espaço Fitness",
      "Lounge Gourmet",
      "Bicicletário",
      "Monitoramento 24h",
    ],
    coverImage: "/blog/beira-mar-norte/jazz-club.webp",
    photos: [{ url: "/blog/beira-mar-norte/jazz-club.webp", position: 1 }],
    isPreserved: true,
    unavailableNotice: "Esta unidade não está disponível para venda no momento.",
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
    unavailableNotice: "Esta unidade não está disponível para venda no momento.",
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
      "Apartamento no Residencial Villa Celimontana (Construtora Fontana), pronto para morar em dezembro de 2023. Conceito home club na Agronômica com lazer completo para a família.",
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
    unavailableNotice: "Esta unidade não está disponível para venda no momento.",
  },
};

/**
 * Lista de códigos revogados explicitamente por decisão administrativa ou solicitação de privacidade.
 * Qualquer código nesta lista sofre bloqueio absoluto no site, sobrepondo qualquer fallback,
 * impedindo a renderização do imóvel, suprimindo metadados e excluindo do sitemap.
 */
export const ADMINISTRATIVE_REVOKED_CODES = new Set<string>([]);

export function isAdministrativeBlocked(code: string): boolean {
  return ADMINISTRATIVE_REVOKED_CODES.has(code);
}

export function getEditorialPreservedSnapshot(code: string): EditorialPreservedProperty | null {
  if (isAdministrativeBlocked(code)) return null;
  const item = EDITORIAL_PRESERVED_CATALOG[code];
  if (!item || !item.isPreserved) return null;
  return item;
}

export function isPreservedCode(code: string): boolean {
  if (isAdministrativeBlocked(code)) return false;
  return Boolean(EDITORIAL_PRESERVED_CATALOG[code]?.isPreserved);
}

