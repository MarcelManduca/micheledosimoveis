import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListProperties,
  deleteProperty,
  getMyAdminStatus,
  importGralhaProperty,
  setPropertyFeatured,
  syncPropertiesAvailability,
} from "@/lib/properties.functions";
import { ArrowRight, ExternalLink, LogOut, RefreshCw, Star, Trash2 } from "lucide-react";


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

  const [url, setUrl] = useState("");
  const importMut = useMutation({
    mutationFn: (u: string) => importGralhaProperty({ data: { url: u } }),
    onSuccess: () => {
      setUrl("");
      qc.invalidateQueries({ queryKey: ["admin-properties"] });
    },
  });

  const featuredMut = useMutation({
    mutationFn: (v: { id: string; featured: boolean }) => setPropertyFeatured({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-properties"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteProperty({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-properties"] }),
  });

  const syncMut = useMutation({
    mutationFn: () => syncPropertiesAvailability(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-properties"] }),
  });


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
            if (url.trim()) importMut.mutate(url.trim());
          }}
          className="mt-8 flex flex-col sm:flex-row gap-3"
        >
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

        <h2 className="mt-16 font-display text-2xl tracking-tight">Imóveis cadastrados</h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Imóvel</th>
                <th className="px-4 py-3">Bairro</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Destaque</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(list.data ?? []).map((p) => (
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
                    <button
                      onClick={() =>
                        featuredMut.mutate({ id: p.id, featured: !p.featured })
                      }
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${
                        p.featured
                          ? "bg-amber-100 text-amber-800"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Star className={`h-3.5 w-3.5 ${p.featured ? "fill-current" : ""}`} />
                      {p.featured ? "Em destaque" : "Destacar"}
                    </button>
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
              {list.data && list.data.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-center text-muted-foreground" colSpan={5}>
                    Nenhum imóvel ainda. Cole um link da Gralha acima para começar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
