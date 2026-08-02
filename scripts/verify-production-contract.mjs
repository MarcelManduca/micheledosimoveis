import fs from "node:fs";
import path from "node:path";

function log(msg) {
  console.log(`[verify-production-contract] ${msg}`);
}

function error(msg) {
  console.error(`[verify-production-contract] ERROR: ${msg}`);
}

function main() {
  log("Starting production build contract verification...");

  const cwd = process.cwd();
  const outputDir = path.resolve(cwd, ".output");
  const serverEntry = path.join(outputDir, "server", "index.mjs");
  const publicAssetsDir = path.join(outputDir, "public", "assets");

  if (!fs.existsSync(serverEntry)) {
    error(`Server entry point not found: ${serverEntry}`);
    process.exit(1);
  }
  log(`✓ Confirmed server entry file exists: ${serverEntry}`);

  if (!fs.existsSync(publicAssetsDir) || !fs.statSync(publicAssetsDir).isDirectory()) {
    error(`Public assets directory not found: ${publicAssetsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(publicAssetsDir);
  const hasCss = files.some((f) => f.endsWith(".css"));
  const hasJs = files.some((f) => f.endsWith(".js"));

  if (!hasCss) {
    error(`No .css files found in ${publicAssetsDir}`);
    process.exit(1);
  }
  if (!hasJs) {
    error(`No .js files found in ${publicAssetsDir}`);
    process.exit(1);
  }

  log(`✓ Confirmed public assets directory contains valid CSS and JS files (${files.length} items found).`);
  log("✓ Production build contract verification PASSED.");
}

main();
