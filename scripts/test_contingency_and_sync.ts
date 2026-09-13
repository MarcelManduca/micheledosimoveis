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

async function runContingencyAndSyncTest() {
  console.log("================================================================================");
  console.log("TESTE REAL DE CONTINGÊNCIA E SINCRONIZADOR COM syncOneGralhaProperty");
  console.log("================================================================================\n");

  const originalFetch = globalThis.fetch;

  try {
    const adminSupabase = createClient(POSTGREST_GATEWAY_URL, SERVICE_ROLE_KEY);

    // 1. Configurar estado inicial da unidade 34547 no banco de homologação
    // Imóvel com is_admin_blocked = true no acervo editorial e previamente published = false
    psql(`
      INSERT INTO public.properties (code, title, neighborhood, city, state, address, condo_name, price_brl, area_m2, published, source_url)
      VALUES ('34547', 'Apartamento La Perle Sincronizacao', 'Agronômica', 'Florianópolis', 'SC', 'Av. Irineu Bornhausen, 3600', 'La Perle', 8900000.00, 316, false, 'https://www.gralhaimoveis.com.br/imovel/apartamento-3-quartos-agronomica-florianopolis-sc/34547')
      ON CONFLICT (code) DO UPDATE SET published = false, source_url = 'https://www.gralhaimoveis.com.br/imovel/apartamento-3-quartos-agronomica-florianopolis-sc/34547';
    `);

    psql(`
      INSERT INTO public.editorial_preserved_properties (code, condo_name, title, is_preserved, is_admin_blocked)
      VALUES ('34547', 'La Perle', 'La Perle Snapshot', false, true)
      ON CONFLICT (code) DO UPDATE SET is_admin_blocked = true, is_preserved = false;
    `);
    await reloadPostgrestSchema();

    // 2. Testar Inacessibilidade da Unidade (fetchPropertyByCode e HTTP)
    const { fetchPropertyByCode, fetchSearchProperties } = await import("../src/lib/properties.functions");
    const result = await fetchPropertyByCode("34547");
    assert(result === null, "Contingência: fetchPropertyByCode retorna null para imóvel com is_admin_blocked=true");

    const httpRes = await fetch(`${APP_SERVER_URL}/imovel/34547`);
    assert(httpRes.status === 404, "Contingência HTTP: GET /imovel/34547 retorna HTTP 404 para imóvel bloqueado");

    const searchRes = await fetchSearchProperties({});
    assert(!searchRes.some((p) => p.code === "34547"), "Contingência Busca: fetchSearchProperties exclui unidade bloqueada dos resultados");

    // 3. Execução REAL da função syncOneGralhaProperty com Scraper Mockado Ativo
    console.log("\n--- Executando syncOneGralhaProperty real com origem externa controlada ---");

    const mockGralhaHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Apartamento com 3 Quartos à Venda, 316 m² por R$ 8.900.000 - Agronômica - Florianópolis/SC</title>
          <meta property="og:title" content="Apartamento La Perle Alto Padrão - R$ 8.900.000" />
          <meta property="og:description" content="Apartamento à venda no La Perle em Florianópolis" />
          <meta property="og:image" content="https://cdn.gralhaimoveis.com.br/fotos/34547-1.jpg" />
        </head>
        <body>
          <span class="codigo-imovel">Código: 34547</span>
          <h1 class="titulo-imovel">Apartamento La Perle Alto Padrão</h1>
          <span class="preco-imovel">R$ 8.900.000</span>
          <span class="bairro">Agronômica</span>
          <span class="cidade">Florianópolis</span>
          <span class="estado">SC</span>
          <span class="endereco">Avenida Governador Irineu Bornhausen, 3600</span>
          <span class="area">316 m²</span>
          <span class="quartos">3</span>
          <span class="suites">3</span>
          <span class="banheiros">6</span>
          <span class="vagas">4</span>
          <div class="fotos">
            <img src="https://cdn.gralhaimoveis.com.br/fotos/34547-1.jpg" alt="Foto 1" />
            <img src="https://cdn.gralhaimoveis.com.br/fotos/34547-2.jpg" alt="Foto 2" />
          </div>
        </body>
      </html>
    `;

    const targetUrl = "https://www.gralhaimoveis.com.br/imovel/apartamento-3-quartos-agronomica-florianopolis-sc/34547";

    // Mockar globalThis.fetch apenas para chamadas externas à Gralha Imóveis (usando startsWith)
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      
      if (
        urlStr.startsWith("https://www.gralhaimoveis.com.br/api/anuncios/search") ||
        urlStr.startsWith("https://gralhaimoveis.com.br/api/anuncios/search")
      ) {
        const jsonBody = JSON.stringify({
          items: [
            {
              codigo: "34547",
              id: "34547",
              valorVenda: 8900000,
              areaPrivativa: 316,
              quartos: 3,
              suites: 3,
              banheiros: 6,
              garagens: 4,
              bairro: "Agronômica",
              cidade: "Florianópolis",
            },
          ],
        });
        const res = new Response(jsonBody, {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
        Object.defineProperty(res, "url", { value: urlStr });
        return res;
      }

      if (
        urlStr.startsWith("https://www.gralhaimoveis.com.br") ||
        urlStr.startsWith("https://gralhaimoveis.com.br")
      ) {
        const res = new Response(mockGralhaHtml, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
        Object.defineProperty(res, "url", { value: targetUrl });
        return res;
      }

      return originalFetch(input, init);
    };

    const { syncOneGralhaProperty } = await import("../src/lib/gralha-property-sync.server");
    const syncResult = await syncOneGralhaProperty(adminSupabase, {
      url: targetUrl,
    });

    console.log("Resultado retornado pelo syncOneGralhaProperty:", {
      mode: syncResult.mode,
      publishedBefore: syncResult.publishedBefore,
      publishedAfter: syncResult.publishedAfter,
      error: syncResult.error,
    });

    // 4. Validação do retorno da função e do registro persistido no banco
    const dbRecord = psql("SELECT published::text || '|' || last_check_status FROM public.properties WHERE code = '34547';");
    console.log("Estado no banco de dados PostgreSQL após o sync:", dbRecord);

    const [dbPublishedStr, dbLastCheckStatus] = dbRecord.split("|");
    const dbPublished = dbPublishedStr === "true";

    assert(syncResult.publishedAfter === false, "Sincronizador Retorno: syncResult.publishedAfter é false para unidade bloqueada");
    assert(syncResult.mode !== "republished", "Sincronizador Retorno: syncResult.mode NÃO indica republicação para unidade bloqueada");
    assert(syncResult.publishedAfter === dbPublished, "Sincronizador Paridade: syncResult.publishedAfter é idêntico ao valor persistido no banco");
    assert(dbPublished === false, "Sincronizador Banco: properties.published está persistido como false no banco");
    assert(dbLastCheckStatus === "administratively_blocked", "Sincronizador Banco: last_check_status está persistido como 'administratively_blocked'");
    assert(syncResult.error === null, "Sincronizador Execução: A sincronização foi concluída sem erro fatal");

  } finally {
    globalThis.fetch = originalFetch;
    // Restauração de segurança
    psql("UPDATE public.editorial_preserved_properties SET is_preserved = true, is_admin_blocked = false WHERE code = '34547';");
    psql("DELETE FROM public.properties WHERE code = '34547';");
    await reloadPostgrestSchema();
    console.log("\n[OK] Ambiente restaurado com sucesso.");
  }

  console.log("\n================================================================================");
  console.log(`RESULTADO DO TESTE: ${passed} PASSARAM, ${failed} FALHARAM`);
  console.log("================================================================================\n");
}

runContingencyAndSyncTest().catch((err) => {
  console.error("Erro no teste:", err);
  process.exit(1);
});
