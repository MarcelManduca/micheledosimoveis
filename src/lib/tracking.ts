/**
 * Camada de telemetria e medição comercial de dados.
 *
 * Diretrizes:
 * 1. Respeito estrito à LGPD: eventos analíticos só disparam com consentimento ("all").
 * 2. Ausência total de dados pessoais (PII) em parâmetros e payloads.
 * 3. Separação rigorosa entre intenção de contato (whatsapp_click) e lead confirmado (generate_lead).
 * 4. Deduplicação de visualização de página (page_view) para SPAs.
 */

import { getCookieConsent } from "@/components/CookieConsent";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
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

/**
 * Emite page_view exatamente uma vez por carregamento ou transição de rota no cliente.
 */
export function trackPageView(locationHref: string, pageTitle: string): void {
  if (getCookieConsent() !== "all") return;
  try {
    const url = new URL(locationHref, window.location.origin);
    pushDataLayer({
      event: "page_view",
      page_location: url.href,
      page_path: url.pathname + url.search,
      page_title: pageTitle,
    });
  } catch {
    pushDataLayer({
      event: "page_view",
      page_location: locationHref,
      page_path: window.location.pathname,
      page_title: pageTitle,
    });
  }
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
 */
export function trackSearch(params: SearchTrackParams): void {
  if (getCookieConsent() !== "all") return;
  pushDataLayer({
    event: "search",
    filter_type: params.tipo ?? "all",
    filter_neighborhood: params.bairro ?? "all",
    filter_bedrooms: params.dorms ?? null,
    filter_price_tier: params.faixa != null ? String(params.faixa) : "all",
    results_count: params.resultsCount,
  });
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
    | "property_detail_primary"
    | "property_detail_secondary"
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
