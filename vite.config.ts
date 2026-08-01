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
  // Contrato de build do deploy nativo (GitHub -> Hostinger, config "Nitro",
  // saída `.output`, entrada `server/index.mjs`): preset Node, que serve os
  // estáticos de `.output/public` no próprio processo.
  // `NITRO_PRESET` do painel continua tendo precedência; dentro do build da
  // Lovable este bloco é ignorado (Cloudflare é forçado pelo preset da plataforma).
  nitro: {
    preset: process.env["NITRO_PRESET"] ?? "node-server",
  },
  vite: {
    plugins: [mcpPlugin()],
  },
});


