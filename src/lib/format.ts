/**
 * Formata valor numérico como moeda BRL.
 * Retorna "Sob consulta" para valores nulos.
 */
export function brl(n: number | null | undefined): string {
  if (n == null) return "Sob consulta";
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}
