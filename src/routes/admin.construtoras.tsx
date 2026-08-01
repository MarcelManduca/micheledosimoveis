import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LaunchesAdminGate } from "@/components/admin/LaunchesAdminGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminListDevelopers,
  adminSaveDeveloper,
  adminDeleteDeveloper,
} from "@/lib/launches.functions";
import { slugifyLaunch, normalizeLaunchText, type DeveloperListItem } from "@/lib/launches-shared";

export const Route = createFileRoute("/admin/construtoras")({
  component: ConstrutorasAdminPage,
});

type Form = {
  id: string | null;
  name: string;
  slug: string;
  slug_touched: boolean;
  website: string;
  instagram: string;
  phone: string;
  email: string;
  logo_url: string;
  city: string;
  founded_year: string;
  description: string;
  seo_title: string;
  seo_description: string;
  is_active: boolean;
};

const EMPTY: Form = {
  id: null,
  name: "",
  slug: "",
  slug_touched: false,
  website: "",
  instagram: "",
  phone: "",
  email: "",
  logo_url: "",
  city: "",
  founded_year: "",
  description: "",
  seo_title: "",
  seo_description: "",
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const list = useQuery({
    queryKey: ["admin-developers"],
    queryFn: () => adminListDevelopers(),
  });

  const rows = useMemo(() => {
    const term = normalizeLaunchText(search);
    return (list.data ?? []).filter((row) => {
      if (statusFilter === "active" && !row.is_active) return false;
      if (statusFilter === "inactive" && row.is_active) return false;
      if (!term) return true;
      return (
        normalizeLaunchText(row.name).includes(term) ||
        row.slug.includes(slugifyLaunch(search)) ||
        normalizeLaunchText(row.city ?? "").includes(term)
      );
    });
  }, [list.data, search, statusFilter]);

  const previewSlug = slugifyLaunch(form.slug_touched ? form.slug : form.name);

  function update(patch: Partial<Form>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      if (!form.name.trim()) throw new Error("Informe o nome da construtora.");
      if (!previewSlug) throw new Error("Informe um slug válido.");
      const year = form.founded_year.trim() ? Number(form.founded_year.trim()) : null;
      await adminSaveDeveloper({
        data: {
          id: form.id,
          name: form.name.trim(),
          slug: previewSlug,
          website: form.website || null,
          instagram: form.instagram || null,
          phone: form.phone || null,
          email: form.email || null,
          logo_url: form.logo_url || null,
          city: form.city || null,
          founded_year: year !== null && Number.isFinite(year) ? year : null,
          description: form.description || null,
          seo_title: form.seo_title || null,
          seo_description: form.seo_description || null,
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

  async function remove(row: DeveloperListItem) {
    if (!confirm(`Excluir a construtora "${row.name}"?`)) return;
    await adminDeleteDeveloper({ data: { id: row.id } });
    await qc.invalidateQueries({ queryKey: ["admin-developers"] });
  }

  function edit(row: DeveloperListItem) {
    setError(null);
    setForm({
      id: row.id,
      name: row.name,
      slug: row.slug,
      slug_touched: true,
      website: row.website ?? "",
      instagram: row.instagram ?? "",
      phone: row.phone ?? "",
      email: row.email ?? "",
      logo_url: row.logo_url ?? "",
      city: row.city ?? "",
      founded_year: row.founded_year ? String(row.founded_year) : "",
      description: row.description ?? "",
      seo_title: row.seo_title ?? "",
      seo_description: row.seo_description ?? "",
      is_active: row.is_active,
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border p-5">
        <h2 className="mb-4 text-lg font-medium">
          {form.id ? "Editar construtora" : "Nova construtora"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Nome *"
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
          />
          <Input
            placeholder="Slug *"
            value={form.slug_touched ? form.slug : previewSlug}
            onChange={(e) => update({ slug: e.target.value, slug_touched: true })}
          />
          <Input
            placeholder="Site"
            value={form.website}
            onChange={(e) => update({ website: e.target.value })}
          />
          <Input
            placeholder="Instagram (@ ou URL)"
            value={form.instagram}
            onChange={(e) => update({ instagram: e.target.value })}
          />
          <Input
            placeholder="Telefone"
            value={form.phone}
            onChange={(e) => update({ phone: e.target.value })}
          />
          <Input
            placeholder="E-mail"
            value={form.email}
            onChange={(e) => update({ email: e.target.value })}
          />
          <Input
            placeholder="Logo (URL)"
            value={form.logo_url}
            onChange={(e) => update({ logo_url: e.target.value })}
          />
          <Input
            placeholder="Cidade-sede"
            value={form.city}
            onChange={(e) => update({ city: e.target.value })}
          />
          <Input
            placeholder="Ano de fundação"
            inputMode="numeric"
            value={form.founded_year}
            onChange={(e) => update({ founded_year: e.target.value })}
          />
          <Input
            placeholder="SEO title"
            value={form.seo_title}
            onChange={(e) => update({ seo_title: e.target.value })}
          />
          <textarea
            className="min-h-20 rounded-md border bg-background p-3 text-sm sm:col-span-2"
            placeholder="SEO description"
            value={form.seo_description}
            onChange={(e) => update({ seo_description: e.target.value })}
          />
          <textarea
            className="min-h-24 rounded-md border bg-background p-3 text-sm sm:col-span-2"
            placeholder="Descrição"
            value={form.description}
            onChange={(e) => update({ description: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => update({ is_active: e.target.checked })}
            />
            Ativa
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
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <Input
            className="max-w-xs"
            placeholder="Buscar por nome, slug ou cidade"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="rounded-md border bg-background p-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
          </select>
          <span className="text-xs text-muted-foreground">{rows.length} construtora(s)</span>
        </div>

        {list.isLoading ? (
          <p className="p-5 text-sm text-muted-foreground">Carregando…</p>
        ) : rows.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">Nenhuma construtora encontrada.</p>
        ) : (
          <ul className="divide-y">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">
                    {row.name}
                    {row.duplicate_slug ? (
                      <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
                        possível duplicidade
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    /{row.slug} · {row.is_active ? "ativa" : "inativa"} ·{" "}
                    {row.developments_count} lançamento(s)
                    {row.city ? ` · ${row.city}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => edit(row)}>
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
