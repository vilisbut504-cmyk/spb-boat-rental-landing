import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BRAND_DIR = path.join(ROOT, "public/images/brand");
const SOURCE = path.join(BRAND_DIR, "logo-piter-kater.png");
/** Current mark — trim excess transparent padding, then rewrite sizes */
/** Unpadded archive of the graphic mark — created once from the first padded export */
const MARK_SOURCE = path.join(BRAND_DIR, "logo-mark-source.webp");
const MARK_FALLBACK = path.join(BRAND_DIR, "logo-mark-lg.webp");

const OUTPUTS = {
  webp: path.join(BRAND_DIR, "logo-piter-kater.webp"),
  webpSmall: path.join(BRAND_DIR, "logo-piter-kater-small.webp"),
  favicon: path.join(BRAND_DIR, "favicon.png"),
  mark: path.join(BRAND_DIR, "logo-mark.webp"),
  markLg: path.join(BRAND_DIR, "logo-mark-lg.webp"),
};

async function ensureSource() {
  try {
    await fs.access(SOURCE);
  } catch {
    throw new Error(`Source logo not found: ${SOURCE}`);
  }
}

async function ensureMarkSource() {
  try {
    await fs.access(MARK_SOURCE);
    return;
  } catch {
    /* create archive from current padded export once */
  }
  try {
    await fs.access(MARK_FALLBACK);
  } catch {
    throw new Error(
      `Logo mark source missing: neither ${MARK_SOURCE} nor ${MARK_FALLBACK}`
    );
  }
  await fs.copyFile(MARK_FALLBACK, MARK_SOURCE);
  console.log(`Archived mark source → ${MARK_SOURCE}`);
}

async function optimizeMark() {
  console.log("\n✂ Logo mark — trim transparent padding\n");
  await ensureMarkSource();

  const trimmed = sharp(MARK_SOURCE).ensureAlpha().trim({
    threshold: 8,
  });

  const { data, info } = await trimmed
    .clone()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(
    `Trimmed content: ${info.width}x${info.height} (was padded canvas)`
  );

  // Keep a little breathing room so the mark doesn't touch the frame edge
  const pad = Math.max(4, Math.round(Math.min(info.width, info.height) * 0.04));
  const padded = await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp(padded)
    .resize({ width: 700, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(OUTPUTS.markLg);
  console.log(`✓ ${OUTPUTS.markLg}`);

  await sharp(padded)
    .resize({ width: 280, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(OUTPUTS.mark);
  console.log(`✓ ${OUTPUTS.mark}`);

  const markMeta = await sharp(OUTPUTS.mark).metadata();
  console.log(`Mark UI size: ${markMeta.width}x${markMeta.height}`);
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

  // Favicon stays on the owner-approved mark export — do not overwrite from old raster
  console.log(`↷ favicon unchanged (${OUTPUTS.favicon})`);

  await optimizeMark();

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
