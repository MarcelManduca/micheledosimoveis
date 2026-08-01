import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  adminDevelopmentSuggestions,
  adminDismissSuggestion,
  adminCreateDraftFromSuggestion,
  adminLinkSuggestionToDevelopment,
} from "@/lib/launches.functions";
import type { DevelopmentListItem } from "@/lib/launches-shared";

export function LaunchSuggestionsPanel({
  developments,
}: {
  developments: DevelopmentListItem[];
}) {
  const qc = useQueryClient();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<Record<string, string>>({});

  const suggestions = useQuery({
    queryKey: ["admin-launch-suggestions"],
    queryFn: () => adminDevelopmentSuggestions({ data: { min_properties: 2 } }),
  });

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-launch-suggestions"] });
    await qc.invalidateQueries({ queryKey: ["admin-developments"] });
  }

  async function run(key: string, fn: () => Promise<unknown>) {
    setBusyKey(key);
    setError(null);
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível concluir a ação.");
    } finally {
      setBusyKey(null);
    }
  }

  const rows = suggestions.data ?? [];

  return (
    <section className="rounded-lg border p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg font-medium">Sugestões de empreendimentos</h2>
        <span className="text-xs text-muted-foreground">{rows.length} sugestão(ões)</span>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Agrupamento assistido a partir dos imóveis existentes. Nenhum registro é criado
        automaticamente e nada é fundido só por nome parecido.
      </p>

      {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}

      {suggestions.isLoading ? (
        <p className="text-sm text-muted-foreground">Analisando base de imóveis…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma sugestão pendente.</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {rows.map((s) => (
            <li key={s.key} className="space-y-2 p-4 text-sm">
              <p className="font-medium">{s.label}</p>
              <ul className="text-xs text-muted-foreground">
                <li>{s.properties_count} imóveis encontrados</li>
                <li>bairro: {s.neighborhoods.join(", ") || "—"}</li>
                <li>endereço predominante: {s.dominant_address ?? "—"}</li>
                <li>possíveis variações de nome: {s.name_variations.join(", ")}</li>
                {s.launch_flagged_count > 0 ? (
                  <li>{s.launch_flagged_count} marcados como lançamento</li>
                ) : null}
                {s.matched_development_id ? <li>possível lançamento já cadastrado</li> : null}
              </ul>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  disabled={busyKey === s.key}
                  onClick={() =>
                    run(s.key, () =>
                      adminCreateDraftFromSuggestion({
                        data: {
                          label: s.label,
                          neighborhood: s.neighborhoods[0] ?? null,
                          address: s.dominant_address,
                          property_ids: s.property_ids,
                        },
                      }),
                    )
                  }
                >
                  Criar rascunho
                </Button>
                <select
                  className="rounded-md border bg-background p-2 text-xs"
                  value={target[s.key] ?? s.matched_development_id ?? ""}
                  onChange={(e) => setTarget((t) => ({ ...t, [s.key]: e.target.value }))}
                >
                  <option value="">Vincular a lançamento…</option>
                  {developments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busyKey === s.key || !(target[s.key] ?? s.matched_development_id)}
                  onClick={() =>
                    run(s.key, () =>
                      adminLinkSuggestionToDevelopment({
                        data: {
                          development_id: (target[s.key] ?? s.matched_development_id) as string,
                          property_ids: s.property_ids,
                        },
                      }),
                    )
                  }
                >
                  Vincular
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busyKey === s.key}
                  onClick={() =>
                    run(s.key, () => adminDismissSuggestion({ data: { key: s.key, label: s.label } }))
                  }
                >
                  Ignorar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
