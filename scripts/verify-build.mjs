#!/usr/bin/env node
/**
 * Postbuild do deploy nativo (GitHub -> Hostinger).
 *
 * 1. Falha o build se `.output/server/index.mjs` ou os estáticos de
 *    `.output/public/assets` não existirem (ou estiverem vazios).
 * 2. Se `STATIC_DOCROOT` estiver definido (docroot servido por
 *    LiteSpeed/Apache), espelha `.output/public` para lá — assim os
 *    `/assets/*` passam a existir em disco no diretório público.
 *
 * Não versiona nada: só opera sobre artefatos gerados em build time.
 */
import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

// Layouts suportados:
//  - Node/Hostinger (preset node-server): .output/server/index.mjs + .output/public
//  - Lovable/Cloudflare (preset cloudflare-module): dist/server/index.mjs + dist/client
const layouts = [
  { server: ".output/server/index.mjs", public: ".output/public" },
  { server: "dist/server/index.mjs", public: "dist/client" },
];
const layout =
  layouts.find((l) => existsSync(path.join(root, l.public, "assets"))) ?? layouts[0];

const serverEntry = path.join(root, layout.server);
const publicDir = path.join(root, layout.public);
const assetsDir = path.join(publicDir, "assets");

function fail(message) {
  console.error(`\n[postbuild] ERRO: ${message}\n`);
  process.exit(1);
}

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

if (!existsSync(serverEntry)) fail(`SSR ausente: ${serverEntry}`);
if (!existsSync(assetsDir)) fail(`Estáticos ausentes: ${assetsDir}`);

const files = await walk(assetsDir);
const css = files.filter((f) => f.endsWith(".css"));
const js = files.filter((f) => f.endsWith(".js"));

if (files.length === 0) fail(`Diretório vazio: ${assetsDir}`);
if (css.length === 0) fail("Nenhum arquivo .css gerado em .output/public/assets.");
if (js.length === 0) fail("Nenhum arquivo .js gerado em .output/public/assets.");

console.log(
  `[postbuild] OK: ${files.length} estáticos (${css.length} css / ${js.length} js) em .output/public/assets`,
);

const docroot = process.env["STATIC_DOCROOT"];
if (docroot) {
  if (!existsSync(docroot)) fail(`STATIC_DOCROOT não existe: ${docroot}`);
  const target = path.join(docroot, "assets");
  await rm(target, { recursive: true, force: true });
  await mkdir(docroot, { recursive: true });
  await cp(publicDir, docroot, { recursive: true });
  const published = await walk(target);
  if (published.length !== files.length) {
    fail(`Cópia incompleta no docroot: ${published.length}/${files.length}`);
  }
  console.log(`[postbuild] ${published.length} estáticos publicados em ${target}`);
} else {
  const info = await stat(publicDir);
  if (!info.isDirectory()) fail("`.output/public` não é um diretório.");
  console.log(
    "[postbuild] STATIC_DOCROOT não definido — estáticos servidos pelo processo Node (.output/public).",
  );
}
