// Server-only scraper for gralhaimoveis.com.br property pages.
// The page is server-rendered HTML, so we can extract everything with regex.

export type ScrapedProperty = {
  code: string;
  source_url: string;
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
  features: string[];
  condo_features: string[];
  cover_image: string | null;
  photos: string[];
};

function parseBrlNumber(s: string | null | undefined): number | null {
  if (!s) return null;
  // "5.750.000" or "5.750.000,00"
  const clean = s.replace(/\./g, "").replace(",", ".");
  const n = Number(clean);
  return Number.isFinite(n) ? n : null;
}

function stripTags(html: string): string {
  const noScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  const text = noScripts.replace(/<[^>]+>/g, " ");
  return text.replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function pickMeta(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']+)["']`,
    "i",
  );
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${name}["']`,
    "i",
  );
  const m2 = html.match(re2);
  return m2 ? m2[1] : null;
}

function sliceBetween(text: string, start: string, ends: string[]): string | null {
  const i = text.indexOf(start);
  if (i === -1) return null;
  let endIdx = text.length;
  for (const e of ends) {
    const j = text.indexOf(e, i + start.length);
    if (j !== -1 && j < endIdx) endIdx = j;
  }
  return text.slice(i + start.length, endIdx).trim();
}

function splitFeatures(s: string | null): string[] {
  if (!s) return [];
  // Features in the page are concatenated with single spaces but each starts with a capital letter
  // e.g. "Água Quente Ar Condicionado Área Serviço Armário Embutido ..."
  // Split using capital-letter word starts as boundaries.
  const tokens = s
    .split(/(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/u)
    .map((t) => t.trim())
    .filter(Boolean);
  // Merge tokens that are clearly single words (1 char with accent etc.)
  const merged: string[] = [];
  for (const t of tokens) {
    const last = merged[merged.length - 1];
    // Heuristic: feature names are 2-4 words. If a token starts with a lowercase-friendly word like "De", "Com", "Da", merge into previous.
    if (last && /^(De|Com|Da|Do|Dos|Das|E|Em)$/.test(t.split(" ")[0])) {
      merged[merged.length - 1] = `${last} ${t}`;
    } else {
      merged.push(t);
    }
  }
  return merged.slice(0, 60);
}

const ALLOWED_HOSTS = new Set(["gralhaimoveis.com.br", "www.gralhaimoveis.com.br"]);
const MAX_HTML_BYTES = 4 * 1024 * 1024; // 4 MB
const FETCH_TIMEOUT_MS = 15_000;

type GralhaApiItem = {
  id?: number;
  codigo?: string;
  tipo?: string | null;
  valorVenda?: number | null;
  valorPromocional?: number | null;
  ocultarValor?: boolean | null;
  empreendimento?: string | null;
  condominio?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estadoSigla?: string | null;
  quartos?: number | null;
  suites?: number | null;
  vagas?: number | null;
  banheiros?: number | null;
  areaConstruida?: number | null;
  url?: string | null;
  imagens?: string[];
  caracteristicas?: string[];
};

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stripPriceSuffix(s: string) {
  return s
    .replace(/\s*-\s*Gralha Imóveis\s*$/i, "")
    .replace(/\s+por\s+R\$\s*[\d.,]+\s*$/i, "")
    .trim();
}

async function fetchGralhaApiItem(codeOrId: string): Promise<GralhaApiItem | null> {
  const apiUrl = new URL("https://www.gralhaimoveis.com.br/api/anuncios/search");
  apiUrl.searchParams.set("finalidade", "venda");
  apiUrl.searchParams.set("codigo", codeOrId);
  apiUrl.searchParams.set("page", "1");
  apiUrl.searchParams.set("pagesize", "1");
  apiUrl.searchParams.set("somenteImoveis", "true");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const resp = await fetch(apiUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "application/json",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as { items?: GralhaApiItem[] };
    const item = data.items?.[0] ?? null;
    if (!item) return null;
    const requested = String(codeOrId);
    if (String(item.codigo ?? "") !== requested && String(item.id ?? "") !== requested) return null;
    return item;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function scrapeGralhaProperty(url: string): Promise<ScrapedProperty> {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    throw new Error("URL inválida.");
  }
  // Strict host check (anti-SSRF / domain-suffix bypass)
  if (u.protocol !== "https:" || !ALLOWED_HOSTS.has(u.hostname.toLowerCase())) {
    throw new Error("URL inválida. Use um link https://www.gralhaimoveis.com.br/imovel/...");
  }
  const urlCodeMatch = u.pathname.match(/(\d{4,})/);
  const urlCode = urlCodeMatch ? urlCodeMatch[1] : u.pathname.split("/").filter(Boolean).pop() || "";
  if (!urlCode) throw new Error("Não foi possível identificar o código do imóvel na URL.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let html: string;
  try {
    const resp = await fetch(u.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });
    if (!resp.ok) {
      throw new Error(`Falha ao buscar a página da Gralha (HTTP ${resp.status}).`);
    }
    const ct = resp.headers.get("content-type") ?? "";
    if (!/text\/html|application\/xhtml/i.test(ct)) {
      throw new Error("Resposta inesperada do servidor (não é HTML).");
    }
    // Read with size cap
    const reader = resp.body?.getReader();
    if (!reader) {
      html = await resp.text();
    } else {
      const chunks: Uint8Array[] = [];
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_HTML_BYTES) {
          await reader.cancel();
          throw new Error("Página muito grande para processar.");
        }
        chunks.push(value);
      }
      const merged = new Uint8Array(total);
      let offset = 0;
      for (const c of chunks) {
        merged.set(c, offset);
        offset += c.byteLength;
      }
      html = new TextDecoder("utf-8").decode(merged);
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new Error("Tempo esgotado ao buscar a página da Gralha.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  const title =
    stripPriceSuffix(pickMeta(html, "og:title") ?? "") ||
    stripPriceSuffix(html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? "") ||
    "Imóvel";
  const cover = pickMeta(html, "og:image");

  // All gallery images
  const imgSet = new Set<string>();
  for (const m of html.matchAll(
    /https:\/\/gralha2\.inforcedata\.com\.br\/api\/image\/[A-Za-z0-9_./-]+\.(?:jpg|jpeg|png|webp)/gi,
  )) {
    imgSet.add(m[0]);
  }
  // Put cover first if present
  const photos: string[] = [];
  if (cover && imgSet.has(cover)) {
    photos.push(cover);
    imgSet.delete(cover);
  }
  // Heuristic: skip very low ids (logos/banners) — keep all in their natural order
  photos.push(...Array.from(imgSet));

  const text = stripTags(html);

  // Pull headline numbers from the page text
  const areaMatch = text.match(/(\d{2,4})\s*m²/);
  const bedroomsMatch = text.match(/(\d+)\s*dormit[óo]rios?/i);
  const suitesMatch = text.match(/\((\d+)\s*su[íi]tes?\)/i) || text.match(/(\d+)\s*su[íi]tes?/i);
  const bathroomsMatch = text.match(/(\d+)\s*banheiros?/i);
  const parkingMatch = text.match(/(\d+)\s*vagas?/i);

  const priceMatch =
    text.match(/Valor de venda:\s*R\$\s*([\d.,]+)/i) ||
    text.match(/R\$\s*([\d.,]{4,})/);
  const condoFeeMatch = text.match(/Condom[íi]nio:\s*R\$\s*([\d.,]+)/i);
  const iptuMatch = text.match(/IPTU(?:\s*Mensal)?:\s*R\$\s*([\d.,]+)/i);

  // Location block: "Condomínio: X Bairro: Y - Cidade, UF Endereço: Z"
  const condoNameMatch = text.match(/Condom[íi]nio:\s*([^B]+?)\s+Bairro:/i);
  const bairroMatch = text.match(/Bairro:\s*([^-]+?)\s*-\s*([^,]+),\s*([A-Z]{2})/);
  const enderecoMatch = text.match(/Endere[çc]o:\s*([^F]+?)(?:\s+Fechar|\s+Gostou|$)/i);

  // Type: try to read from breadcrumb-ish text ("imóveis venda apartamento Bairro - 3 domitórios")
  const typeMatch = text.match(/im[óo]veis\s+(?:venda|aluguel|loca[çc][ãa]o)\s+([a-zçãáéíóúâêôõ]+)/i);

  const description = sliceBetween(text, "Sobre este imóvel", [
    "Infraestrutura do Imóvel",
    "Infraestrutura do Condom",
    "Localização do Imóvel",
  ]);
  const features = splitFeatures(
    sliceBetween(text, "Infraestrutura do Imóvel", [
      "Infraestrutura do Condom",
      "Localização do Imóvel",
      "Vídeo",
    ]),
  );
  const condoFeatures = splitFeatures(
    sliceBetween(text, "Infraestrutura do Condom", [
      "Localização do Imóvel",
      "Vídeo",
      "Gostou deste im",
    ]),
  );

  // Internal Gralha reference code (e.g. "Cod: 42345") — preferred over the URL id
  const internalCodeMatch = text.match(/\bCod(?:igo|\.)?\s*[:#]?\s*(\d{3,7})\b/i);
  const code = internalCodeMatch ? internalCodeMatch[1] : urlCode;
  const apiItem = (await fetchGralhaApiItem(code)) ?? (await fetchGralhaApiItem(urlCode));
  const apiPrice = numberOrNull(apiItem?.valorPromocional) ?? numberOrNull(apiItem?.valorVenda);
  const apiCondoName = apiItem?.condominio || apiItem?.empreendimento || null;
  const apiAddress = [apiItem?.logradouro, apiItem?.numero].filter(Boolean).join(", ") || null;
  const apiArea = numberOrNull(apiItem?.areaConstruida);

  return {
    code: apiItem?.codigo || code,
    source_url: url,
    title: title.trim(),
    property_type: apiItem?.tipo?.toLowerCase() ?? (typeMatch ? typeMatch[1].toLowerCase() : null),
    neighborhood: apiItem?.bairro ?? bairroMatch?.[1].trim() ?? null,
    city: apiItem?.cidade ?? bairroMatch?.[2].trim() ?? null,
    state: apiItem?.estadoSigla ?? bairroMatch?.[3].trim() ?? null,
    address: apiAddress ?? (enderecoMatch ? enderecoMatch[1].trim() : null),
    condo_name: apiCondoName ?? (condoNameMatch ? condoNameMatch[1].trim() : null),
    price_brl: apiPrice ?? parseBrlNumber(priceMatch?.[1] ?? null),
    condo_fee_brl: parseBrlNumber(condoFeeMatch?.[1] ?? null),
    iptu_brl: parseBrlNumber(iptuMatch?.[1] ?? null),
    area_m2: apiArea ?? (areaMatch ? Number(areaMatch[1]) : null),
    bedrooms: numberOrNull(apiItem?.quartos) ?? (bedroomsMatch ? Number(bedroomsMatch[1]) : null),
    suites: numberOrNull(apiItem?.suites) ?? (suitesMatch ? Number(suitesMatch[1]) : null),
    bathrooms: numberOrNull(apiItem?.banheiros) ?? (bathroomsMatch ? Number(bathroomsMatch[1]) : null),
    parking_spots: numberOrNull(apiItem?.vagas) ?? (parkingMatch ? Number(parkingMatch[1]) : null),
    description,
    features: apiItem?.caracteristicas?.length ? apiItem.caracteristicas : features,
    condo_features: condoFeatures,
    cover_image: cover || photos[0] || null,
    photos,
  };
}
