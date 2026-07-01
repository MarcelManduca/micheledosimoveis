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
          { path: "/privacidade", changefreq: "yearly", priority: "0.3" },
          ...NEIGHBORHOODS.map((n) => ({
            path: `/imoveis/${n.slug}`,
            changefreq: "weekly" as const,
            priority: "0.85",
          })),
        ];

        try {
          const { createClient } = await import("@supabase/supabase-js");
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
            entries.push({
              path: `/imovel/${row.code}`,
              lastmod: row.updated_at
                ? new Date(row.updated_at).toISOString().slice(0, 10)
                : undefined,
              changefreq: "weekly",
              priority: "0.8",
              image: row.cover_image,
            });
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
