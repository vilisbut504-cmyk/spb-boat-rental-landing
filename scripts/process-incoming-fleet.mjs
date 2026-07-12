/**
 * Curated processing of incoming-assets:2026-07-12
 * Extends the project WebP pipeline (same output dirs / sizes as optimize-images-to-webp.mjs).
 * HEIC: macOS `sips` → temp JPEG → sharp WebP (sharp cannot read these HEIC files).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const INCOMING = path.join(ROOT, "incoming-assets:2026-07-12");
const OUTPUT_DIR = path.join(ROOT, "public/images/boats-webp");
const THUMB_DIR = path.join(ROOT, "public/images/boats-webp-thumbs");
const HERO_DIR = path.join(ROOT, "public/images/hero");

const MAIN = { width: 1600, quality: 86 };
const THUMB = { width: 480, quality: 80 };
const HERO = { width: 1920, quality: 84 };

/**
 * Curated mapping: only high-confidence boat assignments.
 * Red & Black has no confident photos in this drop.
 * Route / PDF / screenshot files are intentionally omitted.
 */
const BOAT_MAP = {
  "krasnyy-kater": [
    "красный See sex.jpg",
    "красный See sex2.jpg",
    "красный See sex3.JPG",
    "красный See sex4.JPG",
    "See sex 2.JPG",
    "See sex 5.JPG",
  ],
  "belyy-kater": [
    "Белая акула.jpeg",
    "Белая акула 2.jpeg",
    "Белая акула 3.jpeg",
    "Белая акула 4.jpeg",
    "Белая акула 5.JPG",
  ],
  "zheltyy-kater": [
    "Yellow space.HEIC",
    "Yellow space 2.HEIC",
    "Yellow space 3.HEIC",
    "Yellow space 4.HEIC",
    "Yellow space 5.HEIC",
    // existing local original (kept as extra gallery frame)
    "__EXISTING__/Желтый катер, фото 1.jpeg",
  ],
  tiffany: [
    "Tiffany.JPG",
    "Tiffany 2.JPG",
    "Tiffany 3.JPG",
    "Tiffany 4.JPG",
    // Tiffany 5.JPG is an exact duplicate of Tiffany 3.JPG — skipped
  ],
  "total-black": [
    "Тотал блэк.JPG",
    "Тотал блэк 2.JPG",
    "Тотал блэк 3.JPG",
    "Тотал блэк 4.JPG",
    "Тотал блэк 5.JPG",
  ],
};

async function findHeroSource() {
  const entries = await fs.readdir(INCOMING);
  const hit = entries.find(
    (n) => /главн/i.test(n) && /перв/i.test(n) && /\.png$/i.test(n)
  );
  if (!hit) throw new Error("Hero PNG not found in incoming folder");
  return path.join(INCOMING, hit);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function isHeic(filePath) {
  return /\.heic$/i.test(filePath);
}

async function resolveReadable(inputPath, tempDir) {
  if (!isHeic(inputPath)) return { path: inputPath, temp: null };

  const base = path.basename(inputPath, path.extname(inputPath));
  const out = path.join(tempDir, `${base}.jpg`);
  execFileSync("sips", ["-s", "format", "jpeg", inputPath, "--out", out], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  return { path: out, temp: out };
}

async function writeWebp(inputPath, outputPath, { width, quality }) {
  await ensureDir(path.dirname(outputPath));
  await sharp(inputPath)
    .rotate()
    .resize({ width, fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toFile(outputPath);
}

async function clearSlug(slug) {
  for (const root of [OUTPUT_DIR, THUMB_DIR]) {
    const dir = path.join(root, slug);
    await fs.rm(dir, { recursive: true, force: true });
    await ensureDir(dir);
  }
}

async function processBoat(slug, filenames, tempDir, report) {
  console.log(`\n📁 ${slug} (${filenames.length} file(s))`);
  await clearSlug(slug);

  let index = 1;
  for (const name of filenames) {
    const full = name.startsWith("__EXISTING__/")
      ? path.join(ROOT, "public/images", name.replace("__EXISTING__/", ""))
      : path.join(INCOMING, name);
    if (!fsSync.existsSync(full)) {
      console.error(`   ✗ missing: ${name}`);
      report.errors.push({ file: name, error: "missing" });
      continue;
    }

    let readable;
    try {
      readable = await resolveReadable(full, tempDir);
      const num = String(index).padStart(2, "0");
      const outMain = path.join(OUTPUT_DIR, slug, `${num}.webp`);
      const outThumb = path.join(THUMB_DIR, slug, `${num}.webp`);

      await writeWebp(readable.path, outMain, MAIN);
      await writeWebp(readable.path, outThumb, THUMB);

      console.log(`   ✓ ${name} → ${slug}/${num}.webp`);
      report.boats.push({
        source: name,
        slug,
        main: `/images/boats-webp/${slug}/${num}.webp`,
        thumb: `/images/boats-webp-thumbs/${slug}/${num}.webp`,
        heicVia: isHeic(full) ? "sips→jpeg→sharp" : "sharp",
      });
      index++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`   ✗ ${name}: ${msg}`);
      report.errors.push({ file: name, error: msg });
    } finally {
      if (readable?.temp) {
        await fs.unlink(readable.temp).catch(() => {});
      }
    }
  }

  return index - 1;
}

async function processHero(report) {
  console.log("\n🖼  Hero");
  const src = await findHeroSource();
  await ensureDir(HERO_DIR);
  const out = path.join(HERO_DIR, "hero-fleet-lakhta.webp");
  await sharp(src)
    .rotate()
    .resize({ width: HERO.width, fit: "inside", withoutEnlargement: true })
    .webp({ quality: HERO.quality, effort: 4 })
    .toFile(out);

  const meta = await sharp(out).metadata();
  console.log(
    `   ✓ ${path.basename(src)} → /images/hero/hero-fleet-lakhta.webp (${meta.width}x${meta.height})`
  );
  report.hero = {
    source: path.basename(src),
    output: "/images/hero/hero-fleet-lakhta.webp",
    width: meta.width,
    height: meta.height,
  };
}

async function main() {
  console.log("🚤 Incoming fleet optimizer (curated)\n");
  if (!fsSync.existsSync(INCOMING)) {
    throw new Error(`Incoming folder not found: ${INCOMING}`);
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "boat-heic-"));
  const report = { boats: [], errors: [], hero: null, unassigned: [] };

  try {
    await processHero(report);

    for (const [slug, files] of Object.entries(BOAT_MAP)) {
      await processBoat(slug, files, tempDir, report);
    }

    // Keep Blue Wave existing gallery (goluboy-kater) — no overwrite
    console.log("\n📁 goluboy-kater — kept existing WebP gallery (no new sources)");

    report.unassigned = [
      "красная-Акула 2.jpeg … 6.jpeg + Красная акула.jpeg — all-red, overlaps Sexy Sea Red visually; not assigned to Red & Black",
      "photo_2026-07-12 16.42.14.jpeg — website screenshot, not a boat photo",
      "Маршрут 1–5 + PDF — deferred to stage 2",
      "Red & Black — no confident unique photos in this drop",
    ];

    const summaryPath = path.join(ROOT, "scripts/last-incoming-optimize-report.json");
    await fs.writeFile(summaryPath, JSON.stringify(report, null, 2));
    console.log("\n─".repeat(40));
    console.log(`Processed boat frames: ${report.boats.length}`);
    console.log(`Errors: ${report.errors.length}`);
    console.log(`Report: ${summaryPath}`);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
