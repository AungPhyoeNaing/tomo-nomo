import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wrapCanvasText } from '../src/utils/canvasText.js';
const segmenter = new Intl.Segmenter('my', { granularity: 'grapheme' });
const context = { measureText: text => ({ width: Array.from(segmenter.segment(text)).length * 10 }) };

test('PNG text wraps long unspaced Burmese using measured graphemes', () => {
  const text = 'သူငယ်ချင်းနှစ်ယောက်အကြားနားလည်မှုတည်ဆောက်ကြည့်နိုင်ပါတယ်။';
  const { lines, truncated } = wrapCanvasText(context, text, 80, 30);
  assert.equal(truncated, false);
  assert.equal(lines.join(''), text);
  assert.ok(lines.length > 1);
  assert.ok(lines.every(line => context.measureText(line).width <= 80));
  assert.ok(lines.every(line => !/^\p{Mark}/u.test(line)));
});

test('PNG text stays inside a line budget and clearly marks clipping', () => {
  const { lines, truncated } = wrapCanvasText(context, 'A very long title that will not fit inside a small card.', 60, 2);
  assert.equal(lines.length, 2);
  assert.equal(truncated, true);
  assert.ok(lines.at(-1).endsWith('…'));
  assert.ok(lines.every(line => context.measureText(line).width <= 60));
});
