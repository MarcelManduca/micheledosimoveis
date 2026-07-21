/**
 * Endpoint público: /vrsync.xml
 * Retorna o feed VRSync com Content-Type application/xml.
 * Cacheado por 30 min no CDN para evitar sobrecarga.
 */
import { createFileRoute } from "@tanstack/react-router";
import { buildVrsync } from "@/lib/vrsync.functions";

export const Route = createFileRoute("/vrsync.xml")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { xml } = await buildVrsync();
          return new Response(xml, {
            status: 200,
            headers: {
              "content-type": "application/xml; charset=utf-8",
              "cache-control": "public, max-age=1800, s-maxage=1800",
            },
          });
        } catch (err) {
          console.error("vrsync.xml build failed", err);
          return new Response(
            '<?xml version="1.0" encoding="UTF-8"?>\n<Carga><Erro>Feed indisponível no momento.</Erro></Carga>',
            {
              status: 503,
              headers: { "content-type": "application/xml; charset=utf-8" },
            },
          );
        }
      },
    },
  },
});
