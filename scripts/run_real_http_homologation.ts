import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// Configurações do ambiente isolado
const DB_NAME = "michele_homolog";
const POSTGREST_GATEWAY_URL = "http://127.0.0.1:54321";
const APP_SERVER_URL = "http://localhost:8085";
const JWT_SECRET = "super-secret-jwt-token-with-at-least-32-characters-long";

function signJwt(payload: Record<string, unknown>): string {
  const h = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const p = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const s = crypto.createHmac("sha256", JWT_SECRET).update(`${h}.${p}`).digest("base64url");
  return `${h}.${p}.${s}`;
}

const ANON_KEY = signJwt({ role: "anon", iss: "supabase", iat: 1700000000, exp: 2000000000 });
const SERVICE_ROLE_KEY = signJwt({ role: "service_role", iss: "supabase", iat: 1700000000, exp: 2000000000 });

// Configurar variáveis no runtime do script para clientes internos
process.env.SUPABASE_URL = POSTGREST_GATEWAY_URL;
process.env.VITE_SUPABASE_URL = POSTGREST_GATEWAY_URL;
process.env.SUPABASE_PUBLISHABLE_KEY = ANON_KEY;
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = ANON_KEY;
process.env.SUPABASE_SECRET_KEY = SERVICE_ROLE_KEY;

function psql(query: string, user = "marcelmanduca"): string {
  return execFileSync(
    "/opt/homebrew/bin/psql",
    ["-U", user, "-d", DB_NAME, "-t", "-A", "-c", query],
    { encoding: "utf-8" }
  ).trim();
}

function psqlLast(query: string, user = "marcelmanduca"): string {
  const out = psql(query, user);
  return out.split("\n").map((s) => s.trim()).filter(Boolean).pop() || "";
}

async function reloadPostgrestSchema() {
  psql("NOTIFY pgrst, 'reload schema';");
  await new Promise((r) => setTimeout(r, 350));
}

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, description: string) {
  if (condition) {
    console.log(`[PASS] ${description}`);
    passedCount++;
  } else {
    console.error(`[FAIL] ${description}`);
    failedCount++;
    throw new Error(`Assertion failed: ${description}`);
  }
}

async function runHomologation() {
  console.log("================================================================================");
  console.log("HOMOLOGAÇÃO TÉCNICA E HTTP REAL — AMBIENTE ISOLADO COMPLETO");
  console.log(`Banco: ${DB_NAME} | PostgREST Gateway: ${POSTGREST_GATEWAY_URL} | App: ${APP_SERVER_URL}`);
  console.log("================================================================================\n");

  try {
    // --------------------------------------------------------------------------
    // SEÇÃO 1: TESTES SQL / RLS DIRETOS NO POSTGRESQL (REPRODUZÍVEL)
    // --------------------------------------------------------------------------
    console.log("--- SEÇÃO 1: TESTES SQL E RLS NO POSTGRESQL 17 ---");
    
    // Garantir configuração BYPASSRLS reprodutível
    psql("ALTER ROLE service_role BYPASSRLS;");
    psql("GRANT anon, authenticated, service_role TO test_runner;");
    psql("GRANT ALL ON ALL TABLES IN SCHEMA public TO test_runner;");
    
    // Configurar estado inicial das unidades de teste
    // Unidade 34547 (La Perle)
    psql(`
      INSERT INTO public.properties (code, title, neighborhood, city, state, address, condo_name, price_brl, area_m2, bedrooms, suites, bathrooms, parking_spots, description, cover_image, published)
      VALUES ('34547', 'Apartamento La Perle Homolog', 'Agronômica', 'Florianópolis', 'SC', 'Av. Irineu Bornhausen, 3600', 'La Perle Beira Mar', 8900000.00, 316, 3, 3, 6, 4, 'Apartamento de alto padrão com vista mar frontal.', '/blog/beira-mar-norte/la-perle.webp', true)
      ON CONFLICT (code) DO UPDATE SET published = true, price_brl = 8900000.00;
    `);

    // Unidade 31776 (Acqua - permitida/ativa)
    psql(`
      INSERT INTO public.properties (code, title, neighborhood, city, state, address, condo_name, price_brl, area_m2, bedrooms, suites, bathrooms, parking_spots, description, cover_image, published)
      VALUES ('31776', 'Apartamento Acqua Homolog', 'Agronômica', 'Florianópolis', 'SC', 'Rua Frei Caneca, 17', 'Condomínio Acqua', 4500000.00, 221, 3, 3, 4, 3, 'Apartamento no Condomínio Acqua frente praça.', '/blog/beira-mar-norte/acqua.webp', true)
      ON CONFLICT (code) DO UPDATE SET published = true, price_brl = 4500000.00;
    `);

    // Inserir registro no acervo editorial
    psql(`
      INSERT INTO public.editorial_preserved_properties (
        code, condo_name, article_slug, title, property_type, neighborhood, city, state, address,
        area_m2, bedrooms, suites, bathrooms, parking_spots, description, features, condo_features,
        cover_image, photos, is_preserved, is_admin_blocked, unavailable_notice
      ) VALUES (
        '34547', 'La Perle Beira Mar', 'condominios-luxo-beira-mar-norte-agronomica',
        'Apartamento em Agronômica com 3 dormitórios, 316m² — La Perle', 'apartamento', 'Agronômica',
        'Florianópolis', 'SC', 'Avenida Governador Irineu Bornhausen, 3600', 316, 3, 3, 6, 4,
        'Apartamento à beira-mar no La Perle.', ARRAY['Vista Mar', 'Alto Padrão'], ARRAY['Piscina', 'Portaria 24h'],
        '/blog/beira-mar-norte/la-perle.webp', '[{"url":"/blog/beira-mar-norte/la-perle.webp","position":0}]'::jsonb,
        true, false, 'Esta unidade não está disponível para venda no momento.'
      ) ON CONFLICT (code) DO UPDATE SET is_preserved = true, is_admin_blocked = false;
    `);

    psql(`
      INSERT INTO public.editorial_preserved_properties (
        code, condo_name, article_slug, title, property_type, neighborhood, city, state, address,
        area_m2, bedrooms, suites, bathrooms, parking_spots, description, features, condo_features,
        cover_image, photos, is_preserved, is_admin_blocked, unavailable_notice
      ) VALUES (
        '31776', 'Condomínio Acqua', 'condominios-luxo-beira-mar-norte-agronomica',
        'Apartamento em Agronômica com 3 suítes, 221m² — Acqua', 'apartamento', 'Agronômica',
        'Florianópolis', 'SC', 'Rua Frei Caneca, 17', 221, 3, 3, 4, 3,
        'Apartamento no Condomínio Acqua.', ARRAY['Vista Praça', 'Alto Padrão'], ARRAY['Piscina', 'Portaria 24h'],
        '/blog/beira-mar-norte/acqua.webp', '[{"url":"/blog/beira-mar-norte/acqua.webp","position":0}]'::jsonb,
        true, false, 'Esta unidade não está disponível para venda no momento.'
      ) ON CONFLICT (code) DO UPDATE SET is_preserved = true, is_admin_blocked = false;
    `);

    // Teste RLS 1: Bloqueio administrativo oculta registro do anon
    psql("UPDATE public.editorial_preserved_properties SET is_admin_blocked = true WHERE code = '34547';");
    const anonCheck = psqlLast("SET ROLE anon; SELECT count(*) FROM public.editorial_preserved_properties WHERE code = '34547';", "test_runner");
    assert(anonCheck === "0", "SQL/RLS: Consulta com papel 'anon' oculta registro bloqueado (count = 0)");

    // Teste RLS 2: Papel service_role (BYPASSRLS) enxerga registro bloqueado
    const adminCheck = psqlLast("SET ROLE service_role; SELECT count(*) FROM public.editorial_preserved_properties WHERE code = '34547' AND is_admin_blocked = true;", "test_runner");
    assert(adminCheck === "1", "SQL/RLS: Consulta com papel 'service_role' (BYPASSRLS) localiza bloqueio administrativo (count = 1)");

    // Teste 3: Idempotência do Seed
    psql("UPDATE public.editorial_preserved_properties SET is_preserved = false, is_admin_blocked = true WHERE code = '34547';");
    const seedSql = execFileSync("cat", ["supabase/migrations/20260913000001_seed_editorial_preserved_properties.sql"], { encoding: "utf-8" });
    psql(seedSql);
    const postSeedState = psqlLast("SELECT is_preserved::text || ',' || is_admin_blocked::text FROM public.editorial_preserved_properties WHERE code = '34547';");
    assert(postSeedState === "false,true", "SQL/Idempotência: Re-execução da carga semente respeita ON CONFLICT DO NOTHING e NÃO sobrescreve revogações");

    // --------------------------------------------------------------------------
    // SEÇÃO 2: TESTES DE API POSTGREST VIA JWT / GATEWAY
    // --------------------------------------------------------------------------
    console.log("\n--- SEÇÃO 2: TESTES DE API POSTGREST VIA JWT (GATEWAY http://127.0.0.1:54321) ---");
    const anonSupabase = createClient(POSTGREST_GATEWAY_URL, ANON_KEY);
    const adminSupabase = createClient(POSTGREST_GATEWAY_URL, SERVICE_ROLE_KEY);

    // Resetar para is_preserved=true, is_admin_blocked=false
    psql("UPDATE public.editorial_preserved_properties SET is_preserved = true, is_admin_blocked = false WHERE code = '34547';");
    await reloadPostgrestSchema();

    const { data: anonData1 } = await anonSupabase.from("editorial_preserved_properties").select("code, is_preserved").eq("code", "34547");
    assert(Array.isArray(anonData1) && anonData1.length === 1 && anonData1[0].code === "34547", "API/PostgREST: Cliente 'anon' consulta acervo autorizado via JWT anon");

    psql("UPDATE public.editorial_preserved_properties SET is_admin_blocked = true WHERE code = '34547';");
    const { data: anonDataBlocked } = await anonSupabase.from("editorial_preserved_properties").select("code").eq("code", "34547");
    assert(Array.isArray(anonDataBlocked) && anonDataBlocked.length === 0, "API/PostgREST: Cliente 'anon' sob RLS recebe array vazio para código bloqueado");

    const { data: adminDataBlocked } = await adminSupabase.from("editorial_preserved_properties").select("code, is_admin_blocked").eq("code", "34547");
    assert(Array.isArray(adminDataBlocked) && adminDataBlocked.length === 1 && adminDataBlocked[0].is_admin_blocked === true, "API/PostgREST: Cliente 'service_role' autoritativo obtém status is_admin_blocked=true via JWT admin");

    // --------------------------------------------------------------------------
    // SEÇÃO 3: TESTES HTTP REAIS CONTRA A APLICAÇÃO (http://localhost:8085)
    // --------------------------------------------------------------------------
    console.log("\n--- SEÇÃO 3: TESTES HTTP REAIS NA ROTA /imovel/:code (http://localhost:8085) ---");

    // Cenário 3A: Imóvel Ativo Comercial
    // properties.published = true, editorial_preserved_properties.is_preserved = false, is_admin_blocked = false
    psql("UPDATE public.properties SET published = true, price_brl = 8900000.00 WHERE code = '34547';");
    psql("UPDATE public.editorial_preserved_properties SET is_preserved = false, is_admin_blocked = false WHERE code = '34547';");
    await reloadPostgrestSchema();

    const resActive = await fetch(`${APP_SERVER_URL}/imovel/34547`);
    assert(resActive.status === 200, "HTTP 3A: Imóvel comercial ativo retorna HTTP 200");
    const textActive = await resActive.text();
    assert(textActive.includes("8.900.000") || textActive.includes("8900000"), "HTTP 3A: Conteúdo renderizado inclui preço comercial R$ 8.900.000");
    assert(textActive.includes("Falar com Michele"), "HTTP 3A: Conteúdo renderizado inclui CTA comercial 'Falar com Michele'");
    assert(textActive.includes('"@type":"Offer"') || textActive.includes('"@type": "Offer"'), "HTTP 3A: Schema.org inclui objeto de oferta comercial (@type: Offer)");
    assert(!textActive.includes("Esta unidade não está disponível para venda no momento"), "HTTP 3A: NÃO exibe aviso de indisponibilidade");

    // Cenário 3B: Acervo Indisponível Autorizado
    // properties.published = false (ou deletado), editorial_preserved_properties.is_preserved = true, is_admin_blocked = false
    psql("UPDATE public.properties SET published = false WHERE code = '34547';");
    psql("UPDATE public.editorial_preserved_properties SET is_preserved = true, is_admin_blocked = false WHERE code = '34547';");
    await reloadPostgrestSchema();

    const resPreserved = await fetch(`${APP_SERVER_URL}/imovel/34547`);
    assert(resPreserved.status === 200, "HTTP 3B: Acervo editorial indisponível autorizado retorna HTTP 200");
    const textPreserved = await resPreserved.text();
    assert(textPreserved.includes("Esta unidade não está disponível para venda no momento"), "HTTP 3B: Conteúdo renderizado inclui aviso explícito de indisponibilidade");
    assert(textPreserved.includes("Consultar opções"), "HTTP 3B: Conteúdo renderizado inclui CTA alternativo 'Consultar opções'");
    assert(!textPreserved.includes('"@type":"Offer"') && !textPreserved.includes('"@type": "Offer"'), "HTTP 3B: Schema.org OMITE oferta comercial (@type: Offer)");
    assert(textPreserved.includes("Acervo Editorial") || textPreserved.includes("Acervo Michele dos Imóveis"), "HTTP 3B: Identificação visual de Acervo Editorial presente");

    // Cenário 3C: Acervo Revogado sem Oferta Ativa
    // properties.published = false, editorial_preserved_properties.is_preserved = false, is_admin_blocked = false
    psql("UPDATE public.properties SET published = false WHERE code = '34547';");
    psql("UPDATE public.editorial_preserved_properties SET is_preserved = false, is_admin_blocked = false WHERE code = '34547';");
    await reloadPostgrestSchema();

    const resRevoked = await fetch(`${APP_SERVER_URL}/imovel/34547`);
    assert(resRevoked.status === 404, "HTTP 3C: Acervo revogado sem oferta ativa retorna rigorosamente HTTP 404");

    // Cenário 3D: Bloqueio Administrativo Total (prevalece mesmo com properties.published=true)
    // properties.published = true, editorial_preserved_properties.is_admin_blocked = true
    psql("UPDATE public.properties SET published = true WHERE code = '34547';");
    psql("UPDATE public.editorial_preserved_properties SET is_admin_blocked = true WHERE code = '34547';");
    await reloadPostgrestSchema();

    const resBlocked = await fetch(`${APP_SERVER_URL}/imovel/34547`);
    assert(resBlocked.status === 404, "HTTP 3D: Imóvel com bloqueio administrativo retorna rigorosamente HTTP 404 mesmo com properties.published=true");

    // Cenário 3E: Falha Administrativa Induzida (Fail-Closed)
    // Renomear tabela temporariamente para simular falha grave de infraestrutura
    psql("ALTER TABLE public.editorial_preserved_properties RENAME TO editorial_preserved_properties_temp;");
    await reloadPostgrestSchema();

    const resFailure = await fetch(`${APP_SERVER_URL}/imovel/34547`);
    assert(resFailure.status === 500, "HTTP 3E: Falha administrativa induzida retorna HTTP 500 controlado");
    const textFailure = await resFailure.text();
    assert(!textFailure.includes("8.900.000"), "HTTP 3E: Falha técnica NÃO vaza preço ou dados confidenciais (Fail-Closed garantido)");

    // Cenário 3F: Restauração do Ambiente e Recuperação de Ativo
    psql("ALTER TABLE public.editorial_preserved_properties_temp RENAME TO editorial_preserved_properties;");
    psql("UPDATE public.properties SET published = true WHERE code = '34547';");
    psql("UPDATE public.editorial_preserved_properties SET is_admin_blocked = false, is_preserved = false WHERE code = '34547';");
    await reloadPostgrestSchema();

    const resRestored = await fetch(`${APP_SERVER_URL}/imovel/34547`);
    assert(resRestored.status === 200, "HTTP 3F: Após restauração da infraestrutura, imóvel ativo volta imediatamente a retornar HTTP 200");
    const textRestored = await resRestored.text();
    assert(textRestored.includes("Falar com Michele"), "HTTP 3F: Imóvel ativo restaurado renderiza CTA comercial normal");

    // --------------------------------------------------------------------------
    // SEÇÃO 4: TESTES DE CONSUMIDORES REAIS (SITEMAP, BUSCA E MCP)
    // --------------------------------------------------------------------------
    console.log("\n--- SEÇÃO 4: TESTES DE CONSUMIDORES REAIS (SITEMAP, BUSCA E MCP) ---");

    // Artigo do Blog
    const resBlog = await fetch(`${APP_SERVER_URL}/blog/condominios-luxo-beira-mar-norte-agronomica`);
    assert(resBlog.status === 200, "Consumidor HTTP: Rota do artigo do Blog retorna HTTP 200");
    const textBlog = await resBlog.text();
    assert(textBlog.includes("Condomínios de luxo na Beira-Mar Norte"), "Consumidor HTTP: Artigo do Blog contém título oficial");
    assert(!textBlog.includes("280–350 m²") && !textBlog.includes("250–380 m²"), "Consumidor HTTP: Artigo do Blog NÃO contém intervalos de metragem não auditados");

    // Sitemap com unidade autorizada
    psql("UPDATE public.properties SET published = true WHERE code = '34547';");
    psql("UPDATE public.editorial_preserved_properties SET is_admin_blocked = false WHERE code = '34547';");
    await reloadPostgrestSchema();
    const resSitemap = await fetch(`${APP_SERVER_URL}/sitemap.xml`);
    assert(resSitemap.status === 200, "Sitemap: Rota /sitemap.xml retorna HTTP 200");
    const textSitemap = await resSitemap.text();
    assert(textSitemap.includes("<loc>https://micheledosimoveis.com.br/imovel/34547</loc>"), "Sitemap: Unidade autorizada está presente no sitemap.xml");

    // Sitemap com unidade bloqueada
    psql("UPDATE public.editorial_preserved_properties SET is_admin_blocked = true WHERE code = '34547';");
    await reloadPostgrestSchema();
    const resSitemapBlocked = await fetch(`${APP_SERVER_URL}/sitemap.xml`);
    const textSitemapBlocked = await resSitemapBlocked.text();
    assert(!textSitemapBlocked.includes("<loc>https://micheledosimoveis.com.br/imovel/34547</loc>"), "Sitemap: Unidade bloqueada administrativamente é RIGOROSAMENTE EXCLUÍDA do sitemap.xml");

    // Busca Real (fetchSearchProperties)
    const { fetchSearchProperties } = await import("../src/lib/properties.functions");
    const searchResult = await fetchSearchProperties({});
    assert(!searchResult.some((item) => item.code === "34547"), "Busca: Unidade bloqueada administrativamente (34547) é EXCLUÍDA dos resultados de busca");
    assert(searchResult.some((item) => item.code === "31776"), "Busca: Unidade permitida (31776) PERMANECE presente nos resultados de busca");

    // Contexto de autenticação simulado para invocação direta dos handlers de ferramentas MCP
    // (Nota: Executa a lógica de aplicação dos handlers MCP via ToolContext emulado, sem transporte de rede MCP)
    const mockCtx = {
      isAuthenticated: () => true,
      getToken: () => ANON_KEY,
    } as any;

    const getPropertyTool = (await import("../src/lib/mcp/tools/get-property")).default;
    const searchTool = (await import("../src/lib/mcp/tools/search-properties")).default;

    // Teste MCP 1: Busca em ambiente saudável com duas unidades (31776 permitida, 34547 bloqueada)
    const mcpSearchRes = await (searchTool as any).handler({ neighborhood: "Agronômica" }, mockCtx);
    assert(!mcpSearchRes.isError, "MCP search_properties: isError é false/indefinido em ambiente saudável");
    assert(mcpSearchRes.structuredContent?.properties?.some((p: any) => p.code === "31776"), "MCP search_properties: Retorno estruturado MANTÉM unidade permitida (31776)");
    assert(!mcpSearchRes.structuredContent?.properties?.some((p: any) => p.code === "34547"), "MCP search_properties: Retorno estruturado EXCLUI unidade bloqueada (34547)");

    // Teste MCP 2: Detalhe de unidade permitida (31776)
    const mcpAllowedRes = await (getPropertyTool as any).handler({ code: "31776" }, mockCtx);
    assert(!mcpAllowedRes.isError, "MCP get_property_by_code: isError é false/indefinido para unidade permitida");
    assert(mcpAllowedRes.content[0].text.includes("31776") && mcpAllowedRes.content[0].text.includes("Acqua"), "MCP get_property_by_code: Retorna payload estruturado completo da unidade permitida");

    // Teste MCP 3: Detalhe de unidade bloqueada (34547) - Distingue bloqueio de falha técnica
    const mcpBlockedRes = await (getPropertyTool as any).handler({ code: "34547" }, mockCtx);
    assert(!mcpBlockedRes.isError, "MCP get_property_by_code: isError é false/indefinido para unidade bloqueada (não é falha técnica)");
    assert(mcpBlockedRes.content[0].text.includes("No published or preserved property with code 34547"), "MCP get_property_by_code: Retorna mensagem de bloqueio/não encontrado controlada");

    // Teste MCP 4: Detalhe sob falha técnica administrativa (induzida)
    psql("ALTER TABLE public.editorial_preserved_properties RENAME TO editorial_preserved_properties_temp;");
    await reloadPostgrestSchema();
    const mcpFailureRes = await (getPropertyTool as any).handler({ code: "34547" }, mockCtx);
    assert(mcpFailureRes.isError === true, "MCP get_property_by_code: isError é TRUE sob falha técnica administrativa induzida");
    assert(mcpFailureRes.content[0].text.includes("Falha técnica ao verificar bloqueio administrativo"), "MCP get_property_by_code: Retorna mensagem explícita de erro técnico administrativo");

    // Restaurar imediatamente
    psql("ALTER TABLE public.editorial_preserved_properties_temp RENAME TO editorial_preserved_properties;");
    await reloadPostgrestSchema();

  } finally {
    // --------------------------------------------------------------------------
    // RESTAURAÇÃO DE SEGURANÇA NO FINALLY
    // --------------------------------------------------------------------------
    console.log("\n--- RESTAURAÇÃO FINAL DO AMBIENTE (FINALLY) ---");
    try {
      // Restaurar tabela caso esteja com nome temporário
      psql(`
        DO '
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ''editorial_preserved_properties_temp'') THEN
            ALTER TABLE public.editorial_preserved_properties_temp RENAME TO editorial_preserved_properties;
          END IF;
        END ';
      `);
      // Restaurar 34547 e 31776 para estado preservado padrão
      psql(`
        UPDATE public.editorial_preserved_properties
        SET is_preserved = true, is_admin_blocked = false
        WHERE code IN ('34547', '31776');
      `);
      psql("DELETE FROM public.properties WHERE code IN ('34547', '31776');");
      await reloadPostgrestSchema();
      console.log("[OK] Ambiente restaurado para o estado canônico do acervo editorial.");
    } catch (e: any) {
      console.error("[AVISO] Erro na restauração final:", e.message);
    }
  }

  console.log("\n================================================================================");
  console.log(`TOTAL DE TESTES: ${passedCount + failedCount} | APROVADOS: ${passedCount} | FALHAS: ${failedCount}`);
  console.log("================================================================================");
}

runHomologation().catch((err) => {
  console.error("Erro fatal na execução da homologação:", err);
  process.exit(1);
});
