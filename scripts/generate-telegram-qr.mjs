/**
 * Generate a local high-contrast Telegram QR PNG.
 * Usage: npm run generate:telegram-qr
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public/images/contacts/telegram-qr.png");
const URL = "https://t.me/KATER_BEZKAPITANA";

await fs.mkdir(path.dirname(OUT), { recursive: true });

await QRCode.toFile(OUT, URL, {
  type: "png",
  width: 800,
  margin: 4,
  errorCorrectionLevel: "H",
  color: { dark: "#0C0C0A", light: "#FFFFFF" },
});

const buf = await fs.readFile(OUT);
const meta = await sharp(buf).metadata();
console.log(`✓ ${OUT}`);
console.log(`  ${meta.width}x${meta.height}, ${buf.length} bytes`);
console.log(`  encodes: ${URL}`);
