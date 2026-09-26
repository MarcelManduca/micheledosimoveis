/**
 * Test Suite Oficial para Camada de Telemetria e Medição Comercial.
 * Importa diretamente as funções reais do módulo src/lib/tracking.ts.
 */

// 1. Configuração do mock mínimo de ambiente de navegador
class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

const mockLocalStorage = new LocalStorageMock();

// Injeta globais antes de importar os módulos do app
(globalThis as any).window = {
  dataLayer: [],
  localStorage: mockLocalStorage,
  location: {
    origin: "https://micheledosimoveis.com.br",
    pathname: "/",
    search: "",
    hash: "",
    href: "https://micheledosimoveis.com.br/",
  },
};

// 2. Importação dos módulos REAIS da aplicação (sem cópia de código)
import {
  sanitizeTrackingUrl,
  containsPii,
  resetTrackingState,
  trackConsentUpdate,
  trackPageView,
  trackSearch,
  trackViewItem,
  trackWhatsAppClick,
} from "../src/lib/tracking";

function resetEnvironment(consentState: "all" | "essential" | null = null, initialPath = "/") {
  mockLocalStorage.clear();
  resetTrackingState();
  if (consentState) {
    mockLocalStorage.setItem("mdi.cookieConsent.v1", consentState);
  }
  (window as any).dataLayer = [];
  window.location.pathname = initialPath;
  window.location.search = "";
  window.location.hash = "";
  window.location.href = `https://micheledosimoveis.com.br${initialPath}`;
}

async function runSuite() {
  console.log("=== INICIANDO SUÍTE COM MÓDULO REAL (src/lib/tracking.ts) ===");
  let passed = 0;
  let total = 0;

  function assert(name: string, condition: boolean, details = "") {
    total++;
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${details}`);
    }
  }

  // Cenário 1: Consentimento ausente ou recusado
  {
    resetEnvironment(null);
    trackPageView("https://micheledosimoveis.com.br/", "Home");
    trackSearch({ tipo: "apartamento", resultsCount: 5 });
    trackViewItem({ code: "31776", title: "Apto Beira Mar" });
    trackWhatsAppClick({ ctaLocation: "floating_button" });

    assert("1.1 Sem consentimento: dataLayer permanece vazio", window.dataLayer!.length === 0);

    resetEnvironment("essential");
    trackConsentUpdate("essential");
    trackPageView("https://micheledosimoveis.com.br/buscar", "Buscar");
    trackWhatsAppClick({ ctaLocation: "site_header" });

    assert(
      "1.2 Consentimento recusado: apenas consent_update registrado",
      window.dataLayer!.length === 1 &&
        window.dataLayer![0].event === "consent_update" &&
        window.dataLayer![0].consent_status === "essential",
    );
  }

  // Cenário 2: Aceite do Consentimento
  {
    resetEnvironment(null);
    mockLocalStorage.setItem("mdi.cookieConsent.v1", "all");
    trackConsentUpdate("all");
    trackPageView("https://micheledosimoveis.com.br/", "Michele dos Imóveis");

    assert(
      "2.1 Aceite: emite consent_update e exatamente 1 page_view",
      window.dataLayer!.length === 2 &&
        window.dataLayer![0].event === "consent_update" &&
        window.dataLayer![1].event === "page_view" &&
        window.dataLayer![1].page_location === "https://micheledosimoveis.com.br/",
    );
  }

  // Cenário 3: Consentimento salvo no localStorage
  {
    resetEnvironment("all", "/condominios");
    trackPageView("https://micheledosimoveis.com.br/condominios", "Condomínios");

    assert(
      "3.1 Consentimento salvo: emite 1 page_view inicial",
      window.dataLayer!.length === 1 &&
        window.dataLayer![0].event === "page_view" &&
        window.dataLayer![0].page_path === "/condominios",
    );
  }

  // Cenário 4: Navegação SPA, Voltar/Avançar e Controle por Chave de Navegação
  {
    resetEnvironment("all");
    // Carregamento inicial (navKey 1)
    trackPageView("https://micheledosimoveis.com.br/", "Home", "nav-1");
    // Re-renderização da mesma página (mesma navKey 1) -> deve ser deduplicada
    trackPageView("https://micheledosimoveis.com.br/", "Home", "nav-1");

    // Navegação para buscar (navKey 2)
    trackPageView("https://micheledosimoveis.com.br/buscar?tipo=apartamento", "Buscar Imóveis", "nav-2");
    // Re-renderização em buscar (navKey 2)
    trackPageView("https://micheledosimoveis.com.br/buscar?tipo=apartamento", "Buscar Imóveis", "nav-2");

    // Navegação para imóvel (navKey 3)
    trackPageView("https://micheledosimoveis.com.br/imovel/31776", "Imóvel 31776", "nav-3");

    // Voltar para buscar (navKey 4 / histórico restaurado)
    trackPageView("https://micheledosimoveis.com.br/buscar?tipo=apartamento", "Buscar Imóveis", "nav-4");

    // Voltar para Home (navKey 5)
    trackPageView("https://micheledosimoveis.com.br/", "Home", "nav-5");

    assert(
      "4.1 Navegação SPA com controle de navegação: exatamente 1 page_view por navegação legítima",
      window.dataLayer!.length === 5 &&
        window.dataLayer![0].page_path === "/" &&
        window.dataLayer![1].page_path === "/buscar?tipo=apartamento" &&
        window.dataLayer![2].page_path === "/imovel/31776" &&
        window.dataLayer![3].page_path === "/buscar?tipo=apartamento" &&
        window.dataLayer![4].page_path === "/",
    );
  }

  // Cenário 5: Busca - filtros, contagem e ocorrências independentes
  {
    resetEnvironment("all");
    // Primeira busca concluída
    trackSearch({
      tipo: "cobertura",
      bairro: "jurere-internacional",
      dorms: 4,
      faixa: 5000000,
      resultsCount: 3,
    });
    // Segunda busca (ex: usuário retorna à busca após visitar imóvel)
    trackSearch({
      tipo: "cobertura",
      bairro: "jurere-internacional",
      dorms: 4,
      faixa: 5000000,
      resultsCount: 3,
    });

    assert(
      "5.1 Eventos search registram buscas concluídas sem bloqueio residual indevido",
      window.dataLayer!.length === 2 &&
        window.dataLayer![0].event === "search" &&
        window.dataLayer![0].filter_type === "cobertura" &&
        window.dataLayer![1].event === "search" &&
        window.dataLayer![1].results_count === 3,
    );
  }

  // Cenário 6: WhatsApp - CTAs com posição e contexto
  {
    resetEnvironment("all");
    trackWhatsAppClick({
      ctaLocation: "property_detail_primary",
      propertyCode: "31776",
      neighborhood: "Centro",
    });

    trackWhatsAppClick({
      ctaLocation: "condominium_buyer",
      condoSlug: "villa-romana",
      neighborhood: "Agronômica",
    });

    trackWhatsAppClick({
      ctaLocation: "anuncie_primary",
    });

    assert(
      "6.1 whatsapp_click possui cta_location e contextos corretos",
      window.dataLayer!.length === 3 &&
        window.dataLayer![0].cta_location === "property_detail_primary" &&
        window.dataLayer![0].property_code === "31776" &&
        window.dataLayer![1].cta_location === "condominium_buyer" &&
        window.dataLayer![1].condo_slug === "villa-romana" &&
        window.dataLayer![2].cta_location === "anuncie_primary" &&
        window.dataLayer![2].property_code === null,
    );
  }

  // Cenário 7: Sanitização de PII em parâmetros não autorizados e remoção de hash (#)
  {
    resetEnvironment("all");
    const dirtyUrl =
      "https://micheledosimoveis.com.br/buscar?tipo=apartamento&bairro=centro&email=joao.silva@exemplo.com&nome=Joao%20Silva&cpf=12345678900&telefone=48999998888&utm_source=google&utm_campaign=blackfriday#topo-da-pagina";

    trackPageView(dirtyUrl, "Busca Limpa");

    const pv = window.dataLayer![0];
    const expectedLocation =
      "https://micheledosimoveis.com.br/buscar?tipo=apartamento&bairro=centro&utm_source=google&utm_campaign=blackfriday";
    const expectedPath =
      "/buscar?tipo=apartamento&bairro=centro&utm_source=google&utm_campaign=blackfriday";

    assert(
      "7.1 Remoção de fragmento (#) e PII em parâmetros não autorizados",
      pv.page_location === expectedLocation &&
        pv.page_path === expectedPath &&
        !String(pv.page_location).includes("joao.silva") &&
        !String(pv.page_location).includes("12345678900") &&
        !String(pv.page_location).includes("#topo-da-pagina"),
    );
  }

  // Cenário 8: Mitigação de PII dentro de parâmetros autorizados (q, utm_*) e preservação de campanhas seguras
  {
    resetEnvironment("all");
    const piiInParamsUrl =
      "https://micheledosimoveis.com.br/buscar?q=contato_usuario%40exemplo.com&utm_source=48991828828&utm_medium=cpc&utm_campaign=lancamento_beiramar_2026&utm_content=cpf_01234567890";

    trackPageView(piiInParamsUrl, "Busca com PII nos valores");

    const pv = window.dataLayer![0];
    assert(
      "8.1 PII embutida em 'q', 'utm_source' e 'utm_content' é descartada pelo regex de padrão",
      !String(pv.page_location).includes("exemplo.com") &&
        !String(pv.page_location).includes("48991828828") &&
        !String(pv.page_location).includes("01234567890"),
    );

    assert(
      "8.2 Parâmetros de campanha seguros (utm_medium, utm_campaign) são preservados",
      String(pv.page_location).includes("utm_medium=cpc") &&
        String(pv.page_location).includes("utm_campaign=lancamento_beiramar_2026"),
    );
  }

  // Cenário 9: Fallback estrito sem URL bruta
  {
    resetEnvironment("all");
    const brokenUrl = "http://[invalid-url-with-pii:joao@email.com]";
    trackPageView(brokenUrl, "Página Inválida");

    const pv = window.dataLayer![0];
    assert(
      "9.1 Fallback estrito nunca expõe URL maliciosa ou corrompida",
      pv.page_location === "https://micheledosimoveis.com.br/" &&
        pv.page_path === "/" &&
        !String(pv.page_location).includes("invalid"),
    );
  }

  console.log(`\n=== RESULTADO FINAL: ${passed}/${total} TESTES PASSARAM ===`);
  if (passed === total) {
    console.log("SUCESSO: Todos os testes com o módulo REAL src/lib/tracking.ts foram validados.");
    process.exit(0);
  } else {
    console.error("ERRO: Falhas encontradas na suíte.");
    process.exit(1);
  }
}

runSuite();
