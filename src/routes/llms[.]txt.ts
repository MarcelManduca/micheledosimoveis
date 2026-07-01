import { createFileRoute } from "@tanstack/react-router";
import llmsTxt from "../content/llms.txt?raw";

// Servido com charset=utf-8 explícito para evitar mojibake em acentos.
export const Route = createFileRoute("/llms[.]txt")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(llmsTxt, {
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
