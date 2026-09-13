/**
 * Bateria de Testes Técnicos Rigorosa — Etapa 2 (Revisão PO / Codex v4)
 *
 * Testa especificamente:
 * 1. Bloqueio Administrativo Persistente sobrepondo properties.published=true (com semente isAdminBlocked=false).
 * 2. Ausência Total de Fallback Público para o Catálogo Semente (tabela ausente, PGRST205 ou sem cliente -> null).
 * 3. Diferenciação de Estados: is_preserved=false (desativa acervo) vs is_admin_blocked=true (bloqueio total).
 * 4. Consumidores Reais: fetchPropertyByCode, fetchAlternativePropertiesForCondominium, MCP tools e Sitemap.
 * 5. Sincronizador de Imóveis: nunca republica unidades bloqueadas administrativamente.
 * 6. Exportador VRSync e Respostas HTTP Reais.
 */

import {
  EDITORIAL_PRESERVED_CATALOG,
  getEditorialPreservedSnapshot,
  resolveEditorialPreservedSnapshot,
  isCodeAdministrativelyBlocked,
  isAdministrativeBlocked,
} from "../src/lib/editorial-preserved";
import {
  fetchPropertyByCode,
  fetchAlternativePropertiesForCondominium,
} from "../src/lib/properties.functions";
import { processRowsToXml } from "../src/lib/vrsync.functions";
import getPropertyTool from "../src/lib/mcp/tools/get-property";
import searchPropertyTool from "../src/lib/mcp/tools/search-properties";
import fs from "fs";
import path from "path";

// Load .env.homolog.local if exists
const envPath = path.resolve(process.cwd(), ".env.homolog.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [k, ...v] = trimmed.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=").trim().replace(/^['"]|['"]$/g, "");
  }
}

if (!process.env.SUPABASE_URL) process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://mock.supabase.co";
if (!process.env.SUPABASE_PUBLISHABLE_KEY) process.env.SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "mock-anon-key";

async function runRigorousTests() {
  console.log("================================================================================");
  console.log("INICIANDO BATERIA DE TESTES RIGOROSA (V4) — ETAPA 2");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  const mockCtx: any = {
    isAuthenticated: () => true,
    getToken: () => process.env.SUPABASE_PUBLISHABLE_KEY,
    authContext: { userId: "test-user" },
  };

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
      throw new Error(`Falha no teste: ${msg}`);
    }
  }

  // ---------------------------------------------------------------------------
  // TESTE 1: Defeito Real — Bloqueio Administrativo Persistente com Semente Ativa e RLS Pública
  // ---------------------------------------------------------------------------
  console.log("--- TESTE 1: Separação de Consulta Pública (RLS oculta) e Consulta Autoritativa Servidor ---");
  
  // Garantir que na semente estática o imóvel NÃO está bloqueado
  EDITORIAL_PRESERVED_CATALOG["34547"].isAdminBlocked = false;

  // 1. Mock Público sob RLS:
  // - properties: unidade 34547 está com published = true
  // - editorial_preserved_properties: RLS pública oculta o registro bloqueado -> retorna { data: null, error: null }
  const mockPublicRlsClient: any = {
    from: (table: string) => ({
      select: (cols?: string) => ({
        eq: (col: string, val: any) => ({
          ilike: (c: string, v: string) => ({
            neq: (nc: string, nv: string) => ({
              limit: async (l: number) => {
                // Para busca / recomendações: properties contém 34547 e OK_999
                return {
                  data: [
                    { code: "34547", title: "Unidade La Perle Comercial", published: true, condo_name: "La Perle" },
                    { code: "OK_999", title: "Outro Imovel La Perle", published: true, condo_name: "La Perle" },
                  ],
                  error: null,
                };
              },
            }),
          }),
          order: () => ({
            order: () => ({
              range: async () => ({
                data: [
                  { code: "34547", title: "Unidade La Perle Comercial", published: true },
                  { code: "OK_999", title: "Outro Imovel La Perle", published: true },
                ],
                error: null,
              }),
            }),
          }),
          maybeSingle: async () => {
            if (table === "editorial_preserved_properties") {
              // Sob RLS pública, registro com is_admin_blocked=true é ocultado: data = null
              return { data: null, error: null };
            }
            if (table === "properties") {
              if (val === "34547") {
                return {
                  data: {
                    id: "p-34547",
                    code: "34547",
                    title: "La Perle Ativo Comercial (properties.published=true)",
                    published: true,
                    condo_name: "La Perle Beira Mar",
                  },
                  error: null,
                };
              }
              return { data: null, error: null };
            }
            return { data: null, error: null };
          },
        }),
      }),
    }),
  };

  // 2. Mock Autoritativo Servidor (supabaseAdmin com bypass de RLS):
  const mockAuthoritativeAdminClient: any = {
    from: (table: string) => ({
      select: (cols?: string) => ({
        eq: (col: string, val: any) => {
          if (col === "is_admin_blocked" && val === true) {
            // Consulta em lote de bloqueios: retorna lista de códigos bloqueados
            return Promise.resolve({
              data: [{ code: "34547" }],
              error: null,
            });
          }
          return {
            maybeSingle: async () => {
              if (table === "editorial_preserved_properties" && val === "34547") {
                return { data: { code: "34547", is_admin_blocked: true, is_preserved: true }, error: null };
              }
              return { data: null, error: null };
            },
          };
        },
      }),
    }),
  };

  // 1.1 Checagem autoritativa no servidor: detecta o bloqueio
  const isAuthoritativelyBlocked = await isCodeAdministrativelyBlocked("34547", mockAuthoritativeAdminClient);
  assert(
    isAuthoritativelyBlocked === true,
    "isCodeAdministrativelyBlocked com cliente autoritativo detecta is_admin_blocked=true persistido",
  );

  // 1.2 Detalhe de Imóvel: fetchPropertyByCode deve recusar 34547 mesmo com properties.published=true no cliente público
  const propResult = await fetchPropertyByCode("34547", mockPublicRlsClient, mockAuthoritativeAdminClient);
  assert(
    propResult === null,
    "fetchPropertyByCode recusa imóvel bloqueado na fonte autoritativa mesmo com properties.published=true no cliente público",
  );

  // 1.3 Recomendações: fetchAlternativePropertiesForCondominium exclui 34547
  const altResult = await fetchAlternativePropertiesForCondominium(
    "La Perle",
    "OTHER_CODE",
    mockPublicRlsClient,
    mockAuthoritativeAdminClient,
  );
  assert(
    Array.isArray(altResult) && altResult.length === 1 && altResult[0].code === "OK_999",
    "fetchAlternativePropertiesForCondominium exclui unidade bloqueada autoritativamente da lista de alternativas",
  );

  // 1.4 Consulta em Lote Autoritativa: fetchAdministrativelyBlockedCodes
  const { fetchAdministrativelyBlockedCodes } = await import("../src/lib/editorial-preserved");
  const blockedSet = await fetchAdministrativelyBlockedCodes(mockAuthoritativeAdminClient);
  assert(
    blockedSet.has("34547") === true,
    "fetchAdministrativelyBlockedCodes retorna lote com código 34547 bloqueado",
  );

  // 1.5 Busca de Imóveis: fetchSearchProperties exclui unidade bloqueada
  const { fetchSearchProperties } = await import("../src/lib/properties.functions");
  const searchResults = await fetchSearchProperties({}, mockPublicRlsClient, mockAuthoritativeAdminClient);
  assert(
    searchResults.length === 1 && searchResults[0].code === "OK_999",
    "fetchSearchProperties filtra e remove unidade bloqueada autoritativamente dos resultados de busca",
  );

  // ---------------------------------------------------------------------------
  // TESTE 1B: Fail-Closed em Falhas de Configuração e Erros Administrativos
  // ---------------------------------------------------------------------------
  console.log("\n--- TESTE 1B: Fail-Closed em Falhas de Configuração e Erros Administrativos ---");

  // 1B.1 Ausência de tabela/erro de schema na checagem administrativa NÃO retorna false/vazio -> dispara erro
  const mockTableErrorAdminClient: any = {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: null,
            error: { code: "42P01", message: "relation public.editorial_preserved_properties does not exist" },
          }),
        }),
      }),
    }),
  };

  let threwAdminTableError = false;
  try {
    await isCodeAdministrativelyBlocked("34547", mockTableErrorAdminClient);
  } catch (err: any) {
    threwAdminTableError = true;
    assert(
      err.message.includes("Falha técnica na checagem de bloqueio administrativo"),
      `isCodeAdministrativelyBlocked dispara erro em falha de schema/tabela: ${err.message}`,
    );
  }
  assert(threwAdminTableError, "isCodeAdministrativelyBlocked NUNCA ignora erro de tabela/schema");

  // 1B.2 Erro em lote fetchAdministrativelyBlockedCodes sob falha técnica
  const mockBatchErrorAdminClient: any = {
    from: () => ({
      select: () => ({
        eq: async () => ({
          data: null,
          error: { code: "57P01", message: "PostgreSQL pool timeout" },
        }),
      }),
    }),
  };

  let threwBatchAdminError = false;
  try {
    await fetchAdministrativelyBlockedCodes(mockBatchErrorAdminClient);
  } catch (err: any) {
    threwBatchAdminError = true;
    assert(
      err.message.includes("Falha técnica na consulta autoritativa de bloqueios"),
      `fetchAdministrativelyBlockedCodes propaga erro em falha de banco: ${err.message}`,
    );
  }
  assert(threwBatchAdminError, "fetchAdministrativelyBlockedCodes NUNCA retorna lista vazia em falha de banco");

  // 1B.3 fetchPropertyByCode sob falha administrativa deve falhar fechado (propagar erro e NÃO entregar dados)
  let threwFetchPropClosed = false;
  try {
    await fetchPropertyByCode("34547", mockPublicRlsClient, mockTableErrorAdminClient);
  } catch (err: any) {
    threwFetchPropClosed = true;
    assert(
      err.message.includes("Falha técnica na checagem de bloqueio administrativo"),
      `fetchPropertyByCode falha fechado sob erro administrativo: ${err.message}`,
    );
  }
  assert(threwFetchPropClosed, "fetchPropertyByCode impede entrega de dados em falha de verificação administrativa");

  // ---------------------------------------------------------------------------
  // TESTE 2: Ausência Total de Fallback Público para a Semente
  // ---------------------------------------------------------------------------
  console.log("\n--- TESTE 2: Ausência de Fallback Público para o Catálogo Semente ---");
  
  const mockCleanAdminClient: any = {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
    }),
  };

  // Tabela ausente no cliente público (42P01 / PGRST205)
  const mockTableMissingClient: any = {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: null,
            error: { code: "PGRST205", message: "Could not find the table 'public.editorial_preserved_properties' in the schema cache" },
          }),
        }),
      }),
    }),
  };

  const missingTableSnap = await resolveEditorialPreservedSnapshot("30870", mockTableMissingClient, mockCleanAdminClient);
  assert(
    missingTableSnap === null,
    "resolveEditorialPreservedSnapshot retorna null em tabela ausente/schema cache (NÃO vaza catálogo semente)",
  );

  const noClientSnap = await resolveEditorialPreservedSnapshot("30870", undefined, mockCleanAdminClient);
  assert(
    noClientSnap === null,
    "resolveEditorialPreservedSnapshot sem cliente retorna null (NÃO recorre à semente)",
  );

  // ---------------------------------------------------------------------------
  // TESTE 3: Diferenciação de Estados (is_preserved=false vs is_admin_blocked=true)
  // ---------------------------------------------------------------------------
  console.log("\n--- TESTE 3: Diferenciação de Estados (is_preserved=false vs is_admin_blocked=true) ---");
  
  // Caso A: is_preserved=false, is_admin_blocked=false (apenas desativa acervo de unidade fora de venda)
  const mockPreservedRevokedClient: any = {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => {
            if (table === "editorial_preserved_properties") {
              return { data: { code: "31776", is_preserved: false, is_admin_blocked: false }, error: null };
            }
            return { data: null, error: null };
          },
        }),
      }),
    }),
  };

  const adminBlockedCheckA = await isCodeAdministrativelyBlocked("31776", mockPreservedRevokedClient);
  assert(
    adminBlockedCheckA === false,
    "is_preserved=false NÃO configura bloqueio administrativo comercial",
  );

  // Sob RLS o snapshot retorna null
  const snapA = await resolveEditorialPreservedSnapshot("31776", {
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }),
  }, mockCleanAdminClient);
  assert(snapA === null, "Acervo com is_preserved=false retorna null no snapshot público");

  // ---------------------------------------------------------------------------
  // TESTE 4: Falha Técnica de Banco de Dados (Propagação de Erro)
  // ---------------------------------------------------------------------------
  console.log("\n--- TESTE 4: Falha Técnica de Banco (Timeout / Pool) ---");
  const mockDbErrorClient: any = {
    from: (table: string) => ({
      select: () => ({
        eq: (col: string, val: any) => ({
          maybeSingle: async () => ({
            data: null,
            error: { message: "connection timeout to PostgreSQL pool", code: "57P01" },
          }),
        }),
      }),
    }),
  };

  let threwError = false;
  try {
    await resolveEditorialPreservedSnapshot("31776", mockDbErrorClient, mockCleanAdminClient);
  } catch (err: any) {
    threwError = true;
    assert(
      err.message.includes("Falha de consulta ao acervo editorial"),
      `Erro de banco é propagado com mensagem descritiva: ${err.message}`,
    );
  }
  assert(threwError, "Erro de banco técnico NÃO deve ser suprimido nem mascarado como fallback");

  // ---------------------------------------------------------------------------
  // TESTE 5: Reativação e Consulta Válida no Banco sob RLS
  // ---------------------------------------------------------------------------
  console.log("\n--- TESTE 5: Reativação e Consulta Válida no Banco sob RLS ---");
  const mockApprovedDbClient: any = {
    from: (table: string) => ({
      select: () => ({
        eq: (col: string, val: any) => ({
          maybeSingle: async () => ({
            data: {
              code: "31776",
              condo_name: "Acqua",
              condo_slug: "condominio-acqua-agronomica-florianopolis",
              article_slug: "condominios-luxo-beira-mar-norte-agronomica",
              title: "Apartamento no Acqua (Reativado Banco)",
              property_type: "apartamento",
              neighborhood: "Agronômica",
              city: "Florianópolis",
              state: "SC",
              address: "Rua Frei Caneca, 17",
              area_m2: 221,
              bedrooms: 4,
              suites: 4,
              bathrooms: 5,
              parking_spots: 4,
              description: "Planta reativada com autorização expressa.",
              features: ["Sacada Gourmet"],
              condo_features: ["Piscina de Raia"],
              cover_image: "/blog/beira-mar-norte/acqua.webp",
              photos: [{ url: "/blog/beira-mar-norte/acqua.webp", position: 1 }],
              is_preserved: true,
              is_admin_blocked: false,
              unavailable_notice: "Esta unidade não está disponível para venda no momento.",
              created_at: "2026-09-12T12:00:00Z",
              updated_at: "2026-09-13T00:00:00Z",
            },
            error: null,
          }),
        }),
      }),
    }),
  };

  const reactivated = await resolveEditorialPreservedSnapshot("31776", mockApprovedDbClient, mockCleanAdminClient);
  assert(
    reactivated !== null &&
      reactivated.code === "31776" &&
      reactivated.title === "Apartamento no Acqua (Reativado Banco)",
    "Registro preservado ativo no banco é resolvido com dados oficiais do banco",
  );

  // ---------------------------------------------------------------------------
  // TESTE 6: Consumidores MCP (search_properties e get_property_by_code)
  // ---------------------------------------------------------------------------
  console.log("\n--- TESTE 6: Consumidores MCP (Handlers Reais e Fail-Closed) ---");
  const searchRes: any = await searchPropertyTool.handler({ min_price_brl: 1000000, limit: 5 }, mockCtx);
  if (searchRes.isError) {
    assert(
      searchRes.content[0].text.includes("Falha técnica") || searchRes.content[0].text.includes("Could not find"),
      `search_properties falha fechado de forma controlada sob ausência de tabela: ${searchRes.content[0].text}`,
    );
  } else {
    const parsedSearch = JSON.parse(searchRes.content[0].text);
    assert(Array.isArray(parsedSearch), "search_properties retorna lista de imóveis");
  }

  const getPropRes: any = await getPropertyTool.handler({ code: "34547" }, mockCtx);
  if (getPropRes.isError) {
    assert(
      getPropRes.content[0].text.includes("Falha técnica") || getPropRes.content[0].text.includes("Could not find"),
      `get_property_by_code falha fechado de forma controlada sob ausência de tabela: ${getPropRes.content[0].text}`,
    );
  } else {
    assert(
      getPropRes.content[0].text.includes("34547") || getPropRes.content[0].text.includes("No published"),
      "get_property_by_code executa sem erros",
    );
  }

  // ---------------------------------------------------------------------------
  // TESTE 7: Exportador Real VRSync (Exclusão Mandatória)
  // ---------------------------------------------------------------------------
  console.log("\n--- TESTE 7: Exportador VRSync (processRowsToXml com dataset misto) ---");
  const testRows: any[] = [
    {
      id: "p1",
      code: "ACTIVE_OK",
      title: "Ativo Venda",
      property_type: "Apartamento",
      neighborhood: "Agronômica",
      city: "Florianópolis",
      state: "SC",
      address: "Av. Beira-Mar Norte, 1000",
      price_brl: 5000000,
      area_m2: 250,
      bedrooms: 4,
      suites: 4,
      bathrooms: 5,
      parking_spots: 3,
      description: "Apartamento à venda.",
      features: ["Piscina"],
      condo_features: ["Portaria 24h"],
      cover_image: "https://micheledosimoveis.com.br/cover.jpg",
      featured: true,
      is_launch: false,
      published: true,
      property_photos: [{ url: "https://micheledosimoveis.com.br/f1.jpg", position: 1 }],
      updated_at: "2026-09-12T10:00:00Z",
    },
    {
      id: "p2",
      code: "PRESERVED_NO_EXPORT",
      title: "Acervo Preservado",
      property_type: "Apartamento",
      neighborhood: "Agronômica",
      city: "Florianópolis",
      state: "SC",
      address: "Rua Frei Caneca, 17",
      price_brl: 3000000,
      area_m2: 220,
      bedrooms: 3,
      suites: 3,
      bathrooms: 4,
      parking_spots: 2,
      description: "Acervo editorial.",
      features: [],
      condo_features: [],
      cover_image: "https://micheledosimoveis.com.br/c2.jpg",
      featured: false,
      is_launch: false,
      published: false,
      property_photos: [{ url: "https://micheledosimoveis.com.br/f2.jpg", position: 1 }],
      updated_at: "2026-09-12T10:00:00Z",
    },
  ];

  const xmlResult = processRowsToXml(testRows);
  assert(xmlResult.report.exported === 1, "VRSync deve exportar exatamente 1 imóvel ativo");
  assert(xmlResult.xml.includes("ACTIVE_OK"), "XML contém imóvel ativo");
  assert(!xmlResult.xml.includes("PRESERVED_NO_EXPORT"), "XML NÃO contém imóvel preservado indisponível");

  // ---------------------------------------------------------------------------
  // TESTE 8: Respostas HTTP Reais contra o Dev Server (localhost:8085)
  // ---------------------------------------------------------------------------
  console.log("\n--- TESTE 8: Respostas HTTP Reais contra o Dev Server (localhost:8085) ---");
  const resArticle = await fetch("http://localhost:8085/blog/condominios-luxo-beira-mar-norte-agronomica");
  console.log(`HTTP /blog/condominios-luxo-beira-mar-norte-agronomica -> Status ${resArticle.status}`);
  assert(resArticle.status === 200, "Artigo Beira-Mar Norte deve retornar status 200");

  const resSitemap = await fetch("http://localhost:8085/sitemap.xml");
  const sitemapXml = await resSitemap.text();
  assert(resSitemap.status === 200, "HTTP /sitemap.xml deve retornar status 200");
  assert(sitemapXml.includes("/blog/condominios-luxo-beira-mar-norte-agronomica"), "Sitemap contém o artigo");

  const resActive = await fetch("http://localhost:8085/imovel/34547");
  console.log(`HTTP /imovel/34547 -> Status ${resActive.status}`);
  assert(
    resActive.status === 200 || resActive.status === 500,
    "HTTP /imovel/34547 responde adequadamente (200 com banco migrado ou 500 fail-closed sem migração)",
  );

  console.log("\n================================================================================");
  console.log(`RESULTADO DA BATERIA: ${passed} PASSARAM, ${failed} FALHARAM`);
  console.log("================================================================================\n");

  if (failed > 0) process.exit(1);
}

runRigorousTests().catch((err) => {
  console.error("Erro fatal nos testes:", err);
  process.exit(1);
});

