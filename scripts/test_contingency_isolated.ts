import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

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

async function reloadPostgrestSchema() {
  psql("NOTIFY pgrst, 'reload schema';");
  await new Promise((r) => setTimeout(r, 350));
}

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log(`[PASS] ${msg}`);
    passed++;
  } else {
    console.error(`[FAIL] ${msg}`);
    failed++;
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runContingencyIsolatedSuite() {
  const gitHash = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).trim();
  const gitBranch = execFileSync("git", ["branch", "--show-current"], { encoding: "utf-8" }).trim();

  console.log("================================================================================");
  console.log(`TESTE DA VERSÃO DE CONTINGÊNCIA EFETIVA (ISOLADA)`);
  console.log(`Branch: ${gitBranch} | Hash: ${gitHash}`);
  console.log("================================================================================\n");

  const originalFetch = globalThis.fetch;

  try {
    const adminSupabase = createClient(POSTGREST_GATEWAY_URL, SERVICE_ROLE_KEY);

    // -------------------------------------------------------------
    // CENÁRIO 1: Unidade Bloqueada com published=true no banco comercial
    // Deve retornar 404 (bloqueio autoritativo prevalece sobre published=true)
    // -------------------------------------------------------------
    console.log("--- Cenário 1: Unidade bloqueada administrativamente com published=true ---");
    psql(`
      INSERT INTO public.properties (code, title, neighborhood, city, state, address, condo_name, price_brl, area_m2, published)
      VALUES ('34547', 'Apartamento Bloqueado Teste', 'Agronômica', 'Florianópolis', 'SC', 'Av. Irineu Bornhausen', 'La Perle', 8900000.00, 316, true)
      ON CONFLICT (code) DO UPDATE SET published = true;
    `);
    psql(`
      INSERT INTO public.editorial_preserved_properties (code, condo_name, title, is_preserved, is_admin_blocked)
      VALUES ('34547', 'La Perle', 'La Perle Snapshot', false, true)
      ON CONFLICT (code) DO UPDATE SET is_admin_blocked = true, is_preserved = false;
    `);
    await reloadPostgrestSchema();

    const { fetchPropertyByCode, fetchSearchProperties } = await import("../src/lib/properties.functions");
    const blockedData = await fetchPropertyByCode("34547");
    assert(blockedData === null, "Contingência 1: fetchPropertyByCode retorna null para imóvel bloqueado mesmo com published=true");

    const httpBlocked = await fetch(`${APP_SERVER_URL}/imovel/34547`);
    assert(httpBlocked.status === 404, `Contingência 1 HTTP: GET /imovel/34547 retorna HTTP 404 (atual: ${httpBlocked.status})`);

    // -------------------------------------------------------------
    // CENÁRIO 2: Unidade Ativa Permitida (sem bloqueio, published=true)
    // Deve retornar 200 comercial
    // -------------------------------------------------------------
    console.log("\n--- Cenário 2: Unidade ativa permitida comercialmente ---");
    psql(`
      INSERT INTO public.properties (code, title, neighborhood, city, state, address, condo_name, price_brl, area_m2, published)
      VALUES ('1001', 'Apartamento Ativo Comercial', 'Agronômica', 'Florianópolis', 'SC', 'Av. Irineu Bornhausen', 'Beira Mar', 5500000.00, 200, true)
      ON CONFLICT (code) DO UPDATE SET published = true, price_brl = 5500000.00;
    `);
    await reloadPostgrestSchema();

    const activeData = await fetchPropertyByCode("1001");
    assert(activeData !== null && activeData.property.code === "1001" && Number(activeData.property.price_brl) === 5500000, "Contingência 2: fetchPropertyByCode retorna dados comerciais da unidade ativa permitida");

    const httpActive = await fetch(`${APP_SERVER_URL}/imovel/1001`);
    assert(httpActive.status === 200, `Contingência 2 HTTP: GET /imovel/1001 retorna HTTP 200 comercial (atual: ${httpActive.status})`);
    const activeHtml = await httpActive.text();
    assert(activeHtml.includes("R$&nbsp;5.500.000") || activeHtml.includes("5.500.000"), "Contingência 2 Conteúdo: Página comercial exibe preço formatado");

    // -------------------------------------------------------------
    // CENÁRIO 3: Artigo do Blog e Snapshot Editorial Desativados
    // Devem retornar 404 na versão de contingência
    // -------------------------------------------------------------
    console.log("\n--- Cenário 3: Artigo e snapshot editorial desativados na contingência ---");
    const httpBlog = await fetch(`${APP_SERVER_URL}/blog/condominios-luxo-beira-mar-norte-agronomica`);
    assert(httpBlog.status === 404, `Contingência 3 Blog: GET /blog/condominios-luxo-beira-mar-norte-agronomica retorna HTTP 404 (atual: ${httpBlog.status})`);

    const { resolveEditorialPreservedSnapshot } = await import("../src/lib/editorial-preserved");
    const snapshotRes = await resolveEditorialPreservedSnapshot("34547");
    assert(snapshotRes === null, "Contingência 3 Snapshot: resolveEditorialPreservedSnapshot retorna null para qualquer unidade na contingência");

    // -------------------------------------------------------------
    // CENÁRIO 4: Sincronizador Mantém o Bloqueio Administrativo
    // -------------------------------------------------------------
    console.log("\n--- Cenário 4: Sincronizador real mantém bloqueio e não republica unidade bloqueada ---");
    const targetUrl = "https://www.gralhaimoveis.com.br/imovel/apartamento-3-quartos-agronomica-florianopolis-sc/34547";
    const mockGralhaHtml = `
      <!DOCTYPE html>
      <html><body>
        <span class="codigo-imovel">Código: 34547</span>
        <h1 class="titulo-imovel">Apartamento La Perle Alto Padrão</h1>
        <span class="preco-imovel">R$ 8.900.000</span>
        <span class="bairro">Agronômica</span>
        <span class="cidade">Florianópolis</span>
      </body></html>
    `;

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (urlStr.startsWith("https://www.gralhaimoveis.com.br") || urlStr.startsWith("https://gralhaimoveis.com.br")) {
        const res = new Response(mockGralhaHtml, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
        Object.defineProperty(res, "url", { value: targetUrl });
        return res;
      }
      return originalFetch(input, init);
    };

    const { syncOneGralhaProperty } = await import("../src/lib/gralha-property-sync.server");
    const syncRes = await syncOneGralhaProperty(adminSupabase, { url: targetUrl });

    const dbRecord = psql("SELECT published::text || '|' || last_check_status FROM public.properties WHERE code = '34547';");
    const [dbPubStr, dbStatus] = dbRecord.split("|");

    assert(syncRes.publishedAfter === false, "Contingência 4 Sync: syncRes.publishedAfter é false");
    assert(syncRes.mode !== "republished", "Contingência 4 Sync: syncRes.mode NÃO indica republicação");
    assert(dbPubStr === "false", "Contingência 4 Banco: Banco PostgreSQL manteve published=false");
    assert(dbStatus === "administratively_blocked", "Contingência 4 Banco: last_check_status mantido como 'administratively_blocked'");

    // -------------------------------------------------------------
    // CENÁRIO 5: Sitemap da Contingência não contém URLs editoriais
    // -------------------------------------------------------------
    console.log("\n--- Cenário 5: Sitemap da contingência sem URLs editoriais desativadas ---");
    const httpSitemap = await fetch(`${APP_SERVER_URL}/sitemap.xml`);
    if (httpSitemap.ok) {
      const sitemapXml = await httpSitemap.text();
      assert(!sitemapXml.includes("/blog/condominios-luxo-beira-mar-norte-agronomica"), "Contingência 5 Sitemap: sitemap.xml NÃO contém a rota do blog desativada");
    } else {
      // Validar arquivo de rota diretamente
      const fs = await import("node:fs");
      const sitemapSource = fs.readFileSync("src/routes/sitemap[.]xml.ts", "utf-8");
      assert(!sitemapSource.includes("/blog/condominios-luxo-beira-mar-norte-agronomica"), "Contingência 5 Sitemap: Código do sitemap.xml não contém rota editorial");
    }

  } finally {
    globalThis.fetch = originalFetch;
    psql("DELETE FROM public.properties WHERE code IN ('34547', '1001');");
    psql("UPDATE public.editorial_preserved_properties SET is_preserved = true, is_admin_blocked = false WHERE code = '34547';");
    await reloadPostgrestSchema();
    console.log("\n[OK] Ambiente de teste restaurado.");
  }

  console.log("\n================================================================================");
  console.log(`RESULTADO DA CONTINGÊNCIA: ${passed} PASSARAM, ${failed} FALHARAM`);
  console.log("================================================================================\n");
}

runContingencyIsolatedSuite().catch((err) => {
  console.error("Erro na suíte de contingência:", err);
  process.exit(1);
});
