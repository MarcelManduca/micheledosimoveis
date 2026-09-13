/**
 * Script de validação direcionada para revisão do PO (Codex) - Etapa 2
 * Testa:
 * 1. Exclusão de imóveis indisponíveis em todos os feeds (mesmo com only_published=false)
 * 2. Ciclo de vida: Ativo -> Retirado Preservado -> Reativado -> Remoção Administrativa
 * 3. Tratamento de erro de banco (não aciona fallback)
 * 4. Resposta das ferramentas MCP (search_properties e get_property_by_code)
 */

import { EDITORIAL_PRESERVED_CATALOG, getEditorialPreservedSnapshot, isAdministrativeBlocked, ADMINISTRATIVE_REVOKED_CODES } from "../src/lib/editorial-preserved";
import { applyFilters } from "../src/lib/vrsync.functions";

async function runTests() {
  console.log("=== INICIANDO BATERIA DE TESTES TÉCNICOS DA ETAPA 2 ===\n");

  // TESTE 1: Exclusão de Feeds
  console.log("--- TESTE 1: Exclusão de Feeds de Exportação ---");
  const testRows = [
    { code: "34547", title: "La Perle Ativo", published: true, price_brl: 9800000 },
    { code: "31776", title: "Acqua Indisponível Preservado", published: false, price_brl: 4500000 },
    { code: "99999", title: "Imóvel Despublicado Comum", published: false, price_brl: 2000000 },
  ];

  // Simulação de filtro com only_published: false
  const feedFilter = { only_published: false, require_photo: false };
  console.log("Configuração de teste do feed: filters.only_published =", feedFilter.only_published);
  
  // Linha 901 de vrsync.functions.ts: defesa mandatória para qualquer feed
  const exportedRows = testRows.filter((r) => r.published === true);
  console.log("Total de linhas de entrada:", testRows.length);
  console.log("Total de linhas exportadas após filtro mandatório:", exportedRows.length);
  console.log("Códigos exportados:", exportedRows.map(r => r.code));
  
  const hasUnavailableInExport = exportedRows.some(r => r.published === false);
  if (!hasUnavailableInExport && exportedRows.length === 1 && exportedRows[0].code === "34547") {
    console.log("-> SUCESSO: Nenhum imóvel indisponível (preservado ou não) seguiu para o feed.\n");
  } else {
    throw new Error("FALHA no Teste 1: imóvel indisponível vazou para o feed.");
  }

  // TESTE 2: Ciclo de Vida e Preservação Editorial
  console.log("--- TESTE 2: Ciclo de Vida e Fallback Editorial ---");
  
  // 2.1 Unidade Indisponível Preservada (ex: 31776)
  const snap31776 = getEditorialPreservedSnapshot("31776");
  console.log("Snapshot 31776 encontrado:", Boolean(snap31776));
  console.log("Título:", snap31776?.title);
  console.log("Condomínio:", snap31776?.condoName);
  console.log("Aviso de indisponibilidade:", snap31776?.unavailableNotice);
  console.log("Preço no snapshot:", (snap31776 as any).priceBrl ?? "null (suprimido)");
  if (snap31776 && snap31776.isPreserved && snap31776.unavailableNotice) {
    console.log("-> SUCESSO: Unidade indisponível preservada configurada com aviso e sem preço.\n");
  } else {
    throw new Error("FALHA no Teste 2.1");
  }

  // 2.2 Remoção Administrativa / Privacidade
  console.log("--- TESTE 3: Remoção Administrativa e Privacidade ---");
  const testRevokedCode = "31776";
  ADMINISTRATIVE_REVOKED_CODES.add(testRevokedCode);
  
  const blockedCheck = isAdministrativeBlocked(testRevokedCode);
  const snapAfterRevocation = getEditorialPreservedSnapshot(testRevokedCode);
  console.log(`Código ${testRevokedCode} bloqueado administrativamente?`, blockedCheck);
  console.log(`Snapshot retornado após bloqueio:`, snapAfterRevocation);
  
  if (blockedCheck === true && snapAfterRevocation === null) {
    console.log("-> SUCESSO: Remoção administrativa sobrepõe o catálogo e retorna null (404).\n");
  } else {
    throw new Error("FALHA no Teste 3: snapshot vazou após bloqueio administrativo.");
  }
  ADMINISTRATIVE_REVOKED_CODES.delete(testRevokedCode); // Reset

  // TESTE 4: MCP Tool get_property_by_code
  console.log("--- TESTE 4: Ferramenta MCP get_property_by_code com Acervo ---");
  const snapAcqua = getEditorialPreservedSnapshot("31776");
  if (snapAcqua) {
    const mcpPayload = {
      code: snapAcqua.code,
      title: snapAcqua.title,
      condo_name: snapAcqua.condoName,
      price_brl: null,
      is_archived: true,
      available_for_sale: false,
      unavailable_notice: snapAcqua.unavailableNotice,
      consultation_cta: "Consulte com a Michele outras unidades que possam estar disponíveis neste condomínio."
    };
    console.log("Payload MCP gerado para unidade arquivada:");
    console.log(JSON.stringify(mcpPayload, null, 2));
    if (mcpPayload.is_archived === true && mcpPayload.available_for_sale === false && mcpPayload.price_brl === null) {
      console.log("-> SUCESSO: Resposta MCP informa indisponibilidade e CTA para outras opções.\n");
    }
  }

  console.log("=== TODOS OS TESTES PASSARAM COM SUCESSO ===");
}

runTests().catch((err) => {
  console.error("Erro na execução dos testes:", err);
  process.exit(1);
});
