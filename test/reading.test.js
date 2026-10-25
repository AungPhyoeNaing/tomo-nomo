import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createReadingResult, isValidBirthDate, localTodayISO, validateReading } from '../src/utils/reading.js';
import { fetchTomoDestinyReading, DEMO_RESULT, generateDeepProceduralReading, clearTomoReadingCache } from '../src/utils/gemini.js';
import { calculateSecretMetrics } from '../src/utils/astrology.js';
import { readStorage, writeStorage, removeStorage } from '../src/utils/storage.js';

test('blocked browser storage does not prevent calculations or settings changes', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Storage blocked'); } });
  try {
    assert.equal(readStorage('theme', 'light'), 'light');
    assert.equal(writeStorage('theme', 'dark'), false);
    assert.doesNotThrow(() => removeStorage('legacy_key'));
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});

test('birthdates reject rollovers and future dates, and use local calendar days', () => {
  assert.equal(isValidBirthDate('2024-02-29', '2026-10-22'), true);
  for (const date of ['2023-02-29', '2026-02-31', '2026-13-01', 'invalid', '2026-10-23', '', '0099-01-01']) {
    assert.equal(isValidBirthDate(date, '2026-10-22'), false, date);
  }
  assert.equal(localTodayISO(new Date(2026, 9, 22, 0, 5)), '2026-10-22');
});

test('reading snapshot stays consistent after form inputs change', () => {
  const inputs = { p1Name: 'Alice', p2Name: 'Bob', relType: 'Friends', mood: 'Sweet' };
  const result = createReadingResult(DEMO_RESULT, inputs, {}, {});
  inputs.p1Name = 'Eve';
  inputs.relType = 'Couple';
  assert.equal(result.inputs.p1Name, 'Alice');
  assert.equal(result.inputs.relType, 'Friends');
});

test('reading validation rejects malformed data and preserves locally calculated score', () => {
  assert.equal(validateReading({ ...DEMO_RESULT, chemistry_score: 999 }, 72).chemistry_score, 72);
  for (const invalid of [null, [], {}, { ...DEMO_RESULT, tomo_strengths: 'wrong' }, { ...DEMO_RESULT, tomo_challenges: [null] }, { ...DEMO_RESULT, tomo_deep_reading_p1: {} }]) {
    assert.throws(() => validateReading(invalid, 72), /incomplete/);
  }
});

test('Gemini request handles invalid JSON, invalid shape, HTTP errors and cancellation', async t => {
  clearTomoReadingCache();
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const metrics = calculateSecretMetrics('Alice', '1996-06-15');
  const request = () => fetchTomoDestinyReading('Alice', metrics, 'Bob', metrics, 'Friends', 'Sweet', 72, 'test-key');
  for (const text of ['not json', '{}']) {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) });
    await assert.rejects(request());
  }
  globalThis.fetch = async () => ({ ok: false, status: 429, json: async () => ({ error: { message: 'Quota exceeded' } }) });
  await assert.rejects(request(), /Quota exceeded/);
  globalThis.fetch = async () => { const error = new Error(); error.name = 'AbortError'; throw error; };
  await assert.rejects(request(), { name: 'AbortError' });
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify({ ...generateDeepProceduralReading('Alice', metrics, 'Bob', metrics, 'Friends', 'Mystic', 72), chemistry_score: 999 }) }] } }] }) });
  assert.equal((await request()).chemistry_score, 72);
});
