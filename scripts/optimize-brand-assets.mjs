import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BRAND_DIR = path.join(ROOT, "public/images/brand");
const SOURCE = path.join(BRAND_DIR, "logo-piter-kater.png");

const OUTPUTS = {
  webp: path.join(BRAND_DIR, "logo-piter-kater.webp"),
  webpSmall: path.join(BRAND_DIR, "logo-piter-kater-small.webp"),
  favicon: path.join(BRAND_DIR, "favicon.png"),
};

async function ensureSource() {
  try {
    await fs.access(SOURCE);
  } catch {
    throw new Error(`Source logo not found: ${SOURCE}`);
  }
}

async function main() {
  console.log("🎨 Brand assets optimizer\n");
  await ensureSource();

  const meta = await sharp(SOURCE).metadata();
  console.log(`Source: ${SOURCE}`);
  console.log(`Size: ${meta.width}x${meta.height}\n`);

  await sharp(SOURCE)
    .resize({ width: 700, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(OUTPUTS.webp);
  console.log(`✓ ${OUTPUTS.webp}`);

  await sharp(SOURCE)
    .resize({ width: 260, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(OUTPUTS.webpSmall);
  console.log(`✓ ${OUTPUTS.webpSmall}`);

  await sharp(SOURCE)
    .resize(512, 512, { fit: "cover", position: "centre" })
    .png()
    .toFile(OUTPUTS.favicon);
  console.log(`✓ ${OUTPUTS.favicon}`);

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
