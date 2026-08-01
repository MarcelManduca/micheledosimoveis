import { type DevelopmentRow, scoreDevelopment } from "@/lib/launches-shared";

/**
 * Critério ÚNICO de publicação da vertical de LANÇAMENTOS (Sprint 4).
 * Usado tanto no gate do admin (ao publicar) quanto na exposição pública.
 * Módulo puro: sem I/O, seguro no cliente e no servidor.
 */

/** Score mínimo editorial para publicação/exposição pública. */
export const PUBLICATION_MIN_SCORE = 70;
/** Tamanho mínimo de descrição para "conteúdo editorial robusto". */
export const PUBLICATION_MIN_DESCRIPTION = 200;

function filled(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined && String(value).trim() !== "";
}

/**
 * Retorna a lista de bloqueios que impedem a publicação.
 * Lista vazia = apto a publicar.
 */
export function publicationBlockers(row: DevelopmentRow, unitsCount: number): string[] {
  const blockers: string[] = [];
  const { score } = scoreDevelopment(row, unitsCount);

  if (score < PUBLICATION_MIN_SCORE) {
    blockers.push(`Score ${score} abaixo do mínimo de ${PUBLICATION_MIN_SCORE}.`);
  }
  if (!filled(row.cover_image) && !filled(row.gallery)) {
    blockers.push("Sem imagem principal.");
  }
  if (!filled(row.description)) blockers.push("Sem descrição.");
  if (!filled(row.neighborhood)) blockers.push("Sem bairro.");
  if (!filled(row.developer_id)) blockers.push("Sem construtora.");
  if (!filled(row.stage)) blockers.push("Sem estágio da obra.");
  if (!filled(row.seo_title) || !filled(row.seo_description)) {
    blockers.push("SEO title/description incompletos.");
  }
  if (!filled(row.slug)) blockers.push("Sem slug.");

  const editorial = (row.description ?? "").trim().length >= PUBLICATION_MIN_DESCRIPTION;
  if (unitsCount < 1 && !editorial) {
    blockers.push("Sem unidade relacionada e sem conteúdo editorial robusto.");
  }
  return blockers;
}

export function canPublish(row: DevelopmentRow, unitsCount: number): boolean {
  return publicationBlockers(row, unitsCount).length === 0;
}
