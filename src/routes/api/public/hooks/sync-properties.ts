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
        const expected = process.env.SYNC_WEBHOOK_SECRET;
        if (!expected) {
          // Misconfiguration — refuse rather than fall back to a public key.
          return new Response(JSON.stringify({ error: "Webhook not configured" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        }
        // Accept either a dedicated header or Bearer token.
        const headerSecret = request.headers.get("x-sync-secret") ?? "";
        const authHeader = request.headers.get("authorization") ?? "";
        const bearer = authHeader.toLowerCase().startsWith("bearer ")
          ? authHeader.slice(7).trim()
          : "";
        const provided = headerSecret || bearer;
        if (!provided || !safeEqual(provided, expected)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        try {
          const { _runAvailabilitySyncInternal } = await import(
            "@/lib/properties.functions"
          );
          const summary = await _runAvailabilitySyncInternal();
          return Response.json({ ok: true, ...summary });
        } catch (err) {
          console.error("sync-properties failed", err);
          // Don't leak internal error messages.
          return new Response(
            JSON.stringify({ ok: false, error: "Sync failed" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
