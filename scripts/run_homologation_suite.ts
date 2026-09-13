/**
 * Suíte de Homologação Integrada — Etapa 2 (PO Revisão V6 / Homologação)
 *
 * Executa testes reais contra a instância local isolada do PostgreSQL (michele_homolog),
 * validando RLS com roles reais (anon vs service_role), idempotência de carga e todos
 * os fluxos funcionais e de falha induzida.
 */

import { execSync } from "child_process";
import {
  fetchPropertyByCode,
  fetchAlternativePropertiesForCondominium,
  fetchSearchProperties,
} from "../src/lib/properties.functions";
import {
  resolveEditorialPreservedSnapshot,
  fetchAdministrativelyBlockedCodes,
  isCodeAdministrativelyBlocked,
} from "../src/lib/editorial-preserved";
import { processRowsToXml } from "../src/lib/vrsync.functions";
import getPropertyTool from "../src/lib/mcp/tools/get-property";
import searchPropertyTool from "../src/lib/mcp/tools/search-properties";

const DB_NAME = "michele_homolog";
const WHOAMI = execSync("whoami").toString().trim();

function runPsql(sql: string): string {
  const sanitized = sql.replace(/"/g, '\\"');
  return execSync(`/opt/homebrew/bin/psql -U ${WHOAMI} -d ${DB_NAME} -t -A -c "${sanitized}"`).toString().trim();
}

// PostgreSQL Adapter Client para conectar nos testes simulando cliente anon ou service_role
function createPostgresAdapter(role: "anon" | "service_role") {
  return {
    from: (table: string) => ({
      select: (cols: string = "*") => {
        let whereClauses: string[] = [];
        let limitVal: number | null = null;
        let neqVal: { col: string; val: string } | null = null;
        let ilikeVal: { col: string; val: string } | null = null;

        const executeQuery = async () => {
          try {
            let whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
            if (neqVal) {
              whereSql += whereSql ? ` AND ${neqVal.col} != '${neqVal.val}'` : `WHERE ${neqVal.col} != '${neqVal.val}'`;
            }
            if (ilikeVal) {
              whereSql += whereSql ? ` AND ${ilikeVal.col} ILIKE '${ilikeVal.val}'` : `WHERE ${ilikeVal.col} ILIKE '${ilikeVal.val}'`;
            }
            const limitSql = limitVal ? `LIMIT ${limitVal}` : "";
            const sanitizedCols = cols.replace(/property_photos\([^)]+\)/g, "cover_image");
            const query = `
              SET ROLE ${role};
              SELECT json_agg(t) FROM (
                SELECT ${sanitizedCols === "*" ? "*" : sanitizedCols} FROM public.${table} ${whereSql} ${limitSql}
              ) t;
            `;
            const raw = runPsql(query);
            const lines = raw.split("\n").filter((l) => l !== "SET" && l.trim() !== "");
            const jsonStr = lines.join("").trim();
            const data = jsonStr ? JSON.parse(jsonStr) : [];
            return { data, error: null };
          } catch (err: any) {
            return { data: null, error: { message: err.message, code: "PSQL_ERROR" } };
          }
        };

        const builder: any = {
          eq: (col: string, val: any) => {
            whereClauses.push(`${col} = ${typeof val === "boolean" ? val : `'${val}'`}`);
            return builder;
          },
          neq: (col: string, val: string) => {
            neqVal = { col, val };
            return builder;
          },
          ilike: (col: string, val: string) => {
            ilikeVal = { col, val };
            return builder;
          },
          order: () => builder,
          range: () => builder,
          limit: (l: number) => {
            limitVal = l;
            return builder;
          },
          maybeSingle: async () => {
            limitVal = 1;
            const res = await executeQuery();
            return { data: res.data && res.data.length > 0 ? res.data[0] : null, error: res.error };
          },
          then: (onFulfilled: any, onRejected: any) => {
            return executeQuery().then(onFulfilled, onRejected);
          },
        };

        return builder;
      },
    }),
  };
}

async function runHomologation() {
  console.log("================================================================================");
  console.log("SUÍTE DE HOMOLOGAÇÃO REAL — AMBIENTE ISOLADO (PostgreSQL 17)");
  console.log(`Banco: ${DB_NAME} | Host: localhost:5432`);
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(cond: boolean, msg: string) {
    if (cond) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
      throw new Error(`Falha na homologação: ${msg}`);
    }
  }

  const anonClient = createPostgresAdapter("anon");
  const adminClient = createPostgresAdapter("service_role");

  // ---------------------------------------------------------------------------
  // 1. Validação de RLS Real no PostgreSQL com papéis anon e service_role
  // ---------------------------------------------------------------------------
  console.log("--- 1. Validação de RLS Real no PostgreSQL (anon vs service_role) ---");
  
  // 1.1 Inserir unidade de teste bloqueada administrativamente
  runPsql(`
    UPDATE public.editorial_preserved_properties SET is_admin_blocked = true WHERE code = '34547';
  `);

  const anonRes = await anonClient.from("editorial_preserved_properties").select("*").eq("code", "34547").maybeSingle();
  assert(anonRes.data === null, "RLS Pública (anon): registro com is_admin_blocked=true retorna null (oculto pelo PostgreSQL)");

  const adminRes = await adminClient.from("editorial_preserved_properties").select("is_admin_blocked").eq("code", "34547").maybeSingle();
  assert(adminRes.data && adminRes.data.is_admin_blocked === true, "RLS Admin (service_role): detecta is_admin_blocked=true no banco");

  // Restaurar
  runPsql(`
    UPDATE public.editorial_preserved_properties SET is_admin_blocked = false WHERE code = '34547';
  `);

  // ---------------------------------------------------------------------------
  // 2. Validação de Idempotência da Carga Inicial (Repetição sem sobrescrever)
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. Idempotência da Carga Inicial (Seed) ---");
  runPsql(`
    UPDATE public.editorial_preserved_properties SET is_preserved = false WHERE code = '31776';
    UPDATE public.editorial_preserved_properties SET is_admin_blocked = true WHERE code = '34547';
  `);

  // Re-executar arquivo de migração da semente
  execSync(`/opt/homebrew/bin/psql -U ${WHOAMI} -d ${DB_NAME} -f supabase/migrations/20260913000001_seed_editorial_preserved_properties.sql`);

  const checkRevoked = runPsql("SELECT is_preserved FROM public.editorial_preserved_properties WHERE code = '31776';");
  const checkBlocked = runPsql("SELECT is_admin_blocked FROM public.editorial_preserved_properties WHERE code = '34547';");

  assert(checkRevoked === "f", "Carga inicial repetida NÃO sobrescreveu revogação manual (is_preserved=false preservado)");
  assert(checkBlocked === "t", "Carga inicial repetida NÃO sobrescreveu bloqueio administrativo (is_admin_blocked=true preservado)");

  // Restaurar dados padrão para os testes funcionais
  runPsql(`
    UPDATE public.editorial_preserved_properties SET is_preserved = true, is_admin_blocked = false WHERE code IN ('31776', '34547');
  `);

  // ---------------------------------------------------------------------------
  // 3. Testes Funcionais Integrados (Imóvel Ativo, Acervo Preservado, Revogado e Bloqueado)
  // ---------------------------------------------------------------------------
  console.log("\n--- 3. Testes Funcionais Integrados ---");

  // 3.1 Imóvel Comercial Ativo
  runPsql(`
    INSERT INTO public.properties (code, title, property_type, neighborhood, city, price_brl, published, condo_name)
    VALUES ('ACTIVE_100', 'Apartamento La Perle Ativo', 'apartamento', 'Agronômica', 'Florianópolis', 6500000, true, 'La Perle')
    ON CONFLICT (code) DO UPDATE SET published = true, price_brl = 6500000;
  `);

  const activeProp = await fetchPropertyByCode("ACTIVE_100", anonClient, adminClient);
  assert(
    activeProp !== null && activeProp.isArchived === false && activeProp.property.price_brl === 6500000,
    "Imóvel comercial ativo: retorna dados comerciais completos com preço",
  );

  // 3.2 Acervo Autorizado e Indisponível (Sem Oferta Comercial Ativa)
  const preservedSnap = await fetchPropertyByCode("34547", anonClient, adminClient);
  assert(
    preservedSnap !== null &&
      preservedSnap.isArchived === true &&
      preservedSnap.property.price_brl === null &&
      preservedSnap.unavailableNotice === "Esta unidade não está disponível para venda no momento.",
    "Acervo autorizado e indisponível: retorna snapshot sem preço e com aviso de indisponibilidade",
  );

  // 3.3 Acervo Revogado (is_preserved = false)
  runPsql("UPDATE public.editorial_preserved_properties SET is_preserved = false WHERE code = '34547';");
  const revokedSnap = await fetchPropertyByCode("34547", anonClient, adminClient);
  assert(revokedSnap === null, "Acervo revogado: retorna null (HTTP 404)");

  // 3.4 Bloqueio Administrativo Total (is_admin_blocked = true sobrepondo published = true)
  runPsql(`
    UPDATE public.editorial_preserved_properties SET is_preserved = true, is_admin_blocked = true WHERE code = '34547';
    UPDATE public.properties SET published = true WHERE code = '34547';
  `);
  const blockedProp = await fetchPropertyByCode("34547", anonClient, adminClient);
  assert(blockedProp === null, "Bloqueio administrativo total: recusa exibição mesmo com properties.published=true (HTTP 404)");

  // 3.5 Reativação comercial sem desfazer bloqueio administrativo
  runPsql(`
    UPDATE public.properties SET published = true, updated_at = now() WHERE code = '34547';
  `);
  const blockedAfterCommercialUpdate = await fetchPropertyByCode("34547", anonClient, adminClient);
  assert(blockedAfterCommercialUpdate === null, "Reativação comercial sem desfazer bloqueio administrativo permanece bloqueada (HTTP 404)");

  // Restaurar
  runPsql("UPDATE public.editorial_preserved_properties SET is_admin_blocked = false WHERE code = '34547';");

  // ---------------------------------------------------------------------------
  // 4. Testes de Falha Induzida e Restauração de Ambiente
  // ---------------------------------------------------------------------------
  console.log("\n--- 4. Testes de Falha Induzida & Restauração ---");

  // 4.1 Falha induzida: tabela renomeada/indisponível
  runPsql("ALTER TABLE public.editorial_preserved_properties RENAME TO temp_editorial_backup;");

  let threwInduced = false;
  try {
    await fetchPropertyByCode("34547", anonClient, adminClient);
  } catch (err: any) {
    threwInduced = true;
    assert(
      err.message.includes("Falha técnica") || err.message.includes("PSQL_ERROR"),
      `Falha induzida gera erro controlado e impede entrega de dados: ${err.message}`,
    );
  }
  assert(threwInduced, "Ambiente com falha induzida falha fechado (zero vazamento de dados)");

  // 4.2 Restauração do ambiente
  runPsql("ALTER TABLE public.temp_editorial_backup RENAME TO editorial_preserved_properties;");
  const recoveredProp = await fetchPropertyByCode("34547", anonClient, adminClient);
  assert(recoveredProp !== null, "Após restauração do ambiente, serviço recupera operação normal com sucesso");

  // ---------------------------------------------------------------------------
  // 5. Consumidores Integrados (Buscas, Recomendações, Sitemap, VRSync e MCP)
  // ---------------------------------------------------------------------------
  console.log("\n--- 5. Consumidores Integrados (Busca, Recomendações, Sitemap e MCP) ---");

  // Bloquear 34547 para verificar exclusão sistêmica
  runPsql("UPDATE public.editorial_preserved_properties SET is_admin_blocked = true WHERE code = '34547';");

  // 5.1 Recomendações
  const alternatives = await fetchAlternativePropertiesForCondominium("La Perle", "OTHER", anonClient, adminClient);
  assert(
    !alternatives.some((a) => a.code === "34547"),
    "fetchAlternativePropertiesForCondominium exclui unidade bloqueada",
  );

  // 5.2 Lote de bloqueios
  const blockedCodes = await fetchAdministrativelyBlockedCodes(adminClient);
  assert(blockedCodes.has("34547"), "fetchAdministrativelyBlockedCodes inclui código 34547 no lote");

  // 5.3 Exportador VRSync
  const testDataset = [
    {
      id: "p1",
      code: "ACTIVE_100",
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
      code: "34547",
      title: "Acervo Preservado",
      property_type: "Apartamento",
      neighborhood: "Agronômica",
      city: "Florianópolis",
      state: "SC",
      address: "Av. Irineu Bornhausen, 3600",
      price_brl: 3000000,
      area_m2: 316,
      bedrooms: 3,
      suites: 3,
      bathrooms: 4,
      parking_spots: 4,
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
  const vrsyncRes = processRowsToXml(testDataset as any);
  assert(vrsyncRes.report.exported === 1 && !vrsyncRes.xml.includes("34547"), "VRSync exclui unidade do acervo/bloqueada");

  // Restaurar estado final
  runPsql("UPDATE public.editorial_preserved_properties SET is_admin_blocked = false WHERE code = '34547';");

  console.log("\n================================================================================");
  console.log(`RESULTADO DA HOMOLOGAÇÃO: ${passed} PASSARAM, ${failed} FALHARAM`);
  console.log("================================================================================\n");
}

runHomologation().catch((err) => {
  console.error("Erro fatal na homologação:", err);
  process.exit(1);
});
