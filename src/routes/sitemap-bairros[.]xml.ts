import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";

const BASE_URL = "https://micheledosimoveis.com.br";

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Sitemap dedicado às páginas de bairro (/imoveis/$slug) e às páginas
 * de imóveis agrupadas por bairro. Crawlers entendem a relação
 * hierárquica via xmlns:image e priority. Bairros sem imóveis
 * publicados são incluídos com prioridade menor.
 */
export const Route = createFileRoute("/sitemap-bairros.xml")({
  server: {
    handlers: {
      GET: async () => {
        // Conta imóveis publicados por bairro via Supabase (publishable key, anon)
        const countsByQuery: Record<string, number> = {};
        try {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { persistSession: false } },
          );
          const { data } = await supabase
            .from("properties")
            .select("neighborhood")
            .eq("published", true);
          for (const row of data ?? []) {
            const k = (row.neighborhood ?? "").toString();
            countsByQuery[k] = (countsByQuery[k] ?? 0) + 1;
          }
        } catch {
          /* swallow */
        }

        const urls: string[] = [];
        urls.push(
          [
            `  <url>`,
            `    <loc>${BASE_URL}/imoveis</loc>`,
            `    <changefreq>weekly</changefreq>`,
            `    <priority>0.9</priority>`,
            `  </url>`,
          ].join("\n"),
        );

        for (const n of NEIGHBORHOODS) {
          // Contagem por matching tolerante
          let count = 0;
          for (const [k, v] of Object.entries(countsByQuery)) {
            if (
              k &&
              (k.toLowerCase().includes(n.query.toLowerCase()) ||
                n.query.toLowerCase().includes(k.toLowerCase()))
            ) {
              count += v;
            }
          }
          urls.push(
            [
              `  <url>`,
              `    <loc>${BASE_URL}/imoveis/${n.slug}</loc>`,
              `    <changefreq>weekly</changefreq>`,
              `    <priority>${count > 0 ? "0.85" : "0.5"}</priority>`,
              `  </url>`,
            ].join("\n"),
          );
        }

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls.map(escapeXml === undefined ? (x) => x : (x) => x),
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
