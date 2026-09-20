import assert from 'node:assert';

const BASE_URL = process.env.TEST_APP_URL || 'http://127.0.0.1:3030';
const BACKEND_URL = process.env.TEST_BACKEND_URL || 'http://127.0.0.1:3001';

const LOCAL_ANON_TOKEN = process.env.LOCAL_ANON_JWT || '';
const LOCAL_SERVICE_TOKEN = process.env.LOCAL_SERVICE_JWT || '';

async function testBackendSecurityAndRls() {
  console.log('=== TESTE 1: Segurança do Backend, Rejeição de Inválidos e RLS ===');

  // 1.1 Rejeição de credencial malformada / inválida
  const resInvalid = await fetch(`${BACKEND_URL}/rest/v1/properties`, {
    headers: { 'Authorization': 'Bearer invalid-malformed-token' }
  });
  assert.strictEqual(resInvalid.status, 401, 'Credencial inválida DEVE retornar HTTP 401');
  const errBody = await resInvalid.json();
  assert(errBody.code === 'PGRST301' || errBody.message?.includes('JWT'), 'PostgREST deve rejeitar token inválido');
  console.log('  [PASS] Credencial inválida rejeitada com HTTP 401 Unauthorized');

  // 1.2 RLS para role pública ANON em editorial_preserved_properties
  if (LOCAL_ANON_TOKEN) {
    const resAnon = await fetch(`${BACKEND_URL}/rest/v1/editorial_preserved_properties`, {
      headers: { 'Authorization': `Bearer ${LOCAL_ANON_TOKEN}` }
    });
    assert.strictEqual(resAnon.status, 200, 'Consulta com role anon deve retornar HTTP 200');
    const dataAnon = await resAnon.json();
    const anonCodes = dataAnon.map(d => d.code);
    assert(anonCodes.includes('31776'), 'Role anon deve visualizar o imóvel preservado 31776');
    assert(!anonCodes.includes('BLOCKED-ADMIN-999'), 'Role anon NÃO DEVE visualizar o imóvel bloqueado');
    console.log('  [PASS] RLS filtra imóvel bloqueado administrativamente para role anônima');
  }

  // 1.3 RLS para role administrativa SERVICE_ROLE em editorial_preserved_properties
  if (LOCAL_SERVICE_TOKEN) {
    const resAdmin = await fetch(`${BACKEND_URL}/rest/v1/editorial_preserved_properties`, {
      headers: { 'Authorization': `Bearer ${LOCAL_SERVICE_TOKEN}` }
    });
    assert.strictEqual(resAdmin.status, 200, 'Consulta com service_role deve retornar HTTP 200');
    const dataAdmin = await resAdmin.json();
    const adminCodes = dataAdmin.map(d => d.code);
    assert(adminCodes.includes('31776') && adminCodes.includes('BLOCKED-ADMIN-999'), 'Service role possui acesso de manutenção/bypass RLS');
    console.log('  [PASS] Service role acessa ambos os registros para auditoria e manutenção');
  }

  // 1.4 RLS para role pública ANON em properties
  if (LOCAL_ANON_TOKEN) {
    const resAnonProp = await fetch(`${BACKEND_URL}/rest/v1/properties`, {
      headers: { 'Authorization': `Bearer ${LOCAL_ANON_TOKEN}` }
    });
    assert.strictEqual(resAnonProp.status, 200);
    const dataAnonProp = await resAnonProp.json();
    const propCodes = dataAnonProp.map(p => p.code);
    assert(propCodes.includes('34547'), 'Role anon deve visualizar imóvel publicado 34547');
    assert(!propCodes.includes('UNPUB-101'), 'Role anon NÃO DEVE visualizar imóvel rascunho UNPUB-101');
    console.log('  [PASS] RLS filtra imóvel não-publicado (rascunho) para role anônima');
  }
}

async function testNitroHtmlPreserved() {
  console.log('\n=== TESTE 2: HTML da Página Preservada (/imovel/31776) ===');
  const res = await fetch(`${BASE_URL}/imovel/31776`);
  assert.strictEqual(res.status, 200, 'HTTP status deve ser 200');
  const html = await res.text();

  assert(
    html.includes('Esta unidade não está disponível para venda no momento') ||
    html.includes('Imóvel indisponível') ||
    html.includes('indisponível'),
    'HTML deve conter aviso explícito de indisponibilidade'
  );
  console.log('  [PASS] Aviso de indisponibilidade presente no HTML');

  assert(
    html.includes('/blog/condominios-luxo-beira-mar-norte-agronomica') &&
    html.includes('condominio-reserva-imperial'),
    'HTML deve conter links contextuais do condomínio e artigo editorial'
  );
  console.log('  [PASS] CTA contextual e links editoriais presentes no HTML');

  assert(
    html.includes('price_brl:null') || html.includes('"price_brl":null'),
    'price_brl do imóvel 31776 deve ser nulo no manifesto SSR'
  );
  
  const jsonLdBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  const productSchema = jsonLdBlocks.find(s => Array.isArray(s['@type']) && s['@type'].includes('Product'));
  assert(productSchema, 'Schema.org do imóvel deve estar presente');
  assert.strictEqual(productSchema.offers, undefined, 'Imóvel indisponível NÃO deve conter o bloco offers');
  assert(productSchema.description.includes('Esta unidade não está disponível'), 'Descrição do schema deve indicar indisponibilidade');
  console.log('  [PASS] Ausência de oferta/preço ativo confirmada no schema e SSR');
}

async function testNitroHtmlBlocked() {
  console.log('\n=== TESTE 3: Rota Pública com Imóvel Bloqueado (/imovel/BLOCKED-ADMIN-999) ===');
  const res = await fetch(`${BASE_URL}/imovel/BLOCKED-ADMIN-999`);
  
  assert.strictEqual(res.status, 404, `Status HTTP esperado é 404, recebido: ${res.status}`);
  console.log(`  [PASS] Status HTTP 404 verificado com sucesso (${res.status})`);
  
  const html = await res.text();
  assert(html.trim().length > 0, 'Resposta não pode ser vazia');

  assert(
    html.includes('Imóvel não encontrado') ||
    html.includes('O link pode ter expirado ou o imóvel foi removido'),
    'HTML deve renderizar o componente explícito de Imóvel não encontrado'
  );
  assert(
    html.includes('s:"notFound"') || html.includes('isNotFound:!0'),
    'Manifesto SSR deve indicar status notFound para a rota'
  );
  console.log('  [PASS] Componente e status de imóvel não encontrado validados');

  const forbiddenTerms = [
    'Cobertura Exclusiva Bloqueada',
    '2500000',
    '2.500.000',
    'Piscina Privativa'
  ];
  for (const term of forbiddenTerms) {
    assert(!html.includes(term), `HTML NÃO PODE conter dado comercial: "${term}"`);
  }
  console.log('  [PASS] Ausência total de dados comerciais da fixture bloqueada');
}

async function testMcpSearchProperties() {
  console.log('\n=== TESTE 4: MCP Tool search_properties ===');
  const res = await fetch(`${BASE_URL}/.mcp/invoke-tool/search_properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  assert.strictEqual(res.status, 200, 'MCP search_properties deve retornar HTTP 200');
  const body = await res.json();
  assert.strictEqual(body.isError, undefined, 'Não deve retornar isError técnico');

  const text = body.content?.[0]?.text || '[]';
  const properties = Array.isArray(JSON.parse(text)) ? JSON.parse(text) : (body.structuredContent?.properties || []);

  const codes = properties.map(p => p.code);
  assert(codes.includes('34547'), 'Deve incluir o imóvel ativo 34547');
  assert(!codes.includes('UNPUB-101'), 'NÃO deve incluir o imóvel rascunho UNPUB-101');
  assert(!codes.includes('BLOCKED-ADMIN-999'), 'NÃO deve incluir o imóvel bloqueado BLOCKED-ADMIN-999');
  console.log('  [PASS] search_properties filtra rigorosamente não-publicados e bloqueados');
}

async function testMcpGetPropertyByCode() {
  console.log('\n=== TESTE 5: MCP Tool get_property_by_code ===');
  
  // 5.1 Imóvel Ativo (34547)
  const resActive = await fetch(`${BASE_URL}/.mcp/invoke-tool/get_property_by_code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: '34547' })
  });
  assert.strictEqual(resActive.status, 200);
  const bodyActive = await resActive.json();
  assert.strictEqual(bodyActive.isError, undefined, 'Não deve retornar isError');
  const parsedActive = JSON.parse(bodyActive.content?.[0]?.text || '{}');
  assert.strictEqual(parsedActive.code, '34547');
  assert.strictEqual(parsedActive.published, true);
  console.log('  [PASS] Imóvel ativo 34547 retornado com dados públicos e published=true');

  // 5.2 Imóvel Preservado (31776)
  const resPreserved = await fetch(`${BASE_URL}/.mcp/invoke-tool/get_property_by_code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: '31776' })
  });
  assert.strictEqual(resPreserved.status, 200);
  const bodyPreserved = await resPreserved.json();
  assert.strictEqual(bodyPreserved.isError, undefined, 'Não deve retornar isError');
  const parsedPreserved = JSON.parse(bodyPreserved.content?.[0]?.text || '{}');
  assert.strictEqual(parsedPreserved.status, 'unavailable_preserved');
  assert.strictEqual(parsedPreserved.property.code, '31776');
  assert.strictEqual(parsedPreserved.property.price_brl, null, 'Preço de imóvel preservado deve ser null');
  assert.strictEqual(parsedPreserved.property.available_for_sale, false);
  assert.strictEqual(parsedPreserved.property.is_archived, true);
  assert(parsedPreserved.property.unavailable_notice.length > 0, 'Deve conter aviso de indisponibilidade');
  assert.strictEqual(parsedPreserved.property.article_path, '/blog/condominios-luxo-beira-mar-norte-agronomica');
  console.log('  [PASS] Imóvel preservado 31776 retornado com status unavailable_preserved, sem preço, com aviso e CTA');

  // 5.3 Imóvel Bloqueado (BLOCKED-ADMIN-999)
  const resBlocked = await fetch(`${BASE_URL}/.mcp/invoke-tool/get_property_by_code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'BLOCKED-ADMIN-999' })
  });
  assert.strictEqual(resBlocked.status, 200, 'Endpoint MCP deve retornar HTTP 200');
  const bodyBlocked = await resBlocked.json();
  assert.strictEqual(bodyBlocked.isError, undefined, 'isError=true indica erro técnico e deve reprovar');
  assert.strictEqual(
    bodyBlocked.content?.[0]?.text,
    'No published or preserved property with code BLOCKED-ADMIN-999',
    'Handler deve responder com a mensagem específica prevista de imóvel não publicado/preservado'
  );
  const rawBlockedResponse = JSON.stringify(bodyBlocked);
  assert(!rawBlockedResponse.includes('2500000'), 'Resposta não pode conter preço da fixture');
  assert(!rawBlockedResponse.includes('Piscina Privativa'), 'Resposta não pode conter features da fixture');
  assert(!rawBlockedResponse.includes('Cobertura Exclusiva'), 'Resposta não pode conter título da fixture');
  console.log('  [PASS] Imóvel bloqueado: resposta padronizada sem vazamento de dados comerciais e sem erro técnico');

  // 5.4 Imóvel Rascunho / Não Publicado (UNPUB-101)
  const resUnpub = await fetch(`${BASE_URL}/.mcp/invoke-tool/get_property_by_code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'UNPUB-101' })
  });
  assert.strictEqual(resUnpub.status, 200, 'Endpoint MCP deve retornar HTTP 200');
  const bodyUnpub = await resUnpub.json();
  assert.strictEqual(bodyUnpub.isError, undefined, 'isError=true indica erro técnico e deve reprovar');
  assert.strictEqual(
    bodyUnpub.content?.[0]?.text,
    'No published or preserved property with code UNPUB-101',
    'Handler deve responder com a mensagem específica prevista de imóvel não publicado/preservado'
  );
  const rawUnpubResponse = JSON.stringify(bodyUnpub);
  assert(!rawUnpubResponse.includes('500000'), 'Resposta não pode conter preço da fixture rascunho');
  assert(!rawUnpubResponse.includes('Apartamento Rascunho'), 'Resposta não pode conter título da fixture rascunho');
  console.log('  [PASS] Imóvel não publicado: resposta padronizada sem vazamento de dados comerciais e sem erro técnico');
}

async function runAll() {
  console.log('Iniciando Bateria de Homologação em Ambiente Isolado (RLS Estrito e Validação Completa)...\n');
  await testBackendSecurityAndRls();
  await testNitroHtmlPreserved();
  await testNitroHtmlBlocked();
  await testMcpSearchProperties();
  await testMcpGetPropertyByCode();
  console.log('\n=================================================================================');
  console.log('>>> TODOS OS CRITÉRIOS DE HOMOLOGAÇÃO COM RLS FORAM RIGOROSAMENTE APROVADOS! <<<');
  console.log('=================================================================================');
}

runAll().catch((err) => {
  console.error('\n[FALHA NA HOMOLOGAÇÃO]:', err);
  process.exit(1);
});
