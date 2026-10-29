import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { analyzePair, calculateAlgorithmicScore, calculateDetailedMetricsBreakdown, getScoreResonanceTier } from '../src/utils/astrology.js';

test('missing and unmatched symbols remain neutral instead of receiving compatibility bonuses', () => {
  for (const mode of ['Friends', 'Couple']) {
    assert.equal(analyzePair({}, {}, mode).score, 50);
    assert.ok(analyzePair({}, {}, mode).components.every(item => item.score === 50));
    const neutral = analyzePair({ dayIndex: 0, animal: 'Rat', lifePathNumber: 2 }, { dayIndex: 1, animal: 'Tiger', lifePathNumber: 3 }, mode);
    assert.equal(neutral.score, 50);
    assert.equal(getScoreResonanceTier(neutral.score).tier, 'MIXED_SYMBOLS');
  }
});

test('aligned and contrasting fixtures yield different scores with explanations that reconstruct the total', () => {
  const first = { sunLon: 0, moonLon: 0, venusLon: 0, marsLon: 0, dayIndex: 0, animal: 'Rat', elementKey: 'Wood', lifePathNumber: 1, destinyNumber: 1 };
  const aligned = { sunLon: 120, moonLon: 120, venusLon: 120, marsLon: 120, dayIndex: 2, animal: 'Dragon', elementKey: 'Fire', lifePathNumber: 5, destinyNumber: 1 };
  const contrasting = { sunLon: 90, moonLon: 90, venusLon: 90, marsLon: 90, dayIndex: 4, animal: 'Horse', elementKey: 'Earth', lifePathNumber: 4, destinyNumber: 2 };
  for (const mode of ['Friends', 'Couple']) {
    const high = analyzePair(first, aligned, mode);
    const low = analyzePair(first, contrasting, mode);
    assert.ok(high.score >= 70, JSON.stringify(high));
    assert.ok(low.score <= 30, JSON.stringify(low));
    for (const [other, analysis] of [[aligned, high], [contrasting, low]]) {
      assert.equal(calculateAlgorithmicScore(first, other, mode), analysis.score);
      assert.deepEqual(calculateDetailedMetricsBreakdown(first, other, mode), analysis.components);
      assert.ok(Math.abs(analysis.components.reduce((sum, part) => sum + part.weight, 0) - 1) < 1e-12);
      for (const component of analysis.components) {
        assert.equal(component.score, 50 + component.rules.reduce((sum, rule) => sum + rule.delta, 0));
        assert.ok(component.rules.every(rule => rule.reason.length > 0));
      }
      const total = 50 + analysis.components.reduce((sum, part) => sum + part.weightedDelta, 0);
      assert.equal(Math.round(Math.round(total * 1000) / 1000), analysis.score);
      assert.equal(analyzePair(other, first, mode).score, analysis.score);
      assert.equal(analyzePair(first, other, mode).score, analysis.score);
    }
  }
});

test('synthetic distribution stays around the neutral baseline without the previous high-score bias', () => {
  const output = execFileSync(process.execPath, ['scripts/analyze-scores.mjs'], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });
  for (const result of output.trim().split('\n').map(line => JSON.parse(line))) {
    assert.equal(result.syntheticPairs, 5000);
    assert.ok(result.mean > 45 && result.mean < 60);
    assert.ok(result.min < 40);
    assert.ok(result.max > 65);
    assert.ok(result.buckets['80-100'] < 100);
  }
});

test('Friends scores exclude Venus–Mars romance adjustments and master numbers have no automatic bonus', () => {
  const first = { venusLon: 0, marsLon: 0 };
  const second = { venusLon: 120, marsLon: 120 };
  assert.equal(analyzePair(first, second, 'Friends').score, 50);
  assert.ok(analyzePair(first, second, 'Couple').score > 50);
  assert.equal(analyzePair({ lifePathNumber: 11 }, { lifePathNumber: 4 }).score, 50);
});

test('analysis neither mutates nor shares caller-owned chart data', () => {
  const first = Object.freeze({ animal: 'Rat', dayIndex: 0 });
  const second = Object.freeze({ animal: 'Dragon', dayIndex: 2 });
  const result = analyzePair(first, second);
  result.components[0].rules[0].delta = 1000;
  assert.equal(analyzePair(first, second).components[0].rules[0].delta, 0);
});
