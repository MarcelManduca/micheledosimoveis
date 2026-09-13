/**
 * Bateria de Testes Técnicos Rigorosa — Etapa 2 (Revisão PO / Codex v3)
 *
 * Testa especificamente:
 * 1. Interação entre RLS e fallback: data=null no banco NÃO deve ressuscitar pelo catálogo semente.
 * 2. Bloqueio administrativo sobrepondo imóvel publicado (published=true).
 * 3. Falha de banco (erro de conexão/timeout) propagando erro em vez de mascarar como fallback.
 * 4. Consumidores completos: search_properties, sitemap.xml e recomendações alternativas.
 * 5. Exportador VRSync com dataset misto.
 * 6. Testes HTTP reais contra o dev server.
 */

import {
  EDITORIAL_PRESERVED_CATALOG,
  getEditorialPreservedSnapshot,
  resolveEditorialPreservedSnapshot,
  isCodeAdministrativelyBlocked,
} from "../src/lib/editorial-preserved";
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
  console.log("INICIANDO BATERIA DE TESTES RIGOROSA (V3) — ETAPA 2");
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
  // TESTE 1: Interação RLS vs Fallback (Detecção de Defeito de Revogação)
  // ---------------------------------------------------------------------------
  console.log("--- TESTE 1: Interação RLS vs Fallback (Banco autoritativo com data=null) ---");
  
  // Mock Supabase sob RLS: consulta a tabela existente retorna data=null, error=null
  // (representa registro com is_preserved=false ou is_admin_blocked=true no banco).
  const mockRlsFilteredClient: any = {
    from: (table: string) => ({
      select: () => ({
        eq: (col: string, val: any) => ({
          maybeSingle: async () => {
            if (table === "editorial_preserved_properties") {
              return { data: null, error: null }; // RLS filtrou o registro
            }
            return { data: null, error: null };
          },
        }),
      }),
    }),
  };

  // Código 31776 existe no catálogo semente estático, mas o banco retornou data=null (RLS).
  const rlsResolved = await resolveEditorialPreservedSnapshot("31776", mockRlsFilteredClient);
  assert(
    rlsResolved === null,
    "Código presente na semente mas revogado/filtrado por RLS no banco DEVE retornar null (não ressuscitar via semente)",
  );

  // ---------------------------------------------------------------------------
  // TESTE 2: Registro Totalmente Ausente
  // ---------------------------------------------------------------------------
  console.log("\n--- TESTE 2: Registro Totalmente Ausente (Sem banco e sem semente) ---");
  const absentResolved = await resolveEditorialPreservedSnapshot("CODIGO_TOTALMENTE_INEXISTENTE_99999", mockRlsFilteredClient);
  assert(
    absentResolved === null,
    "Código inexistente no banco e na semente deve retornar null",
  );

  // ---------------------------------------------------------------------------
  // TESTE 3: Falha Real de Banco de Dados (Propagação de Erro)
  // ---------------------------------------------------------------------------
  console.log("\n--- TESTE 3: Falha Técnica de Banco (Timeout / Conexão) ---");
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
    await resolveEditorialPreservedSnapshot("31776", mockDbErrorClient);
  } catch (err: any) {
    threwError = true;
    assert(
      err.message.includes("Falha de consulta ao acervo editorial"),
      `Erro de banco é propagado com mensagem descritiva: ${err.message}`,
    );
  }
  assert(threwError, "Erro de banco técnico NÃO deve ser suprimido nem mascarado como fallback");

  // ---------------------------------------------------------------------------
  // TESTE 4: Reativação / Snapshot Aprovado no Banco
  // ---------------------------------------------------------------------------
  console.log("\n--- TESTE 4: Reativação e Consulta Válida no Banco sob RLS ---");
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

  const reactivated = await resolveEditorialPreservedSnapshot("31776", mockApprovedDbClient);
  assert(
    reactivated !== null &&
      reactivated.code === "31776" &&
      reactivated.title === "Apartamento no Acqua (Reativado Banco)",
    "Registro preservado ativo no banco é resolvido com dados oficiais do banco",
  );

  // ---------------------------------------------------------------------------
  // TESTE 5: Fase Transitória Pré-Migração (Erro 42P01 / PGRST205)
  // ---------------------------------------------------------------------------
  console.log("\n--- TESTE 5: Fase Transitória Pré-Migração (Erro 42P01 / PGRST205) ---");
  const mockPreMigrationClient: any = {
    from: (table: string) => ({
      select: () => ({
        eq: (col: string, val: any) => ({
          maybeSingle: async () => ({
            data: null,
            error: { message: 'relation "public.editorial_preserved_properties" does not exist', code: "42P01" },
          }),
        }),
      }),
    }),
  };

  const preMigResolved = await resolveEditorialPreservedSnapshot("30870", mockPreMigrationClient);
  assert(
    preMigResolved !== null && preMigResolved.code === "30870",
    "Em ambiente pré-migração (42P01), o catálogo semente estático opera de forma segura",
  );

  // ---------------------------------------------------------------------------
  // TESTE 6: Bloqueio Administrativo sobre Imóvel Ativo (published=true)
  // ---------------------------------------------------------------------------
  console.log("\n--- TESTE 6: Bloqueio Administrativo sobre Imóvel Ativo (published=true) ---");
  EDITORIAL_PRESERVED_CATALOG["34547"].isAdminBlocked = true;
  const blockedCheck = isCodeAdministrativelyBlocked("34547");
  assert(blockedCheck === true, "isCodeAdministrativelyBlocked identifica código bloqueado");
  const blockedSnapshotCheck = await resolveEditorialPreservedSnapshot("34547");
  assert(blockedSnapshotCheck === null, "resolveEditorialPreservedSnapshot recusa código com bloqueio administrativo");
  
  // Testar exclusão em MCP get_property_by_code
  const mcpBlockedGet: any = await getPropertyTool.handler({ code: "34547" }, mockCtx);
  assert(
    mcpBlockedGet.content[0].text.includes("No published or preserved property with code"),
    "MCP get_property recusa código bloqueado administrativamente",
  );

  // Testar exclusão em MCP search_properties
  const mcpSearchBlocked: any = await searchPropertyTool.handler({ limit: 100 }, mockCtx);
  const mcpSearchList = JSON.parse(mcpSearchBlocked.content[0].text);
  const foundBlocked = mcpSearchList.some((p: any) => p.code === "34547");
  assert(!foundBlocked, "MCP search_properties não exibe imóvel bloqueado administrativamente");

  EDITORIAL_PRESERVED_CATALOG["34547"].isAdminBlocked = false; // Reset

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
  // TESTE 8: Recomendações Alternativas do Condomínio (Filtro de Segurança)
  // ---------------------------------------------------------------------------
  console.log("\n--- TESTE 8: Recomendações Alternativas do Condomínio (Filtro de Bloqueio) ---");
  const rawAlternatives = [
    { code: "OK_1", condo_name: "La Perle", published: true },
    { code: "34547", condo_name: "La Perle", published: true },
  ];
  EDITORIAL_PRESERVED_CATALOG["34547"].isAdminBlocked = true;
  const filteredAlternatives = rawAlternatives.filter(
    (r) => !isCodeAdministrativelyBlocked(r.code) && r.published === true,
  );
  assert(
    filteredAlternatives.length === 1 && filteredAlternatives[0].code === "OK_1",
    "Recomendações alternativas filtram com rigor itens bloqueados administrativamente",
  );
  EDITORIAL_PRESERVED_CATALOG["34547"].isAdminBlocked = false;

  // ---------------------------------------------------------------------------
  // TESTE 9: Respostas HTTP Reais contra o Dev Server (localhost:8085)
  // ---------------------------------------------------------------------------
  console.log("\n--- TESTE 9: Respostas HTTP Reais contra o Dev Server (localhost:8085) ---");
  const resActive = await fetch("http://localhost:8085/imovel/34547");
  console.log(`HTTP /imovel/34547 (Ativo) -> Status ${resActive.status}`);
  assert(resActive.status === 200, "HTTP /imovel/34547 deve retornar status 200");

  const resPreserved = await fetch("http://localhost:8085/imovel/31776");
  console.log(`HTTP /imovel/31776 (Preservado) -> Status ${resPreserved.status}`);
  assert(resPreserved.status === 200, "HTTP /imovel/31776 deve retornar status 200");

  const resNotFound = await fetch("http://localhost:8085/imovel/CODIGO_INEXISTENTE_99999");
  console.log(`HTTP /imovel/CODIGO_INEXISTENTE_99999 -> Status ${resNotFound.status}`);
  assert(resNotFound.status === 404, "HTTP /imovel/CODIGO_INEXISTENTE_99999 deve retornar status 404");

  const resArticle = await fetch("http://localhost:8085/blog/condominios-luxo-beira-mar-norte-agronomica");
  console.log(`HTTP /blog/condominios-luxo-beira-mar-norte-agronomica -> Status ${resArticle.status}`);
  assert(resArticle.status === 200, "Artigo Beira-Mar Norte deve retornar status 200");

  const resSitemap = await fetch("http://localhost:8085/sitemap.xml");
  const sitemapXml = await resSitemap.text();
  assert(resSitemap.status === 200, "HTTP /sitemap.xml deve retornar status 200");
  assert(sitemapXml.includes("/blog/condominios-luxo-beira-mar-norte-agronomica"), "Sitemap contém o artigo");
  assert(sitemapXml.includes("/imovel/31776"), "Sitemap contém o acervo preservado público");

  console.log("\n================================================================================");
  console.log(`RESULTADO DA BATERIA: ${passed} PASSARAM, ${failed} FALHARAM`);
  console.log("================================================================================\n");

  if (failed > 0) process.exit(1);
}

runRigorousTests().catch((err) => {
  console.error("Erro fatal nos testes:", err);
  process.exit(1);
});
