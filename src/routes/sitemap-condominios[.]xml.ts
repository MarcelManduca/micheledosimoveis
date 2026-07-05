import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://micheledosimoveis.com.br";

export const Route = createFileRoute("/sitemap-condominios.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: { path: string; lastmod?: string; changefreq: string; priority: string }[] = [
          { path: "/condominios", changefreq: "weekly", priority: "0.8" },
        ];

        try {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { persistSession: false } },
          );
          const { data } = await supabase
            .from("condominiums")
            .select("slug, bairro_slug, updated_at")
            .eq("is_active", true);

          const bairros = new Set<string>();
          for (const r of (data ?? []) as {
            slug: string;
            bairro_slug: string | null;
            updated_at: string | null;
          }[]) {
            if (r.bairro_slug) bairros.add(r.bairro_slug);
            entries.push({
              path: `/condominio/${r.slug}`,
              lastmod: r.updated_at ? new Date(r.updated_at).toISOString().slice(0, 10) : undefined,
              changefreq: "monthly",
              priority: "0.6",
            });
          }
          for (const b of bairros) {
            entries.push({
              path: `/condominios/${b}`,
              changefreq: "monthly",
              priority: "0.7",
            });
          }
        } catch (err) {
          console.error("sitemap-condominios", err);
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
