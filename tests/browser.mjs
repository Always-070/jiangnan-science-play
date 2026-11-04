import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { QUESTIONS } from '../src/contents/strain-personality-data.ts';
import { scoreQuiz } from '../src/contents/strain-personality-scoring.ts';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4178/jiangnan-science-play/';
const round = process.env.TEST_ROUND || 'development';
const output = `output/playwright/${round}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
const passed = [];
const check = (name, condition) => { assert.ok(condition, name); passed.push(name); };
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'en-US' });

function watch(page) {
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on('request', request => {
    if (/^https?:/.test(request.url()) && !request.url().startsWith(new URL(base).origin)) errors.push(`External request: ${request.url()}`);
  });
}
const page = await context.newPage();
watch(page);
page.setDefaultTimeout(12000);
async function ready(path, selector) {
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.locator(selector).first().waitFor();
  await page.evaluate(() => document.fonts.ready);
}
async function fits(label) {
  const sizes = await page.evaluate(() => ({ viewport: innerWidth, page: document.documentElement.scrollWidth }));
  check(`${label}: no horizontal overflow`, sizes.page <= sizes.viewport + 1);
}
async function picture(name) { await page.screenshot({ path: `${output}/${name}.png`, fullPage: true, animations: 'disabled' }); }
const state2048 = () => page.evaluate(() => localStorage.getItem('7dhc-2048-offline-v1'));

try {
  await ready('qinglan-bay/', '.strain-lab-guide img');
  check('Quiz Wiki navigation removed', await page.locator('.atlas-navbar').count() === 0);
  check('Quiz map loaded', await page.locator('.strain-lab-guide img').evaluate(img => img.complete && img.naturalWidth > 0));
  check('Quiz original colour', await page.locator('.strain-lab').evaluate(el => getComputedStyle(el).backgroundColor) === 'rgb(244, 246, 234)');
  const balance = await page.evaluate(() => {
    const top = document.querySelector('.strain-lab-guide').getBoundingClientRect().top;
    const header = document.querySelector('.strain-lab-topbar').getBoundingClientRect().bottom;
    const bottom = document.querySelector('.strain-lab-landing-footer').getBoundingClientRect().bottom;
    return { upper: top - header, lower: innerHeight - bottom };
  });
  check('Quiz landing vertically centered below language bar', Math.abs(balance.upper - balance.lower) <= 2);
  await picture('quiz-desktop');
  await page.getByRole('button', { name: '中文', exact: true }).click();
  check('Quiz Chinese toggle', await page.locator('html').getAttribute('lang') === 'zh-CN');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await page.getByRole('button', { name: /Begin the Qinglan Bay journey/ }).click();
  check('Quiz next requires an answer', await page.locator('.strain-lab-actions .strain-lab-primary').isDisabled());
  await page.locator('.strain-lab-note-link').click();
  check('Quiz glossary opens', await page.locator('dialog').isVisible());
  await page.keyboard.press('Escape');
  check('Quiz glossary closes', !(await page.locator('dialog').isVisible()));
  const answers = {};
  for (let i = 0; i < QUESTIONS.length; i++) {
    const value = (i % 4) + 1;
    answers[QUESTIONS[i].id] = value;
    await page.locator('.strain-lab-values button').nth(value - 1).click();
    await page.locator('.strain-lab-actions .strain-lab-primary').click();
  }
  const expected = scoreQuiz(QUESTIONS, answers);
  check('Quiz completes all 24 questions', (await page.locator('body').innerText()).includes('All 24 travel scenes completed'));
  check('Quiz expected type', (await page.locator('body').innerText()).includes(expected.type));
  await page.locator('.strain-lab-result img').evaluate(img => img.decode());
  check('Quiz result artwork loaded', await page.locator('.strain-lab-result img').evaluateAll(imgs => imgs.length > 0 && imgs.every(img => img.complete && img.naturalWidth > 0)));
  await picture('quiz-result');
  const quizSession = await page.evaluate(() => localStorage.getItem('strain-personality-lab:session:v2'));
  await page.getByRole('button', { name: '中文', exact: true }).click();
  check('Quiz language preserves answers', await page.evaluate(() => localStorage.getItem('strain-personality-lab:session:v2')) === quizSession);
  await page.reload({ waitUntil: 'networkidle' });
  check('Quiz reload retains answers', await page.evaluate(() => localStorage.getItem('strain-personality-lab:session:v2')) === quizSession);

  await ready('7-dhc-2048/', '#board .cell');
  check('2048 defaults to English', await page.locator('html').getAttribute('lang') === 'en');
  check('2048 has 16 cells', await page.locator('#board .cell').count() === 16);
  await picture('2048-desktop');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowUp');
  check('2048 keyboard moves', Number(await page.locator('#moves').innerText()) === 2);
  check('2048 merges and scores', Number(await page.locator('#score').innerText()) >= 4);
  const played = await state2048();
  await page.getByRole('button', { name: '中文', exact: true }).click();
  check('2048 switches all static copy', (await page.locator('h1').innerText()).includes('从一个碳源开始'));
  check('2048 translated pathway', (await page.locator('#pathList').innerText()).includes('乙酰辅酶A'));
  check('2048 language preserves game', await state2048() === played);
  await page.reload({ waitUntil: 'networkidle' });
  check('2048 reload retains locale', await page.locator('html').getAttribute('lang') === 'zh-CN');
  check('2048 reload retains game', await state2048() === played);
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  check('2048 English dynamic text', (await page.locator('#progressText').innerText()).includes('pathway unlocked'));
  check('2048 English has no untranslated Chinese copy', !/[\u3400-\u9fff]/.test((await page.locator('body').innerText()).replace('中文', '')));

  const winning = [1024,1024,0,0,...Array(12).fill(0)];
  await page.evaluate(board => localStorage.setItem('7dhc-2048-offline-v1', JSON.stringify({board,score:0,best:0,moves:0,hasWon:false})), winning);
  await page.reload({waitUntil:'networkidle'});
  await page.getByRole('button', { name: 'Move left', exact: true }).click();
  check('2048 winning merge', await page.locator('#modalTitle').innerText() === '7-DHC synthesized!');
  await page.getByRole('button', { name: '中文', exact: true }).click();
  check('2048 winning dialog switches language', await page.locator('#modalTitle').innerText() === '7-DHC 已生成！');
  await page.getByRole('button', { name: '继续合成', exact: true }).click();
  check('2048 continue after win', !(await page.locator('#modal').isVisible()));
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  const full = [2,4,2,4,4,2,4,2,2,4,2,4,4,2,4,2];
  await page.evaluate(board => localStorage.setItem('7dhc-2048-offline-v1', JSON.stringify({board,score:64,best:64,moves:7,hasWon:false})), full);
  await page.reload({waitUntil:'networkidle'});
  check('2048 game-over English', await page.locator('#modalTitle').innerText() === 'This reaction has ended');
  await page.getByRole('button', { name: '中文', exact: true }).click();
  check('2048 game-over Chinese', await page.locator('#modalTitle').innerText() === '本轮反应结束');
  await page.getByRole('button', {name:'开始新一轮',exact:true}).click();
  check('2048 restart resets moves', await page.locator('#moves').innerText() === '0');

  await ready('steroid-tile-atlas/', '.steroid-tile.is-free');
  check('Tile-game Wiki navigation removed', await page.locator('.atlas-navbar').count() === 0);
  check('Tile-game original colour', await page.locator('.steroid-game-page').evaluate(el => getComputedStyle(el).backgroundColor) === 'rgb(237, 244, 236)');
  await picture('tiles-desktop');
  const count = await page.locator('.steroid-board .steroid-tile').count();
  await page.locator('.steroid-board .steroid-tile.is-free').first().click();
  check('Tile selection enters tray', await page.locator('.steroid-slot.is-filled').count() === 1);
  await page.getByRole('button', {name:/^Undo,/}).click();
  check('Tile undo restores board', await page.locator('.steroid-board .steroid-tile').count() === count);
  await page.getByRole('button', {name:/^Shuffle,/}).click();
  check('Tile shuffle consumes one use', await page.getByRole('button', {name:'Shuffle, 1 remaining'}).count() === 1);
  await page.getByRole('button', {name:'New board',exact:true}).click();
  check('Tile reset restores tools', await page.getByRole('button', {name:'Shuffle, 2 remaining'}).count() === 1);
  await page.evaluate(() => localStorage.setItem('steroid-tile-atlas-highest-level', '5'));
  await page.reload({waitUntil:'networkidle'});
  for (const level of [2,3,4,5]) {
    await page.getByRole('button', {name:`Level ${level}`,exact:true}).click();
    check(`Tile level ${level} renders`, await page.locator(`main.steroid-level-${level}`).count() === 1);
  }

  for (const width of [390, 320]) {
    await page.setViewportSize({width,height:844});
    await ready('qinglan-bay/', '.strain-lab-guide img');
    await fits(`Quiz ${width}`);
    await picture(`quiz-mobile-${width}`);
    await ready('7-dhc-2048/', '#board .cell');
    for (const language of ['en','zh-CN']) {
      await page.locator(`[data-language="${language}"]`).click();
      await fits(`2048 ${width} ${language}`);
      await picture(`2048-mobile-${width}-${language}`);
    }
    await ready('steroid-tile-atlas/', '.steroid-tile.is-free');
    await page.getByRole('button', {name:'Level 5',exact:true}).click();
    await fits(`Tiles ${width} level 5`);
    await picture(`tiles-mobile-${width}`);
  }

  const touchContext = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:'zh-CN'});
  const touch = await touchContext.newPage();
  watch(touch);
  await touch.goto(base+'7-dhc-2048/', {waitUntil:'networkidle'});
  check('2048 English default on Chinese device', await touch.locator('html').getAttribute('lang') === 'en');
  await touch.locator('#board').scrollIntoViewIfNeeded();
  const box = await touch.locator('#board').boundingBox();
  const cdp = await touchContext.newCDPSession(touch);
  const start = {x:box.x+box.width*.8,y:box.y+box.height*.5};
  const end = {x:box.x+box.width*.2,y:start.y};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[end]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await touch.waitForFunction(() => document.getElementById('moves').textContent === '1');
  check('2048 real touch swipe moves board', await touch.locator('#moves').innerText() === '1');
  await touchContext.close();
  assert.deepEqual(errors, [], 'No console errors, failed responses or external assets');
  passed.push('No console errors, failed responses or external assets');
  console.log(`PASS: ${passed.length} browser checks (${base})`);
} finally {
  await writeFile(`${output}/results.json`,JSON.stringify({base,round,passed,errors},null,2)+'\n');
  await browser.close();
}
