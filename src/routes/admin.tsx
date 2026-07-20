import { createFileRoute, useNavigate, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListProperties,
  adminPropertiesStats,
  deleteProperty,
  exportPropertiesXml,
  getMyAdminStatus,
  importGralhaProperty,
  setPropertyFeatured,
  setPropertyLaunch,
  syncPropertiesAvailability,
} from "@/lib/properties.functions";
import { ArrowRight, ChevronLeft, ChevronRight, Download, ExternalLink, LogOut, RefreshCw, Rocket, Search, Star, Trash2, X } from "lucide-react";


export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel · Michele Prietsch" }] }),
  component: AdminPage,
});

function brl(n: number | null) {
  if (n == null) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isChildRoute = pathname !== "/admin" && pathname !== "/admin/";
  const [sessionReady, setSessionReady] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        navigate({ to: "/auth" });
        return;
      }
      setUserEmail(data.session.user.email ?? null);
      setSessionReady(true);
    });
    const sub = supabase.auth.onAuthStateChange((_e, sess) => {
      if (!sess) navigate({ to: "/auth" });
      else setUserEmail(sess.user.email ?? null);
    });
    return () => {
      mounted = false;
      sub.data.subscription.unsubscribe();
    };
  }, [navigate]);

  const status = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => getMyAdminStatus(),
    enabled: sessionReady,
  });

  const list = useQuery({
    queryKey: ["admin-properties"],
    queryFn: () => adminListProperties(),
    enabled: !!status.data?.isAdmin,
  });

  const stats = useQuery({
    queryKey: ["admin-properties-stats"],
    queryFn: () => adminPropertiesStats(),
    enabled: !!status.data?.isAdmin,
  });


  const [url, setUrl] = useState("");
  const [importFeatured, setImportFeatured] = useState(false);
  const [importLaunch, setImportLaunch] = useState(false);
  const importMut = useMutation({
    mutationFn: (vars: { url: string; featured: boolean; isLaunch: boolean }) =>
      importGralhaProperty({ data: vars }),
    onSuccess: () => {
      setUrl("");
      setImportFeatured(false);
      setImportLaunch(false);
      qc.invalidateQueries({ queryKey: ["admin-properties"] }); qc.invalidateQueries({ queryKey: ["admin-properties-stats"] });
    },
  });

  const featuredMut = useMutation({
    mutationFn: (v: { id: string; featured: boolean }) => setPropertyFeatured({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-properties"] }); qc.invalidateQueries({ queryKey: ["admin-properties-stats"] }); },
  });

  const launchMut = useMutation({
    mutationFn: (v: { id: string; is_launch: boolean }) => setPropertyLaunch({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-properties"] }); qc.invalidateQueries({ queryKey: ["admin-properties-stats"] }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteProperty({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-properties"] }); qc.invalidateQueries({ queryKey: ["admin-properties-stats"] }); },
  });

  const syncMut = useMutation({
    mutationFn: () => syncPropertiesAvailability(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-properties"] }); qc.invalidateQueries({ queryKey: ["admin-properties-stats"] }); },
  });

  const exportMut = useMutation({
    mutationFn: () => exportPropertiesXml(),
    onSuccess: (res) => {
      const blob = new Blob([res.xml], { type: "application/xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `imoveis-${stamp}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });

  // ── Busca, filtros e paginação da tabela ─────────────────────────────
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativos" | "inativos">("ativos");
  const [tagFilter, setTagFilter] = useState<"todos" | "destaques" | "lancamentos">("todos");
  const [pageSize, setPageSize] = useState<25 | 50 | 100>(25);
  const [page, setPage] = useState(1);

  const rows = list.data ?? [];
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((p) => {
      const anyP = p as any;
      if (statusFilter === "ativos" && !anyP.published) return false;
      if (statusFilter === "inativos" && anyP.published) return false;
      if (tagFilter === "destaques" && !p.featured) return false;
      if (tagFilter === "lancamentos" && !p.is_launch) return false;
      if (!q) return true;
      const hay = `${p.title ?? ""} ${p.code ?? ""} ${p.neighborhood ?? ""} ${p.city ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query, statusFilter, tagFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = useMemo(
    () => filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredRows, currentPage, pageSize],
  );
  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, tagFilter, pageSize]);




  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (!sessionReady || status.isLoading) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Carregando painel...
      </div>
    );
  }

  if (status.data?.isAdmin && isChildRoute) {
    return <Outlet />;
  }



  if (status.data && !status.data.isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="font-display text-2xl">Acesso restrito</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sua conta não tem permissão de administrador.
          </p>
          <button onClick={signOut} className="mt-6 text-sm underline">
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 py-5 flex items-center justify-between">
          <Link to="/" className="font-display text-lg tracking-tight">
            Michele Prietsch
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/admin/inteligencia-portfolio" className="hidden sm:inline text-muted-foreground hover:text-foreground">
              Inteligência de portfólio
            </Link>
            <span className="hidden sm:inline text-muted-foreground">{userEmail}</span>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 sm:px-10 py-12">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Painel</div>
        <h1 className="mt-3 font-display font-light text-4xl sm:text-5xl tracking-tight">
          Importar imóvel da <span className="italic">Gralha Imóveis</span>
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Cole o link do imóvel (ex.{" "}
          <code className="text-xs">
            https://www.gralhaimoveis.com.br/imovel/codigo/165138450
          </code>
          ) e o sistema importa título, descrição, valores, características e fotos.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (url.trim())
              importMut.mutate({ url: url.trim(), featured: importFeatured, isLaunch: importLaunch });
          }}
          className="mt-8 space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              required
              placeholder="https://www.gralhaimoveis.com.br/imovel/codigo/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 rounded-full border border-border bg-background px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
            <button
              type="submit"
              disabled={importMut.isPending}
              className="group inline-flex items-center justify-between gap-3 rounded-full bg-foreground text-background pl-6 pr-2 py-3 text-sm font-medium hover:bg-foreground/90 transition disabled:opacity-60"
            >
              {importMut.isPending ? "Importando..." : "Importar imóvel"}
              <span className="grid h-9 w-9 place-items-center rounded-full bg-background text-foreground">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </div>
          <div className="flex flex-wrap gap-5 text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={importFeatured}
                onChange={(e) => setImportFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <Star className="h-4 w-4 text-amber-500" /> Marcar como destaque na home
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={importLaunch}
                onChange={(e) => setImportLaunch(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <Rocket className="h-4 w-4 text-emerald-600" /> Marcar como lançamento
            </label>
          </div>
        </form>
        {importMut.error && (
          <div className="mt-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {(importMut.error as Error).message}
          </div>
        )}
        {importMut.data && (
          <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Imóvel importado (cód. {importMut.data.code}) com {importMut.data.photos} fotos.
          </div>
        )}

        <div className="mt-16 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl tracking-tight">Imóveis cadastrados</h2>
            {stats.data && (
              <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1 text-xs text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {stats.data.active} ativos
                <span className="text-muted-foreground">· {stats.data.total} no total</span>
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              A verificação roda diariamente: atualiza preços, fotos e descrições dos imóveis ativos e despublica os que foram removidos do site da Gralha.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportMut.mutate()}
              disabled={exportMut.isPending}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-secondary transition disabled:opacity-60"
            >
              <Download className={`h-3.5 w-3.5 ${exportMut.isPending ? "animate-pulse" : ""}`} />
              {exportMut.isPending ? "Gerando XML..." : "Exportar XML"}
            </button>
            <button
              onClick={() => syncMut.mutate()}
              disabled={syncMut.isPending}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-secondary transition disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncMut.isPending ? "animate-spin" : ""}`} />
              {syncMut.isPending ? "Sincronizando..." : "Verificar e atualizar agora"}
            </button>
          </div>
        </div>
        {exportMut.data && (
          <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
            XML gerado com {exportMut.data.count} imóveis. Download iniciado automaticamente.
          </div>
        )}
        {exportMut.error && (
          <div className="mt-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {(exportMut.error as Error).message}
          </div>
        )}
        {syncMut.data && (
          <div className="mt-3 rounded-xl bg-secondary/60 px-4 py-3 text-xs text-foreground">
            Verificados {syncMut.data.checked} · atualizados {syncMut.data.refreshed ?? 0} · disponíveis {syncMut.data.available} · despublicados {syncMut.data.unpublished} · erros {syncMut.data.errors}
          </div>
        )}

        {syncMut.error && (
          <div className="mt-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {(syncMut.error as Error).message}
          </div>
        )}
        {/* Barra de busca e filtros */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por título, código, bairro ou cidade"
                className="w-full rounded-full border border-border bg-background pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary"
                  aria-label="Limpar busca"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="rounded-full border border-border bg-background px-3 py-2 text-xs"
              >
                <option value="ativos">Somente ativos</option>
                <option value="inativos">Somente inativos</option>
                <option value="todos">Todos os status</option>
              </select>
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value as typeof tagFilter)}
                className="rounded-full border border-border bg-background px-3 py-2 text-xs"
              >
                <option value="todos">Todas as marcações</option>
                <option value="destaques">Somente destaques</option>
                <option value="lancamentos">Somente lançamentos</option>
              </select>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value) as 25 | 50 | 100)}
                className="rounded-full border border-border bg-background px-3 py-2 text-xs"
              >
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
            </div>
          </div>
          {list.data && (
            <div className="mt-3 text-xs text-muted-foreground">
              Mostrando <span className="font-medium text-foreground">{pagedRows.length}</span> de{" "}
              <span className="font-medium text-foreground">{filteredRows.length}</span> resultados
              {filteredRows.length !== list.data.length && (
                <span> · {list.data.length} imóveis no total</span>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Imóvel</th>
                <th className="px-4 py-3">Bairro</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Destaque</th>
                <th className="px-4 py-3">Lançamento</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((p) => (
                <tr key={p.id} className="border-t border-border align-middle">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.cover_image && (
                        <img
                          src={p.cover_image}
                          alt=""
                          className="h-12 w-16 rounded-md object-cover"
                          loading="lazy"
                        />
                      )}
                      <div>
                        <div className="font-medium line-clamp-1 max-w-xs">{p.title}</div>
                        <div className="text-xs text-muted-foreground">Cód. {p.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.neighborhood ?? "—"} {p.city ? `· ${p.city}` : ""}
                  </td>
                  <td className="px-4 py-3">{brl(p.price_brl)}</td>
                  <td className="px-4 py-3">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={p.featured}
                        disabled={featuredMut.isPending}
                        onChange={(e) =>
                          featuredMut.mutate({ id: p.id, featured: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-border accent-amber-500"
                      />
                      <Star
                        className={`h-3.5 w-3.5 ${p.featured ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`}
                      />
                      <span className={p.featured ? "text-amber-800" : "text-muted-foreground"}>
                        {p.featured ? "Em destaque" : "Destacar"}
                      </span>
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={!!p.is_launch}
                        disabled={launchMut.isPending}
                        onChange={(e) =>
                          launchMut.mutate({ id: p.id, is_launch: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-border accent-emerald-600"
                      />
                      <Rocket
                        className={`h-3.5 w-3.5 ${p.is_launch ? "text-emerald-600" : "text-muted-foreground"}`}
                      />
                      <span className={p.is_launch ? "text-emerald-800" : "text-muted-foreground"}>
                        {p.is_launch ? "Lançamento" : "Marcar"}
                      </span>
                    </label>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to="/imovel/$code"
                        params={{ code: p.code }}
                        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" /> Ver
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm("Excluir este imóvel?")) deleteMut.mutate(p.id);
                        }}
                        className="text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" /> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.data && filteredRows.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-center text-muted-foreground" colSpan={6}>
                    {list.data.length === 0
                      ? "Nenhum imóvel ainda. Cole um link da Gralha acima para começar."
                      : "Nenhum imóvel corresponde aos filtros selecionados."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {filteredRows.length > pageSize && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="text-xs text-muted-foreground">
              Página <span className="font-medium text-foreground">{currentPage}</span> de{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-40"
              >
                Próxima <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );

}
