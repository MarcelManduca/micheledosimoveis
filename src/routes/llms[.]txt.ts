import { createFileRoute } from "@tanstack/react-router";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// Inline conteúdo em build (fallback) e também tenta ler do public em runtime.
// Servido com charset=utf-8 explícito para evitar mojibake em acentos.
import llmsTxtUrl from "../../public/llms.txt?url";

let cached: string | null = null;

function loadContent(): string {
  if (cached) return cached;
  try {
    // Em dev/SSR node, ler do disco relativo ao public/
    const here = dirname(fileURLToPath(import.meta.url));
    const candidates = [
      resolve(process.cwd(), "public/llms.txt"),
      resolve(here, "../../public/llms.txt"),
    ];
    for (const p of candidates) {
      try {
        cached = readFileSync(p, "utf-8");
        return cached;
      } catch {
        // tenta próximo
      }
    }
  } catch {
    // ignora
  }
  // Fallback: URL do asset (não deve ocorrer em Node SSR)
  cached = String(llmsTxtUrl);
  return cached;
}

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const body = loadContent();
        return new Response(body, {
          status: 200,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
