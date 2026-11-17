#!/usr/bin/env node
/**
 * Builds every site icon from Gary's face in the logo.
 *
 *   node scripts/make-favicons.mjs
 *
 * Crops Gary's head and hat out of assets/logo-original.webp, masks out the
 * logo's "G" lettering beside the jaw, puts it on the brand's deep green, and
 * writes the sizes Google, browsers and phones ask for into public/.
 * Google wants a square favicon that is a multiple of 48px, linked from the
 * homepage — favicon-48.png / favicon-96.png cover that.
 */
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const LOGO = 'assets/logo-original.webp';
const BG = '#0f4512'; // --forest
const HEAD = { left: 290, top: 20, width: 370, height: 370 }; // logo pixels
// The logo's "G" curves in just right of the jaw; everything right of this
// line (logo pixels) is painted over with the background.
const G_EDGE = [[720, 262], [660, 285], [632, 310], [616, 330], [598, 345], [588, 368], [586, 700], [720, 700]];

const S = 512;
const scale = S / HEAD.width;
const head = await sharp(LOGO).extract(HEAD).resize(S, S).png().toBuffer();
const points = G_EDGE.map(([x, y]) => `${Math.round((x - HEAD.left) * scale)},${Math.round((y - HEAD.top) * scale)}`).join(' ');
const cover = Buffer.from(`<svg width="${S}" height="${S}"><polygon points="${points}" fill="${BG}"/></svg>`);
const master = await sharp({ create: { width: S, height: S, channels: 4, background: BG } })
  .composite([{ input: head }, { input: cover }])
  .png()
  .toBuffer();

const png = (size) => sharp(master).resize(size, size, { kernel: 'lanczos3' }).png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 }).toBuffer();

const files = {
  'public/favicon-48.png': 48,
  'public/favicon-96.png': 96,
  'public/apple-touch-icon.png': 180,
  'public/icon-192.png': 192,
  'public/icon-512.png': 512,
};
for (const [file, size] of Object.entries(files)) writeFileSync(file, await png(size));

// favicon.ico with 16, 32 and 48px PNG entries (the ICO format allows PNG data).
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(size, e);      // width
  header.writeUInt8(size, e + 1);  // height
  header.writeUInt8(0, e + 2);     // palette
  header.writeUInt8(0, e + 3);     // reserved
  header.writeUInt16LE(1, e + 4);  // colour planes
  header.writeUInt16LE(32, e + 6); // bits per pixel
  header.writeUInt32LE(images[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += images[i].length;
});
writeFileSync('public/favicon.ico', Buffer.concat([header, ...images]));

console.log('Wrote favicon.ico, favicon-48/96.png, apple-touch-icon.png, icon-192/512.png');
