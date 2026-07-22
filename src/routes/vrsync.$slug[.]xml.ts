/**
 * Endpoint público: /vrsync/{slug}.xml
 * Retorna o feed VRSync de uma integração segmentada ativa.
 * Perfil pausado ou inexistente → 404 (XML enxuto).
 */
import { createFileRoute } from "@tanstack/react-router";
import { buildVrsyncForFeed, loadActiveFeedBySlug } from "@/lib/vrsync.functions";

function xmlResponse(body: string, status: number, cacheable: boolean) {
  const headers: Record<string, string> = {
    "content-type": "application/xml; charset=utf-8",
  };
  if (cacheable) headers["cache-control"] = "public, max-age=1800, s-maxage=1800";
  else headers["cache-control"] = "no-store";
  return new Response(body, { status, headers });
}

export const Route = createFileRoute("/vrsync/$slug.xml")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slug = params.slug;
        try {
          const feed = await loadActiveFeedBySlug(slug);
          if (!feed) {
            return xmlResponse(
              `<?xml version="1.0" encoding="UTF-8"?>\n<ListingDataFeed xmlns="http://www.vivareal.com/schemas/1.0/VRSync"><Error>Feed não encontrado.</Error></ListingDataFeed>`,
              404,
              false,
            );
          }
          const { xml } = await buildVrsyncForFeed({
            filters: feed.filters,
            included_property_codes: feed.included_property_codes,
            excluded_property_codes: feed.excluded_property_codes,
            max_items: feed.max_items,
            sort_by: feed.sort_by,
          });

          // Atualiza last_generated_at de forma best-effort com service role.
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            await supabaseAdmin
              .from("vrsync_feeds")
              .update({ last_generated_at: new Date().toISOString() })
              .eq("id", feed.id);
          } catch (err) {
            console.warn("vrsync feed last_generated_at update skipped", err);
          }

          return xmlResponse(xml, 200, true);
        } catch (err) {
          console.error(`vrsync/${slug}.xml build failed`, err);
          return xmlResponse(
            `<?xml version="1.0" encoding="UTF-8"?>\n<ListingDataFeed xmlns="http://www.vivareal.com/schemas/1.0/VRSync"><Error>Feed indisponível no momento.</Error></ListingDataFeed>`,
            503,
            false,
          );
        }
      },
    },
  },
});
