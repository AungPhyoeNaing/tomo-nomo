import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { calculateSecretMetrics, getAstronomicalPlanets, getTrueChineseYear, getMahaboteInfo } from '../src/utils/astrology.js';
import { chartPlacementLabel } from '../src/utils/chartNotes.js';
import { buildTomoPrompt } from '../src/utils/tomoPrompt.js';
import { isValidBirthDate } from '../src/utils/reading.js';

test('Sun labels and attributes agree with the ephemeris on both sides of a sign boundary', () => {
  const before = calculateSecretMetrics('Demo', '2020-01-20');
  const after = calculateSecretMetrics('Demo', '2020-01-21');
  assert.equal(before.western, 'Capricorn');
  assert.equal(before.westernElement, 'Earth');
  assert.equal(before.westernModality, 'Cardinal');
  assert.equal(before.westernRuler, 'Saturn');
  assert.ok(Math.abs(before.sunLon - 299.8763258) < .0001);
  assert.equal(after.western, 'Aquarius');
  assert.equal(after.westernElement, 'Air');
  assert.equal(after.westernModality, 'Fixed');
  assert.equal(after.westernRuler, 'Uranus');
  assert.ok(after.sunLon >= 300 && after.sunLon < 330);
});

test('chart notes distinguish a boundary estimate from a stable sampled Sun sign', () => {
  const cusp = calculateSecretMetrics('Demo', '2020-01-20');
  assert.deepEqual(cusp.chartInfo.possibleSigns.sun, ['Capricorn', 'Aquarius']);
  assert.match(chartPlacementLabel(cusp, 'sun'), /Capricorn \/ Aquarius/);
  assert.match(chartPlacementLabel(cusp, 'sun'), /birth time or time zone/);
  const ordinary = calculateSecretMetrics('Demo', '1996-06-15');
  assert.equal(chartPlacementLabel(ordinary, 'sun'), 'Gemini (estimate)');
  assert.deepEqual(ordinary.chartInfo.possibleSigns.moon, ['Gemini', 'Cancer']);
  assert.match(chartPlacementLabel(ordinary, 'moon'), /Gemini \/ Cancer/);
  assert.equal(chartPlacementLabel({ western: 'Gemini', moonSign: 'Gemini', chartInfo: { source: 'calendar-fallback' } }, 'moon'), 'Unavailable');
});

test('calendar edges preserve the documented solar-year convention and Gregorian leap-day rules', () => {
  assert.equal(getTrueChineseYear('2024-02-03'), 2023);
  assert.equal(getTrueChineseYear('2024-02-04'), 2024);
  assert.equal(getTrueChineseYear('2024-01-01'), 2023);
  assert.equal(getTrueChineseYear('2023-12-31'), 2023);
  assert.equal(isValidBirthDate('2000-02-29'), true);
  assert.equal(isValidBirthDate('1900-02-29'), false);
  assert.equal(getMahaboteInfo('2000-02-29').dayName, 'Tuesday');
  assert.equal(calculateSecretMetrics('Demo', '2000-02-29').western, 'Pisces');
});

test('date-only calculations do not depend on the browser or server time zone', () => {
  const script = `import { calculateSecretMetrics } from './src/utils/astrology.js';
    console.log(JSON.stringify(['2020-01-20','2000-02-29','2024-02-03','2024-02-04','2023-12-31','2024-01-01'].map(date => calculateSecretMetrics('Demo',date))));`;
  const outputs = ['UTC', 'Pacific/Kiritimati', 'America/Adak', 'Asia/Yangon'].map(TZ => execFileSync(process.execPath,
    ['--input-type=module', '-e', script], { cwd: new URL('..', import.meta.url), env: { ...process.env, TZ }, encoding: 'utf8' }));
  outputs.forEach(output => assert.equal(output, outputs[0]));
});

test('cached planetary results cannot be mutated by another reading', () => {
  const first = getAstronomicalPlanets('2020-01-20');
  first.sun.lon = -1;
  first.possibleSigns.sun.push('Made up');
  const second = getAstronomicalPlanets('2020-01-20');
  assert.ok(second.sun.lon > 299);
  assert.deepEqual(second.possibleSigns.sun, ['Capricorn', 'Aquarius']);
});

test('AI prompt receives sign alternatives and uncertainty instructions without raw birthdates', () => {
  const person = calculateSecretMetrics('Demo', '2020-01-20');
  const prompt = buildTomoPrompt({ p1Name: 'Demo', p1Secret: person, p2Name: 'Other', p2Secret: person,
    relType: 'Friends', mood: 'Sweet', algorithmicScore: 72, breakdown: [] });
  const data = JSON.parse(prompt.split('INPUT_DATA_JSON:\n')[1]);
  assert.deepEqual(data.people[0].possiblePlanetSigns.sun, ['Capricorn', 'Aquarius']);
  assert.match(data.people[0].limitations, /do not present one sign as certain/);
  assert.equal(prompt.includes('2020-01-20'), false);
});
