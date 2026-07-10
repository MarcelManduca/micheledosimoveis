import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// TanStack Router escapes literal dots with [.]; do not use a filename starting with '.'.
export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) {
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const oauth = (supabase.auth as unknown as {
      oauth: {
        getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
      };
    }).oauth;
    const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <h1 className="font-display text-2xl">Não foi possível carregar esta autorização</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData() as any;
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const oauth = (supabase.auth as unknown as {
      oauth: {
        approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
        denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
      };
    }).oauth;
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorization_id)
      : await oauth.denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message ?? "Falha ao processar a autorização.");
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("O servidor de autorização não devolveu um redirecionamento.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "um aplicativo externo";

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 bg-background text-foreground">
      <div className="w-full max-w-md">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Autorizar acesso
        </div>
        <h1 className="mt-3 font-display font-light text-3xl tracking-tight">
          Conectar {clientName} à sua conta
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Ao aprovar, {clientName} poderá utilizar as ferramentas MCP do Michele dos Imóveis
          agindo como você, respeitando as permissões da sua conta.
        </p>

        {error && (
          <div role="alert" className="mt-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-foreground/90 transition disabled:opacity-60"
          >
            {busy ? "Aguarde..." : "Aprovar"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 rounded-full border border-border px-6 py-3 text-sm hover:bg-muted transition disabled:opacity-60"
          >
            Negar
          </button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Isto não altera as políticas de acesso do sistema — apenas concede ao cliente
          externo permissão para agir como você via MCP.
        </p>
      </div>
    </main>
  );
}
