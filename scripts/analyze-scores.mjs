import { calculateSecretMetrics, analyzePair } from '../src/utils/astrology.js';

// Synthetic data only. Reproducible distribution audit, not real-user validation.
let seed = 123456789;
const random = () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
const people = Array.from({ length: 400 }, (_, i) => {
  const year = 1960 + Math.floor(random() * 50), month = 1 + Math.floor(random() * 12), day = 1 + Math.floor(random() * 28);
  return calculateSecretMetrics(`သီရိ ${i}`, `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
});
const results = { Friends: [], Couple: [] };
for (let i = 0; i < 5000; i++) {
  const a = Math.floor(random() * people.length);
  let b = Math.floor(random() * people.length);
  if (a === b) b = (b + 1) % people.length;
  for (const mode of Object.keys(results)) results[mode].push(analyzePair(people[a], people[b], mode).score);
}
for (const [mode, scores] of Object.entries(results)) {
  scores.sort((a, b) => a - b);
  console.log(JSON.stringify({ mode, syntheticPairs: scores.length, min: scores[0], max: scores.at(-1),
    mean: scores.reduce((a, b) => a + b, 0) / scores.length, median: scores[2500],
    buckets: Object.fromEntries([[0, 19], [20, 39], [40, 59], [60, 79], [80, 100]].map(([lo, hi]) => [`${lo}-${hi}`, scores.filter(n => n >= lo && n <= hi).length])) }));
}
