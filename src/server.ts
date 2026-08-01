import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function withCacheHeaders(request: Request, response: Response): Response {
  const { pathname } = new URL(request.url);
  const isVersioned =
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/_build/") ||
    pathname.startsWith("/_server/");
  const isStaticAsset =
    isVersioned ||
    /\.(?:js|mjs|css|woff2?|ttf|otf|webp|avif|png|jpg|jpeg|gif|svg|ico|map)$/.test(pathname);
  if (isStaticAsset && response.status < 400) {
    const headers = new Headers(response.headers);
    if (isVersioned) {
      headers.set("cache-control", "public, max-age=31536000, immutable");
    } else if (!headers.get("cache-control")) {
      headers.set("cache-control", "public, max-age=604800");
    }
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
  return response;
}

// ---------------------------------------------------------------------------
// Fallback de estáticos para runtimes Node (Hostinger/PM2).
// O preset de build entrega os estáticos em `.output/public`, mas em Node não
// existe a camada de assets do edge: sem isso `/assets/*.css|js` retorna 404.
// ---------------------------------------------------------------------------
const isNodeRuntime =
  typeof process !== "undefined" &&
  !!(process as unknown as { versions?: { node?: string } }).versions?.node &&
  (globalThis as { navigator?: { userAgent?: string } }).navigator?.userAgent !==
    "Cloudflare-Workers";

const MIME: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

let publicDirPromise: Promise<string | null> | undefined;

async function resolvePublicDir(): Promise<string | null> {
  const [{ existsSync }, path, { fileURLToPath }] = await Promise.all([
    import("node:fs"),
    import("node:path"),
    import("node:url"),
  ]);
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(here, "../public"),
    path.resolve(here, "./public"),
    path.resolve(process.cwd(), ".output/public"),
    path.resolve(process.cwd(), "public"),
  ];
  return candidates.find((dir) => existsSync(path.join(dir, "assets"))) ?? null;
}

async function serveStaticFromDisk(request: Request): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  if (!/\.[a-z0-9]+$/i.test(pathname) || pathname.includes("..")) return null;

  const path = await import("node:path");
  const { existsSync, statSync, createReadStream } = await import("node:fs");

  if (!publicDirPromise) publicDirPromise = resolvePublicDir();
  const publicDir = await publicDirPromise;
  if (!publicDir) return null;

  const filePath = path.join(publicDir, decodeURIComponent(pathname));
  if (!filePath.startsWith(publicDir)) return null;
  if (!existsSync(filePath) || !statSync(filePath).isFile()) return null;

  const { size } = statSync(filePath);
  const body = createReadStream(filePath) as unknown as ReadableStream;
  return new Response(body as BodyInit, {
    status: 200,
    headers: {
      "content-type": MIME[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
      "content-length": String(size),
    },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      let response = await handler.fetch(request, env, ctx);
      if (response.status === 404 && isNodeRuntime) {
        response = (await serveStaticFromDisk(request)) ?? response;
      }
      return withCacheHeaders(request, await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

