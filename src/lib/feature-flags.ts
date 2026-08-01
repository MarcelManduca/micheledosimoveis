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

export const ENABLE_LAUNCHES_VERTICAL: boolean = readFlag(
  import.meta.env["VITE_ENABLE_LAUNCHES_VERTICAL"],
);
