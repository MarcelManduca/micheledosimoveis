// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Fora do build da Lovable (ex.: deploy nativo GitHub -> Hostinger, Node/PM2),
  // gerar saída Node em `.output/` — o preset `node-server` sobe um servidor
  // HTTP real e serve automaticamente os estáticos de `.output/public`.
  // Dentro do build da Lovable estes overrides são ignorados (Cloudflare forçado).
  nitro: {
    preset: process.env["NITRO_PRESET"] ?? "node-server",
    output: {
      dir: ".output",
      publicDir: ".output/public",
      serverDir: ".output/server",
    },
  },
  vite: {
    plugins: [mcpPlugin()],
  },
});


