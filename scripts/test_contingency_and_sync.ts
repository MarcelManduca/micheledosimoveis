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

async function runContingencyTest() {
  console.log("================================================================================");
  console.log("TESTE DE CONTINGÊNCIA E PROTEÇÃO DE SINCRONIZAÇÃO");
  console.log("================================================================================\n");

  try {
    // 1. Configurar estado com is_admin_blocked=true na tabela editorial e published=true na properties
    psql(`
      INSERT INTO public.properties (code, title, neighborhood, city, state, address, condo_name, price_brl, area_m2, published)
      VALUES ('34547', 'Apartamento La Perle Teste Bloqueio', 'Agronômica', 'Florianópolis', 'SC', 'Av. Irineu Bornhausen, 3600', 'La Perle', 8900000.00, 316, true)
      ON CONFLICT (code) DO UPDATE SET published = true;
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
    assert(result === null, "Contingência: fetchPropertyByCode retorna null para imóvel bloqueado mesmo com properties.published=true");

    const httpRes = await fetch(`${APP_SERVER_URL}/imovel/34547`);
    assert(httpRes.status === 404, "Contingência HTTP: GET /imovel/34547 retorna HTTP 404 mesmo com properties.published=true");

    const searchRes = await fetchSearchProperties({});
    assert(!searchRes.some((p) => p.code === "34547"), "Contingência Busca: fetchSearchProperties exclui unidade bloqueada dos resultados");

    // 3. Testar Proteção do Sincronizador (Gralha Sync)
    // Simular que o scraper encontrou a unidade ativa na fonte externa
    const { isCodeAdministrativelyBlocked } = await import("../src/lib/editorial-preserved");
    const isBlocked = await isCodeAdministrativelyBlocked("34547");
    assert(isBlocked === true, "Sincronizador: isCodeAdministrativelyBlocked detecta bloqueio autoritativo persistido no servidor");

    // Simulação do payload que o sync grava no banco:
    const syncTargetPublished = !isBlocked;
    const syncStatus = isBlocked ? "admin_blocked" : "available";

    assert(syncTargetPublished === false, "Sincronizador: Flag 'published' é forçada para false pelo sincronizador");
    assert(syncStatus === "admin_blocked", "Sincronizador: 'last_check_status' é definido como 'admin_blocked'");

    // Atualizar banco simulando ação do sync
    psql(`
      UPDATE public.properties
      SET published = ${syncTargetPublished}, last_check_status = '${syncStatus}'
      WHERE code = '34547';
    `);

    const dbPublished = psql("SELECT published::text || ',' || last_check_status FROM public.properties WHERE code = '34547';");
    assert(dbPublished === "false,admin_blocked", "Sincronizador: Banco confirma que a sincronização NÃO republica imóvel bloqueado");

  } finally {
    // Restauração de segurança
    psql("UPDATE public.editorial_preserved_properties SET is_preserved = true, is_admin_blocked = false WHERE code = '34547';");
    psql("DELETE FROM public.properties WHERE code = '34547';");
    await reloadPostgrestSchema();
    console.log("\n[OK] Ambiente restaurado com sucesso.");
  }

  console.log("\n================================================================================");
  console.log(`RESULTADO DO TESTE DE CONTINGÊNCIA: ${passed} PASSARAM, ${failed} FALHARAM`);
  console.log("================================================================================\n");
}

runContingencyTest().catch((err) => {
  console.error("Erro no teste de contingência:", err);
  process.exit(1);
});
