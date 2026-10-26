export function localTodayISO(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function isValidBirthDate(value, today = localTodayISO()) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value > today) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return year >= 100 && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function validateReading(data, algorithmicScore) {
  const strings = ['tomo_deep_reading_p1', 'tomo_deep_reading_p2', 'relationship_title', 'tomo_dynamic_insight', 'tomo_secret_advice'];
  const lists = ['tomo_strengths', 'tomo_challenges'];
  const isText = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 20000;
  if (!data || typeof data !== 'object' || Array.isArray(data) ||
      !strings.every(key => isText(data[key])) ||
      !lists.every(key => Array.isArray(data[key]) && data[key].length > 0 && data[key].length <= 8 && data[key].every(isText))) {
    throw new Error('Gemini returned an incomplete reading.');
  }
  return Object.fromEntries([
    ...strings.map(key => [key, data[key].trim()]),
    ...lists.map(key => [key, data[key].map(text => text.trim())]),
    ['chemistry_score', algorithmicScore]
  ]);
}

export function normalizePersonName(value) {
  return String(value ?? '').normalize('NFC').trim().replace(/\s+/gu, ' ');
}

// Cheap language/shape checks, not a claim to judge Burmese grammar or truth.
export function validateBurmeseReading(data, { relType, names = [], expanded = false } = {}) {
  const normalized = validateReading(data, data.chemistry_score);
  for (const key of ['tomo_deep_reading_p1', 'tomo_deep_reading_p2']) {
    const profile = normalized[key].replace(/\r\n?/g, '\n');
    const headings = Array.from(profile.matchAll(/\[([^\]\n]{1,100})\]/gu));
    // Models vary whitespace around headings and dialogue. Canonicalize a
    // complete four-section profile locally; never spend another API call
    // repairing harmless formatting or discard otherwise valid long content.
    if (headings.length === 4 && !profile.slice(0, headings[0].index).trim()) {
      normalized[key] = headings.map((heading, index) => {
        const body = profile.slice(heading.index + heading[0].length, headings[index + 1]?.index ?? profile.length).trim().replace(/\n\s*\n/gu, '\n');
        return `[${heading[1]}]\n${body}`;
      }).join('\n\n');
    }
  }
  if (normalized.relationship_title.length > 220) throw new Error('Reading quality check: shorten the Burmese title.');
  const fields = [normalized.tomo_deep_reading_p1, normalized.tomo_deep_reading_p2,
    normalized.relationship_title, normalized.tomo_dynamic_insight, normalized.tomo_secret_advice,
    ...normalized.tomo_strengths, ...normalized.tomo_challenges];
  for (let field of fields) {
    for (const name of names) if (name) field = field.split(name).join('');
    const letters = field.match(/\p{L}/gu) || [];
    const myanmarLetters = field.match(/[\u1000-\u102a\u103f\u1050-\u1055]/gu) || [];
    if (myanmarLetters.length < 5 || myanmarLetters.length / Math.max(1, letters.length) < .7) {
      throw new Error('Reading quality check: write every field in Burmese.');
    }
    if (relType === 'Friends' && /ချစ်သူ|ရည်းစား|အိမ်ထောင်ဖက်|အချစ်ရေး|ရိုမန်တစ်/u.test(field)) {
      throw new Error('Reading quality check: keep Friends mode platonic.');
    }
  }
  for (const profile of [normalized.tomo_deep_reading_p1, normalized.tomo_deep_reading_p2]) {
    if (profile.split(/\n\s*\n/u).length !== 4 || (profile.match(/^\[[^\]]+\]\s*\n/gmu) || []).length !== 4) {
      throw new Error('Reading quality check: use four bracket-headed profile paragraphs.');
    }
  }
  if (normalized.tomo_deep_reading_p1 === normalized.tomo_deep_reading_p2) throw new Error('Reading quality check: give distinct profiles.');
  for (const key of ['tomo_strengths', 'tomo_challenges']) {
    if (normalized[key].length !== 3 || new Set(normalized[key].map(text => text.normalize('NFC').trim())).size !== 3) {
      throw new Error('Reading quality check: provide three distinct list items.');
    }
  }
  if (expanded) {
    if ([normalized.tomo_deep_reading_p1, normalized.tomo_deep_reading_p2].some(text => text.length < 1000) ||
        normalized.tomo_dynamic_insight.length < 750 || normalized.tomo_dynamic_insight.split(/\n\s*\n/u).length < 3 ||
        normalized.tomo_secret_advice.length < 500 || normalized.tomo_secret_advice.split(/\n\s*\n/u).length < 2 ||
        [...normalized.tomo_strengths, ...normalized.tomo_challenges].some(text => text.length < 180)) {
      throw new Error('Reading quality check: expand every section with distinct examples and actions; use three insight paragraphs and two advice paragraphs.');
    }
    if (relType === 'Couple') {
      const romanticContext = /ချစ်သူ|အချစ်|ချစ်ခြင်း|ချစ်ရသူ|ရင်ခုန်|ရည်းစား|ရိုမန်တစ်/u;
      let sharedStory = [normalized.relationship_title, normalized.tomo_dynamic_insight, normalized.tomo_secret_advice].join(' ');
      for (const name of names) if (name) sharedStory = sharedStory.split(name).join('');
      if (!romanticContext.test(sharedStory)) {
        throw new Error('Reading quality check: make Couple mode explicitly about romantic partners, with date and affection examples.');
      }
    }
  }
  return normalized;
}

export function createReadingResult(reading, inputs, p1Secret, p2Secret, readingInfo = {}) {
  return { ...reading, p1Secret, p2Secret, inputs: { ...inputs }, readingInfo: { source: 'built-in', ...reading.readingInfo, ...readingInfo } };
}
