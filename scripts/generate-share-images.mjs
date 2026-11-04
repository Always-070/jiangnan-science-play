import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import QRCode from 'qrcode';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';

const directory = fileURLToPath(new URL('../public/share/', import.meta.url));
const pages = JSON.parse(await readFile(new URL('../public/qr/links.json', import.meta.url), 'utf8'));
const themes = {
  'qinglan-bay': { background: '#f4f6ea', ink: '#174f57', accent: '#d9c573', line: '#c5d8c9', action: '扫码开启青澜湾之旅', actionEn: 'Scan to explore Qinglan Bay' },
  '7-dhc-2048': { background: '#08120e', ink: '#f3f7ec', accent: '#baef78', line: '#2b4236', action: '扫码开始合成', actionEn: 'Scan to play 7-DHC 2048' },
  'steroid-tile-atlas': { background: '#eef4ed', ink: '#29483d', accent: '#648c74', line: '#c2d4c7', action: '扫码开始三消挑战', actionEn: 'Scan to play Steroid Tile Atlas' },
};
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
function verify(buffer, expectedURL, label) {
  const png = PNG.sync.read(buffer);
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  assert.equal(decoded?.data, expectedURL, `${label} must decode to its exact page`);
}

await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1440 }, deviceScaleFactor: 1 });
  for (const [index, activity] of pages.entries()) {
    const theme = themes[activity.path];
    const modules = QRCode.create(activity.url, { errorCorrectionLevel: 'H' }).modules.size + 8;
    const side = modules * Math.floor(780 / modules);
    const code = await QRCode.toString(activity.url, { type: 'svg', errorCorrectionLevel: 'H', margin: 4, color: { dark: '#000000', light: '#ffffff' } });
    const nestedCode = code.replace('<svg ', `<svg x="${(1080 - side) / 2}" y="${350 + (840 - side) / 2}" width="${side}" height="${side}" `);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440">
  <title>${escape(activity.label)}</title>
  <desc>${escape(activity.url)}</desc>
  <style>text{font-family:'Microsoft YaHei','Noto Sans CJK SC',Arial,sans-serif;fill:${theme.ink}}</style>
  <rect width="1080" height="1440" fill="${theme.background}"/>
  <path d="M72 116H1008" stroke="${theme.line}" stroke-width="2"/>
  <path d="M72 116H216" stroke="${theme.accent}" stroke-width="5"/>
  <text x="72" y="82" font-size="23" font-weight="700" letter-spacing="3">JIANGNAN-CHINA 2026</text>
  <text x="1008" y="82" text-anchor="end" font-size="23" letter-spacing="3">0${index + 1} / 03</text>
  <text x="540" y="216" text-anchor="middle" font-size="56" font-weight="700">${escape(activity.zhName)}</text>
  <text x="540" y="278" text-anchor="middle" font-size="38" font-weight="400">${escape(activity.enName)}</text>
  <rect x="120" y="350" width="840" height="840" rx="32" fill="#ffffff" stroke="${theme.line}" stroke-width="2"/>
  ${nestedCode}
  <text x="540" y="1266" text-anchor="middle" font-size="37" font-weight="700">${escape(theme.action)}</text>
  <text x="540" y="1313" text-anchor="middle" font-size="27">${escape(theme.actionEn)}</text>
  <text x="540" y="1390" text-anchor="middle" font-size="20" letter-spacing="1" opacity=".7">SCIENCE PLAY · EXPLORE / LEARN / PLAY</text>
</svg>`;
    await writeFile(`${directory}/${activity.path}.svg`, svg + '\n');
    await page.setViewportSize({ width: 1080, height: 1440 });
    await page.setContent(`<html><head><meta charset="UTF-8"></head><body style="margin:0">${svg}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    const bounds = await page.locator('text').evaluateAll(elements => elements.map(el => {
      const box = el.getBoundingClientRect();
      return { text: el.textContent, left: box.left, right: box.right, top: box.top, bottom: box.bottom };
    }));
    assert.ok(bounds.every(box => box.left >= 32 && box.right <= 1048 && box.top >= 0 && box.bottom <= 1440), `Text fits: ${activity.path}`);
    const png = await page.screenshot({ path: `${directory}/${activity.path}.png`, animations: 'disabled' });
    verify(png, activity.url, `${activity.path}: full size`);
    await page.setViewportSize({ width: 540, height: 720 });
    await page.setContent(`<body style="margin:0"><img style="display:block;width:540px;height:720px" src="data:image/png;base64,${png.toString('base64')}"></body>`);
    await page.locator('img').evaluate(img => img.decode());
    verify(await page.screenshot(), activity.url, `${activity.path}: half size`);
    console.log(`Verified bilingual share card (1080×1440 and 540×720): ${activity.url}`);
  }
} finally {
  await browser.close();
}
