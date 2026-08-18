import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";

// Public cron endpoint that triggers the availability sync.
// Authenticated by a dedicated SYNC_WEBHOOK_SECRET (NOT the Supabase
// publishable key, which is a public client-side value and unsafe as a shared
// secret). Configure pg_cron / external schedulers with header
// `x-sync-secret: <SYNC_WEBHOOK_SECRET>`.

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  try {
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/public/hooks/sync-properties")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const envSecret = process.env.SYNC_WEBHOOK_SECRET ?? "";

        const headerSecret = request.headers.get("x-sync-secret") ?? "";
        const authHeader = request.headers.get("authorization") ?? "";
        const bearer = authHeader.toLowerCase().startsWith("bearer ")
          ? authHeader.slice(7).trim()
          : "";
        const provided = headerSecret || bearer;

        if (!provided) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Accept either the env-configured shared secret OR the DB-stored
        // token used by pg_cron (public.cron_secrets, service-role only).
        let authorized = envSecret ? safeEqual(provided, envSecret) : false;
        if (!authorized) {
          try {
            const { supabaseAdmin } = await import(
              "@/integrations/supabase/client.server"
            );
            const { data } = await supabaseAdmin
              .from("cron_secrets")
              .select("token")
              .eq("name", "sync")
              .maybeSingle();
            const dbToken = (data?.token as string | undefined) ?? "";
            if (dbToken) authorized = safeEqual(provided, dbToken);
          } catch (err) {
            console.error("cron_secrets lookup failed", err);
          }
        }

        if (!authorized) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
          
          // Verificar lock ativo antes de disparar o sync
          const { data: activeRuns } = await supabaseAdmin
            .from("sync_runs")
            .select("id")
            .eq("status", "running")
            .gt("started_at", oneHourAgo)
            .limit(1);

          if (activeRuns && activeRuns.length > 0) {
            return new Response(
              JSON.stringify({ ok: false, error: "Sincronização já em andamento." }),
              { status: 409, headers: { "Content-Type": "application/json" } }
            );
          }

          const { _runAvailabilitySyncInternal } = await import(
            "@/lib/properties.functions"
          );

          // Disparar sincronização em background (sem await)
          _runAvailabilitySyncInternal()
            .then((summary) => console.log("[Cron Hook] Sincronização em background concluída com sucesso:", summary))
            .catch((err) => console.error("[Cron Hook] Erro na sincronização em background:", err));

          return new Response(
            JSON.stringify({ ok: true, message: "Sincronização iniciada em segundo plano.", status: "processing" }),
            { status: 202, headers: { "Content-Type": "application/json" } }
          );
        } catch (err) {
          console.error("sync-properties failed to initiate", err);
          return new Response(
            JSON.stringify({ ok: false, error: "Falha ao iniciar sincronização." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
