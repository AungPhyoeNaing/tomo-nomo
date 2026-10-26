import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateSecretMetrics } from '../src/utils/astrology.js';
import { generateDeepProceduralReading } from '../src/utils/proceduralReading.js';
import { validateBurmeseReading } from '../src/utils/reading.js';

const names = ['သူရိန်', 'သီရိ'];
const people = Array.from({ length: 24 }, (_, index) => calculateSecretMetrics(
  names[index % 2], `${1985 + index}-${String(1 + index % 12).padStart(2, '0')}-${String(1 + index * 7 % 27).padStart(2, '0')}`
));
const reading = (first = people[0], second = people[1], mode = 'Friends', voice = 'Sweet', score = 72) =>
  generateDeepProceduralReading(names[0], first, names[1], second, mode, voice, score);
const prose = result => [result.tomo_deep_reading_p1, result.tomo_deep_reading_p2,
  result.tomo_dynamic_insight, ...result.tomo_strengths, ...result.tomo_challenges, result.tomo_secret_advice];

test('built-in stories are deterministic, offline and do not mutate chart inputs', t => {
  const fetch = t.mock.method(globalThis, 'fetch', () => assert.fail('Built-in readings must stay offline'));
  const snapshot = structuredClone(people);
  const first = reading();
  assert.deepEqual(reading(), first);
  assert.deepEqual(people, snapshot);
  assert.equal(fetch.mock.callCount(), 0);
  first.tomo_strengths[0] = 'changed by a caller';
  assert.notDeepEqual(reading().tomo_strengths, first.tomo_strengths);
});

test('216 pair/mode/voice/score combinations retain complete Burmese stories', () => {
  for (let index = 0; index < people.length; index += 2) {
    for (const mode of ['Friends', 'Couple']) for (const voice of ['Sweet', 'Playful', 'Mystic']) for (const score of [50, 72, 94]) {
      const result = reading(people[index], people[index + 1], mode, voice, score);
      assert.doesNotThrow(() => validateBurmeseReading(result, { relType: mode, names, expanded: true }), `${index}/${mode}/${voice}/${score}`);
      assert.equal(result.chemistry_score, score);
      assert.ok(result.tomo_deep_reading_p1.includes(names[0]));
      assert.ok(result.tomo_deep_reading_p2.includes(names[1]));
    }
  }
});

test('different charts change shared advice and lists even with the same names, voice and score', () => {
  const results = people.map((person, index) => reading(person, people[(index + 7) % people.length]));
  for (const field of ['relationship_title', 'tomo_secret_advice']) {
    assert.ok(new Set(results.map(result => result[field])).size >= 6, `${field} still repeats across pairs`);
  }
  for (const field of ['tomo_deep_reading_p1', 'tomo_dynamic_insight', 'tomo_strengths', 'tomo_challenges']) {
    assert.ok(new Set(results.map(result => JSON.stringify(result[field]))).size >= 18, `${field} still repeats across pairs`);
  }
});

test('score bands change the shared story without rerolling individual profiles or lists', () => {
  const low = reading(undefined, undefined, 'Friends', 'Sweet', 64);
  const middle = reading(undefined, undefined, 'Friends', 'Sweet', 65);
  const high = reading(undefined, undefined, 'Friends', 'Sweet', 85);
  assert.notEqual(low.tomo_dynamic_insight, middle.tomo_dynamic_insight);
  assert.notEqual(middle.tomo_secret_advice, high.tomo_secret_advice);
  assert.match(low.tomo_dynamic_insight, /အမှတ်က ဆက်ဆံရေးရဲ့ အဖြေမဟုတ်/);
  for (const result of [low, high]) {
    assert.equal(result.tomo_deep_reading_p1, middle.tomo_deep_reading_p1);
    assert.deepEqual(result.tomo_strengths, middle.tomo_strengths);
    assert.deepEqual(result.tomo_challenges, middle.tomo_challenges);
  }
  assert.equal(reading(undefined, undefined, 'Friends', 'Sweet', 84).tomo_dynamic_insight, middle.tomo_dynamic_insight);
});

test('Moon, numerology, Mahabote and Chinese elements influence the relevant prose', () => {
  const first = { ...people[0], moonElement: 'Air', lifePathNumber: 1, dayIndex: 0, elementKey: 'Wood' };
  const base = reading(first);
  const blocks = result => result.tomo_deep_reading_p1.split('\n\n');
  assert.notEqual(blocks(reading({ ...first, moonElement: 'Water' }))[1], blocks(base)[1]);
  assert.notEqual(blocks(reading({ ...first, lifePathNumber: 9 }))[2], blocks(base)[2]);
  assert.notEqual(blocks(reading({ ...first, dayIndex: 6 }))[3], blocks(base)[3]);
  assert.notEqual(reading({ ...first, elementKey: 'Metal' }).tomo_dynamic_insight, base.tomo_dynamic_insight);
});

test('swapping people preserves each profile and the pair topic selections', () => {
  const original = reading();
  const swapped = generateDeepProceduralReading(names[1], people[1], names[0], people[0], 'Friends', 'Sweet', 72);
  assert.equal(swapped.tomo_deep_reading_p1, original.tomo_deep_reading_p2);
  assert.equal(swapped.tomo_deep_reading_p2, original.tomo_deep_reading_p1);
  assert.equal(swapped.relationship_title, original.relationship_title);
  assert.deepEqual(swapped.tomo_strengths, original.tomo_strengths);
  assert.deepEqual(swapped.tomo_challenges, original.tomo_challenges);
});

test('identical and sparse charts still give two distinct complete profiles', () => {
  for (const metrics of [people[0], {}, undefined]) {
    const result = generateDeepProceduralReading('သူရိန်', metrics, 'သူရိန်', metrics, 'Couple', 'Mystic', 72);
    assert.doesNotThrow(() => validateBurmeseReading(result, { relType: 'Couple', names: ['သူရိန်'], expanded: true }));
    assert.ok(prose(result).every(text => !/undefined|null|NaN/.test(text)));
  }
});

test('matching chart symbols do not repeat full sentences across a reading', () => {
  for (const metrics of [people[0], {}, undefined]) for (const voice of ['Sweet', 'Playful', 'Mystic']) {
    const result = generateDeepProceduralReading(names[0], metrics, names[1], metrics, 'Friends', voice, 72);
    const sentences = prose(result).flatMap(text => text.replace(/\[[^\]]+\]\n/gu, '').split('။'))
      .map(text => text.trim()).filter(text => text.length >= 50);
    assert.equal(new Set(sentences).size, sentences.length, `${voice}: repeated long sentences`);
  }
});

test('normalizing Unicode names and whitespace does not reroll the story', () => {
  const result = reading();
  assert.deepEqual(generateDeepProceduralReading(`  ${names[0]}  `, people[0], ` ${names[1]} `, people[1], 'Friends', 'Sweet', 72), result);
});
