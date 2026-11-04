import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';

const base = 'https://always-070.github.io/jiangnan-science-play/';
const pages = [
  { path: 'qinglan-bay', zhName: '青澜湾菌株人格问卷', enName: 'Qinglan Bay Strain Profile', query: '?lang=en' },
  { path: '7-dhc-2048', zhName: '7-DHC 2048 合成游戏', enName: '7-DHC 2048 · Biosynthesis Game' },
  { path: 'steroid-tile-atlas', zhName: '甾体三消游戏', enName: 'Steroid Tile Atlas' },
];
const directory = fileURLToPath(new URL('../public/qr/', import.meta.url));
await mkdir(directory, { recursive: true });
for (const page of pages) {
  const url = `${base}${page.path}/${page.query || ''}`;
  const options = { errorCorrectionLevel: 'H', margin: 4, width: 1200, color: { dark: '#000000', light: '#ffffff' } };
  const png = await QRCode.toBuffer(url, { ...options, type: 'png' });
  const decoded = PNG.sync.read(png);
  const actual = jsQR(new Uint8ClampedArray(decoded.data), decoded.width, decoded.height)?.data;
  if (actual !== url) throw new Error(`QR decoding failed: ${page.path}`);
  await writeFile(`${directory}/${page.path}.png`, png);
  await writeFile(`${directory}/${page.path}.svg`, await QRCode.toString(url, { ...options, type: 'svg' }));
  page.url = url;
  page.label = `${page.zhName} / ${page.enName}`;
  console.log(`Verified QR: ${url}`);
}
await writeFile(`${directory}/links.json`, JSON.stringify(pages, null, 2) + '\n');
