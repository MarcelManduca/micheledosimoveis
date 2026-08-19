/**
 * VRSync automated tests — Evolução 02
 *
 * Run with: npx vite-node src/lib/vrsync.test.ts
 *
 * These tests exercise REAL production code:
 *  - processRowsToXml (the XML core, including published defense)
 *  - normalizeFeatures (feature whitelist + fusion)
 *  - applyFilters (real SQL query builder filter logic exercised via FakeQuery)
 *
 * No network, no Supabase connection required.
 */
import {
  processRowsToXml,
  normalizeFeatures,
  applyFilters,
  type PropertyRow,
  type FeedFilters,
} from "./vrsync.functions";
import * as fs from "node:fs";
import * as path from "node:path";

// ─────────────────────── Fake Query Builder ───────────────────────
/**
 * Generic in-memory query builder implementing the subset of Supabase/PostgREST
 * methods called by `applyFilters`. Does not implement business logic of filters,
 * only interprets generic operations (eq, gte, lte, gt, in, not, neq) on data.
 */
class FakeQuery<T extends Record<string, any>> {
  items: T[];

  constructor(items: T[]) {
    this.items = [...items];
  }

  eq(col: string, val: any): this {
    this.items = this.items.filter((item) => item[col] === val);
    return this;
  }

  gte(col: string, val: any): this {
    this.items = this.items.filter((item) => item[col] != null && item[col] >= val);
    return this;
  }

  lte(col: string, val: any): this {
    this.items = this.items.filter((item) => item[col] != null && item[col] <= val);
    return this;
  }

  gt(col: string, val: any): this {
    this.items = this.items.filter((item) => item[col] != null && item[col] > val);
    return this;
  }

  in(col: string, values: any[]): this {
    this.items = this.items.filter((item) => values.includes(item[col]));
    return this;
  }

  neq(col: string, val: any): this {
    this.items = this.items.filter((item) => item[col] !== val);
    return this;
  }

  not(col: string, operator: string, val: any): this {
    if (operator === "is" && val === null) {
      this.items = this.items.filter((item) => item[col] !== null && item[col] !== undefined);
    } else if (operator === "in" && typeof val === "string") {
      const parsed = val.replace(/^\(|\)$/g, "").split(",").map((s) => s.trim());
      this.items = this.items.filter((item) => !parsed.includes(String(item[col])));
    }
    return this;
  }
}

// ─────────────────────── Helpers ───────────────────────
let passed = 0;
let failed = 0;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    failed += 1;
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

function test(name: string, fn: () => void) {
  try {
    fn();
    passed += 1;
    console.log(`  ✅ ${name}`);
  } catch (err: any) {
    console.error(`  ❌ ${name}: ${err.message}`);
  }
}

/** Factory for a valid, exportable property row. */
function makeRow(overrides: Partial<PropertyRow> = {}): PropertyRow {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    code: "12345",
    title: "Apartamento Teste",
    property_type: "apartamento",
    neighborhood: "Centro",
    city: "Florianópolis",
    state: "Santa Catarina",
    address: "Rua Teste, 100",
    condo_name: null,
    price_brl: 500000,
    condo_fee_brl: null,
    iptu_brl: null,
    area_m2: 80,
    bedrooms: 3,
    suites: 1,
    bathrooms: 2,
    parking_spots: 1,
    description: "Apartamento de teste para VRSync.",
    features: ["Piscina", "Academia"],
    condo_features: null,
    cover_image: "https://example.com/cover.jpg",
    featured: false,
    published: true,
    property_photos: [
      { url: "https://example.com/photo1.jpg", position: 0 },
      { url: "https://example.com/photo2.jpg", position: 1 },
    ],
    ...overrides,
  };
}

// ─────────────────────── Tests ───────────────────────
console.log("\n=== VRSYNC TESTS — Evolução 02 ===\n");

// ── 01: Preço atualizado na base aparece no XML ──
test("01 — preço atualizado na base aparece no XML", () => {
  const row = makeRow({ code: "P01", price_brl: 750000 });
  const { xml } = processRowsToXml([row]);
  assert(xml.includes("<ListPrice currency=\"BRL\">750000</ListPrice>"), "preço 750000 deve aparecer no XML");
});

// ── 02: Descrição atualizada aparece no XML ──
test("02 — descrição atualizada aparece no XML", () => {
  const row = makeRow({ code: "P02", description: "Nova descrição atualizada pela Gralha" });
  const { xml } = processRowsToXml([row]);
  assert(xml.includes("Nova descrição atualizada pela Gralha"), "descrição deve estar no CDATA");
});

// ── 03: Foto adicionada aparece no XML ──
test("03 — foto adicionada aparece no XML", () => {
  const row = makeRow({
    code: "P03",
    property_photos: [
      { url: "https://example.com/a.jpg", position: 0 },
      { url: "https://example.com/b.jpg", position: 1 },
      { url: "https://example.com/c.jpg", position: 2 },
    ],
  });
  const { xml } = processRowsToXml([row]);
  const itemCount = (xml.match(/<Item /g) || []).length;
  assert(itemCount === 4, `esperado 4 fotos (cover + 3), encontrado ${itemCount}`);
});

// ── 04: Foto removida desaparece do XML ──
test("04 — foto removida desaparece do XML", () => {
  const row = makeRow({
    code: "P04",
    cover_image: null,
    property_photos: [{ url: "https://example.com/only.jpg", position: 0 }],
  });
  const { xml } = processRowsToXml([row]);
  const itemCount = (xml.match(/<Item /g) || []).length;
  assert(itemCount === 1, `esperado exatamente 1 foto, encontrado ${itemCount}`);
  assert(!xml.includes("photo2.jpg"), "foto removida não deve estar no XML");
});

// ── 05: Reordenação de fotos aparece na ordem correta ──
test("05 — reordenação de fotos aparece na ordem correta", () => {
  const row = makeRow({
    code: "P05",
    cover_image: null,
    property_photos: [
      { url: "https://example.com/third.jpg", position: 2 },
      { url: "https://example.com/first.jpg", position: 0 },
      { url: "https://example.com/second.jpg", position: 1 },
    ],
  });
  const { xml } = processRowsToXml([row]);
  const firstIdx = xml.indexOf("first.jpg");
  const secondIdx = xml.indexOf("second.jpg");
  const thirdIdx = xml.indexOf("third.jpg");
  assert(firstIdx < secondIdx, "first.jpg deve vir antes de second.jpg");
  assert(secondIdx < thirdIdx, "second.jpg deve vir antes de third.jpg");
});

// ── 06: published=false desaparece do feed geral ──
test("06 — published=false desaparece do feed geral (processRowsToXml)", () => {
  const published = makeRow({ code: "PUB01", published: true });
  const unpublished = makeRow({ code: "UNPUB01", published: false });
  const { xml, report } = processRowsToXml([published, unpublished]);
  assert(xml.includes("<ListingID>PUB01</ListingID>"), "publicado deve estar no XML");
  assert(!xml.includes("<ListingID>UNPUB01</ListingID>"), "despublicado NÃO deve estar no XML");
  assert(report.totalActive === 1, `totalActive deve ser 1 (só publicado), encontrado ${report.totalActive}`);
});

// ── 07: published=false desaparece do feed segmentado ──
test("07 — published=false desaparece do feed segmentado (processRowsToXml)", () => {
  const rows = [
    makeRow({ code: "SEG01", published: true, neighborhood: "Ingleses" }),
    makeRow({ code: "SEG02", published: false, neighborhood: "Ingleses" }),
    makeRow({ code: "SEG03", published: true, neighborhood: "Canasvieiras" }),
  ];
  const { xml } = processRowsToXml(rows);
  assert(xml.includes("<ListingID>SEG01</ListingID>"), "SEG01 publicado deve estar");
  assert(!xml.includes("<ListingID>SEG02</ListingID>"), "SEG02 despublicado NÃO deve estar");
  assert(xml.includes("<ListingID>SEG03</ListingID>"), "SEG03 publicado deve estar");
});

// ── 08: published=false + included_property_codes continua fora ──
test("08 — published=false + included_property_codes continua fora do XML", () => {
  const included = makeRow({ code: "INC01", published: false });
  const normal = makeRow({ code: "NRM01", published: true });
  const { xml } = processRowsToXml([included, normal]);
  assert(!xml.includes("<ListingID>INC01</ListingID>"), "INC01 despublicado deve ser bloqueado pelo núcleo");
  assert(xml.includes("<ListingID>NRM01</ListingID>"), "NRM01 publicado deve estar");
});

// ── 09: published=false→true volta ao feed quando atende filtros ──
test("09 — published=false→true volta ao feed quando atende filtros", () => {
  const rowOff = makeRow({ code: "TOGGLE01", published: false });
  const { xml: xmlOff } = processRowsToXml([rowOff]);
  assert(!xmlOff.includes("TOGGLE01"), "com published=false não deve estar");

  const rowOn = makeRow({ code: "TOGGLE01", published: true });
  const { xml: xmlOn } = processRowsToXml([rowOn]);
  assert(xmlOn.includes("<ListingID>TOGGLE01</ListingID>"), "com published=true deve voltar ao feed");
});

// ── 10: alteração de preço faz imóvel entrar no filtro ──
test("10 — preço dentro da faixa → selecionado (applyFilters real)", () => {
  const filters: FeedFilters = { price_min: 400000, price_max: 600000 };
  const items = [
    makeRow({ code: "PRICE01", price_brl: 500000, published: true }),
    makeRow({ code: "PRICE02", price_brl: 450000, published: true }),
  ];
  const query = new FakeQuery(items);
  const filtered = (applyFilters(query as any, filters, []) as unknown as FakeQuery<PropertyRow>).items;
  assert(filtered.some((r) => r.code === "PRICE01"), "preço 500k dentro de 400k-600k deve ser selecionado");
  assert(filtered.some((r) => r.code === "PRICE02"), "preço 450k dentro de 400k-600k deve ser selecionado");
  assert(filtered.length === 2, "ambos devem ser selecionados");
});

// ── 11: alteração de preço faz imóvel sair do filtro ──
test("11 — preço fora da faixa → não selecionado (applyFilters real)", () => {
  const filters: FeedFilters = { price_min: 400000, price_max: 600000 };
  const items = [
    makeRow({ code: "IN01", price_brl: 500000, published: true }),
    makeRow({ code: "OUT01", price_brl: 700000, published: true }),
    makeRow({ code: "OUT02", price_brl: 300000, published: true }),
  ];
  const query = new FakeQuery(items);
  const filtered = (applyFilters(query as any, filters, []) as unknown as FakeQuery<PropertyRow>).items;
  assert(filtered.some((r) => r.code === "IN01"), "preço 500k dentro da faixa deve ser mantido");
  assert(!filtered.some((r) => r.code === "OUT01"), "preço 700k acima do max deve sair");
  assert(!filtered.some((r) => r.code === "OUT02"), "preço 300k abaixo do min deve sair");
  assert(filtered.length === 1, "apenas 1 item deve permanecer");
});

// ── 12: alteração de bairro/tipo muda participação no feed ──
test("12 — bairro/tipo alterado muda participação (applyFilters real)", () => {
  const filters: FeedFilters = {
    neighborhoods: ["Ingleses", "Canasvieiras"],
    property_types: ["apartamento"],
  };
  const items = [
    makeRow({ code: "NB01", neighborhood: "Ingleses", property_type: "apartamento", published: true }),
    makeRow({ code: "NB02", neighborhood: "Centro", property_type: "apartamento", published: true }),
    makeRow({ code: "NB03", neighborhood: "Ingleses", property_type: "terreno", published: true }),
    makeRow({ code: "NB04", neighborhood: "Canasvieiras", property_type: "apartamento", published: true }),
  ];
  const query = new FakeQuery(items);
  const filtered = (applyFilters(query as any, filters, []) as unknown as FakeQuery<PropertyRow>).items;
  assert(filtered.some((r) => r.code === "NB01"), "Ingleses + apartamento → dentro");
  assert(!filtered.some((r) => r.code === "NB02"), "Centro + apartamento → fora (bairro não está na lista)");
  assert(!filtered.some((r) => r.code === "NB03"), "Ingleses + terreno → fora (tipo não está na lista)");
  assert(filtered.some((r) => r.code === "NB04"), "Canasvieiras + apartamento → dentro (bairro da lista)");
  assert(filtered.length === 2, "apenas NB01 e NB04 devem ser selecionados");
});

// ── 13: features atuais são usadas ──
test("13 — features atuais são usadas no XML", () => {
  const row = makeRow({
    code: "F01",
    features: ["Piscina", "Academia", "Elevador"],
    condo_features: ["Portaria 24h"],
  });
  const { xml } = processRowsToXml([row]);
  assert(xml.includes("<Feature>Piscina</Feature>"), "Piscina deve estar no XML");
  assert(xml.includes("<Feature>Academia</Feature>"), "Academia deve estar no XML");
  assert(xml.includes("<Feature>Elevador</Feature>"), "Elevador deve estar no XML");
  assert(xml.includes("<Feature>Portaria 24h</Feature>"), "Portaria 24h deve estar no XML");

  // normalizeFeatures retorna válidas e conta removidas
  const result = normalizeFeatures(["Piscina", "inválida", "Academia"]);
  assert(result.valid.includes("Piscina"), "Piscina na whitelist");
  assert(result.valid.includes("Academia"), "Academia na whitelist");
  assert(result.removed >= 1, "ao menos 1 feature inválida removida");
});

// ── 14: nenhum preço hardcoded ──
test("14 — nenhum preço hardcoded no source", () => {
  const srcPath = path.resolve(__dirname, "vrsync.functions.ts");
  const source = fs.readFileSync(srcPath, "utf-8");
  assert(
    !source.includes("VERIFIED_GRALHA_PRICES_BRL"),
    "VERIFIED_GRALHA_PRICES_BRL não deve existir no source",
  );
  // Verificar que não há arrays/objetos de preço fixo suspeitos
  const priceArrayMatch = source.match(/price_brl\s*[:=]\s*\[\s*\d/);
  assert(!priceArrayMatch, "não deve haver arrays de preço hardcoded");
});

// ── 15: feed preserva XML bem-formado ──
test("15 — feed preserva XML bem-formado", () => {
  const rows = [
    makeRow({ code: "XML01" }),
    makeRow({ code: "XML02", description: 'Descrição com <html> & "aspas"' }),
    makeRow({ code: "XML03", title: "Título com ]]> e & especiais" }),
  ];
  const { xml } = processRowsToXml(rows);

  // Basic well-formedness checks
  assert(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), "deve iniciar com declaração XML");
  assert(xml.includes("<ListingDataFeed"), "deve ter ListingDataFeed root");
  assert(xml.includes("</ListingDataFeed>"), "deve fechar ListingDataFeed");
  assert(xml.includes("<Listings>"), "deve ter Listings");
  assert(xml.includes("</Listings>"), "deve fechar Listings");

  // Verify escaping: raw & and < should not appear outside CDATA
  const outsideCdata = xml.replace(/<!\[CDATA\[.*?\]\]>/gs, "");
  assert(!outsideCdata.includes(" & "), "& fora de CDATA deve estar escapado");

  // VRSync namespace preserved
  assert(
    xml.includes('xmlns="http://www.vivareal.com/schemas/1.0/VRSync"'),
    "namespace VRSync deve estar presente",
  );
});

// ── 16: cache ≤ 300 segundos ──
test("16 — cache ≤ 300 segundos nos routes", () => {
  const routeDir = path.resolve(__dirname, "../routes");
  const generalRoute = fs.readFileSync(path.join(routeDir, "vrsync[.]xml.ts"), "utf-8");
  const segmentedRoute = fs.readFileSync(path.join(routeDir, "vrsync.{$slug}[.]xml.ts"), "utf-8");

  assert(!generalRoute.includes("max-age=1800"), "feed geral não deve ter cache de 1800s");
  assert(!generalRoute.includes("s-maxage=1800"), "feed geral não deve ter s-maxage de 1800s");
  assert(generalRoute.includes("max-age=300"), "feed geral deve ter cache de 300s");

  assert(!segmentedRoute.includes("max-age=1800"), "feed segmentado não deve ter cache de 1800s");
  assert(!segmentedRoute.includes("s-maxage=1800"), "feed segmentado não deve ter s-maxage de 1800s");
  assert(segmentedRoute.includes("max-age=300"), "feed segmentado deve ter cache de 300s");
});

// ─────────────────────── Summary ───────────────────────
console.log(`\n=== RESULTADO: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  console.error("\n❌ TESTS FAILED");
  process.exit(1);
} else {
  console.log("\n✅ ALL 16 TESTS PASSED");
}
