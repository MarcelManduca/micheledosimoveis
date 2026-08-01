import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminListDevelopmentUnits,
  adminSearchPropertiesForLaunch,
  adminLinkPropertyToDevelopment,
  adminUnlinkDevelopmentUnit,
} from "@/lib/launches.functions";

const PAGE_SIZE = 20;

export function DevelopmentUnitsManager({
  developmentId,
  developmentName,
  onClose,
}: {
  developmentId: string;
  developmentName: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [term, setTerm] = useState("");
  const [activeTerm, setActiveTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const units = useQuery({
    queryKey: ["admin-development-units", developmentId, page],
    queryFn: () =>
      adminListDevelopmentUnits({
        data: { development_id: developmentId, page, page_size: PAGE_SIZE },
      }),
  });

  const results = useQuery({
    queryKey: ["admin-launch-property-search", activeTerm],
    queryFn: () => adminSearchPropertiesForLaunch({ data: { query: activeTerm, limit: 20 } }),
    enabled: activeTerm.trim().length > 1,
  });

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-development-units", developmentId] });
    await qc.invalidateQueries({ queryKey: ["admin-developments"] });
  }

  async function link(propertyId: string) {
    setBusy(true);
    setError(null);
    try {
      await adminLinkPropertyToDevelopment({
        data: { development_id: developmentId, property_id: propertyId },
      });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível vincular o imóvel.");
    } finally {
      setBusy(false);
    }
  }

  async function unlink(id: string) {
    if (!confirm("Remover este vínculo? O imóvel original não é alterado.")) return;
    setBusy(true);
    try {
      await adminUnlinkDevelopmentUnit({ data: { id } });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const total = units.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const linkedIds = new Set((units.data?.units ?? []).map((u) => u.property_id));

  return (
    <section className="rounded-lg border p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Unidades de {developmentName}</h2>
          <p className="text-xs text-muted-foreground">
            {total} unidade(s) relacionada(s) · o anúncio original nunca é alterado
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Fechar
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          className="max-w-sm"
          placeholder="Buscar imóvel por código, título ou bairro"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setActiveTerm(term);
          }}
        />
        <Button type="button" variant="outline" onClick={() => setActiveTerm(term)}>
          Buscar
        </Button>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      {activeTerm.trim().length > 1 ? (
        <div className="mt-4 rounded-md border">
          {results.isLoading ? (
            <p className="p-4 text-sm text-muted-foreground">Buscando…</p>
          ) : (results.data ?? []).length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Nenhum imóvel encontrado.</p>
          ) : (
            <ul className="divide-y">
              {(results.data ?? []).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div>
                    <p className="font-medium">
                      {p.code} — {p.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.neighborhood ?? "sem bairro"}
                      {p.condo_name ? ` · ${p.condo_name}` : ""}
                      {p.published ? "" : " · não publicado"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={busy || linkedIds.has(p.id)}
                    onClick={() => link(p.id)}
                  >
                    {linkedIds.has(p.id) ? "Vinculado" : "Vincular"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <div className="mt-6 rounded-md border">
        {units.isLoading ? (
          <p className="p-4 text-sm text-muted-foreground">Carregando unidades…</p>
        ) : (units.data?.units ?? []).length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Nenhuma unidade relacionada.</p>
        ) : (
          <ul className="divide-y">
            {(units.data?.units ?? []).map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                <div>
                  <p className="font-medium">
                    {u.property ? `${u.property.code} — ${u.property.title}` : (u.unit_name ?? "Unidade")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {u.property?.neighborhood ?? "—"}
                    {u.area_m2 ? ` · ${u.area_m2} m²` : ""}
                    {u.bedrooms ? ` · ${u.bedrooms} dorm.` : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => unlink(u.id)}
                >
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pages > 1 ? (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-muted-foreground">
            Página {page} de {pages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      ) : null}
    </section>
  );
}
