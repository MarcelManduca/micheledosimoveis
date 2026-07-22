import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { next?: string } => {
    return { next: typeof s.next === "string" ? s.next : undefined };
  },
  head: () => ({ meta: [{ title: "Acesso administrativo · Michele Prietsch" }] }),
  component: AuthPage,
});

function safeNext(next: string | undefined): string {
  // Only allow same-origin relative paths (start with "/" but not "//").
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/admin";
  return next;
}

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const target = safeNext(next);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}${target}` },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      window.location.href = target;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="px-6 sm:px-10 py-6">
        <Link to="/" className="font-display text-lg tracking-tight">
          Michele Prietsch
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Área restrita
          </div>
          <h1 className="mt-3 font-display font-light text-4xl tracking-tight">
            {mode === "signin" ? "Acesso ao painel" : "Criar acesso"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Entre com seu e-mail e senha para gerenciar os imóveis."
              : "Cadastre o e-mail e senha do administrador. O primeiro cadastro torna-se admin."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
                Senha
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group inline-flex w-full items-center justify-between rounded-full bg-foreground text-background pl-6 pr-2 py-3 text-sm font-medium hover:bg-foreground/90 transition disabled:opacity-60"
            >
              {loading ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}
              <span className="grid h-9 w-9 place-items-center rounded-full bg-background text-foreground group-hover:translate-x-0.5 transition">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 text-sm text-muted-foreground hover:text-foreground transition"
          >
            {mode === "signin"
              ? "Primeiro acesso? Criar conta administrativa"
              : "Já tenho conta — entrar"}
          </button>
        </div>
      </main>
    </div>
  );
}
