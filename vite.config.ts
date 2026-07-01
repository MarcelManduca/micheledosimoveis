// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    routeRules: {
      "/assets/**": {
        headers: {
          "cache-control": "public, max-age=31536000, immutable",
        },
      },
      "/_build/**": {
        headers: {
          "cache-control": "public, max-age=31536000, immutable",
        },
      },
      "/favicon.ico": { headers: { "cache-control": "public, max-age=604800" } },
      "/favicon-16.png": { headers: { "cache-control": "public, max-age=604800" } },
      "/favicon-32.png": { headers: { "cache-control": "public, max-age=604800" } },
      "/apple-touch-icon.png": { headers: { "cache-control": "public, max-age=604800" } },
      "/michele-dos-imoveis-og.png": { headers: { "cache-control": "public, max-age=604800" } },
    },
  },
});
