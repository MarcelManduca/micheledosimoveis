import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMyAdminStatus } from "@/lib/properties.functions";
import { ENABLE_LAUNCHES_VERTICAL } from "@/lib/feature-flags";

/**
 * Gate isolado para o submenu admin da vertical de lançamentos.
 * Não altera o gate existente de /admin.
 */
export function LaunchesAdminGate({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/auth" });
      else setSessionReady(true);
    });
  }, [navigate]);

  const status = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => getMyAdminStatus(),
    enabled: sessionReady,
  });

  if (!ENABLE_LAUNCHES_VERTICAL) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">Módulo indisponível</h1>
        <p className="mt-3 text-muted-foreground">
          A vertical de lançamentos está desativada por feature flag.
        </p>
      </main>
    );
  }

  if (!sessionReady || status.isLoading) {
    return <main className="px-6 py-24 text-center text-muted-foreground">Carregando…</main>;
  }

  if (!status.data?.isAdmin) {
    return (
      <main className="px-6 py-24 text-center text-muted-foreground">
        Acesso restrito a administradores.
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">{title}</h1>
      {children}
    </main>
  );
}
