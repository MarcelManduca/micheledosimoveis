import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://micheledosimoveis.com.br";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  image?: string | null;
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { NEIGHBORHOODS } = await import("@/lib/neighborhoods");
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/buscar", changefreq: "daily", priority: "0.9" },
          { path: "/imoveis", changefreq: "weekly", priority: "0.9" },
          { path: "/anuncie", changefreq: "monthly", priority: "0.8" },
          { path: "/guia-imoveis-alto-padrao-florianopolis", changefreq: "monthly", priority: "0.8" },
          { path: "/blog", changefreq: "monthly", priority: "0.8" },
          { path: "/blog/condominios-luxo-beira-mar-norte-agronomica", changefreq: "monthly", priority: "0.8" },
          { path: "/privacidade", changefreq: "yearly", priority: "0.3" },
          ...NEIGHBORHOODS.map((n) => ({
            path: `/imoveis/${n.slug}`,
            changefreq: "weekly" as const,
            priority: "0.85",
          })),
        ];

        try {
          const { createClient } = await import("@supabase/supabase-js");
          const { EDITORIAL_PRESERVED_CATALOG, isAdministrativeBlocked } = await import("@/lib/editorial-preserved");
          const existingPaths = new Set(entries.map((e) => e.path));

          const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { persistSession: false } },
          );
          const { data } = await supabase
            .from("properties")
            .select("code, updated_at, cover_image")
            .eq("published", true);

          for (const row of data ?? []) {
            if (isAdministrativeBlocked(row.code)) continue;
            const path = `/imovel/${row.code}`;
            if (!existingPaths.has(path)) {
              existingPaths.add(path);
              entries.push({
                path,
                lastmod: row.updated_at
                  ? new Date(row.updated_at).toISOString().slice(0, 10)
                  : undefined,
                changefreq: "weekly",
                priority: "0.8",
                image: row.cover_image,
              });
            }
          }

          // Consulta às unidades preservadas (banco primeiro, semente apenas se tabela não migrada)
          const { data: preservedData, error: presErr } = await supabase
            .from("editorial_preserved_properties")
            .select("code, cover_image, created_at, updated_at");

          if (!presErr && preservedData) {
            for (const row of preservedData) {
              if (isAdministrativeBlocked(row.code)) continue;
              const path = `/imovel/${row.code}`;
              if (!existingPaths.has(path)) {
                existingPaths.add(path);
                entries.push({
                  path,
                  lastmod: row.updated_at
                    ? new Date(row.updated_at).toISOString().slice(0, 10)
                    : undefined,
                  changefreq: "monthly",
                  priority: "0.6",
                  image: row.cover_image,
                });
              }
            }
          } else if (
            presErr &&
            (presErr.code === "42P01" ||
              presErr.code === "PGRST205" ||
              presErr.message?.includes("does not exist") ||
              presErr.message?.includes("Could not find the table") ||
              presErr.message?.includes("schema cache"))
          ) {
            for (const [code, item] of Object.entries(EDITORIAL_PRESERVED_CATALOG)) {
              if (isAdministrativeBlocked(code) || !item.isPreserved) continue;
              const path = `/imovel/${code}`;
              if (!existingPaths.has(path)) {
                existingPaths.add(path);
                entries.push({
                  path,
                  lastmod: item.snapshotDate,
                  changefreq: "monthly",
                  priority: "0.6",
                  image: item.coverImage,
                });
              }
            }
          }
        } catch {
          // fall through
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            e.image
              ? `    <image:image><image:loc>${escapeXml(e.image)}</image:loc></image:image>`
              : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
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
