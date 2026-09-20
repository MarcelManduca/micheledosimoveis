import assert from "node:assert/strict";
import path from "node:path";
import module, { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const projectRoot = process.cwd();

const DEFAULT_TEST_ANON_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlLWxvY2FsLWlzb2xhdGVkIiwiZXhwIjoyMTA1Mjg5NDA3fQ.QR6MVzy_LiqqVQ492GPUVLUa2HXQRfKlxZbtReGpdxw";
const DEFAULT_TEST_SERVICE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UtbG9jYWwtaXNvbGF0ZWQiLCJleHAiOjIxMDUyODk0MDd9.0r6l4Zt5JVuA3K5_E2wV3jukR_8BwvBMPE9_g9M9Pgw";

process.env.SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:3001";
process.env.SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || DEFAULT_TEST_SERVICE_JWT;
process.env.SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || DEFAULT_TEST_ANON_JWT;

// -----------------------------------------------------------------------------
// 1. FIXTURES LOCAIS DE BANCO DE DADOS
// -----------------------------------------------------------------------------
const FIXTURE_DB = {
  properties: [
    {
      id: "prop-34547",
      code: "34547",
      title: "Apartamento no La Perle Beira Mar",
      property_type: "apartamento",
      neighborhood: "Agronômica",
      city: "Florianópolis",
      state: "SC",
      address: "Av. Beira Mar Norte, 3600",
      price_brl: 10000000,
      area_m2: 316,
      bedrooms: 3,
      suites: 3,
      bathrooms: 6,
      parking_spots: 4,
      published: true,
      featured: true,
    },
    {
      id: "prop-unpub-101",
      code: "UNPUB-101",
      title: "Imóvel Rascunho Não Publicado",
      property_type: "apartamento",
      neighborhood: "Agronômica",
      city: "Florianópolis",
      state: "SC",
      address: "Rua Exemplo, 100",
      price_brl: 5000000,
      area_m2: 120,
      bedrooms: 2,
      suites: 1,
      bathrooms: 2,
      parking_spots: 1,
      published: false,
      featured: false,
    },
    {
      id: "prop-blocked-999",
      code: "BLOCKED-ADMIN-999",
      title: "Imóvel com Bloqueio Administrativo",
      property_type: "apartamento",
      neighborhood: "Agronômica",
      city: "Florianópolis",
      state: "SC",
      address: "Rua Bloqueada, 999",
      price_brl: 8000000,
      area_m2: 200,
      bedrooms: 3,
      suites: 2,
      bathrooms: 3,
      parking_spots: 2,
      published: true,
      featured: false,
    },
  ],

  editorial_preserved: [
    {
      id: "ed-31776",
      code: "31776",
      condo_name: "Acqua",
      condo_slug: "condominio-acqua-agronomica-florianopolis",
      article_slug: "condominios-luxo-beira-mar-norte-agronomica",
      title: "Apartamento em Agronômica com 4 dormitórios, 221m² — Acqua",
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
      description: "Apartamento no condomínio Acqua (CFL), na região da Praça Celso Ramos.",
      features: ["Elevador", "Sacada Gourmet", "Piscina no Condomínio"],
      condo_features: ["Piscina de Raia", "Academia Completa", "Spa"],
      cover_image: "/blog/beira-mar-norte/acqua.webp",
      photos: [{ url: "/blog/beira-mar-norte/acqua.webp", position: 1 }],
      is_preserved: true,
      is_admin_blocked: false,
      unavailable_notice: "Esta unidade não está disponível para venda no momento.",
    },
    {
      id: "ed-blocked-999",
      code: "BLOCKED-ADMIN-999",
      condo_name: "Acqua",
      condo_slug: "condominio-acqua-agronomica-florianopolis",
      article_slug: "condominios-luxo-beira-mar-norte-agronomica",
      title: "Cobertura Acqua Bloqueada",
      property_type: "apartamento",
      neighborhood: "Agronômica",
      city: "Florianópolis",
      state: "SC",
      address: "Rua Frei Caneca, 17",
      area_m2: 450,
      bedrooms: 5,
      suites: 5,
      bathrooms: 7,
      parking_spots: 6,
      description: "Cobertura com bloqueio administrativo.",
      features: ["Piscina Privativa"],
      condo_features: ["Piscina de Raia"],
      cover_image: "/blog/beira-mar-norte/acqua.webp",
      photos: [],
      is_preserved: true,
      is_admin_blocked: true,
      unavailable_notice: "Esta unidade não está disponível para venda no momento.",
    },
  ],
};

function createFixtureSupabaseClient() {
  return {
    from: (table: string) => {
      const filters: Array<(row: any) => boolean> = [];
      let isSingle = false;
      let isMaybeSingle = false;
      let selectFields: string[] | null = null;

      const builder: any = {
        select: (fields?: string) => {
          if (fields && fields !== "*") {
            selectFields = fields.split(",").map((s) => s.trim());
          }
          return builder;
        },
        eq: (col: string, val: any) => {
          filters.push((r: any) => r[col] === val);
          return builder;
        },
        ilike: (col: string, pattern: string) => {
          const search = pattern.replace(/%/g, "").toLowerCase();
          filters.push((r: any) => String(r[col] || "").toLowerCase().includes(search));
          return builder;
        },
        order: (_col: string, _opts?: any) => builder,
        limit: (_n: number) => builder,
        single: () => {
          isSingle = true;
          return builder.then ? builder : Promise.resolve(execute());
        },
        maybeSingle: () => {
          isMaybeSingle = true;
          return builder.then ? builder : Promise.resolve(execute());
        },
        then: (onfulfilled: any, onrejected: any) => {
          return Promise.resolve(execute()).then(onfulfilled, onrejected);
        },
      };

      function execute() {
        let dataset: any[] = [];
        if (table === "properties") dataset = [...FIXTURE_DB.properties];
        else if (table === "editorial_preserved_properties") dataset = [...FIXTURE_DB.editorial_preserved];
        else if (table === "condominiums") dataset = [];

        let filtered = dataset.filter((row) => filters.every((f) => f(row)));

        if (selectFields) {
          filtered = filtered.map((row) => {
            const projected: any = {};
            for (const f of selectFields!) {
              projected[f] = row[f];
            }
            return projected;
          });
        }

        if (isSingle) {
          if (filtered.length === 0) {
            return { data: null, error: { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned" } };
          }
          return { data: filtered[0], error: null };
        }

        if (isMaybeSingle) {
          return { data: filtered.length > 0 ? filtered[0] : null, error: null };
        }

        return { data: filtered, error: null };
      }

      return builder;
    },
  };
}

const fixtureClient = createFixtureSupabaseClient();

const originalResolve = (module as any)._resolveFilename;
(module as any)._resolveFilename = function (request: string, parent: any, isMain: boolean, options: any) {
  if (request.startsWith("@/")) {
    const newPath = path.resolve(projectRoot, "src", request.slice(2));
    return originalResolve.call(this, newPath, parent, isMain, options);
  }
  return originalResolve.call(this, request, parent, isMain, options);
};

require.cache[require.resolve(path.join(projectRoot, "src/integrations/supabase/client.server.ts"))] = {
  id: path.join(projectRoot, "src/integrations/supabase/client.server.ts"),
  filename: path.join(projectRoot, "src/integrations/supabase/client.server.ts"),
  loaded: true,
  exports: { supabaseAdmin: fixtureClient },
  children: [],
  paths: [],
  path: path.join(projectRoot, "src/integrations/supabase"),
} as any;

require.cache[require.resolve(path.join(projectRoot, "src/lib/mcp/supabase.ts"))] = {
  id: path.join(projectRoot, "src/lib/mcp/supabase.ts"),
  filename: path.join(projectRoot, "src/lib/mcp/supabase.ts"),
  loaded: true,
  exports: { supabaseForUser: (_ctx: any) => fixtureClient },
  children: [],
  paths: [],
  path: path.join(projectRoot, "src/lib/mcp"),
} as any;

const testCtx: any = {
  token: null,
  getToken: () => null,
  isAuthenticated: () => false,
};

async function runAllAutomatedTests() {
  console.log("================================================================================");
  console.log(" EXECUÇÃO DOS TESTES UNITÁRIOS COM FIXTURES LOCAIS E ASSERÇÕES AUTOMÁTICAS");
  console.log("================================================================================\n");

  const getPropTool = (await import(path.join(projectRoot, "src/lib/mcp/tools/get-property.ts"))).default;
  const searchPropsTool = (await import(path.join(projectRoot, "src/lib/mcp/tools/search-properties.ts"))).default;

  // TESTE 1: search_properties com filtros, não publicado e bloqueio administrativo
  console.log("▶ [Teste 1/4] search_properties: Exclusão de Não Publicados e Bloqueados");
  const resSearch = await searchPropsTool.handler({ neighborhood: "Agronômica", limit: 10 }, testCtx);

  assert.strictEqual(resSearch.isError, undefined, "Busca não deve retornar isError");
  const searchResults = (resSearch.structuredContent as any)?.properties || [];

  assert.ok(searchResults.length > 0, "O resultado da busca NÃO deve estar vazio");
  assert.strictEqual(searchResults.length, 1, "Apenas 1 imóvel deve ser retornado");
  assert.strictEqual(searchResults[0].code, "34547", "O único imóvel retornado deve ser o permitido ('34547')");

  const codes = searchResults.map((r: any) => r.code);
  assert.ok(!codes.includes("UNPUB-101"), "Imóvel não publicado (UNPUB-101) NÃO deve aparecer na busca");
  assert.ok(!codes.includes("BLOCKED-ADMIN-999"), "Imóvel bloqueado (BLOCKED-ADMIN-999) NÃO deve aparecer na busca");
  console.log("  ✔ Apenas o imóvel publicado permitido ('34547') foi retornado. Filtros e bloqueios validados com sucesso.\n");

  // TESTE 2: get_property_by_code: Imóvel Ativo (34547)
  console.log("▶ [Teste 2/4] get_property_by_code: Imóvel Ativo ('34547')");
  const resAtivo = await getPropTool.handler({ code: "34547" }, testCtx);

  assert.strictEqual(resAtivo.isError, undefined, "Handler não deve retornar isError");
  const propAtivo = (resAtivo.structuredContent as any)?.property;
  assert.strictEqual(propAtivo.code, "34547");
  assert.strictEqual(propAtivo.published, true);
  assert.strictEqual(propAtivo.price_brl, 10000000);
  console.log("  ✔ Imóvel ativo carregado com preço comercial e published=true.\n");

  // TESTE 3: get_property_by_code: Imóvel Preservado / Acervo (31776)
  console.log("▶ [Teste 3/4] get_property_by_code: Imóvel Preservado/Acervo ('31776')");
  const resPreservado = await getPropTool.handler({ code: "31776" }, testCtx);

  assert.strictEqual(resPreservado.isError, undefined);
  const propPres = (resPreservado.structuredContent as any)?.property;
  assert.strictEqual(propPres.code, "31776");
  assert.strictEqual(propPres.published, false, "Imóvel preservado deve ter published=false");
  assert.strictEqual(propPres.is_archived, true, "Imóvel preservado deve ter is_archived=true");
  assert.strictEqual(propPres.available_for_sale, false, "Imóvel preservado deve ter available_for_sale=false");
  assert.strictEqual(propPres.price_brl, null, "Preço de imóvel preservado deve ser estritamente null");
  assert.strictEqual(propPres.unavailable_notice, "Esta unidade não está disponível para venda no momento.");
  assert.strictEqual(
    propPres.consultation_cta,
    "Consulte com a Michele outras unidades que possam estar disponíveis neste condomínio."
  );
  assert.strictEqual(propPres.article_path, "/blog/condominios-luxo-beira-mar-norte-agronomica");
  console.log("  ✔ Imóvel preservado verificado: aviso presente, CTA presente, preço nulo e status acervo.\n");

  // TESTE 4: get_property_by_code: Bloqueio Administrativo (BLOCKED-ADMIN-999)
  console.log("▶ [Teste 4/4] get_property_by_code: Bloqueio Administrativo ('BLOCKED-ADMIN-999')");
  const resBloqueado = await getPropTool.handler({ code: "BLOCKED-ADMIN-999" }, testCtx);

  assert.strictEqual(resBloqueado.isError, undefined, "Não deve expor erro de infraestrutura");
  assert.strictEqual(resBloqueado.structuredContent, undefined, "Nenhum dado estruturado deve ser retornado");
  assert.strictEqual(
    resBloqueado.content?.[0]?.text,
    "No published or preserved property with code BLOCKED-ADMIN-999",
    "Deve responder com mensagem pública padrão de não encontrado"
  );
  console.log("  ✔ Bloqueio administrativo validado: resposta segura mascarada sem vazamento de dados.\n");
}

runAllAutomatedTests().catch((err) => {
  console.error("❌ FALHA NAS ASSERÇÕES:", err);
  process.exit(1);
});
