import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layoutTomoCard } from '../src/utils/destinyCard.js';
import { generateDeepProceduralReading } from '../src/utils/gemini.js';

const context = { font: '', measureText(text) { return { width: Array.from(text).length * Number(this.font.match(/(\d+)px/)[1]) * .5 }; } };
const reading = generateDeepProceduralReading('သူရိန်', { westernElement: 'Air' }, 'သီရိ', { westernElement: 'Earth' }, 'Friends', 'Sweet', 83);

test('current longer closing note fits in the exported card without truncation', () => {
  const layout = layoutTomoCard(context, { result: reading, p1Name: 'သူရိန်', p2Name: 'သီရိ', breakdown: Array(5).fill({ score: 80 }) });
  assert.equal(layout.advice.truncated, false);
  assert.equal(layout.advice.lines.join('').replace(/\s/gu, ''), reading.tomo_secret_advice.replace(/\s/gu, ''));
  assert.ok(layout.height > 1600);
  assert.ok(layout.height < 4320);
  assert.ok(layout.noteY + layout.noteHeight < layout.height - 100);
});

test('long names have space above the score and the card does not invent missing metrics', () => {
  const layout = layoutTomoCard(context, { result: reading, p1Name: 'နာမည်'.repeat(14), p2Name: 'သူငယ်ချင်း'.repeat(8) });
  assert.equal(layout.first.truncated, false);
  assert.equal(layout.second.truncated, false);
  const lastNameBaseline = layout.namesY + layout.first.lines.length * 72 + 28 + 68 + (layout.second.lines.length - 1) * 72;
  assert.ok(lastNameBaseline + 28 < layout.scoreY - 100);
  assert.equal(layout.metricsHeight, 0);
});

test('oversized content stays within a bounded image and marks an excerpt', () => {
  const layout = layoutTomoCard(context, { result: { ...reading, tomo_secret_advice: reading.tomo_secret_advice.repeat(30) }, p1Name: 'Alice', p2Name: 'Bob' });
  assert.equal(layout.advice.truncated, true);
  assert.match(layout.advice.lines.at(-1), /…$/);
  assert.ok(layout.height < 4320);
});
