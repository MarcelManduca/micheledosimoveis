import { createFileRoute } from "@tanstack/react-router";

// Public cron endpoint that triggers the availability sync.
// Authenticated by Supabase anon key in the `apikey` header (sent by pg_cron),
// matching the project's publishable key.

export const Route = createFileRoute("/api/public/hooks/sync-properties")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!expected || apikey !== expected) {
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
          return new Response(
            JSON.stringify({ ok: false, error: (err as Error).message }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
