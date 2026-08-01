import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LaunchesAdminGate } from "@/components/admin/LaunchesAdminGate";
import { DevelopmentUnitsManager } from "@/components/admin/launches/DevelopmentUnitsManager";
import { LaunchSuggestionsPanel } from "@/components/admin/launches/LaunchSuggestionsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminListDevelopers,
  adminListDevelopments,
  adminSaveDevelopment,
  adminDeleteDevelopment,
} from "@/lib/launches.functions";
import { DEVELOPMENT_STAGES } from "@/lib/launches-schemas";
import { slugifyLaunch, normalizeLaunchText, type DevelopmentListItem } from "@/lib/launches-shared";

export const Route = createFileRoute("/admin/lancamentos")({
  component: LancamentosAdminPage,
});

type Filter =
  | "all"
  | "drafts"
  | "published"
  | "no_developer"
  | "no_units"
  | "duplicates"
  | "ready";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "drafts", label: "Drafts" },
  { value: "published", label: "Publicados" },
  { value: "no_developer", label: "Sem construtora" },
  { value: "no_units", label: "Sem unidades" },
  { value: "duplicates", label: "Com duplicidade potencial" },
  { value: "ready", label: "Prontos para publicação" },
];

type Form = {
  id: string | null;
  name: string;
  slug: string;
  slug_touched: boolean;
  developer_id: string;
  stage: string;
  is_published: boolean;
  address: string;
  neighborhood: string;
  city: string;
  latitude: string;
  longitude: string;
  launch_date: string;
  delivery_estimate: string;
  price_min: string;
  price_max: string;
  description: string;
  cover_image: string;
  gallery: string;
  video_url: string;
  brochure_url: string;
  amenities: string;
  architecture: string;
  landscaping: string;
  interiors: string;
  seo_title: string;
  seo_description: string;
};

const EMPTY: Form = {
  id: null,
  name: "",
  slug: "",
  slug_touched: false,
  developer_id: "",
  stage: "launch",
  is_published: false,
  address: "",
  neighborhood: "",
  city: "Florianópolis",
  latitude: "",
  longitude: "",
  launch_date: "",
  delivery_estimate: "",
  price_min: "",
  price_max: "",
  description: "",
  cover_image: "",
  gallery: "",
  video_url: "",
  brochure_url: "",
  amenities: "",
  architecture: "",
  landscaping: "",
  interiors: "",
  seo_title: "",
  seo_description: "",
};

function toNumber(value: string): number | null {
  const cleaned = value.replace(/[^\d.,-]/g, "").replace(",", ".");
  const n = Number(cleaned);
  return cleaned.trim() === "" || Number.isNaN(n) ? null : n;
}

function toList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((v) => v.trim())
    .filter(Boolean);
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
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [unitsFor, setUnitsFor] = useState<DevelopmentListItem | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const developers = useQuery({
    queryKey: ["admin-developers"],
    queryFn: () => adminListDevelopers(),
  });
  const list = useQuery({
    queryKey: ["admin-developments"],
    queryFn: () => adminListDevelopments(),
  });

  const rows = useMemo(() => {
    const term = normalizeLaunchText(search);
    return (list.data ?? []).filter((row) => {
      if (filter === "drafts" && row.is_published) return false;
      if (filter === "published" && !row.is_published) return false;
      if (filter === "no_developer" && row.developer_id) return false;
      if (filter === "no_units" && row.units_count > 0) return false;
      if (filter === "duplicates" && !row.potential_duplicate) return false;
      if (filter === "ready" && !row.ready_to_publish) return false;
      if (!term) return true;
      return (
        normalizeLaunchText(row.name).includes(term) ||
        normalizeLaunchText(row.neighborhood ?? "").includes(term) ||
        row.slug.includes(slugifyLaunch(search))
      );
    });
  }, [list.data, filter, search]);

  const previewSlug = slugifyLaunch(form.slug_touched ? form.slug : form.name);

  function update(patch: Partial<Form>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      if (!form.name.trim()) throw new Error("Informe o nome do lançamento.");
      if (!previewSlug) throw new Error("Informe um slug válido.");
      await adminSaveDevelopment({
        data: {
          id: form.id,
          name: form.name.trim(),
          slug: previewSlug,
          developer_id: form.developer_id || null,
          stage: form.stage || "launch",
          address: form.address || null,
          neighborhood: form.neighborhood || null,
          city: form.city || "Florianópolis",
          state: "SC",
          latitude: toNumber(form.latitude),
          longitude: toNumber(form.longitude),
          launch_date: form.launch_date || null,
          delivery_estimate: form.delivery_estimate || null,
          price_min_brl: toNumber(form.price_min),
          price_max_brl: toNumber(form.price_max),
          description: form.description || null,
          cover_image: form.cover_image || null,
          gallery: toList(form.gallery),
          amenities: toList(form.amenities),
          video_url: form.video_url || null,
          brochure_url: form.brochure_url || null,
          architecture: form.architecture || null,
          landscaping: form.landscaping || null,
          interiors: form.interiors || null,
          seo_title: form.seo_title || null,
          seo_description: form.seo_description || null,
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

  async function remove(row: DevelopmentListItem) {
    if (!confirm(`Excluir o lançamento "${row.name}"?`)) return;
    await adminDeleteDevelopment({ data: { id: row.id } });
    if (unitsFor?.id === row.id) setUnitsFor(null);
    await qc.invalidateQueries({ queryKey: ["admin-developments"] });
  }

  function edit(row: DevelopmentListItem) {
    setError(null);
    setForm({
      id: row.id,
      name: row.name,
      slug: row.slug,
      slug_touched: true,
      developer_id: row.developer_id ?? "",
      stage: row.stage,
      is_published: row.is_published,
      address: row.address ?? "",
      neighborhood: row.neighborhood ?? "",
      city: row.city,
      latitude: row.latitude != null ? String(row.latitude) : "",
      longitude: row.longitude != null ? String(row.longitude) : "",
      launch_date: row.launch_date ?? "",
      delivery_estimate: row.delivery_estimate ?? "",
      price_min: row.price_min_brl != null ? String(row.price_min_brl) : "",
      price_max: row.price_max_brl != null ? String(row.price_max_brl) : "",
      description: row.description ?? "",
      cover_image: row.cover_image ?? "",
      gallery: (row.gallery ?? []).join("\n"),
      video_url: row.video_url ?? "",
      brochure_url: row.brochure_url ?? "",
      amenities: (row.amenities ?? []).join("\n"),
      architecture: row.architecture ?? "",
      landscaping: row.landscaping ?? "",
      interiors: row.interiors ?? "",
      seo_title: row.seo_title ?? "",
      seo_description: row.seo_description ?? "",
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border p-5">
        <h2 className="mb-4 text-lg font-medium">
          {form.id ? "Editar lançamento" : "Novo lançamento"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Nome *" value={form.name} onChange={(e) => update({ name: e.target.value })} />
          <Input
            placeholder="Slug *"
            value={form.slug_touched ? form.slug : previewSlug}
            onChange={(e) => update({ slug: e.target.value, slug_touched: true })}
          />
          <select
            className="rounded-md border bg-background p-2 text-sm"
            value={form.developer_id}
            onChange={(e) => update({ developer_id: e.target.value })}
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
            onChange={(e) => update({ stage: e.target.value })}
          >
            {DEVELOPMENT_STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <Input placeholder="Endereço" value={form.address} onChange={(e) => update({ address: e.target.value })} />
          <Input placeholder="Bairro" value={form.neighborhood} onChange={(e) => update({ neighborhood: e.target.value })} />
          <Input placeholder="Cidade" value={form.city} onChange={(e) => update({ city: e.target.value })} />
          <Input placeholder="Latitude" value={form.latitude} onChange={(e) => update({ latitude: e.target.value })} />
          <Input placeholder="Longitude" value={form.longitude} onChange={(e) => update({ longitude: e.target.value })} />
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Data de lançamento
            <Input type="date" value={form.launch_date} onChange={(e) => update({ launch_date: e.target.value })} />
          </label>
          <Input
            placeholder="Previsão de entrega (ex.: 2027)"
            value={form.delivery_estimate}
            onChange={(e) => update({ delivery_estimate: e.target.value })}
          />
          <Input placeholder="Preço mínimo (R$)" value={form.price_min} onChange={(e) => update({ price_min: e.target.value })} />
          <Input placeholder="Preço máximo (R$)" value={form.price_max} onChange={(e) => update({ price_max: e.target.value })} />
          <Input placeholder="Hero image (URL)" value={form.cover_image} onChange={(e) => update({ cover_image: e.target.value })} />
          <Input placeholder="Vídeo (URL)" value={form.video_url} onChange={(e) => update({ video_url: e.target.value })} />
          <Input placeholder="Book/brochure (URL)" value={form.brochure_url} onChange={(e) => update({ brochure_url: e.target.value })} />
          <textarea
            className="min-h-20 rounded-md border bg-background p-3 text-sm sm:col-span-2"
            placeholder="Galeria (uma URL por linha)"
            value={form.gallery}
            onChange={(e) => update({ gallery: e.target.value })}
          />
          <textarea
            className="min-h-20 rounded-md border bg-background p-3 text-sm sm:col-span-2"
            placeholder="Amenities (um por linha ou separados por vírgula)"
            value={form.amenities}
            onChange={(e) => update({ amenities: e.target.value })}
          />
          <textarea
            className="min-h-20 rounded-md border bg-background p-3 text-sm"
            placeholder="Arquitetura"
            value={form.architecture}
            onChange={(e) => update({ architecture: e.target.value })}
          />
          <textarea
            className="min-h-20 rounded-md border bg-background p-3 text-sm"
            placeholder="Paisagismo"
            value={form.landscaping}
            onChange={(e) => update({ landscaping: e.target.value })}
          />
          <textarea
            className="min-h-20 rounded-md border bg-background p-3 text-sm sm:col-span-2"
            placeholder="Interiores"
            value={form.interiors}
            onChange={(e) => update({ interiors: e.target.value })}
          />
          <Input placeholder="SEO title" value={form.seo_title} onChange={(e) => update({ seo_title: e.target.value })} />
          <textarea
            className="min-h-20 rounded-md border bg-background p-3 text-sm"
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
              checked={form.is_published}
              onChange={(e) => update({ is_published: e.target.checked })}
            />
            Publicado (ativo)
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
        <div className="flex flex-wrap items-center gap-2 border-b p-4">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              type="button"
              size="sm"
              variant={filter === f.value ? "default" : "outline"}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant={showSuggestions ? "default" : "outline"}
            onClick={() => setShowSuggestions((v) => !v)}
          >
            Sugestões detectadas
          </Button>
          <Input
            className="ml-auto max-w-xs"
            placeholder="Buscar por nome, slug ou bairro"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {list.isLoading ? (
          <p className="p-5 text-sm text-muted-foreground">Carregando…</p>
        ) : rows.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">Nenhum lançamento encontrado.</p>
        ) : (
          <ul className="divide-y">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-wrap items-start justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">
                    {row.name}
                    {row.potential_duplicate ? (
                      <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
                        duplicidade potencial
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    /{row.slug} · {row.neighborhood ?? "sem bairro"} ·{" "}
                    {row.is_published ? "publicado" : "rascunho"} · {row.units_count} unidade(s)
                  </p>
                  <p className="mt-1 text-xs">
                    Score {row.quality_score}/100 ·{" "}
                    <span className={row.ready_to_publish ? "text-emerald-700" : "text-amber-700"}>
                      pronto para publicar: {row.ready_to_publish ? "sim" : "não"}
                    </span>
                  </p>
                  {row.quality_issues.length > 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Pendências: {row.quality_issues.join(", ")}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setUnitsFor(row)}>
                    Unidades
                  </Button>
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

      {unitsFor ? (
        <DevelopmentUnitsManager
          key={unitsFor.id}
          developmentId={unitsFor.id}
          developmentName={unitsFor.name}
          onClose={() => setUnitsFor(null)}
        />
      ) : null}

      {showSuggestions ? <LaunchSuggestionsPanel developments={list.data ?? []} /> : null}
    </div>
  );
}
