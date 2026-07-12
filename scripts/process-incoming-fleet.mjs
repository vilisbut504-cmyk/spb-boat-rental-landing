/**
 * Curated processing of incoming-assets:2026-07-12
 * Final seven-boat fleet mapping (owner-confirmed).
 * HEIC: macOS `sips` → temp JPEG → sharp WebP.
 *
 * Output naming: {prefix}-01.webp inside boats-webp/{slug}/
 * Red & Black reuses Total Black WebP URLs in data (no physical copies).
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
 * Owner-final mapping. Only NEW incoming files.
 * No old project originals (Blue Wave / Желтый катер / etc.).
 */
const BOAT_MAP = [
  {
    slug: "tiffany",
    prefix: "tiffany",
    files: [
      "Tiffany.JPG",
      "Tiffany 2.JPG",
      "Tiffany 3.JPG",
      "Tiffany 4.JPG",
      // Tiffany 5.JPG is exact duplicate of Tiffany 3 — skipped
    ],
  },
  {
    slug: "krasnyy-kater",
    prefix: "sexy-sea-red",
    files: [
      "красный See sex.jpg",
      "красный See sex2.jpg",
      "красный See sex3.JPG",
      "красный See sex4.JPG",
      "See sex 2.JPG",
      "See sex 5.JPG",
    ],
  },
  {
    slug: "red-shark",
    prefix: "red-shark",
    files: [
      "Красная акула.jpeg",
      "красная-Акула 2.jpeg",
      "красная-Акула 3.jpeg",
      "красная-Акула 4.jpeg",
      "красная-Акула 5.jpeg",
      "красная-Акула 6.jpeg",
    ],
  },
  {
    slug: "total-black",
    prefix: "total-black",
    files: [
      "Тотал блэк.JPG",
      "Тотал блэк 2.JPG",
      "Тотал блэк 3.JPG",
      "Тотал блэк 4.JPG",
      "Тотал блэк 5.JPG",
    ],
  },
  {
    slug: "zheltyy-kater",
    prefix: "yellow-space",
    files: [
      "Yellow space.HEIC",
      "Yellow space 2.HEIC",
      "Yellow space 3.HEIC",
      "Yellow space 4.HEIC",
      "Yellow space 5.HEIC",
    ],
  },
  {
    slug: "belyy-kater",
    prefix: "white-shark",
    files: [
      "Белая акула.jpeg",
      "Белая акула 2.jpeg",
      "Белая акула 3.jpeg",
      "Белая акула 4.jpeg",
      "Белая акула 5.JPG",
    ],
  },
];

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

async function processBoat({ slug, prefix, files }, tempDir, report) {
  console.log(`\n📁 ${slug} / ${prefix} (${files.length} file(s))`);
  await clearSlug(slug);

  let index = 1;
  for (const name of files) {
    const full = path.join(INCOMING, name);
    if (!fsSync.existsSync(full)) {
      console.error(`   ✗ missing: ${name}`);
      report.errors.push({ file: name, error: "missing" });
      continue;
    }

    let readable;
    try {
      readable = await resolveReadable(full, tempDir);
      const num = String(index).padStart(2, "0");
      const fileName = `${prefix}-${num}.webp`;
      const outMain = path.join(OUTPUT_DIR, slug, fileName);
      const outThumb = path.join(THUMB_DIR, slug, fileName);

      await writeWebp(readable.path, outMain, MAIN);
      await writeWebp(readable.path, outThumb, THUMB);

      console.log(`   ✓ ${name} → ${slug}/${fileName}`);
      report.boats.push({
        source: name,
        slug,
        prefix,
        main: `/images/boats-webp/${slug}/${fileName}`,
        thumb: `/images/boats-webp-thumbs/${slug}/${fileName}`,
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

  report.counts = report.counts || {};
  report.counts[slug] = index - 1;
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
  console.log("🚤 Finalize seven-boat fleet optimizer\n");
  console.log(`Incoming: ${INCOMING}`);
  if (!fsSync.existsSync(INCOMING)) {
    throw new Error(`Incoming folder not found: ${INCOMING}`);
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "boat-heic-"));
  const report = {
    boats: [],
    errors: [],
    hero: null,
    counts: {},
    notes: [
      "Blue Wave removed from active fleet — not processed",
      "Red & Black shares Total Black WebP URLs in data/boats.ts (no physical copies)",
      "Old project originals not used",
      "Tiffany 5 skipped as duplicate of Tiffany 3",
    ],
  };

  try {
    await processHero(report);

    for (const boat of BOAT_MAP) {
      await processBoat(boat, tempDir, report);
    }

    console.log(
      "\n📁 red-black — no physical WebP; reuses total-black URLs in data"
    );

    const summaryPath = path.join(
      ROOT,
      "scripts/last-incoming-optimize-report.json"
    );
    await fs.writeFile(summaryPath, JSON.stringify(report, null, 2));
    console.log("\n" + "─".repeat(50));
    console.log(`Processed boat frames: ${report.boats.length}`);
    console.log(`Errors: ${report.errors.length}`);
    console.log("Counts:", report.counts);
    console.log(`Report: ${summaryPath}`);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
