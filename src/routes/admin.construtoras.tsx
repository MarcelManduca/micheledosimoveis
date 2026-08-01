import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LaunchesAdminGate } from "@/components/admin/LaunchesAdminGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminListDevelopers,
  adminSaveDeveloper,
  adminDeleteDeveloper,
  slugifyLaunch,
  type DeveloperRow,
} from "@/lib/launches.functions";

export const Route = createFileRoute("/admin/construtoras")({
  component: ConstrutorasAdminPage,
});

type Form = {
  id: string | null;
  name: string;
  slug: string;
  website: string;
  phone: string;
  email: string;
  city: string;
  description: string;
  is_active: boolean;
};

const EMPTY: Form = {
  id: null,
  name: "",
  slug: "",
  website: "",
  phone: "",
  email: "",
  city: "",
  description: "",
  is_active: false,
};

function ConstrutorasAdminPage() {
  return (
    <LaunchesAdminGate title="Construtoras">
      <ConstrutorasCrud />
    </LaunchesAdminGate>
  );
}

function ConstrutorasCrud() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ["admin-developers"],
    queryFn: () => adminListDevelopers(),
  });

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await adminSaveDeveloper({
        data: {
          id: form.id,
          name: form.name,
          slug: slugifyLaunch(form.slug || form.name),
          website: form.website || null,
          phone: form.phone || null,
          email: form.email || null,
          city: form.city || null,
          description: form.description || null,
          is_active: form.is_active,
        },
      });
      setForm(EMPTY);
      await qc.invalidateQueries({ queryKey: ["admin-developers"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: DeveloperRow) {
    if (!confirm(`Excluir a construtora "${row.name}"?`)) return;
    await adminDeleteDeveloper({ data: { id: row.id } });
    await qc.invalidateQueries({ queryKey: ["admin-developers"] });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border p-5">
        <h2 className="mb-4 text-lg font-medium">
          {form.id ? "Editar construtora" : "Nova construtora"}
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
          <Input
            placeholder="Site"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
          <Input
            placeholder="Telefone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            placeholder="E-mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            placeholder="Cidade"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
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
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Ativa (visível publicamente)
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
          <p className="p-5 text-sm text-muted-foreground">Nenhuma construtora cadastrada.</p>
        ) : (
          <ul className="divide-y">
            {(list.data ?? []).map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-muted-foreground">
                    /{row.slug} · {row.is_active ? "ativa" : "inativa"}
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
                        website: row.website ?? "",
                        phone: row.phone ?? "",
                        email: row.email ?? "",
                        city: row.city ?? "",
                        description: row.description ?? "",
                        is_active: row.is_active,
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
