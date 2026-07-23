import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createVrsyncFeed,
  deleteVrsyncFeed,
  duplicateVrsyncFeed,
  generateVrsyncFeedById,
  listVrsyncFeeds,
  previewVrsyncFeed,
  setVrsyncFeedActive,
  updateVrsyncFeed,
  type FeedFilters,
  type SortBy,
  type VrsyncFeedRecord,
} from "@/lib/vrsync.functions";
import {
  ClipboardCopy,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Pause,
  Pencil,
  Play,
  Plus,
  Trash2,
  X,
} from "lucide-react";

const SORT_OPTIONS: Array<{ value: SortBy; label: string }> = [
  { value: "recent", label: "Mais recentes" },
  { value: "price_desc", label: "Maior preço" },
  { value: "price_asc", label: "Menor preço" },
  { value: "featured_first", label: "Destaques primeiro" },
  { value: "launch_first", label: "Lançamentos primeiro" },
  { value: "code", label: "Código (A→Z)" },
  { value: "manual", label: "Ordem manual (códigos incluídos)" },
];

type FormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  filters: FeedFilters;
  neighborhoods_text: string;
  cities_text: string;
  property_types_text: string;
  included_property_codes: string;
  excluded_property_codes: string;
  max_items: string;
  sort_by: SortBy;
};

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  description: "",
  is_active: true,
  filters: { only_published: true },
  neighborhoods_text: "",
  cities_text: "",
  property_types_text: "",
  included_property_codes: "",
  excluded_property_codes: "",
  max_items: "",
  sort_by: "recent",
};

function slugify(v: string): string {
  return v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function parseList(v: string): string[] {
  return v
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function toNumOrNull(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function brl(n: number | null) {
  if (n == null) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function feedToForm(feed: VrsyncFeedRecord): FormState {
  const filters = feed.filters ?? {};
  return {
    id: feed.id,
    name: feed.name,
    slug: feed.slug,
    description: feed.description ?? "",
    is_active: feed.is_active,
    filters,
    neighborhoods_text: (filters.neighborhoods ?? []).join(", "),
    cities_text: (filters.cities ?? []).join(", "),
    property_types_text: (filters.property_types ?? []).join(", "),
    included_property_codes: (feed.included_property_codes ?? []).join(", "),
    excluded_property_codes: (feed.excluded_property_codes ?? []).join(", "),
    max_items: feed.max_items == null ? "" : String(feed.max_items),
    sort_by: feed.sort_by,
  };
}

function formToPayload(f: FormState) {
  const neighborhoods = parseList(f.neighborhoods_text);
  const cities = parseList(f.cities_text);
  const property_types = parseList(f.property_types_text);
  const filters: FeedFilters = {
    ...f.filters,
    neighborhoods: neighborhoods.length ? neighborhoods : undefined,
    cities: cities.length ? cities : undefined,
    property_types: property_types.length ? property_types : undefined,
  };
  return {
    name: f.name.trim(),
    slug: f.slug.trim(),
    description: f.description.trim() || null,
    is_active: f.is_active,
    filters,
    included_property_codes: parseList(f.included_property_codes),
    excluded_property_codes: parseList(f.excluded_property_codes),
    max_items: f.max_items.trim() ? Number(f.max_items) : null,
    sort_by: f.sort_by,
  };
}


function feedUrl(slug: string): string {
  if (typeof window !== "undefined") return `${window.location.origin}/vrsync/${slug}.xml`;
  return `https://micheledosimoveis.com.br/vrsync/${slug}.xml`;
}

export function VrsyncFeedsSection() {
  const qc = useQueryClient();
  const feedsQ = useQuery({ queryKey: ["vrsync-feeds"], queryFn: () => listVrsyncFeeds() });

  const [form, setForm] = useState<FormState | null>(null);
  const [formNonce, setFormNonce] = useState(0);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: (v: ReturnType<typeof formToPayload>) => createVrsyncFeed({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vrsync-feeds"] });
      setForm(null);
    },
  });
  const updateMut = useMutation({
    mutationFn: (v: ReturnType<typeof formToPayload> & { id: string }) =>
      updateVrsyncFeed({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vrsync-feeds"] });
      setForm(null);
    },
  });
  const duplicateMut = useMutation({
    mutationFn: (id: string) => duplicateVrsyncFeed({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vrsync-feeds"] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteVrsyncFeed({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vrsync-feeds"] }),
  });
  const toggleMut = useMutation({
    mutationFn: (v: { id: string; is_active: boolean }) => setVrsyncFeedActive({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vrsync-feeds"] }),
  });
  const downloadMut = useMutation({
    mutationFn: (id: string) => generateVrsyncFeedById({ data: { id } }),
    onSuccess: (res) => {
      const blob = new Blob([res.xml], { type: "application/xml;charset=utf-8" });
      const u = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = u;
      a.download = `vrsync-${res.slug}-${stamp}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(u);
      qc.invalidateQueries({ queryKey: ["vrsync-feeds"] });
    },
  });

  const copyUrl = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(feedUrl(slug));
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="mt-10 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Sindicação segmentada
          </div>
          <h3 className="mt-1 font-display text-xl tracking-tight">Integrações VRSync</h3>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Crie feeds VRSync filtrados por preço, bairro, tipo e outros critérios. Cada perfil
            gera uma URL pública própria em <code>/vrsync/&lt;slug&gt;.xml</code>. O feed geral
            continua em <code>/vrsync.xml</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm({ ...EMPTY_FORM });
            setFormNonce((n) => n + 1);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition hover:bg-foreground/90"
        >
          <Plus className="h-3.5 w-3.5" /> Nova integração
        </button>
      </div>

      {feedsQ.error && (
        <div className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {(feedsQ.error as Error).message}
        </div>
      )}

      <div className="mt-5 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Integração</th>
              <th className="px-3 py-2">Filtros</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Última geração</th>
              <th className="px-3 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(feedsQ.data ?? []).map((feed) => (
              <FeedRow
                key={feed.id}
                feed={feed}
                onEdit={() => setForm(feedToForm(feed))}
                onDuplicate={() => duplicateMut.mutate(feed.id)}
                onDelete={() => {
                  if (confirm(`Excluir a integração "${feed.name}"?`)) deleteMut.mutate(feed.id);
                }}
                onToggle={() => toggleMut.mutate({ id: feed.id, is_active: !feed.is_active })}
                onDownload={() => downloadMut.mutate(feed.id)}
                onCopyUrl={() => copyUrl(feed.slug)}
                copied={copiedSlug === feed.slug}
                busy={
                  duplicateMut.isPending ||
                  deleteMut.isPending ||
                  toggleMut.isPending ||
                  downloadMut.isPending
                }
              />
            ))}
            {feedsQ.data && feedsQ.data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-xs text-muted-foreground">
                  Nenhuma integração segmentada cadastrada.
                </td>
              </tr>
            )}
            {feedsQ.isLoading && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-xs text-muted-foreground">
                  Carregando integrações...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <FeedFormPanel
          key={form.id ?? "__new__"}
          initial={form}
          onCancel={() => setForm(null)}
          onSubmit={(payload) => {
            if (form.id) updateMut.mutate({ ...payload, id: form.id });
            else createMut.mutate(payload);
          }}
          submitting={createMut.isPending || updateMut.isPending}
          error={
            (createMut.error as Error | null)?.message ||
            (updateMut.error as Error | null)?.message ||
            null
          }
        />
      )}

      {downloadMut.error && (
        <div className="mt-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {(downloadMut.error as Error).message}
        </div>
      )}
    </section>
  );
}

function FeedRow({
  feed,
  onEdit,
  onDuplicate,
  onDelete,
  onToggle,
  onDownload,
  onCopyUrl,
  copied,
  busy,
}: {
  feed: VrsyncFeedRecord;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onDownload: () => void;
  onCopyUrl: () => void;
  copied: boolean;
  busy: boolean;
}) {
  const f = feed.filters ?? {};
  const bits: string[] = [];
  if (f.price_min != null || f.price_max != null) {
    bits.push(`${brl(f.price_min ?? null)} → ${brl(f.price_max ?? null)}`);
  }
  if (f.neighborhoods?.length) bits.push(`Bairros: ${f.neighborhoods.slice(0, 3).join(", ")}${f.neighborhoods.length > 3 ? "…" : ""}`);
  if (f.property_types?.length) bits.push(`Tipos: ${f.property_types.slice(0, 3).join(", ")}`);
  if (f.only_featured) bits.push("Destaques");
  if (f.only_launch) bits.push("Lançamentos");
  if (feed.max_items) bits.push(`máx ${feed.max_items}`);

  return (
    <tr className="border-t border-border align-middle">
      <td className="px-3 py-3">
        <div className="font-medium">{feed.name}</div>
        <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">/vrsync/{feed.slug}.xml</div>
        {feed.description && (
          <div className="mt-1 line-clamp-1 max-w-md text-[11px] text-muted-foreground">
            {feed.description}
          </div>
        )}
      </td>
      <td className="px-3 py-3 text-xs text-muted-foreground">
        {bits.length ? bits.join(" · ") : "Sem filtros"}
      </td>
      <td className="px-3 py-3">
        {feed.is_active ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ativo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Pausado
          </span>
        )}
      </td>
      <td className="px-3 py-3 text-xs text-muted-foreground">
        {feed.last_generated_at
          ? new Date(feed.last_generated_at).toLocaleString("pt-BR")
          : "—"}
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
          <button
            onClick={onCopyUrl}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            title="Copiar URL"
          >
            <ClipboardCopy className="h-3.5 w-3.5" /> {copied ? "Copiado!" : "URL"}
          </button>
          {feed.is_active && (
            <a
              href={`/vrsync/${feed.slug}.xml`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              title="Abrir feed"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Abrir
            </a>
          )}
          <button
            onClick={onDownload}
            disabled={busy}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
            title="Baixar XML"
          >
            <Download className="h-3.5 w-3.5" /> Baixar
          </button>
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" /> Editar
          </button>
          <button
            onClick={onDuplicate}
            disabled={busy}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <Copy className="h-3.5 w-3.5" /> Duplicar
          </button>
          <button
            onClick={onToggle}
            disabled={busy}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            {feed.is_active ? (
              <>
                <Pause className="h-3.5 w-3.5" /> Pausar
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" /> Ativar
              </>
            )}
          </button>
          <button
            onClick={onDelete}
            disabled={busy}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-destructive disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" /> Excluir
          </button>
        </div>
      </td>
    </tr>
  );
}

function FeedFormPanel({
  initial,
  onCancel,
  onSubmit,
  submitting,
  error,
}: {
  initial: FormState;
  onCancel: () => void;
  onSubmit: (payload: ReturnType<typeof formToPayload>) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [autoSlug, setAutoSlug] = useState(!initial.id);

  useEffect(() => {
    if (autoSlug) setForm((f) => ({ ...f, slug: slugify(f.name) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name, autoSlug]);

  const setFilter = <K extends keyof FeedFilters>(k: K, v: FeedFilters[K]) =>
    setForm((f) => ({ ...f, filters: { ...f.filters, [k]: v } }));

  const previewMut = useMutation({
    mutationFn: () => previewVrsyncFeed({ data: formToPayload(form) }),
  });

  const preview = previewMut.data;

  const canSubmit = useMemo(
    () => form.name.trim().length >= 2 && /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(form.slug),
    [form.name, form.slug],
  );

  return (
    <div className="mt-5 rounded-2xl border border-border bg-background p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-display text-lg">
            {initial.id ? "Editar integração" : "Nova integração"}
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Configure filtros e visualize os imóveis antes de salvar.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome">
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input"
            placeholder="Alto padrão Centro e Agronômica"
          />
        </Field>
        <Field label="Slug (URL)">
          <div className="flex items-center gap-2">
            <input
              value={form.slug}
              onChange={(e) => {
                setAutoSlug(false);
                setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
              }}
              className="input flex-1 font-mono text-xs"
              placeholder="alto-padrao-centro-agronomica"
            />
          </div>
          <div className="mt-1 font-mono text-[10px] text-muted-foreground">
            /vrsync/{form.slug || "…"}.xml
          </div>
        </Field>
        <Field label="Descrição interna" className="sm:col-span-2">
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="input"
            placeholder="Uso interno — canal, portal, campanha, etc."
          />
        </Field>

        <fieldset className="sm:col-span-2 rounded-xl border border-border p-4">
          <legend className="px-2 text-xs uppercase tracking-wider text-muted-foreground">
            Filtros
          </legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Preço mínimo (R$)">
              <input
                type="number"
                min={0}
                value={form.filters.price_min ?? ""}
                onChange={(e) => setFilter("price_min", toNumOrNull(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Preço máximo (R$)">
              <input
                type="number"
                min={0}
                value={form.filters.price_max ?? ""}
                onChange={(e) => setFilter("price_max", toNumOrNull(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Área mínima (m²)">
              <input
                type="number"
                min={0}
                value={form.filters.area_min ?? ""}
                onChange={(e) => setFilter("area_min", toNumOrNull(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Área máxima (m²)">
              <input
                type="number"
                min={0}
                value={form.filters.area_max ?? ""}
                onChange={(e) => setFilter("area_max", toNumOrNull(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Dormitórios (mín)">
              <input
                type="number"
                min={0}
                value={form.filters.bedrooms_min ?? ""}
                onChange={(e) => setFilter("bedrooms_min", toNumOrNull(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Dormitórios (máx)">
              <input
                type="number"
                min={0}
                value={form.filters.bedrooms_max ?? ""}
                onChange={(e) => setFilter("bedrooms_max", toNumOrNull(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Suítes (mín)">
              <input
                type="number"
                min={0}
                value={form.filters.suites_min ?? ""}
                onChange={(e) => setFilter("suites_min", toNumOrNull(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Vagas (mín)">
              <input
                type="number"
                min={0}
                value={form.filters.parking_min ?? ""}
                onChange={(e) => setFilter("parking_min", toNumOrNull(e.target.value))}
                className="input"
              />
            </Field>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Bairros (separe por vírgula ou linha)">
              <textarea
                rows={2}
                value={form.neighborhoods_text}
                onChange={(e) => setForm((f) => ({ ...f, neighborhoods_text: e.target.value }))}
                className="input"
                placeholder="Centro, Agronômica"
              />
            </Field>
            <Field label="Cidades (separe por vírgula ou linha)">
              <textarea
                rows={2}
                value={form.cities_text}
                onChange={(e) => setForm((f) => ({ ...f, cities_text: e.target.value }))}
                className="input"
                placeholder="Florianópolis"
              />
            </Field>
            <Field label="Tipos (separe por vírgula ou linha)">
              <textarea
                rows={2}
                value={form.property_types_text}
                onChange={(e) => setForm((f) => ({ ...f, property_types_text: e.target.value }))}
                className="input"
                placeholder="Apartamento, Cobertura"
              />
            </Field>

          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            <Check
              label="Somente publicados (ativos)"
              checked={form.filters.only_published !== false}
              onChange={(v) => setFilter("only_published", v)}
            />
            <Check
              label="Somente destaques"
              checked={!!form.filters.only_featured}
              onChange={(v) => setFilter("only_featured", v)}
            />
            <Check
              label="Somente lançamentos"
              checked={!!form.filters.only_launch}
              onChange={(v) => setFilter("only_launch", v)}
            />
            <Check
              label="Exigir foto"
              checked={!!form.filters.require_photo}
              onChange={(v) => setFilter("require_photo", v)}
            />
            <Check
              label="Exigir descrição"
              checked={!!form.filters.require_description}
              onChange={(v) => setFilter("require_description", v)}
            />
            <Check
              label="Exigir endereço"
              checked={!!form.filters.require_address}
              onChange={(v) => setFilter("require_address", v)}
            />
            <Check
              label="Exigir área"
              checked={!!form.filters.require_area}
              onChange={(v) => setFilter("require_area", v)}
            />
          </div>
        </fieldset>

        <Field label="Códigos a incluir (fora do filtro)" className="sm:col-span-1">
          <textarea
            rows={3}
            value={form.included_property_codes}
            onChange={(e) => setForm((f) => ({ ...f, included_property_codes: e.target.value }))}
            className="input font-mono text-xs"
            placeholder="CÓD1, CÓD2, CÓD3"
          />
        </Field>
        <Field label="Códigos a excluir" className="sm:col-span-1">
          <textarea
            rows={3}
            value={form.excluded_property_codes}
            onChange={(e) => setForm((f) => ({ ...f, excluded_property_codes: e.target.value }))}
            className="input font-mono text-xs"
            placeholder="CÓD9, CÓD10"
          />
        </Field>
        <Field label="Quantidade máxima (opcional)">
          <input
            type="number"
            min={1}
            value={form.max_items}
            onChange={(e) => setForm((f) => ({ ...f, max_items: e.target.value }))}
            className="input"
            placeholder="Sem limite"
          />
        </Field>
        <Field label="Ordenar por">
          <select
            value={form.sort_by}
            onChange={(e) => setForm((f) => ({ ...f, sort_by: e.target.value as SortBy }))}
            className="input"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" className="sm:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="h-4 w-4 rounded border-border accent-emerald-600"
            />
            Integração ativa (URL pública disponível)
          </label>
        </Field>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => previewMut.mutate()}
          disabled={previewMut.isPending}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium transition hover:bg-secondary disabled:opacity-60"
        >
          <Eye className="h-3.5 w-3.5" />
          {previewMut.isPending ? "Calculando..." : "Visualizar imóveis"}
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSubmit(formToPayload(form))}
            disabled={!canSubmit || submitting}
            className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/90 disabled:opacity-60"
          >
            {submitting ? "Salvando..." : initial.id ? "Salvar alterações" : "Criar integração"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {previewMut.error && (
        <div className="mt-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {(previewMut.error as Error).message}
        </div>
      )}

      {preview && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard label="Encontrados" value={preview.totalMatched} />
            <MetricCard label="Exportáveis" value={preview.totalExportable} tone="ok" />
            <MetricCard
              label="Rejeitados"
              value={preview.totalRejected}
              tone={preview.totalRejected > 0 ? "warn" : "ok"}
            />
            <MetricCard label="Preço médio" value={brl(preview.avgPrice)} small />
            <MetricCard label="Menor preço" value={brl(preview.minPrice)} small />
            <MetricCard label="Maior preço" value={brl(preview.maxPrice)} small />
            <MetricCard
              label="Sem foto"
              value={preview.report.missingPhoto}
              tone={preview.report.missingPhoto > 0 ? "warn" : undefined}
            />
            <MetricCard
              label="Sem descrição"
              value={preview.report.missingDescription}
              tone={preview.report.missingDescription > 0 ? "warn" : undefined}
            />
          </div>

          {(preview.neighborhoods.length > 0 || preview.propertyTypes.length > 0) && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TopList title="Principais bairros" items={preview.neighborhoods} />
              <TopList title="Principais tipos" items={preview.propertyTypes} />
            </div>
          )}

          {preview.sample.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-xs">
                <thead className="bg-secondary/60 text-left uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Imóvel</th>
                    <th className="px-3 py-2">Bairro</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Preço</th>
                    <th className="px-3 py-2">Validação</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.sample.map((s) => (
                    <tr key={s.code} className="border-t border-border align-middle">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {s.cover_image && (
                            <img
                              src={s.cover_image}
                              alt=""
                              loading="lazy"
                              className="h-8 w-12 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="line-clamp-1 max-w-xs font-medium">{s.title}</div>
                            <div className="font-mono text-[10px] text-muted-foreground">{s.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{s.neighborhood ?? "—"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{s.property_type ?? "—"}</td>
                      <td className="px-3 py-2">{brl(s.price_brl)}</td>
                      <td className="px-3 py-2">
                        {s.validation === "exportado" ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                            Exportado
                          </span>
                        ) : (
                          <span
                            className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700"
                            title={s.rejection_reason}
                          >
                            Rejeitado · {s.rejection_reason ?? ""}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.totalMatched > preview.sample.length && (
                <div className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
                  Mostrando {preview.sample.length} de {preview.totalMatched} imóveis.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`.input{width:100%;border-radius:0.5rem;border:1px solid var(--border,#e5e7eb);background:var(--background,#fff);padding:0.5rem 0.75rem;font-size:0.875rem;outline:none}.input:focus{box-shadow:0 0 0 2px rgba(0,0,0,0.08)}`}</style>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border"
      />
      {label}
    </label>
  );
}

function MetricCard({
  label,
  value,
  tone,
  small,
}: {
  label: string;
  value: number | string;
  tone?: "ok" | "warn";
  small?: boolean;
}) {
  const cls =
    tone === "ok"
      ? "text-emerald-700"
      : tone === "warn"
        ? "text-amber-700"
        : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-0.5 font-medium ${small ? "text-xs" : "text-lg"} ${cls}`}>{value}</div>
    </div>
  );
}

function TopList({ title, items }: { title: string; items: Array<{ name: string; count: number }> }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{title}</div>
      <ul className="mt-2 space-y-1 text-xs">
        {items.map((i) => (
          <li key={i.name} className="flex items-center justify-between">
            <span className="line-clamp-1">{i.name}</span>
            <span className="font-mono text-muted-foreground">{i.count}</span>
          </li>
        ))}
        {items.length === 0 && <li className="text-muted-foreground">—</li>}
      </ul>
    </div>
  );
}
