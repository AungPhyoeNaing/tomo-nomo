// Hand-authored entertainment rules, not a calibrated relationship model.
export const SCORING_VERSION = 'neutral-50-v1';
const clamp = score => Math.max(0, Math.min(100, score));
const pair = (a, b, pairs) => pairs.some(([x, y]) => a === x && b === y || a === y && b === x);
const complementary = [['Fire', 'Air'], ['Earth', 'Water']];
const contrasting = [['Fire', 'Water'], ['Earth', 'Air']];
const harmonicNumbers = [[1, 5], [1, 7], [2, 4], [2, 8], [3, 6], [3, 9]];
const contrastingNumbers = [[1, 4], [5, 4], [7, 8]];
const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];

function section(rules) {
  const score = clamp(50 + rules.reduce((sum, rule) => sum + rule.delta, 0));
  return { score, baseline: 50, rules };
}
const rule = (id, delta, reason) => ({ id, delta, reason });

function aspect(first, second) {
  if (!Number.isFinite(first) || !Number.isFinite(second)) return null;
  const difference = Math.abs(first - second) % 360;
  const angle = Math.min(difference, 360 - difference);
  return [[120, 8, 24, 'Trine'], [0, 8, 16, 'Conjunction'], [60, 6, 18, 'Sextile'],
    [180, 8, -12, 'Opposition'], [30, 4, 4, 'Semi-sextile'], [150, 4, -10, 'Inconjunct'], [90, 7, -24, 'Square']]
    .find(([target, orb]) => Math.abs(angle - target) <= orb);
}

export function aspectGameRule(angle) {
  const found = aspect(0, angle);
  return found ? { aspect: `${found[3]} (${found[0]}°)`, delta: found[2], score: 50 + found[2], harmonic: found[2] > 0 } : null;
}

function planetRule(id, first, second, e1, e2, scale = 1) {
  const found = aspect(first, second);
  if (found) return rule(id, found[2] * scale, `${id}: ${found[3]} ဂြိုဟ်ထောင့်အတွက် သတ်မှတ်ထားသော ဂိမ်းအမှတ်။`);
  if (e1 && e2 && e1 === e2) return rule(id, 12 * scale, `${id}: ဓာတ်တူညီမှုအတွက် ဂိမ်းအမှတ်။`);
  if (pair(e1, e2, complementary)) return rule(id, 16 * scale, `${id}: ဖြည့်ဆည်းပေးသော ဓာတ်တွဲအတွက် ဂိမ်းအမှတ်။`);
  if (pair(e1, e2, contrasting)) return rule(id, -16 * scale, `${id}: ကွာခြားသော ဓာတ်တွဲအတွက် ဂိမ်းအမှတ်။`);
  return rule(id, 0, `${id}: အမှတ်တိုး/လျော့သည့် စည်းမျဉ်း မတွေ့ပါ။ အချက်အလက်မပြည့်စုံလျှင်လည်း အပိုမှတ်မပေးပါ။`);
}

export function westernSection(a, b, mode = 'Couple') {
  const rules = [planetRule('Sun–Sun', a.sunLon, b.sunLon, a.westernElement, b.westernElement),
    planetRule('Moon–Moon', a.moonLon, b.moonLon, a.moonElement, b.moonElement, .4)];
  if (mode === 'Couple') {
    // Average the two directions: swapping people must not change the score.
    rules.push(planetRule('Venus–Mars', a.venusLon, b.marsLon, null, null, .2),
      planetRule('Mars–Venus', b.venusLon, a.marsLon, null, null, .2));
  }
  return section(rules);
}

export function mahaboteSection(a, b) {
  const valid = [a.dayIndex, b.dayIndex].every(day => Number.isInteger(day) && day >= 0 && day <= 6);
  let delta = 0, reason = 'နေ့နံတွဲအတွက် အပိုမှတ်တိုး/လျော့သည့် စည်းမျဉ်း မတွေ့ပါ။';
  if (valid && pair(a.dayIndex, b.dayIndex, [[0, 2], [1, 3], [5, 6]])) { delta = 24; reason = 'သတ်မှတ်ထားသော နေ့နံမိတ်ဖက်တွဲ ဖြစ်သည်။'; }
  else if (valid && pair(a.dayIndex, b.dayIndex, [[0, 4], [1, 5], [2, 6]])) { delta = -24; reason = 'သတ်မှတ်ထားသော နေ့နံကွာခြားမှုတွဲ ဖြစ်သည်။'; }
  else if (valid && a.dayIndex === b.dayIndex) { delta = 10; reason = 'မွေးနေ့နံ တူညီသည်။'; }
  const rules = [rule('weekday', delta, reason)];
  if (a.mahaboteHouse && a.mahaboteHouse === b.mahaboteHouse) rules.push(rule('house', 6, 'အနီးစပ်ဆုံးတွက်ထားသော မဟာဘုတ်ဌာန တူညီသည်။'));
  return section(rules);
}

export function animalSection(a, b) {
  const x = a.animal, y = b.animal;
  if (!animals.includes(x) || !animals.includes(y)) return section([rule('animal', 0, 'ရာသီအချက်အလက် မပြည့်စုံသောကြောင့် အပိုမှတ်မပေးပါ။')]);
  if (x === y) return section([rule('animal', 10, 'တရုတ်နှစ်ရာသီ တူညီသည်။')]);
  if ([['Rat', 'Dragon', 'Monkey'], ['Ox', 'Snake', 'Rooster'], ['Tiger', 'Horse', 'Dog'], ['Rabbit', 'Goat', 'Pig']].some(group => group.includes(x) && group.includes(y))) return section([rule('animal', 30, 'သတ်မှတ်ထားသော သုံးရာသီမိတ်ဖက်အုပ်စု တူညီသည်။')]);
  if (pair(x, y, [['Rat', 'Ox'], ['Tiger', 'Pig'], ['Rabbit', 'Dog'], ['Dragon', 'Rooster'], ['Snake', 'Monkey'], ['Horse', 'Goat']])) return section([rule('animal', 24, 'သတ်မှတ်ထားသော ရာသီမိတ်ဖက်တွဲ ဖြစ်သည်။')]);
  if (pair(x, y, [['Rat', 'Horse'], ['Ox', 'Goat'], ['Tiger', 'Monkey'], ['Rabbit', 'Rooster'], ['Dragon', 'Dog'], ['Snake', 'Pig']])) return section([rule('animal', -30, 'သတ်မှတ်ထားသော ဆန့်ကျင်ရာသီတွဲ ဖြစ်သည်။')]);
  if (pair(x, y, [['Rat', 'Goat'], ['Ox', 'Horse'], ['Tiger', 'Snake'], ['Rabbit', 'Dragon'], ['Monkey', 'Pig'], ['Rooster', 'Dog']])) return section([rule('animal', -20, 'သတ်မှတ်ထားသော ရာသီကွာခြားမှုတွဲ ဖြစ်သည်။')]);
  return section([rule('animal', 0, 'ရာသီတွဲအတွက် အပိုမှတ်တိုး/လျော့သည့် စည်းမျဉ်း မတွေ့ပါ။')]);
}

export function elementSection(a, b) {
  const x = a.elementKey, y = b.elementKey;
  if (!['Wood', 'Fire', 'Earth', 'Metal', 'Water'].includes(x) || !['Wood', 'Fire', 'Earth', 'Metal', 'Water'].includes(y)) return section([rule('element', 0, 'ဓာတ်အချက်အလက် မပြည့်စုံသောကြောင့် အပိုမှတ်မပေးပါ။')]);
  if (x === y) return section([rule('element', 10, 'တရုတ်နှစ်ဓာတ် တူညီသည်။')]);
  if (pair(x, y, [['Wood', 'Fire'], ['Fire', 'Earth'], ['Earth', 'Metal'], ['Metal', 'Water'], ['Water', 'Wood']])) return section([rule('element', 25, 'ဓာတ်ဖြစ်ထွန်းစေသော တွဲဖက်စည်းမျဉ်းနှင့် ကိုက်ညီသည်။')]);
  return section([rule('element', -25, 'ဓာတ်ထိန်းချုပ်သော တွဲဖက်စည်းမျဉ်းနှင့် ကိုက်ညီသည်။')]);
}

export function numerologySection(a, b) {
  const allowed = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
  let delta = 0, reason = 'ဘဝလမ်းကြောင်းဂဏန်းအတွက် အပိုမှတ်တိုး/လျော့သည့် စည်းမျဉ်း မတွေ့ပါ။';
  if (allowed.includes(a.lifePathNumber) && allowed.includes(b.lifePathNumber)) {
    if (a.lifePathNumber === b.lifePathNumber) { delta = 16; reason = 'ဘဝလမ်းကြောင်းဂဏန်း တူညီသည်။'; }
    else if (pair(a.lifePathNumber, b.lifePathNumber, harmonicNumbers)) { delta = 18; reason = 'သတ်မှတ်ထားသော ဂဏန်းမိတ်ဖက်တွဲ ဖြစ်သည်။'; }
    else if (pair(a.lifePathNumber, b.lifePathNumber, contrastingNumbers)) { delta = -18; reason = 'သတ်မှတ်ထားသော ဂဏန်းကွာခြားမှုတွဲ ဖြစ်သည်။'; }
  }
  const rules = [rule('life-path', delta, reason)];
  if ([a.destinyNumber, b.destinyNumber].every(n => Number.isInteger(n) && n >= 1 && n <= 9)) {
    if (a.destinyNumber === b.destinyNumber) rules.push(rule('name-game', 4, 'အမည်ဂိမ်းဂဏန်း တူညီသည်။ ဤနည်းသည် အတည်ပြုထားသော မြန်မာအမည်ဗေဒ မဟုတ်ပါ။'));
    else if (a.destinyTriad && a.destinyTriad === b.destinyTriad) rules.push(rule('name-game', 3, 'အမည်ဂိမ်းဂဏန်းအုပ်စု တူညီသည်။'));
  }
  return section(rules);
}

export function analyzeSymbolicPair(a = {}, b = {}, mode = 'Friends') {
  const weights = mode === 'Couple' ? [.28, .22, .18, .18, .14] : [.20, .22, .24, .18, .16];
  const labels = mode === 'Couple'
    ? ['အချစ်ရေးအတွက် ဂြိုဟ်တွဲ ဂိမ်းအမှတ်', 'မဟာဘုတ် ဂိမ်းအမှတ်', 'တရုတ်ရာသီ ဂိမ်းအမှတ်', 'တရုတ်ဓာတ် ဂိမ်းအမှတ်', 'ဂဏန်းဗေဒ ဂိမ်းအမှတ်']
    : ['မိတ်ဆွေစစ် ရာသီခွင် ဂိမ်းအမှတ်', 'မဟာဘုတ် ဂိမ်းအမှတ်', 'တရုတ်ရာသီ ဂိမ်းအမှတ်', 'တရုတ်ဓာတ် ဂိမ်းအမှတ်', 'ဂဏန်းဗေဒ ဂိမ်းအမှတ်'];
  const sections = [westernSection(a, b, mode), mahaboteSection(a, b), animalSection(a, b), elementSection(a, b), numerologySection(a, b)];
  const components = sections.map((item, i) => ({ ...item, label: labels[i], weight: weights[i], weightedDelta: Math.round((item.score - 50) * weights[i] * 1000) / 1000 }));
  const rawScore = Math.round((50 + components.reduce((sum, component) => sum + component.weightedDelta, 0)) * 1000) / 1000;
  return { version: SCORING_VERSION, baseline: 50, rawScore, score: Math.round(clamp(rawScore)), components };
}
