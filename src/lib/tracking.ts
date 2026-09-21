/**
 * Camada de telemetria e medição comercial de dados (dataLayer).
 *
 * Diretrizes de Privacidade e Arquitetura:
 * 1. Respeito estrito à LGPD: eventos analíticos só disparam com consentimento explícito ("all").
 * 2. Sanitização rigorosa de URLs: remoção de fragmentos (#) e filtragem de parâmetros via allowlist estrita (zero PII).
 * 3. Fallback seguro: se o parsing da URL falhar, nunca expõe a URL bruta.
 * 4. Separação rigorosa entre intenção de contato (whatsapp_click) e lead confirmado (generate_lead).
 * 5. Deduplicação de page_view para SPAs (uma única emissão por mudança efetiva de rota).
 */

import { getCookieConsent } from "@/components/CookieConsent";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Lista de parâmetros de URL autorizados para rastreamento analítico.
 * Qualquer parâmetro não listado (e.g. email, nome, telefone, cpf) é descartado para proteção de PII.
 */
const ALLOWED_QUERY_PARAMS = new Set([
  "tipo",
  "bairro",
  "dorms",
  "faixa",
  "ordenar",
  "pagina",
  "q",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
]);

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const CPF_REGEX = /(?:\d{3}\.?\d{3}\.?\d{3}-?\d{2})|(?:\b\d{11}\b)/;

/**
 * Verifica se um valor de parâmetro contém padrões de dados pessoais (PII).
 */
export function containsPii(value: string): boolean {
  if (!value) return false;
  if (EMAIL_REGEX.test(value)) return true;
  if (CPF_REGEX.test(value)) return true;
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 10 && digits.length <= 13) return true;
  return false;
}

/**
 * Sanitiza uma URL removendo fragmentos (#), parâmetros fora da allowlist e valores com PII.
 */
export function sanitizeTrackingUrl(locationHref: string): { pageLocation: string; pagePath: string } {
  try {
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://micheledosimoveis.com.br";
    const parsed = new URL(locationHref, origin);

    // Remove fragmento/hash explicitamente
    parsed.hash = "";

    // Filtra parâmetros de consulta usando a allowlist explícita e valida ausência de PII no valor
    const cleanParams = new URLSearchParams();
    parsed.searchParams.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (ALLOWED_QUERY_PARAMS.has(lowerKey) && !containsPii(value)) {
        cleanParams.set(lowerKey, value);
      }
    });

    const queryString = cleanParams.toString();
    const cleanSearch = queryString ? `?${queryString}` : "";
    const pagePath = `${parsed.pathname}${cleanSearch}`;
    const pageLocation = `${parsed.origin}${pagePath}`;

    return { pageLocation, pagePath };
  } catch {
    // Fallback estrito: nunca retorna a string locationHref bruta
    const safePath =
      typeof window !== "undefined" && window.location.pathname
        ? window.location.pathname
        : "/";
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://micheledosimoveis.com.br";

    return {
      pageLocation: `${origin}${safePath}`,
      pagePath: safePath,
    };
  }
}

function pushDataLayer(data: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
}

/**
 * Registra a mudança de estado de consentimento do usuário.
 */
export function trackConsentUpdate(consent: "all" | "essential"): void {
  pushDataLayer({
    event: "consent_update",
    consent_status: consent,
    timestamp: new Date().toISOString(),
  });
}

let lastTrackedLocation: string | null = null;
let lastTrackedNavKey: string | number | null = null;

/**
 * Reseta o estado interno de deduplicação (usado em testes).
 */
export function resetTrackingState(): void {
  lastTrackedLocation = null;
  lastTrackedNavKey = null;
}

/**
 * Emite page_view sanitizado exatamente uma vez por ocorrência de navegação no cliente.
 * Ignora qualquer disparo subsequente dentro da mesma ocorrência (mesma navigationKey).
 */
export function trackPageView(
  locationHref: string,
  pageTitle: string,
  navigationKey?: string | number,
): boolean {
  if (getCookieConsent() !== "all") return false;

  const { pageLocation, pagePath } = sanitizeTrackingUrl(locationHref);

  // Garante exatamente uma única emissão por ocorrência de navegação:
  // Se a chave de navegação for informada, qualquer chamada subsequente com a mesma chave é ignorada.
  if (navigationKey != null) {
    if (lastTrackedNavKey === navigationKey) {
      return false;
    }
  } else {
    if (lastTrackedLocation === pageLocation) {
      return false;
    }
  }

  lastTrackedLocation = pageLocation;
  lastTrackedNavKey = navigationKey ?? null;

  pushDataLayer({
    event: "page_view",
    page_location: pageLocation,
    page_path: pagePath,
    page_title: pageTitle,
  });

  return true;
}

export interface SearchTrackParams {
  tipo?: string | null;
  bairro?: string | null;
  dorms?: number | null;
  faixa?: number | null;
  resultsCount: number;
}

/**
 * Emite evento de busca com filtros e total de resultados encontrados.
 * Retorna boolean indicando se o evento foi efetivamente enviado.
 */
export function trackSearch(params: SearchTrackParams): boolean {
  if (getCookieConsent() !== "all") return false;

  pushDataLayer({
    event: "search",
    filter_type: params.tipo ?? "all",
    filter_neighborhood: params.bairro ?? "all",
    filter_bedrooms: params.dorms ?? null,
    filter_price_tier: params.faixa != null ? String(params.faixa) : "all",
    results_count: params.resultsCount,
  });

  return true;
}

export interface ViewItemTrackParams {
  code: string;
  title: string;
  priceBrl?: number | null;
  neighborhood?: string | null;
  propertyType?: string | null;
}

/**
 * Emite evento de visualização de imóvel detalhado.
 */
export function trackViewItem(params: ViewItemTrackParams): void {
  if (getCookieConsent() !== "all") return;
  pushDataLayer({
    event: "view_item",
    property_code: params.code,
    property_title: params.title,
    price_brl: params.priceBrl ?? null,
    neighborhood: params.neighborhood ?? null,
    property_type: params.propertyType ?? null,
  });
}

export interface WhatsAppClickTrackParams {
  ctaLocation:
    | "floating_button"
    | "site_header"
    | "hero_home"
    | "contact_section"
    | "property_detail_primary"
    | "property_detail_secondary"
    | "property_detail_mobile_bar"
    | "condominium_buyer"
    | "condominium_owner"
    | "condominium_alert"
    | "neighborhood_hero"
    | "anuncie_primary"
    | "anuncie_offmarket"
    | "blog_article";
  propertyCode?: string | null;
  condoSlug?: string | null;
  neighborhood?: string | null;
}

/**
 * Emite evento de intenção de contato via WhatsApp com posição e contexto.
 * ATENÇÃO: Representa clique em CTA, não lead confirmado.
 */
export function trackWhatsAppClick(params: WhatsAppClickTrackParams): void {
  if (getCookieConsent() !== "all") return;
  pushDataLayer({
    event: "whatsapp_click",
    cta_location: params.ctaLocation,
    property_code: params.propertyCode ?? null,
    condo_slug: params.condoSlug ?? null,
    neighborhood: params.neighborhood ?? null,
  });
}

export interface GenerateLeadTrackParams {
  formName: "anuncie" | "contato_geral";
}

/**
 * Emite evento de lead confirmado somente após resposta de sucesso do servidor.
 */
export function trackGenerateLead(params: GenerateLeadTrackParams): void {
  if (getCookieConsent() !== "all") return;
  pushDataLayer({
    event: "generate_lead",
    form_name: params.formName,
    success: true,
  });
}
