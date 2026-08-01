/**
 * Feature flags do projeto.
 *
 * Aditivo: nenhuma flag existente é alterada aqui.
 * A vertical de lançamentos nasce DESATIVADA por padrão.
 * Para habilitar em preview/produção, defina VITE_ENABLE_LAUNCHES_VERTICAL="true".
 */
function readFlag(value: unknown): boolean {
  return String(value ?? "").toLowerCase() === "true";
}

// Contenção de produção: vertical desativada até nova homologação manual.
// Não reativar por variável de ambiente sem aprovação explícita.
export const ENABLE_LAUNCHES_VERTICAL: boolean = false;
