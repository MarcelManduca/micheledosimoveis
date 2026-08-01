import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LaunchesAdminGate } from "@/components/admin/LaunchesAdminGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminListDevelopers,
  adminListDevelopments,
  adminSaveDevelopment,
  adminDeleteDevelopment,
  slugifyLaunch,
  type DevelopmentRow,
} from "@/lib/launches.functions";

export const Route = createFileRoute("/admin/lancamentos")({
  component: LancamentosAdminPage,
});

type Form = {
  id: string | null;
  name: string;
  slug: string;
  developer_id: string;
  stage: string;
  address: string;
  neighborhood: string;
  city: string;
  delivery_estimate: string;
  price_min: string;
  price_max: string;
  description: string;
  is_published: boolean;
};

const EMPTY: Form = {
  id: null,
  name: "",
  slug: "",
  developer_id: "",
  stage: "lancamento",
  address: "",
  neighborhood: "",
  city: "Florianópolis",
  delivery_estimate: "",
  price_min: "",
  price_max: "",
  description: "",
  is_published: false,
};

function toNumber(value: string): number | null {
  const n = Number(value.replace(/[^\d.,-]/g, "").replace(",", "."));
  return value.trim() === "" || Number.isNaN(n) ? null : n;
}

function LancamentosAdminPage() {
  return (
    <LaunchesAdminGate title="Lançamentos">
      <LancamentosCrud />
    </LaunchesAdminGate>
  );
}

function LancamentosCrud() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const developers = useQuery({
    queryKey: ["admin-developers"],
    queryFn: () => adminListDevelopers(),
  });
  const list = useQuery({
    queryKey: ["admin-developments"],
    queryFn: () => adminListDevelopments(),
  });

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await adminSaveDevelopment({
        data: {
          id: form.id,
          name: form.name,
          slug: slugifyLaunch(form.slug || form.name),
          developer_id: form.developer_id || null,
          stage: form.stage || "lancamento",
          address: form.address || null,
          neighborhood: form.neighborhood || null,
          city: form.city || "Florianópolis",
          state: "SC",
          delivery_estimate: form.delivery_estimate || null,
          price_min_brl: toNumber(form.price_min),
          price_max_brl: toNumber(form.price_max),
          description: form.description || null,
          is_published: form.is_published,
        },
      });
      setForm(EMPTY);
      await qc.invalidateQueries({ queryKey: ["admin-developments"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: DevelopmentRow) {
    if (!confirm(`Excluir o lançamento "${row.name}"?`)) return;
    await adminDeleteDevelopment({ data: { id: row.id } });
    await qc.invalidateQueries({ queryKey: ["admin-developments"] });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border p-5">
        <h2 className="mb-4 text-lg font-medium">
          {form.id ? "Editar lançamento" : "Novo lançamento"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder="Slug (opcional)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <select
            className="rounded-md border bg-background p-2 text-sm"
            value={form.developer_id}
            onChange={(e) => setForm({ ...form, developer_id: e.target.value })}
          >
            <option value="">Sem construtora</option>
            {(developers.data ?? []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border bg-background p-2 text-sm"
            value={form.stage}
            onChange={(e) => setForm({ ...form, stage: e.target.value })}
          >
            <option value="lancamento">Lançamento</option>
            <option value="em_obras">Em obras</option>
            <option value="pronto">Pronto para morar</option>
          </select>
          <Input
            placeholder="Endereço"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <Input
            placeholder="Bairro"
            value={form.neighborhood}
            onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
          />
          <Input
            placeholder="Cidade"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <Input
            placeholder="Previsão de entrega (ex.: 2027)"
            value={form.delivery_estimate}
            onChange={(e) => setForm({ ...form, delivery_estimate: e.target.value })}
          />
          <Input
            placeholder="Preço mínimo (R$)"
            value={form.price_min}
            onChange={(e) => setForm({ ...form, price_min: e.target.value })}
          />
          <Input
            placeholder="Preço máximo (R$)"
            value={form.price_max}
            onChange={(e) => setForm({ ...form, price_max: e.target.value })}
          />
          <textarea
            className="min-h-24 rounded-md border bg-background p-3 text-sm sm:col-span-2"
            placeholder="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            />
            Publicado
          </label>
        </div>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <div className="mt-4 flex gap-2">
          <Button type="button" onClick={save} disabled={saving || !form.name.trim()}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
          {form.id ? (
            <Button type="button" variant="outline" onClick={() => setForm(EMPTY)}>
              Cancelar
            </Button>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border">
        {list.isLoading ? (
          <p className="p-5 text-sm text-muted-foreground">Carregando…</p>
        ) : (list.data ?? []).length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">Nenhum lançamento cadastrado.</p>
        ) : (
          <ul className="divide-y">
            {(list.data ?? []).map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-muted-foreground">
                    /{row.slug} · {row.neighborhood ?? "sem bairro"} ·{" "}
                    {row.is_published ? "publicado" : "rascunho"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setForm({
                        id: row.id,
                        name: row.name,
                        slug: row.slug,
                        developer_id: row.developer_id ?? "",
                        stage: row.stage,
                        address: row.address ?? "",
                        neighborhood: row.neighborhood ?? "",
                        city: row.city,
                        delivery_estimate: row.delivery_estimate ?? "",
                        price_min: row.price_min_brl ? String(row.price_min_brl) : "",
                        price_max: row.price_max_brl ? String(row.price_max_brl) : "",
                        description: row.description ?? "",
                        is_published: row.is_published,
                      })
                    }
                  >
                    Editar
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(row)}>
                    Excluir
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
