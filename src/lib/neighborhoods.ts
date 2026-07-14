// Programmatic SEO: neighborhood data for /imoveis/$slug routes.
// One entry per region of actuation. Slugs are stable — do not rename
// without updating sitemap and internal links.
import beiraMar720 from "@/assets/bairros/bairro-beira-mar-norte-720.webp";
import beiraMar1280 from "@/assets/bairros/bairro-beira-mar-norte-1280.webp";
import centro720 from "@/assets/bairros/bairro-centro-720.webp";
import centro1280 from "@/assets/bairros/bairro-centro-1280.webp";
import agronomica720 from "@/assets/bairros/bairro-agronomica-720.webp";
import agronomica1280 from "@/assets/bairros/bairro-agronomica-1280.webp";
import jurereInt720 from "@/assets/bairros/bairro-jurere-internacional-720.webp";
import jurereInt1280 from "@/assets/bairros/bairro-jurere-internacional-1280.webp";
import jurereTrad720 from "@/assets/bairros/bairro-jurere-tradicional-720.webp";
import jurereTrad1280 from "@/assets/bairros/bairro-jurere-tradicional-1280.webp";
import praiaBrava720 from "@/assets/bairros/bairro-praia-brava-720.webp";
import praiaBrava1280 from "@/assets/bairros/bairro-praia-brava-1280.webp";
import joaoPaulo720 from "@/assets/bairros/bairro-joao-paulo-720.webp";
import joaoPaulo1280 from "@/assets/bairros/bairro-joao-paulo-1280.webp";
import cacupe720 from "@/assets/bairros/bairro-cacupe-720.webp";
import cacupe1280 from "@/assets/bairros/bairro-cacupe-1280.webp";
import santoAntonio720 from "@/assets/bairros/bairro-santo-antonio-de-lisboa-720.webp";
import santoAntonio1280 from "@/assets/bairros/bairro-santo-antonio-de-lisboa-1280.webp";
import itacorubi720 from "@/assets/bairros/bairro-itacorubi-720.webp";
import itacorubi1280 from "@/assets/bairros/bairro-itacorubi-1280.webp";
import trindade720 from "@/assets/bairros/bairro-trindade-720.webp";
import trindade1280 from "@/assets/bairros/bairro-trindade-1280.webp";
import santaMonica720 from "@/assets/bairros/bairro-santa-monica-720.webp";
import santaMonica1280 from "@/assets/bairros/bairro-santa-monica-1280.webp";
import corregoGrande720 from "@/assets/bairros/bairro-corrego-grande-720.webp";
import corregoGrande1280 from "@/assets/bairros/bairro-corrego-grande-1280.webp";
import lagoa720 from "@/assets/bairros/bairro-lagoa-da-conceicao-720.webp";
import lagoa1280 from "@/assets/bairros/bairro-lagoa-da-conceicao-1280.webp";
import cantoLagoa720 from "@/assets/bairros/bairro-canto-da-lagoa-720.webp";
import cantoLagoa1280 from "@/assets/bairros/bairro-canto-da-lagoa-1280.webp";
import campeche720 from "@/assets/bairros/bairro-campeche-720.webp";
import campeche1280 from "@/assets/bairros/bairro-campeche-1280.webp";
import novoCampeche720 from "@/assets/bairros/bairro-novo-campeche-720.webp";
import novoCampeche1280 from "@/assets/bairros/bairro-novo-campeche-1280.webp";
import rioTavares720 from "@/assets/bairros/bairro-rio-tavares-720.webp";
import rioTavares1280 from "@/assets/bairros/bairro-rio-tavares-1280.webp";
import morroPedras720 from "@/assets/bairros/bairro-morro-das-pedras-720.webp";
import morroPedras1280 from "@/assets/bairros/bairro-morro-das-pedras-1280.webp";

export type NeighborhoodImage = {
  // URL padrão (fallback). Deve corresponder à variante ~640w.
  src: string;
  // Ex.: "img-320.webp 320w, img-640.webp 640w, img-960.webp 960w".
  srcset?: string;
  // Ex.: "(max-width: 640px) 25vw, 30vw".
  sizes?: string;
  // Texto descritivo curto (contexto do bairro).
  alt?: string;
};

export type Neighborhood = {
  slug: string;
  name: string;
  // Term used to filter properties.neighborhood via ILIKE. Keep generic
  // enough to match Gralha's naming (e.g. "Beira Mar" instead of the
  // full "Centro / Beira Mar Norte").
  query: string;
  // Short tag used on cards.
  tag: string;
  // 1-line meta description body (will be wrapped in a full sentence).
  metaDesc: string;
  // Long-form intro (1–2 paragraphs) displayed at the top of the page.
  intro: string;
  // Bullet points about the region: vista, perfil, lazer, valorização.
  highlights: string[];
  // Approximate geo center (lat,lng) for LocalBusiness/Place schema.
  geo?: { lat: number; lng: number };
  // Slugs of nearby/related neighborhoods for internal linking.
  related: string[];
  // Se true, a página do bairro é indexável (index,follow) mesmo quando
  // o portfólio público estiver vazio — usado em bairros estratégicos
  // de SEO/GEO com forte autoridade local e captação off market.
  indexWhenEmpty?: boolean;
  // Foto representativa (opcional). Quando ausente, o card usa o layout
  // atual sem imagem. Ver `NeighborhoodImage` para o contrato.
  image?: NeighborhoodImage;
};

const STRATEGIC_SLUGS = new Set([
  "jurere-internacional",
  "beira-mar-norte",
  "cacupe",
  "joao-paulo",
  "campeche",
  "lagoa-da-conceicao",
  "praia-brava",
  "santo-antonio-de-lisboa",
  "novo-campeche",
]);

export const NEIGHBORHOODS: Neighborhood[] = [
  {
    slug: "beira-mar-norte",
    name: "Beira Mar Norte",
    query: "Beira Mar",
    tag: "Vista mar e localização central",
    metaDesc:
      "apartamentos frente mar, coberturas e imóveis de alto padrão na Av. Beira Mar Norte, em Florianópolis",
    intro:
      "A Avenida Beira Mar Norte concentra os endereços mais cobiçados do centro de Florianópolis: edifícios frente mar, coberturas com vista para a Baía Norte e prédios com infraestrutura completa. É a região onde a vida urbana, gastronomia e mobilidade encontram a paisagem da ilha.",
    highlights: [
      "Apartamentos e coberturas com vista panorâmica da Baía Norte",
      "Proximidade a restaurantes, parques e centros comerciais",
      "Acesso rápido ao centro histórico e à BR-282",
      "Forte liquidez e valorização consistente",
    ],
    geo: { lat: -27.5818, lng: -48.5648 },
    related: ["agronomica", "centro", "joao-paulo"],
    image: {
      src: beiraMar720,
      srcset: `${beiraMar720} 720w, ${beiraMar1280} 1280w`,
      sizes: "(max-width: 640px) 25vw, 30vw",
      alt: "Avenida Beira Mar Norte, Florianópolis",
    },
  },
  {
    slug: "centro",
    name: "Centro",
    query: "Centro",
    tag: "Coração histórico e comercial",
    metaDesc:
      "imóveis de alto padrão no Centro de Florianópolis, com mobilidade, serviços e proximidade à orla",
    intro:
      "O Centro de Florianópolis é o ponto de convergência da capital: serviços, instituições, gastronomia e a orla da Beira Mar Norte ao alcance dos pés. Reúne edifícios clássicos restaurados e empreendimentos contemporâneos a poucos minutos da ponte Hercílio Luz.",
    highlights: [
      "Mobilidade urbana e acesso aos principais bairros",
      "Vida cultural, gastronômica e comercial intensa",
      "Patrimônio histórico preservado",
      "Endereço estratégico para profissionais e investidores",
    ],
    geo: { lat: -27.5969, lng: -48.5495 },
    related: ["beira-mar-norte", "agronomica", "trindade"],
    image: {
      src: centro720,
      srcset: `${centro720} 720w, ${centro1280} 1280w`,
      sizes: "(max-width: 640px) 35vw, 40vw",
      alt: "Centro de Florianópolis — atmosfera urbana editorial",
    },
  },
  {
    slug: "agronomica",
    name: "Agronômica",
    query: "Agronômica",
    tag: "Próximo ao centro, vista privilegiada",
    metaDesc:
      "imóveis de alto padrão na Agronômica, em Florianópolis — vista mar, infraestrutura e proximidade ao centro",
    intro:
      "A Agronômica é a continuação natural da Beira Mar Norte: ruas arborizadas, edifícios residenciais consolidados e vista privilegiada para a Baía Norte. Bairro de perfil residencial, valorizado por famílias que buscam tranquilidade sem abrir mão da localização.",
    highlights: [
      "Edifícios com vista para a baía e o continente",
      "Bairro residencial com excelente infraestrutura",
      "Próximo a hospitais, escolas e ao Palácio Cruz e Sousa",
      "Forte demanda por imóveis amplos e coberturas",
    ],
    geo: { lat: -27.5764, lng: -48.5505 },
    related: ["beira-mar-norte", "joao-paulo", "centro"],
    image: {
      src: agronomica720,
      srcset: `${agronomica720} 720w, ${agronomica1280} 1280w`,
      sizes: "(max-width: 640px) 35vw, 40vw",
      alt: "Agronômica — vista para a Baía Norte, atmosfera editorial",
    },
  },
  {
    slug: "jurere-internacional",
    name: "Jurerê Internacional",
    query: "Jurerê Internacional",
    tag: "O endereço mais exclusivo da Ilha",
    metaDesc:
      "casas e apartamentos de alto padrão em Jurerê Internacional, Florianópolis — o endereço mais exclusivo da Ilha",
    intro:
      "Jurerê Internacional é sinônimo de alto padrão em Florianópolis: ruas planejadas, mansões à beira-mar, beach clubs renomados e uma das comunidades mais desejadas do Brasil. Endereço de assinatura para quem busca exclusividade absoluta.",
    highlights: [
      "Mansões pé na areia e residências em condomínios fechados",
      "Beach clubs, gastronomia internacional e marinas privativas",
      "Liquidez premium e valorização constante",
      "Operações off market frequentes",
    ],
    geo: { lat: -27.4413, lng: -48.4985 },
    related: ["jurere-tradicional", "praia-brava", "joao-paulo"],
    image: {
      src: jurereInt720,
      srcset: `${jurereInt720} 720w, ${jurereInt1280} 1280w`,
      sizes: "(max-width: 640px) 35vw, 40vw",
      alt: "Jurerê Internacional — arquitetura branca e golden hour",
    },
  },
  {
    slug: "jurere-tradicional",
    name: "Jurerê Tradicional",
    query: "Jurerê Tradicional",
    tag: "Praia familiar e tranquila",
    metaDesc:
      "imóveis de alto padrão em Jurerê Tradicional, em Florianópolis — clima familiar e mar calmo",
    intro:
      "Jurerê Tradicional preserva o clima de vila praiana original do Norte da Ilha, com casas amplas, mar calmo e perfil familiar. Convive lado a lado com Jurerê Internacional e oferece uma alternativa mais discreta, sem perder o alto padrão.",
    highlights: [
      "Casas térreas e sobrados em terrenos generosos",
      "Mar calmo, ideal para famílias",
      "Comunidade consolidada e segura",
      "Excelente custo-benefício no Norte da Ilha",
    ],
    geo: { lat: -27.4429, lng: -48.5125 },
    related: ["jurere-internacional", "praia-brava", "cacupe"],
  },
  {
    slug: "praia-brava",
    name: "Praia Brava",
    query: "Praia Brava",
    tag: "Mar aberto e arquitetura contemporânea",
    metaDesc:
      "apartamentos e coberturas frente mar na Praia Brava, em Florianópolis — arquitetura contemporânea e mar aberto",
    intro:
      "A Praia Brava combina mar aberto, surf, gastronomia e empreendimentos de assinatura. Reduto de quem busca lifestyle praiano sofisticado e arquitetura contemporânea no Norte da Ilha.",
    highlights: [
      "Lançamentos frente mar de assinatura",
      "Pôr do sol, surf e gastronomia premiada",
      "Acesso rápido a Jurerê e ao aeroporto via SC-403",
      "Perfil internacional e investidores",
    ],
    geo: { lat: -27.4083, lng: -48.4327 },
    related: ["jurere-internacional", "jurere-tradicional", "cacupe"],
  },
  {
    slug: "joao-paulo",
    name: "João Paulo",
    query: "João Paulo",
    tag: "Vista para a baía, alto padrão residencial",
    metaDesc:
      "casas e apartamentos de alto padrão no João Paulo, em Florianópolis — vista para a Baía Norte",
    intro:
      "O João Paulo é um dos bairros residenciais mais valorizados da capital: ruas tranquilas em meia encosta, casas em condomínios fechados e vista privilegiada para a Baía Norte. Localização estratégica entre o centro e o Norte da Ilha.",
    highlights: [
      "Condomínios fechados de alto padrão",
      "Vista panorâmica para a Baía Norte",
      "Acesso rápido a Santo Antônio de Lisboa e Cacupé",
      "Perfil familiar e residencial",
    ],
    geo: { lat: -27.5462, lng: -48.5096 },
    related: ["cacupe", "santo-antonio-de-lisboa", "agronomica"],
  },
  {
    slug: "cacupe",
    name: "Cacupé",
    query: "Cacupé",
    tag: "Mar calmo, pôr do sol e exclusividade",
    metaDesc:
      "casas pé na areia e imóveis de alto padrão em Cacupé, em Florianópolis — mar calmo e exclusividade",
    intro:
      "Cacupé é um dos endereços mais reservados da costa Norte: praia tranquila, pôr do sol sobre a baía e casas pé na areia que raramente entram no mercado tradicional. Região de operações discretas e exclusivas.",
    highlights: [
      "Casas frente mar e terrenos pé na areia",
      "Pôr do sol icônico sobre a Baía Norte",
      "Comunidade discreta e estabelecida",
      "Alto volume de transações off market",
    ],
    geo: { lat: -27.5253, lng: -48.5096 },
    related: ["santo-antonio-de-lisboa", "joao-paulo", "jurere-tradicional"],
  },
  {
    slug: "santo-antonio-de-lisboa",
    name: "Santo Antônio de Lisboa",
    query: "Santo Antônio",
    tag: "Charme açoriano à beira-mar",
    metaDesc:
      "imóveis de alto padrão em Santo Antônio de Lisboa, em Florianópolis — charme açoriano e gastronomia à beira-mar",
    intro:
      "Santo Antônio de Lisboa preserva o casario colonial açoriano, a gastronomia à base de frutos do mar e uma das vistas mais cinematográficas do pôr do sol em Florianópolis. Bairro charmoso para quem busca uma residência com história.",
    highlights: [
      "Patrimônio histórico e arquitetura açoriana",
      "Gastronomia premiada à beira-mar",
      "Pôr do sol sobre o continente",
      "Casas com terrenos amplos e vista para a baía",
    ],
    geo: { lat: -27.5083, lng: -48.5142 },
    related: ["cacupe", "joao-paulo", "jurere-tradicional"],
  },
  {
    slug: "itacorubi",
    name: "Itacorubi",
    query: "Itacorubi",
    tag: "Bairro nobre, próximo a tudo",
    metaDesc:
      "apartamentos e casas de alto padrão no Itacorubi, em Florianópolis — centralidade e infraestrutura completa",
    intro:
      "O Itacorubi é o centro nervoso do Leste da Ilha: shoppings, hospitais de referência, universidades e acesso direto à Lagoa da Conceição, à Trindade e ao centro. Bairro de forte demanda residencial e corporativa.",
    highlights: [
      "Acesso rápido à Lagoa, à Trindade e ao centro",
      "Shoppings, hospitais e escolas internacionais",
      "Edifícios residenciais e empresariais de alto padrão",
      "Forte demanda de locação e revenda",
    ],
    geo: { lat: -27.5786, lng: -48.5093 },
    related: ["trindade", "santa-monica", "corrego-grande"],
  },
  {
    slug: "trindade",
    name: "Trindade",
    query: "Trindade",
    tag: "Centralidade e valorização constante",
    metaDesc:
      "imóveis de alto padrão na Trindade, em Florianópolis — vida universitária e infraestrutura completa",
    intro:
      "A Trindade combina a vitalidade da UFSC, gastronomia jovem e edifícios residenciais consolidados. Bairro de localização estratégica, com forte demanda residencial e excelente liquidez.",
    highlights: [
      "Vida universitária, comércio e gastronomia",
      "Próximo ao centro, à Lagoa e ao Itacorubi",
      "Forte demanda de locação",
      "Edifícios residenciais consolidados",
    ],
    geo: { lat: -27.6021, lng: -48.5181 },
    related: ["itacorubi", "santa-monica", "corrego-grande"],
  },
  {
    slug: "santa-monica",
    name: "Santa Mônica",
    query: "Santa Mônica",
    tag: "Residencial, arborizado, alto padrão",
    metaDesc:
      "casas e apartamentos de alto padrão em Santa Mônica, em Florianópolis — bairro residencial e arborizado",
    intro:
      "Santa Mônica é referência em qualidade de vida na capital: ruas arborizadas, perfil residencial, escolas de excelência e proximidade aos polos comerciais do Leste. Bairro de famílias que buscam tranquilidade e infraestrutura.",
    highlights: [
      "Ruas arborizadas e baixo tráfego",
      "Escolas internacionais e bilíngues",
      "Próximo a shoppings, parques e à Lagoa",
      "Demanda constante por casas em condomínio",
    ],
    geo: { lat: -27.5862, lng: -48.5012 },
    related: ["corrego-grande", "trindade", "itacorubi"],
  },
  {
    slug: "corrego-grande",
    name: "Córrego Grande",
    query: "Córrego Grande",
    tag: "Tranquilidade a minutos do centro",
    metaDesc:
      "casas e apartamentos de alto padrão no Córrego Grande, em Florianópolis — natureza e tranquilidade",
    intro:
      "O Córrego Grande une o verde do Horto Florestal à infraestrutura do Leste da Ilha. Bairro residencial procurado por famílias que valorizam contato com a natureza sem se afastar dos serviços.",
    highlights: [
      "Horto Florestal e áreas verdes preservadas",
      "Casas em condomínios fechados",
      "Próximo a shoppings e escolas internacionais",
      "Bairro residencial em valorização",
    ],
    geo: { lat: -27.5961, lng: -48.4974 },
    related: ["santa-monica", "itacorubi", "trindade"],
  },
  {
    slug: "lagoa-da-conceicao",
    name: "Lagoa da Conceição",
    query: "Lagoa da Conceição",
    tag: "Estilo de vida único na Ilha",
    metaDesc:
      "casas e apartamentos de alto padrão na Lagoa da Conceição, em Florianópolis — lifestyle, gastronomia e natureza",
    intro:
      "A Lagoa da Conceição é o coração cultural do Leste da Ilha: gastronomia, esportes náuticos, vida noturna e paisagens entre o mar, a lagoa e o morro. Endereço para quem quer viver Florianópolis em sua forma mais autêntica.",
    highlights: [
      "Esportes náuticos, gastronomia e vida noturna",
      "Casas com vista para a lagoa e para o mar",
      "Acesso rápido a praias do Leste",
      "Lifestyle único na Ilha",
    ],
    geo: { lat: -27.6051, lng: -48.4671 },
    related: ["canto-da-lagoa", "campeche", "itacorubi"],
    image: {
      src: lagoa720,
      srcset: `${lagoa720} 720w, ${lagoa1280} 1280w`,
      sizes: "(max-width: 640px) 35vw, 40vw",
      alt: "Lagoa da Conceição — espelho d'água ao entardecer",
    },
  },
  {
    slug: "canto-da-lagoa",
    name: "Canto da Lagoa",
    query: "Canto da Lagoa",
    tag: "Reserva, natureza e exclusividade",
    metaDesc:
      "casas de alto padrão no Canto da Lagoa, em Florianópolis — natureza, reserva e privacidade",
    intro:
      "O Canto da Lagoa preserva o ambiente mais reservado do entorno da Lagoa da Conceição: trilhas, natureza e residências exclusivas em meio à mata. Endereço para quem quer privacidade absoluta sem abrir mão da Lagoa.",
    highlights: [
      "Casas em meio à reserva e trilhas",
      "Privacidade e perfil exclusivo",
      "Próximo à Lagoa e à Praia Mole",
      "Mercado restrito e operações discretas",
    ],
    geo: { lat: -27.6202, lng: -48.4823 },
    related: ["lagoa-da-conceicao", "campeche", "morro-das-pedras"],
  },
  {
    slug: "campeche",
    name: "Campeche",
    query: "Campeche",
    tag: "Praia, lifestyle e novos lançamentos",
    metaDesc:
      "apartamentos, casas e lançamentos de alto padrão no Campeche, em Florianópolis — lifestyle praiano",
    intro:
      "O Campeche é o bairro que mais cresce no Sul da Ilha: praia extensa, cultura surf, gastronomia jovem e lançamentos imobiliários de alto padrão. Endereço para quem busca lifestyle praiano contemporâneo.",
    highlights: [
      "Praia extensa e cultura surf",
      "Lançamentos pé na areia e edifícios contemporâneos",
      "Gastronomia jovem e mercado em expansão",
      "Forte valorização nos últimos anos",
    ],
    geo: { lat: -27.6789, lng: -48.4878 },
    related: ["novo-campeche", "morro-das-pedras", "rio-tavares"],
    image: {
      src: campeche720,
      srcset: `${campeche720} 720w, ${campeche1280} 1280w`,
      sizes: "(max-width: 640px) 35vw, 40vw",
      alt: "Campeche — dunas ao golden hour, atmosfera editorial",
    },
  },
  {
    slug: "novo-campeche",
    name: "Novo Campeche",
    query: "Novo Campeche",
    tag: "Empreendimentos contemporâneos pé na areia",
    metaDesc:
      "lançamentos e apartamentos de alto padrão no Novo Campeche, em Florianópolis — empreendimentos contemporâneos",
    intro:
      "O Novo Campeche concentra a nova geração de empreendimentos pé na areia da capital. Arquitetura contemporânea, infraestrutura completa e perfil internacional para quem busca lifestyle praiano de assinatura.",
    highlights: [
      "Lançamentos pé na areia",
      "Arquitetura contemporânea de assinatura",
      "Perfil internacional e investidores",
      "Forte valorização e demanda",
    ],
    geo: { lat: -27.6912, lng: -48.4845 },
    related: ["campeche", "morro-das-pedras", "rio-tavares"],
  },
  {
    slug: "rio-tavares",
    name: "Rio Tavares",
    query: "Rio Tavares",
    tag: "Casas em condomínio com amplo terreno",
    metaDesc:
      "casas em condomínios fechados de alto padrão no Rio Tavares, em Florianópolis — terrenos amplos e tranquilidade",
    intro:
      "O Rio Tavares é o endereço dos grandes condomínios fechados do Sul da Ilha: casas com terrenos amplos, perfil residencial e proximidade ao Campeche e à Lagoa da Conceição.",
    highlights: [
      "Condomínios fechados de alto padrão",
      "Casas com terrenos generosos",
      "Próximo ao Campeche e à Lagoa",
      "Perfil residencial e familiar",
    ],
    geo: { lat: -27.6727, lng: -48.5012 },
    related: ["campeche", "novo-campeche", "canto-da-lagoa"],
  },
  {
    slug: "morro-das-pedras",
    name: "Morro das Pedras",
    query: "Morro das Pedras",
    tag: "Vista mar aberta e privacidade",
    metaDesc:
      "casas e apartamentos de alto padrão no Morro das Pedras, em Florianópolis — vista mar aberta e privacidade",
    intro:
      "O Morro das Pedras oferece um dos cartões-postais do Sul da Ilha: costões, mar aberto e residências privilegiadas por vista e privacidade. Alternativa para quem busca exclusividade fora dos polos mais movimentados.",
    highlights: [
      "Vista mar aberta e costões cinematográficos",
      "Casas em meia encosta com privacidade",
      "Próximo ao Campeche e à Armação",
      "Mercado restrito e exclusivo",
    ],
    geo: { lat: -27.7204, lng: -48.5119 },
    related: ["campeche", "novo-campeche", "rio-tavares"],
  },
];

// Marca bairros estratégicos como indexáveis mesmo sem imóveis públicos.
for (const n of NEIGHBORHOODS) {
  if (STRATEGIC_SLUGS.has(n.slug)) n.indexWhenEmpty = true;
}

export function getNeighborhood(slug: string): Neighborhood | undefined {
  return NEIGHBORHOODS.find((n) => n.slug === slug);
}

// Normaliza string para matching tolerante a acentos/caixa.
function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Resolve um nome de bairro vindo do Gralha para o slug canônico
// do bairro programático. Usado para linkar imóveis ao bairro e
// para unificar canonicals (ex.: /buscar?bairro=X → /imoveis/$slug).
export function findNeighborhoodByName(
  name: string | null | undefined,
): Neighborhood | undefined {
  if (!name) return undefined;
  const target = norm(name);
  let hit = NEIGHBORHOODS.find((n) => norm(n.name) === target);
  if (hit) return hit;
  hit = NEIGHBORHOODS.find(
    (n) => target.includes(norm(n.query)) || norm(n.query).includes(target),
  );
  if (hit) return hit;
  return NEIGHBORHOODS.find(
    (n) => target.includes(norm(n.name)) || norm(n.name).includes(target),
  );
}

