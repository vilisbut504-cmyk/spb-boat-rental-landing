import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SOURCE_DIRS = [
  "public/images",
  "images",
  "public/uploads",
  "public/uploads/raw-boats",
].map((d) => path.join(ROOT, d));

const OUTPUT_DIR = path.join(ROOT, "public/images/boats-webp");
const THUMB_DIR = path.join(ROOT, "public/images/boats-webp-thumbs");

const IGNORE_DIRS = new Set([
  "boats-webp",
  "boats-webp-thumbs",
  "optimized",
  "node_modules",
  ".next",
]);

const RASTER_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
]);

/** Map Russian color keywords in filenames to slug folders */
const FILENAME_BOAT_RULES = [
  { pattern: /желт/i, slug: "zheltyy-kater" },
  { pattern: /бел/i, slug: "belyy-kater" },
  { pattern: /голуб/i, slug: "goluboy-kater" },
  { pattern: /красн/i, slug: "krasnyy-kater" },
];

function isRaster(file) {
  return RASTER_EXT.has(path.extname(file).toLowerCase());
}

function shouldSkipDir(dirName) {
  return IGNORE_DIRS.has(dirName);
}

function slugFromFilename(filename) {
  for (const { pattern, slug } of FILENAME_BOAT_RULES) {
    if (pattern.test(filename)) return slug;
  }
  return null;
}

function slugFromRelativePath(relPath) {
  const parts = relPath.split(path.sep).filter(Boolean);
  if (parts.length > 1) {
    const folder = parts[parts.length - 2];
    if (!shouldSkipDir(folder) && folder !== "images" && folder !== "uploads" && folder !== "raw-boats") {
      return folder
        .toLowerCase()
        .replace(/[^a-z0-9а-яё]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        || "general";
    }
  }
  return slugFromFilename(path.basename(relPath)) ?? "general";
}

async function walk(dir, baseDir, files = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue;
      await walk(full, baseDir, files);
      continue;
    }
    if (!entry.isFile() || !isRaster(entry.name)) continue;

    const rel = path.relative(baseDir, full);
    if (rel.includes("boats-webp")) continue;

    files.push({ full, rel, baseDir });
  }
  return files;
}

async function collectSourceFiles() {
  const all = [];
  for (const dir of SOURCE_DIRS) {
    const found = await walk(dir, dir);
    all.push(...found);
  }

  const seen = new Set();
  return all.filter((f) => {
    const key = f.full;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function processImage(inputPath, outputPath, { width, quality }) {
  await ensureDir(path.dirname(outputPath));
  await sharp(inputPath)
    .rotate()
    .resize({ width, fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toFile(outputPath);
}

async function main() {
  console.log("🖼  Boat image optimizer → WebP\n");

  const sources = await collectSourceFiles();
  console.log(`Found ${sources.length} raster image(s)\n`);

  if (sources.length === 0) {
    console.log("No images to process.");
    return;
  }

  const grouped = new Map();

  for (const file of sources) {
    const slug = slugFromRelativePath(file.rel);
    if (!grouped.has(slug)) grouped.set(slug, []);
    grouped.get(slug).push(file);
  }

  for (const [, list] of grouped) {
    list.sort((a, b) => a.full.localeCompare(b.full, "ru"));
  }

  let processed = 0;
  let skipped = 0;
  const errors = [];
  const report = [];

  for (const [slug, files] of [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`📁 ${slug} (${files.length} file(s))`);

    let index = 1;
    for (const file of files) {
      const num = String(index).padStart(2, "0");
      const outMain = path.join(OUTPUT_DIR, slug, `${num}.webp`);
      const outThumb = path.join(THUMB_DIR, slug, `${num}.webp`);

      try {
        await processImage(file.full, outMain, { width: 1600, quality: 82 });
        await processImage(file.full, outThumb, { width: 480, quality: 78 });

        const relMain = `/images/boats-webp/${slug}/${num}.webp`;
        const relThumb = `/images/boats-webp-thumbs/${slug}/${num}.webp`;

        console.log(`   ✓ ${path.basename(file.full)} → ${relMain}`);
        report.push({ slug, source: file.full, main: relMain, thumb: relThumb });
        processed++;
        index++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`   ✗ ${path.basename(file.full)}: ${msg}`);
        errors.push({ file: file.full, error: msg });
        skipped++;
      }
    }
    console.log("");
  }

  console.log("─".repeat(50));
  console.log(`Processed: ${processed}`);
  console.log(`Skipped/errors: ${skipped}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Thumbs: ${THUMB_DIR}`);

  if (errors.length) {
    console.log("\nErrors:");
    for (const e of errors) console.log(`  - ${e.file}: ${e.error}`);
  }

  const summaryPath = path.join(ROOT, "scripts/last-optimize-report.json");
  await fs.writeFile(
    summaryPath,
    JSON.stringify({ processed, skipped, errors, boats: Object.fromEntries(grouped) }, null, 2)
  );
  console.log(`\nReport saved: scripts/last-optimize-report.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
