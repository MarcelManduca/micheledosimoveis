/**
 * Configuração estática do site — fonte única para contatos,
 * links e dados institucionais reutilizados em várias seções.
 */

export const SITE = {
  brokerName: "Michele Prietsch",
  brandName: "Michele dos Imóveis",
  city: "Florianópolis",
  state: "SC",
  phoneDisplay: "+55 (48) 9 9182-8828",
  phoneE164: "5548991828828",
  email: "micheledosimoveis@gmail.com",
  instagram: "micheledosimoveis",
  instagramUrl: "https://www.instagram.com/micheledosimoveis",
  creci: "CRECI 69502 · CRECI 11463J",
  address: {
    street: "R. Alves de Brito, 285",
    district: "Centro",
    cityState: "Florianópolis/SC",
  },
  publishedUrl: "https://micheledosimoveis.com.br/",
} as const;

const DEFAULT_WHATSAPP_MSG =
  "Olá Michele! Vi sua página e gostaria de saber mais sobre imóveis de alto padrão em Florianópolis.";

export function buildWhatsAppUrl(message: string = DEFAULT_WHATSAPP_MSG): string {
  return `https://api.whatsapp.com/send?phone=${SITE.phoneE164}&text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_URL = buildWhatsAppUrl();

/** Regiões de atuação — usadas no grid de bairros da home + rotas /imoveis/$slug. */
export const REGIOES = [
  { slug: "beira-mar-norte", nome: "Centro / Beira Mar Norte", desc: "Vista mar e localização central" },
  { slug: "agronomica", nome: "Agronômica", desc: "Próximo ao centro, vista privilegiada" },
  { slug: "jurere-internacional", nome: "Jurerê Internacional", desc: "Endereço mais exclusivo da Ilha" },
  { slug: "jurere-tradicional", nome: "Jurerê Tradicional", desc: "Praia familiar e tranquila" },
  { slug: "praia-brava", nome: "Praia Brava", desc: "Mar aberto e arquitetura contemporânea" },
  { slug: "joao-paulo", nome: "João Paulo", desc: "Vista para a baía, alto padrão residencial" },
  { slug: "cacupe", nome: "Cacupé", desc: "Mar calmo, pôr do sol e exclusividade" },
  { slug: "santo-antonio-de-lisboa", nome: "Santo Antônio de Lisboa", desc: "Charme açoriano à beira-mar" },
  { slug: "itacorubi", nome: "Itacorubi", desc: "Bairro nobre, próximo a tudo" },
  { slug: "trindade", nome: "Trindade", desc: "Centralidade e valorização constante" },
  { slug: "santa-monica", nome: "Santa Mônica", desc: "Residencial, arborizado, alto padrão" },
  { slug: "corrego-grande", nome: "Córrego Grande", desc: "Tranquilidade a minutos do centro" },
  { slug: "lagoa-da-conceicao", nome: "Lagoa da Conceição", desc: "Estilo de vida único na Ilha" },
  { slug: "canto-da-lagoa", nome: "Canto da Lagoa", desc: "Reserva, natureza e exclusividade" },
  { slug: "campeche", nome: "Campeche", desc: "Praia, lifestyle e novos lançamentos" },
  { slug: "novo-campeche", nome: "Novo Campeche", desc: "Empreendimentos contemporâneos pé na areia" },
  { slug: "rio-tavares", nome: "Rio Tavares", desc: "Casas em condomínio com amplo terreno" },
  { slug: "morro-das-pedras", nome: "Morro das Pedras", desc: "Vista mar aberta e privacidade" },
] as const;

/** Bio expandida (preservada para SEO + UX de "ler mais"). */
export const BIO_FULL = [
  "Sou Michele Prietsch, corretora de imóveis com 16 anos de experiência no mercado imobiliário e atuação especializada em imóveis de alto padrão em Florianópolis. Gaúcha de origem e apaixonada pela Ilha, encontrei em Florianópolis o cenário ideal para unir minha trajetória profissional à qualidade de vida, à arquitetura e ao estilo de vida que tornam a cidade uma das mais desejadas do Brasil.",
  "Embora meu nome seja Michele Prietsch, muitos clientes passaram a me chamar carinhosamente de Michele dos Imóveis — um apelido que nasceu da minha presença constante no mercado imobiliário, da forma próxima como conduzo cada atendimento e da dedicação em conectar pessoas aos imóveis certos em Florianópolis. Com o tempo, esse nome se tornou parte da minha identidade profissional e da minha marca pessoal.",
  "Atendo compradores, vendedores e investidores que buscam uma experiência imobiliária personalizada, segura e transparente. Meu trabalho vai além da intermediação: envolve escuta ativa, curadoria criteriosa, análise de perfil, leitura de mercado e acompanhamento próximo em cada etapa da negociação.",
  "Atuo em regiões valorizadas de Florianópolis, incluindo Jurerê Internacional, Praia Brava, Cacupé, Lagoa da Conceição, Campeche, Morro das Pedras, Centro, Beira-Mar Norte, Agronômica, Itacorubi, Trindade, Santa Mônica e Córrego Grande, sempre com foco em imóveis que combinam localização, arquitetura, conforto, liquidez e estilo de vida.",
  "Apaixonada por arquitetura, fotografia e produção de conteúdo, apresento cada imóvel de forma autêntica e estratégica, destacando não apenas suas características técnicas, mas também a experiência de morar, investir ou viver naquele endereço.",
  "Meu compromisso é tornar a compra ou venda de imóveis em Florianópolis uma jornada mais leve, segura e memorável, conectando pessoas a imóveis que fazem sentido para seu momento de vida.",
  "Será um prazer acompanhar você nessa escolha.",
];

/** Estatísticas da seção "Sobre". */
export const ABOUT_STATS = [
  { n: "+16 anos", l: "no mercado imobiliário" },
  { n: "150+", l: "imóveis negociados" },
  { n: "R$ 380M", l: "em VGV transacionado" },
  { n: "16k", l: "seguidores no Instagram" },
] as const;

/** Paleta usada pelo ChromaGrid nos cards de imóveis. */
export const CHROMA_PALETTE: Array<{ border: string; gradient: string }> = [
  { border: "#C8A464", gradient: "linear-gradient(145deg, #C8A464, #0b0b0b)" },
  { border: "#1E3A5F", gradient: "linear-gradient(180deg, #1E3A5F, #0b0b0b)" },
  { border: "#0F766E", gradient: "linear-gradient(165deg, #0F766E, #0b0b0b)" },
  { border: "#8B5E3C", gradient: "linear-gradient(195deg, #8B5E3C, #0b0b0b)" },
  { border: "#4B5563", gradient: "linear-gradient(225deg, #4B5563, #0b0b0b)" },
  { border: "#9CA3AF", gradient: "linear-gradient(135deg, #9CA3AF, #0b0b0b)" },
];
