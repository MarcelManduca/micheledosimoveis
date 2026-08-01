import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * Sitemap DEDICADO da vertical de LANÇAMENTOS (Sprint 4).
 * Isolado: não altera /sitemap.xml nem os demais sitemaps já indexados.
 * Só lista lançamentos publicados e elegíveis e construtoras ativas com lançamentos.
 */

const BASE_URL = "https://micheledosimoveis.com.br";

export const Route = createFileRoute("/sitemap-lancamentos.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: { path: string; lastmod?: string; changefreq: string; priority: string }[] = [];

        try {
          const { loadEligible } = await import("@/lib/launches-public");
          const { rows, developers } = await loadEligible();

          if (rows.length > 0) {
            entries.push({ path: "/lancamentos", changefreq: "weekly", priority: "0.8" });
          }

          const activeDevelopers = new Set<string>();
          for (const row of rows) {
            entries.push({
              path: `/lancamentos/${row.slug}`,
              lastmod: row.updated_at ? new Date(row.updated_at).toISOString().slice(0, 10) : undefined,
              changefreq: "weekly",
              priority: "0.7",
            });
            const dev = row.developer_id ? developers.get(row.developer_id) : null;
            if (dev?.is_active) activeDevelopers.add(dev.slug);
          }
          for (const slug of activeDevelopers) {
            entries.push({
              path: `/construtoras/${slug}`,
              changefreq: "monthly",
              priority: "0.6",
            });
          }
        } catch (err) {
          console.error("sitemap-lancamentos", err);
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            `    <changefreq>${e.changefreq}</changefreq>`,
            `    <priority>${e.priority}</priority>`,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
