import fs from "node:fs";
import path from "node:path";

function log(msg) {
  console.log(`[publish-hostinger-assets] ${msg}`);
}

function error(msg) {
  console.error(`[publish-hostinger-assets] ERROR: ${msg}`);
}

async function main() {
  const hostingerPublicHtml = process.env.HOSTINGER_PUBLIC_HTML;

  if (!hostingerPublicHtml || hostingerPublicHtml.trim() === "") {
    log("Hostinger publish skipped");
    process.exit(0);
  }

  const targetPublicHtml = path.resolve(hostingerPublicHtml.trim());
  const sourceAssetsDir = path.resolve(process.cwd(), ".output/public/assets");

  log(`Target public_html: ${targetPublicHtml}`);
  log(`Source assets dir: ${sourceAssetsDir}`);

  if (!fs.existsSync(sourceAssetsDir)) {
    error(`Source directory does not exist: ${sourceAssetsDir}`);
    process.exit(1);
  }

  const sourceFiles = fs.readdirSync(sourceAssetsDir);
  const hasCss = sourceFiles.some((f) => f.endsWith(".css"));
  const hasJs = sourceFiles.some((f) => f.endsWith(".js"));

  if (!hasCss || !hasJs) {
    error("Source assets directory must contain at least one .css and one .js file.");
    process.exit(1);
  }

  if (!fs.existsSync(targetPublicHtml)) {
    error(`Target HOSTINGER_PUBLIC_HTML directory does not exist: ${targetPublicHtml}`);
    process.exit(1);
  }

  const targetAssetsDir = path.join(targetPublicHtml, "assets");
  const tempDirName = `.assets-tmp-${Date.now()}`;
  const tempDir = path.join(targetPublicHtml, tempDirName);
  const oldBackupDirName = `.assets-old-${Date.now()}`;
  const oldBackupDir = path.join(targetPublicHtml, oldBackupDirName);

  log(`Creating temporary staging directory: ${tempDir}`);
  fs.mkdirSync(tempDir, { recursive: true });

  let copySuccess = false;
  try {
    fs.cpSync(sourceAssetsDir, tempDir, { recursive: true });
    const copiedFiles = fs.readdirSync(tempDir);
    log(`Successfully copied ${copiedFiles.length} files to temporary directory.`);
    copySuccess = true;
  } catch (err) {
    error(`Failed to copy assets to temporary directory: ${err.message}`);
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    process.exit(1);
  }

  if (!copySuccess) {
    process.exit(1);
  }

  let oldAssetsRenamed = false;
  try {
    if (fs.existsSync(targetAssetsDir)) {
      log(`Renaming existing assets directory to temporary backup: ${oldBackupDir}`);
      fs.renameSync(targetAssetsDir, oldBackupDir);
      oldAssetsRenamed = true;
    }

    log(`Promoting staging directory to target assets: ${targetAssetsDir}`);
    fs.renameSync(tempDir, targetAssetsDir);

    if (oldAssetsRenamed && fs.existsSync(oldBackupDir)) {
      log("Cleaning up temporary backup directory...");
      fs.rmSync(oldBackupDir, { recursive: true, force: true });
    }

    log("Hostinger assets published successfully.");
  } catch (err) {
    error(`Failed during atomic directory swap: ${err.message}`);
    log("Initiating automatic rollback...");

    if (fs.existsSync(targetAssetsDir) && !fs.existsSync(tempDir)) {
      // Swapped partially or corrupted
    }

    if (oldAssetsRenamed && fs.existsSync(oldBackupDir)) {
      try {
        if (fs.existsSync(targetAssetsDir)) {
          fs.rmSync(targetAssetsDir, { recursive: true, force: true });
        }
        fs.renameSync(oldBackupDir, targetAssetsDir);
        log("Rollback completed: Restored previous assets directory.");
      } catch (rollbackErr) {
        error(`Rollback failed: ${rollbackErr.message}`);
      }
    }

    if (fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanErr) {
        // ignore
      }
    }

    process.exit(1);
  }
}

main();
