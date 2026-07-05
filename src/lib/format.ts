/**
 * Formata valor numérico como moeda BRL.
 * Retorna "Sob consulta" para valores nulos.
 */
export function brl(n: number | null | undefined): string {
  if (n == null) return "Sob consulta";
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function stripAccentsLower(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// Mapa de preposição contraída por bairro (Florianópolis).
// "no" = em + o (masculino) · "na" = em + a (feminino)
// "nos"/"nas" = plural · "em" = sem artigo definido
const NEIGHBORHOOD_PREP: Record<string, "no" | "na" | "em" | "nos" | "nas"> = {
  "centro": "no",
  "itacorubi": "no",
  "campeche": "no",
  "corrego grande": "no",
  "canto da lagoa": "no",
  "rio tavares": "no",
  "morro das pedras": "no",
  "estreito": "no",
  "saco dos limoes": "no",
  "saco grande": "no",
  "monte verde": "no",
  "pantanal": "no",
  "bom abrigo": "no",
  "kobrasol": "no",

  "agronomica": "na",
  "beira-mar norte": "na",
  "beira mar norte": "na",
  "lagoa da conceicao": "na",
  "trindade": "na",
  "praia brava": "na",
  "praia mole": "na",
  "barra da lagoa": "na",
  "cachoeira do bom jesus": "na",
  "carvoeira": "na",
  "serrinha": "na",

  "cacupe": "em",
  "joao paulo": "em",
  "jurere internacional": "em",
  "jurere tradicional": "em",
  "jurere": "em",
  "santa monica": "em",
  "santo antonio de lisboa": "em",
  "coqueiros": "em",
  "canasvieiras": "em",
  "sambaqui": "em",
  "ratones": "em",
  "vargem grande": "em",
  "vargem pequena": "em",
  "ponta das canas": "em",
  "daniela": "em",

  "ingleses": "nos",
  "ingleses do rio vermelho": "nos",
};

/**
 * Retorna a preposição correta para citar um bairro em texto corrente.
 * Ex.: "Centro" -> "no Centro", "Agronômica" -> "na Agronômica",
 *      "Cacupé" -> "em Cacupé", "Ingleses" -> "nos Ingleses".
 * Fallback conservador: "em <bairro>".
 */
export function formatNeighborhoodWithPreposition(
  neighborhood: string | null | undefined,
): string {
  if (!neighborhood) return "";
  const key = stripAccentsLower(neighborhood);
  const prep = NEIGHBORHOOD_PREP[key] ?? "em";
  return `${prep} ${neighborhood}`;
}
