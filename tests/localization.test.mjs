import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { COPY, ENGLISH_ITEMS, initialLocale } from '../7-dhc-2048/i18n.js';

const html = readFileSync(new URL('../7-dhc-2048/index.html', import.meta.url), 'utf8');

test('2048 starts in English before JavaScript runs', () => {
  assert.match(html, /<html lang="en">/);
  assert.match(html, /Start with a carbon source/);
});

test('2048 exposes both language buttons without replacing the game board', () => {
  assert.match(html, /data-language="en"/);
  assert.match(html, /data-language="zh-CN"/);
  assert.equal((html.match(/id="board"/g) || []).length, 1);
});

test('every static and accessibility message exists in both languages', () => {
  assert.deepEqual(Object.keys(COPY.en).sort(), Object.keys(COPY['zh-CN']).sort());
  for (const [, key] of html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)) {
    assert.equal(typeof COPY.en[key], 'string', `English message: ${key}`);
    assert.equal(typeof COPY['zh-CN'][key], 'string', `Chinese message: ${key}`);
  }
  assert.equal(ENGLISH_ITEMS.length, 11);
  assert.equal(COPY.en.overBody('Squalene').includes('Squalene'), true);
  assert.equal(COPY['zh-CN'].yield(2), '7-DHC 产量 × 2');
});

test('English is the default, Chinese preference is restored, storage failures are tolerated', () => {
  assert.equal(initialLocale({getItem: () => null}), 'en');
  assert.equal(initialLocale({getItem: () => 'zh-CN'}), 'zh-CN');
  assert.equal(initialLocale({getItem: () => 'invalid'}), 'en');
  assert.equal(initialLocale({getItem() { throw new Error('Storage unavailable'); }}), 'en');
});
