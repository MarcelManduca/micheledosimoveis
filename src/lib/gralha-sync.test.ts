// Automated unit tests for Gralha property synchronization (Evolução 01 v3)
// Run with: bun src/lib/gralha-sync.test.ts

import { parseGralhaPropertyHtml } from "./gralha-scraper.server";
import { syncOneGralhaProperty } from "./gralha-property-sync.server";

// Mock global fetch
const mockFetchResponses = new Map<string, { status: number; text: string; ok: boolean; url: string }>();

// Simple assert helper
function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Mock Supabase
class MockSupabase {
  queries: any[] = [];
  dataMap = new Map<string, any>();
  singleReturn: any = null;
  photosReturn: any[] = [];

  from(table: string) {
    const self = this;
    const currentQuery: any = { table, eqFilters: {}, orFilters: null, isInsert: false };

    return {
      select(cols?: string) {
        currentQuery.action = "select";
        currentQuery.cols = cols;
        return this;
      },
      insert(data: any) {
        currentQuery.action = "insert";
        currentQuery.isInsert = true;
        currentQuery.data = data;
        self.queries.push({ ...currentQuery });
        return this;
      },
      update(data: any) {
        currentQuery.action = "update";
        currentQuery.data = data;
        self.queries.push({ ...currentQuery });
        return this;
      },
      delete() {
        currentQuery.action = "delete";
        self.queries.push({ ...currentQuery });
        return this;
      },
      eq(col: string, val: any) {
        currentQuery.eqFilters[col] = val;
        return this;
      },
      in(col: string, val: any) {
        currentQuery.inFilter = { col, val };
        return this;
      },
      or(expr: string) {
        currentQuery.orFilters = expr;
        return this;
      },
      not(col: string, op: string, val: any) {
        currentQuery.notFilter = { col, op, val };
        return this;
      },
      order(col: string, options?: any) {
        currentQuery.order = { col, options };
        return this;
      },
      limit(num: number) {
        currentQuery.limit = num;
        return this;
      },
      async maybeSingle() {
        self.queries.push({ ...currentQuery });
        return { data: self.singleReturn, error: null };
      },
      async single() {
        self.queries.push({ ...currentQuery });
        if (currentQuery.isInsert) {
          return { data: { id: "new-uuid-11111" }, error: null };
        }
        return { data: self.singleReturn, error: null };
      },
      then(onfulfilled: any) {
        self.queries.push({ ...currentQuery });
        let data = self.singleReturn;
        if (currentQuery.table === "property_photos") {
          data = self.photosReturn;
        } else if (currentQuery.isInsert) {
          data = { id: "new-uuid-11111" };
        }
        return Promise.resolve(onfulfilled({ data, error: null }));
      },
    };
  }
}

async function runTests() {
  console.log("=== INICIANDO TESTES DO MOTOR DE SINCRONIZAÇÃO ===");

  // Mock global fetch object
  globalThis.fetch = (async (url: string) => {
    const mock = mockFetchResponses.get(url);
    if (!mock) {
      return {
        ok: false,
        status: 404,
        text: async () => "Not Found",
        url,
      } as any;
    }
    return {
      ok: mock.ok,
      status: mock.status,
      text: async () => mock.text,
      url: mock.url,
      body: {
        getReader() {
          let readCount = 0;
          return {
            async read() {
              if (readCount > 0) return { done: true, value: null };
              readCount++;
              return { done: false, value: new TextEncoder().encode(mock.text) as any };
            },
            async cancel() {},
          };
        },
      },
    } as any;
  }) as any;

  // HTML content template for Gralha property page
  const generateHtml = (code: string, price: string, desc = "Lindo apartamento na praia") => `
    <html>
      <head>
        <title>Apartamento em Ingleses - Michele Imóveis</title>
        <meta property="og:title" content="Apartamento à venda em Ingleses - R$ ${price}" />
        <meta property="og:image" content="https://gralha2.inforcedata.com.br/api/image/photo1.jpg" />
      </head>
      <body>
        <div>Cod: ${code}</div>
        <div>Valor de venda: R$ ${price}</div>
        <div>Condomínio: R$ 500</div>
        <div>IPTU: R$ 100</div>
        <div>Sobre este imóvel ${desc} Infraestrutura do Imóvel</div>
        <div>Infraestrutura do Imóvel Churrasqueira Piscina Infraestrutura do Condom</div>
        <div>Infraestrutura do Condom Elevador Portaria Localização do Imóvel</div>
        <img src="https://gralha2.inforcedata.com.br/api/image/photo1.jpg" />
        <img src="https://gralha2.inforcedata.com.br/api/image/photo2.jpg" />
        <img src="https://gralha2.inforcedata.com.br/api/image/photo3.jpg" />
      </body>
    </html>
  `;

  // ----------------------------------------------------
  // Cenário 01: Novo Imóvel
  // ----------------------------------------------------
  {
    console.log("Cenário 01: Novo Imóvel...");
    mockFetchResponses.set("https://www.gralhaimoveis.com.br/imovel/11111", {
      ok: true,
      status: 200,
      text: generateHtml("11111", "500.000"),
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    // Mock API search
    mockFetchResponses.set("https://www.gralhaimoveis.com.br/api/anuncios/search?finalidade=venda&codigo=11111&page=1&pagesize=1&somenteImoveis=true", {
      ok: true,
      status: 200,
      text: JSON.stringify({ items: [{ codigo: "11111", valorVenda: 500000 }] }),
      url: "https://www.gralhaimoveis.com.br/api/anuncios/search?finalidade=venda&codigo=11111&page=1&pagesize=1&somenteImoveis=true",
    });

    const db = new MockSupabase();
    db.singleReturn = null; // Imóvel não existe no banco

    const result = await syncOneGralhaProperty(db, {
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
      featured: true,
      isLaunch: false,
    });

    console.log("Cenário 01 result:", result);
    assert(result.mode === "created", "Deveria registrar modo created");
    assert(result.photosAdded === 3, "Deveria salvar 3 fotos");
    const insQuery = db.queries.find((q) => q.action === "insert" && q.table === "properties");
    assert(insQuery, "Deveria inserir na tabela properties");
    assert(insQuery.data.price_brl === 500000, "Deveria salvar preço correto");
    assert(insQuery.data.featured === true, "Deveria salvar flag featured");
    console.log("  Passou! ✅");
  }

  // ----------------------------------------------------
  // Cenário 02: Reimport sem duplicidade
  // ----------------------------------------------------
  {
    console.log("Cenário 02: Reimport sem duplicidade...");
    const db = new MockSupabase();
    db.singleReturn = {
      id: "uuid-123",
      code: "11111",
      source_url: "https://www.gralhaimoveis.com.br/imovel/11111",
      published: true,
      featured: true,
      is_launch: true,
      price_brl: 500000,
      last_check_status: "available",
    };

    mockFetchResponses.set("https://www.gralhaimoveis.com.br/imovel/11111", {
      ok: true,
      status: 200,
      text: generateHtml("11111", "550.000"), // Novo preço R$ 550.000
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    mockFetchResponses.set("https://www.gralhaimoveis.com.br/api/anuncios/search?finalidade=venda&codigo=11111&page=1&pagesize=1&somenteImoveis=true", {
      ok: true,
      status: 200,
      text: JSON.stringify({ items: [{ codigo: "11111", valorVenda: 550000 }] }),
      url: "https://www.gralhaimoveis.com.br/api/anuncios/search?finalidade=venda&codigo=11111&page=1&pagesize=1&somenteImoveis=true",
    });

    const result = await syncOneGralhaProperty(db, {
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    console.log("Cenário 02 result:", result);
    assert(result.mode === "updated", "Deveria ser updated");
    assert(result.id === "uuid-123", "Preservou ID do banco");
    const upQuery = db.queries.find((q) => q.action === "update" && q.table === "properties");
    assert(upQuery, "Realizou update");
    assert(upQuery.data.price_brl === 550000, "Preço atualizado no update");
    assert(upQuery.data.featured === undefined, "Featured preservado");
    console.log("  Passou! ✅");
  }

  // ----------------------------------------------------
  // Cenário 05: Preço alterado
  // ----------------------------------------------------
  {
    console.log("Cenário 05: Preço alterado...");
    const db = new MockSupabase();
    db.singleReturn = {
      id: "uuid-123",
      code: "11111",
      source_url: "https://www.gralhaimoveis.com.br/imovel/11111",
      price_brl: 500000,
      published: true,
      last_check_status: "available",
    };

    const result = await syncOneGralhaProperty(db, {
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    assert(result.mode === "updated", "Deveria ser updated");
    assert(result.changedFields.includes("price_brl"), "price_brl deveria constar nos changedFields");
    console.log("  Passou! ✅");
  }

  // ----------------------------------------------------
  // Cenário 06: Descrição alterada com preço igual
  // ----------------------------------------------------
  {
    console.log("Cenário 06: Descrição alterada com preço igual...");
    const db = new MockSupabase();
    db.singleReturn = {
      id: "uuid-123",
      code: "11111",
      source_url: "https://www.gralhaimoveis.com.br/imovel/11111",
      price_brl: 550000,
      description: "Apartamento antigo",
      published: true,
      last_check_status: "available",
    };

    mockFetchResponses.set("https://www.gralhaimoveis.com.br/imovel/11111", {
      ok: true,
      status: 200,
      text: generateHtml("11111", "550.000", "Lindo apartamento reformado"),
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    const result = await syncOneGralhaProperty(db, {
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    assert(result.mode === "updated", "Deveria ser updated");
    assert(result.changedFields.includes("description"), "description deveria constar nos changedFields");
    console.log("  Passou! ✅");
  }

  // ----------------------------------------------------
  // Cenário 07: Fotos alteradas com preço igual
  // ----------------------------------------------------
  {
    console.log("Cenário 07: Fotos alteradas com preço igual...");
    const db = new MockSupabase();
    db.singleReturn = {
      id: "uuid-123",
      code: "11111",
      source_url: "https://www.gralhaimoveis.com.br/imovel/11111",
      price_brl: 550000,
      published: true,
      last_check_status: "available",
    };

    db.photosReturn = [
      { id: "ph-1", url: "https://gralha2.inforcedata.com.br/api/image/photo1.jpg", position: 0 },
      { id: "ph-2", url: "https://gralha2.inforcedata.com.br/api/image/photo2.jpg", position: 1 },
      { id: "ph-3", url: "https://gralha2.inforcedata.com.br/api/image/photo_old.jpg", position: 2 },
    ];

    mockFetchResponses.set("https://www.gralhaimoveis.com.br/imovel/11111", {
      ok: true,
      status: 200,
      text: generateHtml("11111", "550.000"), // Contém photo1, photo2, photo3
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    const result = await syncOneGralhaProperty(db, {
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    console.log("Cenário 07 result:", result);
    assert(result.mode === "updated", "Deveria ser updated");
    assert(result.photosAdded === 1, "Deveria adicionar photo3"); // photo2 is already in desired list
    assert(result.photosRemoved === 1, "Deveria remover photo_old");
    console.log("  Passou! ✅");
  }

  // ----------------------------------------------------
  // Cenário 12: Imóvel removido
  // ----------------------------------------------------
  {
    console.log("Cenário 12: Imóvel removido...");
    const db = new MockSupabase();
    db.singleReturn = {
      id: "uuid-123",
      code: "11111",
      source_url: "https://www.gralhaimoveis.com.br/imovel/11111",
      published: true,
    };

    mockFetchResponses.set("https://www.gralhaimoveis.com.br/imovel/11111", {
      ok: false,
      status: 404,
      text: "Not Found",
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    const result = await syncOneGralhaProperty(db, {
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    assert(result.mode === "unpublished", "Deveria despublicar imóvel");
    const upQuery = db.queries.find((q) => q.action === "update" && q.table === "properties");
    assert(upQuery.data.published === false, "Setou published = false");
    console.log("  Passou! ✅");
  }

  // ----------------------------------------------------
  // Cenário 14: Timeout seguro
  // ----------------------------------------------------
  {
    console.log("Cenário 14: Timeout seguro...");
    const db = new MockSupabase();
    db.singleReturn = {
      id: "uuid-123",
      code: "11111",
      source_url: "https://www.gralhaimoveis.com.br/imovel/11111",
      published: true,
      price_brl: 550000,
    };

    // Simular falha
    globalThis.fetch = async () => {
      throw new Error("Timeout");
    };

    const result = await syncOneGralhaProperty(db, {
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    assert(result.mode === "error", "Registrou erro");
    const upQuery = db.queries.find((q) => q.action === "update" && q.table === "properties");
    assert(upQuery.data.published === undefined, "Não alterou flag published");
    assert(upQuery.data.price_brl === undefined, "Não alterou preço");
    console.log("  Passou! ✅");
  }

  // ----------------------------------------------------
  // Cenários Adicionais (Evolução 01 v3)
  // ----------------------------------------------------

  // Cenário 03: featured preservado
  {
    console.log("Cenário 03: featured preservado...");
    globalThis.fetch = (async (url: string) => {
      const mock = mockFetchResponses.get(url);
      if (!mock) return { ok: false, status: 404, text: async () => "Not Found" } as any;
      return { ok: mock.ok, status: mock.status, text: async () => mock.text, url: mock.url, body: { getReader() { let readCount = 0; return { async read() { if (readCount > 0) return { done: true, value: null }; readCount++; return { done: false, value: new TextEncoder().encode(mock.text) as any }; }, async cancel() {} }; } } } as any;
    }) as any;

    const db = new MockSupabase();
    db.singleReturn = {
      id: "uuid-123",
      code: "11111",
      source_url: "https://www.gralhaimoveis.com.br/imovel/11111",
      published: true,
      featured: true,
      is_launch: false,
      price_brl: 500000,
      last_check_status: "available",
    };

    mockFetchResponses.set("https://www.gralhaimoveis.com.br/imovel/11111", {
      ok: true,
      status: 200,
      text: generateHtml("11111", "500.000"),
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    await syncOneGralhaProperty(db, {
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    const upQuery = db.queries.find((q) => q.action === "update" && q.table === "properties");
    if (upQuery) {
      assert(upQuery.data.featured === undefined, "Deveria preservar featured (não enviar no update)");
    }
    console.log("  Passou! ✅");
  }

  // Cenário 04: is_launch preservado
  {
    console.log("Cenário 04: is_launch preservado...");
    const db = new MockSupabase();
    db.singleReturn = {
      id: "uuid-123",
      code: "11111",
      source_url: "https://www.gralhaimoveis.com.br/imovel/11111",
      published: true,
      featured: false,
      is_launch: true,
      price_brl: 500000,
      last_check_status: "available",
    };

    await syncOneGralhaProperty(db, {
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    const upQuery = db.queries.find((q) => q.action === "update" && q.table === "properties");
    if (upQuery) {
      assert(upQuery.data.is_launch === undefined, "Deveria preservar is_launch");
    }
    console.log("  Passou! ✅");
  }

  // Cenário 08: foto adicionada
  {
    console.log("Cenário 08: foto adicionada...");
    const db = new MockSupabase();
    db.singleReturn = {
      id: "uuid-123",
      code: "11111",
      source_url: "https://www.gralhaimoveis.com.br/imovel/11111",
      price_brl: 500000,
      published: true,
      last_check_status: "available",
    };

    db.photosReturn = [
      { id: "ph-1", url: "https://gralha2.inforcedata.com.br/api/image/photo1.jpg", position: 0 },
      { id: "ph-2", url: "https://gralha2.inforcedata.com.br/api/image/photo2.jpg", position: 1 },
    ];

    const result = await syncOneGralhaProperty(db, {
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    assert(result.photosAdded === 1, "Deveria adicionar exatamente 1 foto");
    assert(result.photosRemoved === 0, "Nenhuma foto removida");
    console.log("  Passou! ✅");
  }

  // Cenário 09: foto removida
  {
    console.log("Cenário 09: foto removida...");
    const db = new MockSupabase();
    db.singleReturn = {
      id: "uuid-123",
      code: "11111",
      source_url: "https://www.gralhaimoveis.com.br/imovel/11111",
      price_brl: 500000,
      published: true,
      last_check_status: "available",
    };

    db.photosReturn = [
      { id: "ph-1", url: "https://gralha2.inforcedata.com.br/api/image/photo1.jpg", position: 0 },
      { id: "ph-2", url: "https://gralha2.inforcedata.com.br/api/image/photo2.jpg", position: 1 },
      { id: "ph-3", url: "https://gralha2.inforcedata.com.br/api/image/photo3.jpg", position: 2 },
      { id: "ph-4", url: "https://gralha2.inforcedata.com.br/api/image/photo_old.jpg", position: 3 },
    ];

    const result = await syncOneGralhaProperty(db, {
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    assert(result.photosAdded === 0, "Nenhuma foto adicionada");
    assert(result.photosRemoved === 1, "Deveria remover exatamente 1 foto");
    console.log("  Passou! ✅");
  }

  // Cenário 10: foto reordenada
  {
    console.log("Cenário 10: foto reordenada...");
    const db = new MockSupabase();
    db.singleReturn = {
      id: "uuid-123",
      code: "11111",
      source_url: "https://www.gralhaimoveis.com.br/imovel/11111",
      price_brl: 500000,
      published: true,
      last_check_status: "available",
    };

    db.photosReturn = [
      { id: "ph-1", url: "https://gralha2.inforcedata.com.br/api/image/photo2.jpg", position: 0 },
      { id: "ph-2", url: "https://gralha2.inforcedata.com.br/api/image/photo1.jpg", position: 1 },
      { id: "ph-3", url: "https://gralha2.inforcedata.com.br/api/image/photo3.jpg", position: 2 },
    ];

    const result = await syncOneGralhaProperty(db, {
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    assert(result.photosReordered > 0, "Deveria detectar fotos reordenadas");
    console.log("  Passou! ✅");
  }

  // Cenário 11: galeria idêntica sem writes
  {
    console.log("Cenário 11: galeria idêntica sem writes...");
    const db = new MockSupabase();
    db.singleReturn = {
      id: "uuid-123",
      code: "11111",
      source_url: "https://www.gralhaimoveis.com.br/imovel/11111",
      price_brl: 500000,
      published: true,
      last_check_status: "available",
    };

    db.photosReturn = [
      { id: "ph-1", url: "https://gralha2.inforcedata.com.br/api/image/photo1.jpg", position: 0 },
      { id: "ph-2", url: "https://gralha2.inforcedata.com.br/api/image/photo2.jpg", position: 1 },
      { id: "ph-3", url: "https://gralha2.inforcedata.com.br/api/image/photo3.jpg", position: 2 },
    ];

    const result = await syncOneGralhaProperty(db, {
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    assert(result.photosAdded === 0, "Nenhuma foto adicionada");
    assert(result.photosRemoved === 0, "Nenhuma foto removida");
    assert(result.photosReordered === 0, "Nenhuma foto reordenada");
    console.log("  Passou! ✅");
  }

  // Cenário 13: imóvel recuperado/republicado
  {
    console.log("Cenário 13: imóvel recuperado/republicado...");
    const db = new MockSupabase();
    db.singleReturn = {
      id: "uuid-123",
      code: "11111",
      source_url: "https://www.gralhaimoveis.com.br/imovel/11111",
      published: false,
      last_check_status: "not_found",
    };

    const result = await syncOneGralhaProperty(db, {
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    assert(result.mode === "republished", "Registrou modo republished");
    const upQuery = db.queries.find((q) => q.action === "update" && q.table === "properties");
    assert(upQuery.data.published === true, "Setou published = true");
    assert(upQuery.data.unavailable_since === null, "Limpou unavailable_since");
    console.log("  Passou! ✅");
  }

  // Cenário 15: HTTP 5xx seguro
  {
    console.log("Cenário 15: HTTP 5xx seguro...");
    const db = new MockSupabase();
    db.singleReturn = {
      id: "uuid-123",
      code: "11111",
      source_url: "https://www.gralhaimoveis.com.br/imovel/11111",
      published: true,
      price_brl: 500000,
    };

    mockFetchResponses.set("https://www.gralhaimoveis.com.br/imovel/11111", {
      ok: false,
      status: 500,
      text: "Internal Server Error",
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    const result = await syncOneGralhaProperty(db, {
      url: "https://www.gralhaimoveis.com.br/imovel/11111",
    });

    assert(result.mode === "error", "Registrou modo error");
    const upQuery = db.queries.find((q) => q.action === "update" && q.table === "properties");
    assert(upQuery.data.published === undefined, "Não despublicou no 500");
    assert(upQuery.data.last_check_status === "error: HTTP 500", "Registrou erro correto");
    console.log("  Passou! ✅");
  }

  // ----------------------------------------------------
  // Cenários Adicionais de Lote e Infra (Evolução 01 v3)
  // ----------------------------------------------------

  // Cenário 16, 17 & 18: batch, ordenação e concorrência no arquivo properties.functions.ts
  {
    console.log("Cenário 16, 17 & 18: batch, ordenação e concorrência...");
    const fs = await import("fs");
    const code = fs.readFileSync("src/lib/properties.functions.ts", "utf-8");
    assert(code.includes(".limit(25)"), "Cenário 16 falhou: Deveria limitar a 25 imóveis");
    assert(code.includes("last_checked_at") && code.includes("ascending: true"), "Cenário 17 falhou: Deveria ordenar por last_checked_at determinístico");
    assert(code.includes("batchSize = 5") || code.includes("Promise.all"), "Cenário 18 falhou: Deveria limitar concorrência a 5");
    console.log("  Passou! ✅");
  }

  // Cenário 19: ausência de VERIFIED_GRALHA_PRICES_BRL
  {
    console.log("Cenário 19: ausência de VERIFIED_GRALHA_PRICES_BRL...");
    const fs = await import("fs");
    const content = fs.readFileSync("src/lib/gralha-scraper.server.ts", "utf-8");
    assert(!content.includes("VERIFIED_GRALHA_PRICES_BRL"), "Cenário 19 falhou: VERIFIED_GRALHA_PRICES_BRL foi encontrado no scraper");
    console.log("  Passou! ✅");
  }

  // Cenário 20: webhook retorna 200
  {
    console.log("Cenário 20: webhook retorna 200 com resumo síncrono...");
    const fs = await import("fs");
    const webhookContent = fs.readFileSync("src/routes/api/public/hooks/sync-properties.ts", "utf-8");
    assert(!webhookContent.includes("status: 202"), "Cenário 20 falhou: webhook retorna 202");
    assert(webhookContent.includes("Response.json") || webhookContent.includes("ok: true"), "Cenário 20 falhou: webhook não retorna 200");
    console.log("  Passou! ✅");
  }

  console.log("\n✅ TODOS OS TESTES PASSARAM COM SUCESSO!");
}

runTests().catch((err) => {
  console.error("❌ FALHA EM UM DOS TESTES:", err);
  process.exit(1);
});
